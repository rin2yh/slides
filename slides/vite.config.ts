import { defineConfig } from 'vite'
import type MarkdownIt from 'markdown-it'

// `{.class}` at the end of a row's last cell → `class` on its `<tr>`.
// Must be inside the last cell (`2 {.total} |`), not a trailing cell
// (`| 2 | {.total}`): markdown-it drops cells past the header column count.
export function markdownItRowAttrs(md: MarkdownIt) {
  // Before `inline` so the marker is stripped before MDC/comark parses the
  // cell (else `{.class}` becomes an inline span instead of the row class).
  md.core.ruler.before('inline', 'row_attrs', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'tr_open') continue

      let cell = null
      for (let j = i + 1; j < tokens.length && tokens[j].type !== 'tr_close'; j++) {
        if (tokens[j].type === 'inline') cell = tokens[j]
      }
      if (!cell) continue

      const m = cell.content.match(/\s*\{(\.[^}]*)\}\s*$/)
      if (!m) continue

      const cls = m[1].split(/\s+/).filter(x => x.startsWith('.')).map(x => x.slice(1)).join(' ')
      if (cls) tokens[i].attrJoin('class', cls)
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
