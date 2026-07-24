import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import comark from '@comark/markdown-it'
import { markdownItRowAttrs } from '../slides/vite.config'

// Render with the same plugins Slidev applies (comark = MDC), so the tests
// exercise the real interaction — not markdownItRowAttrs in isolation.
function render(src: string): string {
  return new MarkdownIt({ html: true }).use(comark).use(markdownItRowAttrs).render(src)
}

const table = (lastCell: string) => `
| a | b |
|---|:-:|
| x | ${lastCell} |
`

describe('markdownItRowAttrs', () => {
  it('hoists a trailing {.class} onto the row', () => {
    expect(render(table('y {.ok}'))).toContain('<tr class="ok">')
  })

  it('strips the marker from the cell text', () => {
    const html = render(table('y {.ok}'))
    expect(html).not.toContain('{.ok}')
    expect(html).toContain('y')
  })

  it('leaves a row without a marker unchanged', () => {
    expect(render(table('y'))).not.toContain('<tr class')
  })

  it('honors only .class tokens, ignoring #id and bare words', () => {
    const html = render(table('y {.ok #skip plain}'))
    expect(html).toContain('<tr class="ok">')
    expect(html).not.toContain('skip')
  })

  it('supports multiple classes', () => {
    expect(render(table('y {.ok .total}'))).toContain('<tr class="ok total">')
  })

  it('runs before inline parsing, so MDC/comark does not eat {.class} as a span', () => {
    // Regression guard for the `before("inline")` ordering: otherwise comark
    // turns `✓ {.ok}` into `<span class="ok">` on the cell instead of the row.
    const html = render(table('✓ {.ok}'))
    expect(html).toContain('<tr class="ok">')
    expect(html).not.toContain('<span class="ok"')
  })

  it('keeps native column alignment', () => {
    expect(render(table('y {.ok}'))).toContain('text-align:center')
  })
})
