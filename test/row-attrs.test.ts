import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import comark from '@comark/markdown-it'
import { markdownItRowAttrs } from '../slides/vite.config'

// Render with the same plugins Slidev applies (comark = MDC), so the tests
// exercise the real interaction — not markdownItRowAttrs in isolation.
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
    { name: 'hoists a trailing {.class} onto the row', cell: 'y {.ok}', present: ['<tr class="ok">'], absent: [] },
    { name: 'strips the marker from the cell text', cell: 'y {.ok}', present: ['y'], absent: ['{.ok}'] },
    { name: 'leaves a row without a marker unchanged', cell: 'y', present: [], absent: ['<tr class'] },
    {
      name: 'honors only .class, ignoring #id and bare words',
      cell: 'y {.ok #skip plain}',
      present: ['<tr class="ok">'],
      absent: ['skip'],
    },
    { name: 'supports multiple classes', cell: 'y {.ok .total}', present: ['<tr class="ok total">'], absent: [] },
    {
      // Regression guard for `before("inline")`: otherwise comark turns
      // `✓ {.ok}` into a `<span class="ok">` on the cell instead of the row.
      name: 'runs before inline so MDC does not eat {.class} as a span',
      cell: '✓ {.ok}',
      present: ['<tr class="ok">'],
      absent: ['<span class="ok"'],
    },
    { name: 'keeps native column alignment', cell: 'y {.ok}', present: ['text-align:center'], absent: [] },
  ])('$name', ({ cell, present, absent }) => {
    const html = renderRow(cell)
    for (const s of present) expect(html).toContain(s)
    for (const s of absent) expect(html).not.toContain(s)
  })
})
