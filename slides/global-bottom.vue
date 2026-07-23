<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { next, prev, hasNext, hasPrev, currentSlideNo, total, isPlaying, isPresenter } = useNav()
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const visible = computed(() => isPlaying.value && !isPresenter.value)
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dc-playbar" role="toolbar" aria-label="スライド操作">
      <button
        class="dc-playbar-btn"
        :disabled="!hasPrev"
        aria-label="前のスライド"
        @click="prev()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="dc-playbar-count" aria-live="polite">
        <span class="dc-playbar-current">{{ currentSlideNo }}</span>
        <span class="dc-playbar-sep">/</span>
        <span class="dc-playbar-total">{{ total }}</span>
      </div>

      <button
        class="dc-playbar-btn"
        :disabled="!hasNext"
        aria-label="次のスライド"
        @click="next()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <span class="dc-playbar-divider" aria-hidden="true" />

      <button
        class="dc-playbar-btn"
        :aria-label="isFullscreen ? 'フルスクリーンを終了' : 'フルスクリーン'"
        @click="toggleFullscreen()"
      >
        <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.dc-playbar {
  position: fixed;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 0 8px;
  background: var(--dc-panel, #f0eee7);
  border: 1px solid var(--dc-border, #c4ccd0);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: 'JetBrains Mono', monospace;
  color: var(--dc-text-2, #3a4046);
  user-select: none;
}

.dc-playbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.dc-playbar-btn:hover:not(:disabled) {
  background: var(--dc-panel-accent, #e6f4f7);
  color: var(--dc-accent, #0a7c98);
}
.dc-playbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dc-playbar-count {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 0 10px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.dc-playbar-current { color: var(--dc-text, #1b1f23); font-weight: 500; }
.dc-playbar-sep { color: var(--dc-muted-3, #9aa0a6); }
.dc-playbar-total { color: var(--dc-muted, #7d838a); }

.dc-playbar-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: var(--dc-border-2, #eae6dd);
}
</style>
