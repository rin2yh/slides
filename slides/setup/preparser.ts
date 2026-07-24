import { definePreparserSetup } from '@slidev/types'

// Extend Markdown tables with row-level classes via `|{.class}` suffix.
//
// Input:
//   | Head | Value |
//   |---|---|
//   | a | b | {.accent}
//   | c | d |
//
// Output (raw HTML table so the class survives to render):
//   <table>...
//     <tr class="accent"><td>a</td><td>b</td></tr>
//     <tr><td>c</td><td>d</td></tr>
//   </table>
//
// Only tables that actually have a `{.accent}` (or `{.foo}`) suffix on any row
// are rewritten; plain Markdown tables pass through unchanged.

const ATTR = /\s*\{([^}]+)\}\s*$/

// Split a table row on `|`, honoring `\|` escapes and pipes inside `code`
// spans — same rules markdown-it uses.
function splitCells(inner: string): string[] {
  const cells: string[] = []
  let buf = ''
  let inCode = false
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (c === '\\' && inner[i + 1] === '|') {
      buf += '|'
      i++
      continue
    }
    if (c === '`') {
      inCode = !inCode
      buf += c
      continue
    }
    if (c === '|' && !inCode) {
      cells.push(buf.trim())
      buf = ''
      continue
    }
    buf += c
  }
  cells.push(buf.trim())
  return cells
}

function parseRow(line: string): { cells: string[], cls?: string } | null {
  let s = line.trim()
  if (!s.startsWith('|') || !s.includes('|', 1)) return null
  let cls: string | undefined
  const m = s.match(ATTR)
  if (m) {
    cls = m[1]
      .split(/\s+/)
      .filter(x => x.startsWith('.'))
      .map(x => x.slice(1))
      .join(' ') || undefined
    s = s.slice(0, m.index)
  }
  const inner = s.replace(/^\|/, '').replace(/\|\s*$/, '')
  const cells = splitCells(inner)
  return { cells, cls }
}

function isDivider(line: string) {
  return /^\s*\|?\s*:?[-]+:?\s*(\|\s*:?[-]+:?\s*)+\|?\s*$/.test(line)
}

// Parse the divider row into per-column alignments: left | center | right | null.
function parseAlign(line: string): (string | null)[] {
  const stripped = line.trim().replace(/^\|/, '').replace(/\|\s*$/, '')
  return stripped.split('|').map(seg => {
    const s = seg.trim()
    const l = s.startsWith(':')
    const r = s.endsWith(':')
    if (l && r) return 'center'
    if (r) return 'right'
    if (l) return 'left'
    return null
  })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderCellInline(text: string): string {
  // Inline conversions kept intentionally small; falls back to raw text for
  // anything the author writes as HTML. Markdown-it would normally do this,
  // but once we emit raw HTML the inline pass no longer runs on the cells.
  let t = esc(text)
  t = t.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  return t
}

function rewriteTables(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    // Detect a table block: header row, divider row, then 1+ data rows.
    const header = parseRow(lines[i] ?? '')
    const div = lines[i + 1]
    if (header && div && isDivider(div)) {
      const rows: { cells: string[], cls?: string }[] = []
      let j = i + 2
      while (j < lines.length) {
        const r = parseRow(lines[j] ?? '')
        if (!r) break
        rows.push(r)
        j++
      }

      // Only rewrite when at least one row has an attribute — otherwise keep
      // the original Markdown so shiki/mdc/etc. still process it normally.
      const hasAttr = rows.some(r => r.cls)
      if (hasAttr) {
        const align = parseAlign(div)
        const styleFor = (idx: number) =>
          align[idx] ? ` style="text-align:${align[idx]}"` : ''
        const thead = '<thead><tr>' + header.cells.map((c, ci) =>
          `<th${styleFor(ci)}>${renderCellInline(c)}</th>`,
        ).join('') + '</tr></thead>'
        const tbody = '<tbody>' + rows.map(r => {
          const tag = r.cls ? `<tr class="${r.cls}">` : '<tr>'
          return tag + r.cells.map((c, ci) =>
            `<td${styleFor(ci)}>${renderCellInline(c)}</td>`,
          ).join('') + '</tr>'
        }).join('') + '</tbody>'
        // Blank lines around the HTML block are what tells markdown-it to
        // treat it as a raw block rather than wrapping it in <p>.
        out.push('')
        out.push(`<table>${thead}${tbody}</table>`)
        out.push('')
        i = j
        continue
      }
    }
    out.push(lines[i])
    i++
  }
  return out.join('\n')
}

// Convention: a slide whose first non-empty non-HTML line is an h1 (`# …`)
// is a section-divider slide. Anything else (h2, plain content) uses the
// default layout. Explicit `layout:` in frontmatter always wins.
function detectLayout(content: string): 'section' | undefined {
  for (const raw of content.split(/\r?\n/)) {
    const t = raw.trim()
    if (!t) continue
    if (t.startsWith('<')) continue
    if (t.startsWith('# ')) return 'section'
    return undefined
  }
  return undefined
}

// Convert ```shell fences into the terminal panel HTML.
//
//   ```shell
//   $ go test -cover
//   coverage: 80.0% {badge}of statements{/badge}
//   ```
//
// becomes
//
//   <pre class="dc-shell"><span class="prompt">$</span> go test -cover
//   coverage: 80.0% <span class="badge">of statements</span></pre>
//
// The line-leading `$ ` is auto-converted to the muted prompt glyph, and
// `{badge}…{/badge}` / `{mark}…{/mark}` map to accent-soft chip and accent
// bold. Any other language passes through untouched.
function rewriteShellFences(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(/^(\s*)```(shell|sh|console|terminal)\s*$/)
    if (m) {
      const indent = m[1]
      const body: string[] = []
      let j = i + 1
      while (j < lines.length && !/^\s*```\s*$/.test(lines[j])) {
        body.push(lines[j])
        j++
      }
      const html = body.map(l =>
        esc(l)
          .replace(/^(\s*)\$ /, (_, sp) => `${sp}<span class="prompt">$</span> `)
          .replace(/\{badge\}([\s\S]*?)\{\/badge\}/g, '<span class="badge">$1</span>')
          .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<span class="mark">$1</span>')
      ).join('\n')
      out.push('')
      out.push(`${indent}<pre class="dc-shell">${html}</pre>`)
      out.push('')
      i = j + 1
      continue
    }
    out.push(line)
    i++
  }
  return out.join('\n')
}

// Inject `favicon: ''` into a deck's headmatter block so Slidev's built-in
// default favicon (a jsdelivr CDN icon) is suppressed. Runs for every deck, so
// the icon is configured commonly — no per-deck headmatter — matching the fact
// that the favicon (injected via slides/index.html) is the same everywhere and
// never changes. Skips decks that already set `favicon` explicitly.
function disableDefaultFavicon(lines: string[]): void {
  if (lines[0]?.trim() !== '---') return
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break }
  }
  if (end === -1) return
  for (let i = 1; i < end; i++) {
    if (/^favicon\s*:/.test(lines[i])) return
  }
  lines.splice(end, 0, "favicon: ''")
}

export default definePreparserSetup(() => {
  return [{
    name: 'row-attrs',
    transformRawLines(lines) {
      disableDefaultFavicon(lines)
    },
    transformSlide(content, frontmatter) {
      if (!frontmatter.layout) {
        const detected = detectLayout(content)
        if (detected) frontmatter.layout = detected
      }
      let out = rewriteTables(content)
      out = rewriteShellFences(out)
      return out
    },
  }]
})
