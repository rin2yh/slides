import { describe, it, expect } from 'vitest'
import { renderShell } from '../slides/setup/transformers'

const PRE = (inner: string) => `<pre class="dc-shell">${inner}</pre>`

describe('renderShell', () => {
  it.each([
    { name: 'wraps content in a dc-shell <pre>', input: 'hello', expected: PRE('hello') },
    {
      name: 'turns a line-leading `$ ` into the prompt glyph',
      input: '$ go test -cover',
      expected: PRE('<span class="prompt">$</span> go test -cover'),
    },
    { name: 'leaves a mid-line `$` (shell var) untouched', input: 'echo $HOME', expected: PRE('echo $HOME') },
    {
      name: 'maps {badge} and {mark} to accent spans',
      input: 'x {badge}stmts{/badge} {mark}66.7%{/mark}',
      expected: PRE('x <span class="badge">stmts</span> <span class="mark">66.7%</span>'),
    },
    { name: 'HTML-escapes &, < and >', input: 'a < b && c > d', expected: PRE('a &lt; b &amp;&amp; c &gt; d') },
    { name: 'strips a single trailing newline', input: 'line\n', expected: PRE('line') },
    { name: 'preserves multiple lines', input: '$ a\nb', expected: PRE('<span class="prompt">$</span> a\nb') },
  ])('$name', ({ input, expected }) => {
    expect(renderShell(input)).toBe(expected)
  })
})
