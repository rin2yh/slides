import { defineShikiSetup } from '@slidev/types'
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers'

export default defineShikiSetup(() => {
  return {
    transformers: [
      transformerNotationDiff(),
      transformerNotationFocus(),
      transformerNotationHighlight(),
    ],
  }
})
