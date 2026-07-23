<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const props = withDefaults(defineProps<{
  hashtag?: string
  showNumber?: boolean
  numberPosition?: 'left' | 'right'
}>(), {
  hashtag: '',
  showNumber: true,
  numberPosition: 'right',
})

const nav = useNav()
const no = computed(() => String(nav.currentSlideNo.value).padStart(2, '0'))
</script>

<template>
  <span v-if="hashtag" class="footer-tag" :class="numberPosition === 'right' ? 'left' : 'right'">
    #{{ hashtag }}
  </span>
  <span v-if="showNumber" class="footer-tag" :class="numberPosition">
    {{ no }}
  </span>
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
