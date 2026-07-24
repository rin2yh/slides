import { describe, it, expect } from 'vitest'
import { renderShell } from '../slides/setup/transformers'

describe('renderShell', () => {
  it('wraps the content in a dc-shell <pre>', () => {
    expect(renderShell('hello')).toBe('<pre class="dc-shell">hello</pre>')
  })

  it('turns a line-leading `$ ` into the prompt glyph', () => {
    expect(renderShell('$ go test -cover')).toBe(
      '<pre class="dc-shell"><span class="prompt">$</span> go test -cover</pre>',
    )
  })

  it('only rewrites `$ ` at the start of a line', () => {
    // A `$` mid-line (e.g. a shell variable) is left untouched.
    expect(renderShell('echo $HOME')).toBe('<pre class="dc-shell">echo $HOME</pre>')
  })

  it('maps {badge} and {mark} to accent spans', () => {
    const html = renderShell('coverage 80% {badge}of statements{/badge} {mark}66.7%{/mark}')
    expect(html).toContain('<span class="badge">of statements</span>')
    expect(html).toContain('<span class="mark">66.7%</span>')
  })

  it('HTML-escapes &, < and >', () => {
    expect(renderShell('a < b && c > d')).toContain('a &lt; b &amp;&amp; c &gt; d')
  })

  it('strips a single trailing newline (the fence terminator)', () => {
    expect(renderShell('line\n')).toBe('<pre class="dc-shell">line</pre>')
  })

  it('preserves multiple lines', () => {
    expect(renderShell('$ a\nb')).toBe(
      '<pre class="dc-shell"><span class="prompt">$</span> a\nb</pre>',
    )
  })
})
