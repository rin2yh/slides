import { definePreparserSetup } from '@slidev/types'

// Convention: a slide whose first non-empty non-HTML line is an h1 (`# …`)
// is a section-divider slide. Anything else (h2, plain content) uses the
// default layout. Explicit `layout:` in frontmatter always wins.
//
// This stays in the preparser because it edits the slide's frontmatter, which
// only the preparser (`transformSlide`) can do — table row classes and shell
// fences moved to markdown-it / codeblock extension points instead.
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
