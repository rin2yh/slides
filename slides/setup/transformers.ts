import { defineTransformersSetup, defineCodeblockTransformer } from '@slidev/types'

// Render ```shell / ```sh / ```console / ```terminal fences as the terminal
// panel: line-leading `$ ` → prompt glyph, `{badge}…{/badge}` / `{mark}…{/mark}`
// → accent spans. Other languages fall through to shiki.

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
