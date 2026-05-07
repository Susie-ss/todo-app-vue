import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const openModals = ref({})
  const contextMenu = ref({ show: false, x: 0, y: 0, noteId: null })
  const toasts = ref([])
  const ctxTargetId = ref(null)

  function openModal(name) {
    openModals.value[name] = true
  }

  function closeModal(name) {
    openModals.value[name] = false
  }

  function showContextMenu(e, noteId) {
    e.preventDefault()
    e.stopPropagation()
    ctxTargetId.value = noteId
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY,
      noteId
    }
  }

  function hideContextMenu() {
    contextMenu.value.show = false
    ctxTargetId.value = null
  }

  function showToast(msg, type = 'info') {
    const id = Date.now()
    toasts.value.push({ id, msg, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 2500)
  }

  return {
    openModals, contextMenu, toasts, ctxTargetId,
    openModal, closeModal, showContextMenu, hideContextMenu, showToast
  }
})
