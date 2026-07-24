import { definePreparserSetup } from '@slidev/types'

// A slide whose first non-empty non-HTML line is an h1 (`# …`) is a
// section divider; anything else keeps the default layout. Explicit
// `layout:` wins. Stays in the preparser because only it can edit frontmatter.
function detectLayout(content: string): 'section' | undefined {
  for (const raw of content.split(/\r?\n/)) {
    const t = raw.trim()
    if (!t) continue
    if (t.startsWith('<')) continue
    if (t.startsWith('# ')) return 'section'
    return undefined
  }
  return undefined
}

export default definePreparserSetup(() => {
  return [{
    name: 'auto-layout',
    transformSlide(content, frontmatter) {
      if (!frontmatter.layout) {
        const detected = detectLayout(content)
        if (detected) frontmatter.layout = detected
      }
      return content
    },
  }]
})
