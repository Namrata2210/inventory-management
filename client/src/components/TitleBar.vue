<template>
  <header class="title-bar">
    <div class="title-bar-left">
      <span class="title-bar-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path
            d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 6l7 3.5L17 6M10 9.5V17.5"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="title-bar-app-name">{{ t('nav.companyName') }}</span>
    </div>

    <div class="title-bar-controls">
      <button
        type="button"
        class="title-bar-btn"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <svg v-if="isDark" viewBox="0 0 12 12" fill="none">
          <circle
            cx="6"
            cy="6"
            r="2.5"
            stroke="currentColor"
            stroke-width="1.15"
          />
          <path
            d="M6 0.5v1.4M6 10.1v1.4M0.5 6h1.4M10.1 6h1.4M2.3 2.3l1 1M8.7 8.7l1 1M9.7 2.3l-1 1M3.3 8.7l-1 1"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 12 12" fill="none">
          <path
            d="M9.7 7.4A4.1 4.1 0 015.3 1.3a4.6 4.6 0 105.4 5.4c-0.3 0.5-0.6 0.7-1 0.7z"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        class="title-bar-btn"
        :title="t('titleBar.minimize')"
        :aria-label="t('titleBar.minimize')"
        @click="$emit('minimize')"
      >
        <svg viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6h8"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        class="title-bar-btn"
        :title="isFullscreen ? t('titleBar.restore') : t('titleBar.maximize')"
        :aria-label="
          isFullscreen ? t('titleBar.restore') : t('titleBar.maximize')
        "
        @click="toggleFullscreen"
      >
        <svg v-if="!isFullscreen" viewBox="0 0 12 12" fill="none">
          <rect
            x="1.75"
            y="1.75"
            width="8.5"
            height="8.5"
            stroke="currentColor"
            stroke-width="1.25"
          />
        </svg>
        <svg v-else viewBox="0 0 12 12" fill="none">
          <rect
            x="3.5"
            y="1.5"
            width="7"
            height="7"
            stroke="currentColor"
            stroke-width="1.15"
          />
          <rect
            x="1.5"
            y="3.5"
            width="7"
            height="7"
            class="restore-icon-front"
            stroke="currentColor"
            stroke-width="1.15"
          />
        </svg>
      </button>

      <button
        type="button"
        class="title-bar-btn title-bar-btn-close"
        :title="t('titleBar.close')"
        :aria-label="t('titleBar.close')"
        @click="showCloseDialog = true"
      >
        <svg viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="close-dialog">
      <div
        v-if="showCloseDialog"
        class="close-dialog-overlay"
        @click.self="dismissCloseDialog"
      >
        <div
          class="close-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="t('titleBar.closeDialogTitle')"
        >
          <h3 class="close-dialog-title">
            {{ t('titleBar.closeDialogTitle') }}
          </h3>
          <p class="close-dialog-body">{{ t('titleBar.closeDialogBody') }}</p>
          <div class="close-dialog-actions">
            <button
              type="button"
              class="close-dialog-btn"
              @click="dismissCloseDialog"
            >
              {{ t('titleBar.closeDialogAcknowledge') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

const { t } = useI18n()
const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')

defineEmits(['minimize'])

const isFullscreen = ref(!!document.fullscreenElement)
const showCloseDialog = ref(false)

const updateFullscreenState = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState)
})

const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.error('Fullscreen request failed:', err)
  }
}

const dismissCloseDialog = async () => {
  // Closing the tab isn't possible from script for a user-opened tab.
  // As a reasonable approximation of "closing", drop out of fullscreen if active.
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch (err) {
      console.error('Failed to exit fullscreen:', err)
    }
  }
  showCloseDialog.value = false
}
</script>

<style scoped>
.title-bar {
  height: 42px;
  min-height: 42px;
  flex-shrink: 0;
  background: #0b1120;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.375rem 0 0.875rem;
  user-select: none;
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.title-bar-icon {
  display: flex;
  align-items: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.title-bar-icon svg {
  width: 16px;
  height: 16px;
}

.title-bar-app-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-bar-controls {
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
}

.title-bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.title-bar-btn svg {
  width: 12px;
  height: 12px;
}

.title-bar-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.title-bar-btn-close:hover {
  background: #dc2626;
  color: #ffffff;
}

.restore-icon-front {
  fill: #0b1120;
}

/* Close confirmation dialog */
.close-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1rem;
}

.close-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
  padding: 1.5rem;
}

.close-dialog-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin-bottom: 0.625rem;
}

.close-dialog-body {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.close-dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.close-dialog-btn {
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: inherit;
}

.close-dialog-btn:hover {
  background: #1d4ed8;
}

.close-dialog-enter-active,
.close-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.close-dialog-enter-from,
.close-dialog-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .close-dialog-enter-active,
  .close-dialog-leave-active {
    transition: none;
  }
}
</style>
