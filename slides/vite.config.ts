import { defineConfig } from 'vite'
import type MarkdownIt from 'markdown-it'
import { markdownItRowAttrs } from './lib/row-attrs'

export default defineConfig({
  slidev: {
    markdown: {
      markdownSetup(md: MarkdownIt) {
        md.use(markdownItRowAttrs)
      },
    },
  },
})
