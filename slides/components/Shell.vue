<script setup lang="ts">
// Renders as a terminal / shell output panel.
// Passing content via `code` preserves whitespace regardless of Vue's condense.
// Highlight patterns:
//   {prompt}   -> muted "$ " prompt glyph
//   {badge}...{/badge}  -> accent-soft filled inline badge
//   {mark}...{/mark}    -> accent-color bold text
//
// Example:
//   <Shell code="{prompt}$ go test -cover
// coverage: 80.0% {badge}of statements{/badge}" />
const props = defineProps<{ code: string }>()

const html = props.code
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\{prompt\}/g, '<span class="prompt">$</span>')
  .replace(/\{badge\}([\s\S]*?)\{\/badge\}/g, '<span class="badge">$1</span>')
  .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<span class="mark">$1</span>')
</script>

<template>
  <pre class="dc-shell" v-html="html" />
</template>
