import { describe, it, expect } from 'vitest'
import { renderCode } from '../slides/lib/code'

describe('renderCode', () => {
  it.each([
    { name: 'passes a plain line through', lines: ['hello'], expected: 'hello' },
    { name: 'leaves a `$` prompt as literal text', lines: ['$ go test -cover'], expected: '$ go test -cover' },
    {
      name: 'maps {badge} and {mark} to accent spans',
      lines: ['x {badge}stmts{/badge} {mark}66.7%{/mark}'],
      expected: 'x <span class="badge">stmts</span> <span class="mark">66.7%</span>',
    },
    { name: 'HTML-escapes &, < and >', lines: ['a < b && c > d'], expected: 'a &lt; b &amp;&amp; c &gt; d' },
    { name: 'joins lines with a newline', lines: ['a', 'b'], expected: 'a\nb' },
  ])('$name', ({ lines, expected }) => {
    expect(renderCode(lines)).toBe(expected)
  })
})
