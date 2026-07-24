import { defineTransformersSetup, defineCodeblockTransformer } from '@slidev/types'

// Render ```shell / ```sh / ```console / ```terminal fences as the terminal
// panel HTML.
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
// A line-leading `$ ` becomes the muted prompt glyph, and
// `{badge}…{/badge}` / `{mark}…{/mark}` map to the accent-soft chip and accent
// bold spans. Any other language returns undefined and falls through to
// Slidev's normal (shiki) fence rendering.
//
// This runs on the already-tokenized fence (info + content) instead of the raw
// Markdown text, so it replaces the preparser's regex-based rewrite.

const SHELL_LANGS = new Set(['shell', 'sh', 'console', 'terminal'])

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const shellFence = defineCodeblockTransformer(({ info, code }) => {
  const lang = info.split(/\s+/)[0]
  if (!SHELL_LANGS.has(lang)) return

  const html = code
    .replace(/\n$/, '')
    .split('\n')
    .map(l =>
      esc(l)
        .replace(/^(\s*)\$ /, (_, sp) => `${sp}<span class="prompt">$</span> `)
        .replace(/\{badge\}([\s\S]*?)\{\/badge\}/g, '<span class="badge">$1</span>')
        .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<span class="mark">$1</span>'),
    )
    .join('\n')

  return `<pre class="dc-shell">${html}</pre>`
})

export default defineTransformersSetup(() => ({
  codeblocks: [shellFence],
}))
