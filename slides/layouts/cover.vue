<script setup lang="ts">
defineProps<{
  event?: string
  speaker?: string
  handle?: string
  handleUrl?: string
  hashtag?: string
}>()
</script>

<template>
  <div class="slidev-layout dc-cover">
    <div v-if="event" class="event dc-mono">{{ event }}</div>
    <div class="title"><slot /></div>
    <div v-if="speaker" class="speaker">
      {{ speaker }}
      <template v-if="handle">
        <span class="handle-sep dc-mono">/</span>
        <a v-if="handleUrl" class="handle dc-mono" :href="handleUrl" target="_blank" rel="noopener">{{ handle }}</a>
        <span v-else class="handle dc-mono">{{ handle }}</span>
      </template>
    </div>
    <PageFooter :hashtag="hashtag" :show-number="false" />
  </div>
</template>

<style scoped>
.dc-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event {
  font-size: 30px;
  color: var(--dc-accent);
  letter-spacing: 0.12em;
  margin-bottom: 30px;
}
.title :deep(h1) {
  margin: 0 0 36px;
  font-size: 84px;
  max-width: 1620px;
}
.speaker {
  font-size: 32px;
  color: var(--dc-text-2);
  font-weight: 500;
}
.speaker .handle,
.speaker .handle-sep {
  color: var(--dc-muted-2);
  margin-left: 6px;
}
.speaker a.handle { color: var(--dc-accent); }
</style>
