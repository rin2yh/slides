<script setup lang="ts">
import { computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

const nav = useNav()
const { $frontmatter } = useSlideContext()

const hashtag = computed<string>(() => (($frontmatter as Record<string, unknown> | undefined)?.hashtag as string | undefined) ?? '')
const showNumber = computed(() => nav.currentLayout.value !== 'cover')
const no = computed(() => String(nav.currentSlideNo.value).padStart(2, '0'))
</script>

<template>
  <span v-if="hashtag" class="footer-tag left">#{{ hashtag }}</span>
  <span v-if="showNumber" class="footer-tag right">{{ no }}</span>
</template>

<style scoped>
.footer-tag {
  position: absolute;
  bottom: 56px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  color: var(--dc-muted-2);
  letter-spacing: 0.08em;
}
.left { left: 130px; }
.right { right: 130px; }
</style>
