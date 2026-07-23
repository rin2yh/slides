<script setup lang="ts">
// Renders a code panel with per-line highlight states.
// Each line is one entry of `lines`; the JSON array preserves whitespace natively.
//
// State values:
//   undefined -> plain line
//   'hl'      -> light accent background
//   'hl-strong' -> strong accent background
//   'dim'     -> muted text (skipped/not executed)
//
// `mark` (bool) wraps the whole line text in accent-colored bold.
//
// Example:
//   <Code :lines="[
//     { text: 'func Abs(n int) int {' },
//     { text: '    GoCover.Count[0] = 0', state: 'hl', mark: true },
//     { text: '    if n < 0 {', state: 'hl' },
//   ]" />
defineProps<{
  lines: { text: string, state?: 'hl' | 'hl-strong' | 'dim', mark?: boolean }[]
}>()
</script>

<template>
  <pre class="dc-code" v-pre><template v-for="(l, i) in lines" :key="i"><span v-if="l.state" :class="l.state"><span v-if="l.mark" class="mark">{{ l.text }}</span><template v-else>{{ l.text }}</template></span><template v-else>{{ l.text }}
</template></template></pre>
</template>
