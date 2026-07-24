<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  image?: string
  name?: string
  facts?: { label: string, value: string }[]
}>()

const resolvedImage = computed(() => {
  if (!props.image) return undefined
  if (!props.image.startsWith('/')) return props.image
  return import.meta.env.BASE_URL.replace(/\/$/, '') + props.image
})
</script>

<template>
  <div class="slidev-layout dc-profile">
    <h2><slot name="heading">自己紹介</slot></h2>
    <div class="body">
      <img v-if="resolvedImage" class="avatar" :src="resolvedImage" alt="" />
      <div v-else class="avatar placeholder" />
      <div class="facts">
        <div v-for="f in facts" :key="f.label" class="row">
          <span class="label dc-mono">{{ f.label }}</span>
          <span class="value" :class="{ strong: f.label === (facts && facts[0].label) }">{{ f.value }}</span>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dc-profile {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.dc-profile :deep(h2) { margin-bottom: 48px; }
.body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 130px;
}
.avatar {
  width: 520px;
  height: 520px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  flex: 0 0 auto;
}
.avatar.placeholder {
  background: repeating-linear-gradient(135deg, var(--dc-hatch-a), var(--dc-hatch-a) 14px, var(--dc-hatch-b) 14px, var(--dc-hatch-b) 28px);
  border: 1px solid var(--dc-border-3);
}
.facts {
  display: flex;
  flex-direction: column;
  gap: 46px;
}
.row {
  display: flex;
  align-items: baseline;
  gap: 52px;
}
.label {
  font-size: 30px;
  color: var(--dc-accent);
  width: 150px;
  flex: 0 0 auto;
}
.value {
  font-size: 44px;
  color: var(--dc-text-2);
}
.value.strong {
  color: var(--dc-text);
  font-weight: 700;
}
</style>
