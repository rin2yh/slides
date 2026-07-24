<script setup lang="ts">
import { computed } from 'vue'
import { renderShell } from '../lib/shell'

// Terminal-output panel. Pass each line as a string; `{badge}…{/badge}` /
// `{mark}…{/mark}` become accent spans. Used instead of a ```shell fence so
// code fences stay on the normal shiki path (no fence interception).
const props = defineProps<{ lines: string[] }>()
const html = computed(() => renderShell(props.lines))
</script>

<template>
  <pre class="dc-shell" v-html="html" />
</template>
