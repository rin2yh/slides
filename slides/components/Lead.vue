<script setup lang="ts">
// Lead: bold "punchline" statement.
// size="lg" (default) = 44px — main punchline
// size="sm"           = 32px — sub-conclusion / callout
withDefaults(defineProps<{ size?: 'lg' | 'sm' }>(), { size: 'lg' })
</script>

<template>
  <div class="dc-lead" :class="[`size-${size}`]"><slot /></div>
</template>
