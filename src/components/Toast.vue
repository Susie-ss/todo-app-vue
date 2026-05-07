<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          class="toast-item"
          v-for="t in toasts"
          :key="t.id"
          :class="t.type"
        >
          <span class="toast-icon">{{ iconMap[t.type] || 'ℹ️' }}</span>
          <span class="toast-msg">{{ t.msg || t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
const { toasts } = storeToRefs(uiStore)

const iconMap = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}
</script>

<style scoped>
.toast-container {
  position: fixed; top: 16px; right: 16px; z-index: 2000;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none;
}
.toast-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px;
  border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border);
  box-shadow: var(--shadow); font-size: 13px; color: var(--text-primary);
  pointer-events: all; min-width: 200px; max-width: 360px;
}
.toast-item.success { border-left: 3px solid var(--success); }
.toast-item.error { border-left: 3px solid var(--danger); }
.toast-item.warning { border-left: 3px solid var(--warning); }
.toast-item.info { border-left: 3px solid var(--accent); }
.toast-icon { font-size: 14px; flex-shrink: 0; }
.toast-msg { flex: 1; }

.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastOut 0.3s ease; }
@keyframes toastIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-10px); } }
</style>
