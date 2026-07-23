<script setup lang="ts">
defineProps<{
  hashtag?: string
}>()
</script>

<template>
  <div class="slidev-layout dc-content">
    <slot />
    <PageFooter :hashtag="hashtag" />
  </div>
</template>

<style scoped>
/* Plain block flow so element top/bottom margins collapse. That way
   consecutive elements pick the larger of their gap requirements, and the
   author doesn't have to sprinkle inline margin styles. */
.dc-content { display: block; }
</style>
