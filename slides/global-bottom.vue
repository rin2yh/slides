<script setup lang="ts">
import { useFullscreen, isClient } from '@vueuse/core'
import { useNav } from '@slidev/client'

const { next, prev, hasNext, hasPrev, currentSlideNo, total, isPlaying, isPresenter } = useNav()
// Slidev's built-in `f` shortcut fullscreens `document.body`; match it so
// our button and Slidev's shortcut share one state.
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(isClient ? document.body : null)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isPlaying && !isPresenter && !isFullscreen"
      class="dc-playbar"
      role="toolbar"
      aria-label="スライド操作"
    >
      <button
        v-for="b in [
          { disabled: !hasPrev, label: '前のスライド', d: 'M15 6l-6 6 6 6', click: prev },
          { disabled: !hasNext, label: '次のスライド', d: 'M9 6l6 6-6 6', click: next },
        ]"
        :key="b.label"
        class="dc-playbar-btn"
        :disabled="b.disabled"
        :aria-label="b.label"
        @click="b.click()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path :d="b.d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="dc-playbar-count dc-mono" aria-live="polite">
        <span class="dc-playbar-current">{{ currentSlideNo }}</span> / {{ total }}
      </div>

      <span class="dc-playbar-divider" aria-hidden="true" />

      <button
        class="dc-playbar-btn"
        :aria-label="isFullscreen ? 'フルスクリーンを終了' : 'フルスクリーン'"
        @click="toggleFullscreen()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            :d="isFullscreen
              ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5'
              : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
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
  background: var(--dc-panel);
  border: 1px solid var(--dc-border);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: var(--dc-text-2);
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
  background: var(--dc-panel-accent);
  color: var(--dc-accent);
}
.dc-playbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dc-playbar-count {
  padding: 0 10px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--dc-muted);
}
.dc-playbar-current { color: var(--dc-text); font-weight: 500; }

.dc-playbar-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: var(--dc-border-2);
}
</style>
