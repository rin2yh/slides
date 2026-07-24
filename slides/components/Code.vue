<script setup lang="ts">
import { computed } from 'vue'
import { renderCode } from '../lib/code'

// Custom code/output panel (no shiki highlighting). Pass each line as a string;
// `{badge}…{/badge}` / `{mark}…{/mark}` become accent spans. Used instead of a
// fenced code block so real fences stay on the normal shiki path.
const props = defineProps<{ lines: string[] }>()
const html = computed(() => renderCode(props.lines))
</script>

<template>
  <pre class="dc-code" v-html="html" />
</template>
