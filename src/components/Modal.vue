<template>
  <Teleport to="body">
    <div class="modal-backdrop" v-if="isOpen" @click.self="onBackdrop">
      <div class="modal-content" :style="{maxWidth: maxWidth}">
        <div class="modal-header" v-if="title">
          <span class="modal-title">{{ title }}</span>
          <button class="modal-close" @click="close">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '../stores/uiStore'

const props = defineProps({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '420px' }
})

const uiStore = useUIStore()
const { openModals } = storeToRefs(uiStore)

const isOpen = computed(() => !!openModals.value[props.name])

function close() { uiStore.closeModal(props.name) }
function onBackdrop() { close() }
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); width: 90%; max-height: 80vh;
  overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp 0.2s ease;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border-light);
}
.modal-title { font-size: 14px; font-weight: 600; }
.modal-close {
  width: 24px; height: 24px; border-radius: 4px; border: none;
  background: transparent; color: var(--text-muted); cursor: pointer; font-size: 16px;
}
.modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }
.modal-body { padding: 20px; }
</style>
