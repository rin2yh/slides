import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import comark from '@comark/markdown-it'
import { markdownItRowAttrs } from '../slides/vite.config'

// Render with comark (MDC) applied, mirroring how Slidev wires the rule
// alongside it — so the tests exercise the real interaction, not the plugin
// in isolation.
function renderRow(lastCell: string): string {
  const src = `
| a | b |
|---|:-:|
| x | ${lastCell} |
`
  return new MarkdownIt({ html: true }).use(comark).use(markdownItRowAttrs).render(src)
}

describe('markdownItRowAttrs', () => {
  it.each([
    { name: 'hoists a trailing {.class} onto the row', cell: 'y {.ok}', contains: '<tr class="ok">' },
    { name: 'strips the marker from the cell text', cell: 'y {.ok}', contains: 'y', notContains: '{.ok}' },
    { name: 'leaves a row without a marker unchanged', cell: 'y', notContains: '<tr class' },
    {
      name: 'honors only .class, ignoring #id and bare words',
      cell: 'y {.ok #skip plain}',
      contains: '<tr class="ok">',
      notContains: 'skip',
    },
    { name: 'supports multiple classes', cell: 'y {.ok .total}', contains: '<tr class="ok total">' },
    {
      // Regression guard for `before("inline")`: otherwise comark turns
      // `✓ {.ok}` into a `<span class="ok">` on the cell instead of the row.
      name: 'runs before inline so MDC does not eat {.class} as a span',
      cell: '✓ {.ok}',
      contains: '<tr class="ok">',
      notContains: '<span class="ok"',
    },
    { name: 'keeps native column alignment', cell: 'y {.ok}', contains: 'text-align:center' },
  ])('$name', ({ cell, contains, notContains }) => {
    const html = renderRow(cell)
    if (contains) expect(html).toContain(contains)
    if (notContains) expect(html).not.toContain(notContains)
  })
})
