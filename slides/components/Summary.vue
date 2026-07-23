<script setup lang="ts">
// Summary: numbered decisions with optional "理由" reason lines.
// Each item's `text` and `reason` accept HTML (so <b>…</b> works for dark
// bold and **…** in markdown-preprocessed strings works via Vue).
defineProps<{
  items: { text: string, reason?: string }[]
}>()
</script>

<template>
  <div class="summary">
    <template v-for="(item, i) in items" :key="i">
      <div class="item">
        <span class="num">{{ i + 1 }}.</span>
        <span v-html="item.text" />
      </div>
      <div v-if="item.reason" class="item reason">
        <span class="reason-label">理由</span>
        <span class="reason-body" v-html="item.reason" />
      </div>
    </template>
  </div>
</template>
