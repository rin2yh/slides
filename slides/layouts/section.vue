<script setup lang="ts">
defineProps<{
  no?: string | number
}>()
</script>

<template>
  <div class="slidev-layout dc-section">
    <div v-if="no !== undefined" class="tag dc-mono">SECTION {{ String(no).padStart(2, '0') }}</div>
    <div class="title"><slot /></div>
  </div>
</template>

<style scoped>
.dc-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.tag {
  font-size: 30px;
  color: var(--dc-accent);
  letter-spacing: 0.22em;
  margin-bottom: 42px;
}
.title :deep(h1) {
  margin: 0 0 40px;
  font-size: 120px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
</style>
