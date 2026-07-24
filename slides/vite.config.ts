import { defineConfig } from 'vite'
import type MarkdownIt from 'markdown-it'

// Add a row-level class to a Markdown table row via a trailing `{.class}` in
// its last cell:
//
//   | 単位        | 実行 |
//   |-------------|:----:|
//   | ブロック単位 | ✓ {.ok} |
//   | 合計        | 2 {.total} |
//
// renders the `<tr>` with `class="ok"` / `class="total"`. Only `.class`
// tokens are honored. This replaces the preparser's hand-written table
// rewrite: cells now go through markdown-it's own inline parsing (so links /
// MDC / any inline syntax work in every cell), and column alignment is handled
// natively by markdown-it — we only hoist the class onto the row.
//
// The marker must live *inside* the last cell (`… 2 {.total} |`), not as a
// standalone trailing cell (`… | 2 | {.total}`): markdown-it fixes each body
// row to the header's column count and discards any extra cell, so a separate
// `{.total}` cell would be dropped before this rule runs.
function markdownItRowAttrs(md: MarkdownIt) {
  // Run before the `inline` rule so the marker is stripped from the raw cell
  // content before any inline parsing (incl. MDC/comark) sees it — otherwise
  // `{.class}` gets consumed as an inline span attribute instead of the row.
  md.core.ruler.before('inline', 'row_attrs', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'tr_open') continue

      // The inline token of the row's last cell.
      let cell = null
      for (let j = i + 1; j < tokens.length && tokens[j].type !== 'tr_close'; j++) {
        if (tokens[j].type === 'inline') cell = tokens[j]
      }
      if (!cell) continue

      const m = cell.content.match(/\s*\{(\.[^}]*)\}\s*$/)
      if (!m) continue

      const cls = m[1]
        .split(/\s+/)
        .filter(x => x.startsWith('.'))
        .map(x => x.slice(1))
        .join(' ')
      if (cls) tokens[i].attrJoin('class', cls)

      // Drop the `{.class}` marker; the `inline` rule then parses the rest.
      cell.content = cell.content.slice(0, m.index)
    }
  })
}

export default defineConfig({
  slidev: {
    markdown: {
      markdownSetup(md: MarkdownIt) {
        md.use(markdownItRowAttrs)
      },
    },
  },
})
