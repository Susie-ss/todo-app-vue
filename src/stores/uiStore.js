import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const openModals = ref({})
  const contextMenu = ref({ show: false, x: 0, y: 0, noteId: null })
  const toasts = ref([])
  const ctxTargetId = ref(null)

  // 主题: 'light' | 'dark'
  const theme = ref(localStorage.getItem('app-theme') || 'light')

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('app-theme', val)
    applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement
    const t = theme.value
    root.setAttribute('data-theme', t)

    if (t === 'light') {
      // 清新淡雅的浅色主题
      root.style.cssText = `
        --bg: #f5f7fa;
        --bg-sidebar: #ffffff;
        --bg-hover: #eef1f5;
        --bg-editor: #ffffff;
        --bg-note: #ffffff;
        --bg-input: #f5f7fa;
        --text-primary: #374151;
        --text-secondary: #6b7280;
        --text-muted: #9ca3af;
        --border: #e5e7eb;
        --accent: #3b82f6;
        --accent-hover: #2563eb;
        --danger: #ef4444;
        --success: #10b981;
        --warning: #f59e0b;
        --shadow: 0 2px 8px rgba(0,0,0,0.04);
        --shadow-hover: 0 4px 12px rgba(0,0,0,0.08);
        --shadow-lg: 0 8px 24px rgba(0,0,0,0.1);
        --radius: 8px;
        --radius-sm: 4px;
        --radius-lg: 12px;
      `
    } else {
      // 深色主题
      root.style.cssText = `
        --bg: #0f172a;
        --bg-sidebar: #1e293b;
        --bg-hover: #334155;
        --bg-editor: #1e293b;
        --bg-note: #1e293b;
        --bg-input: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --border: #334155;
        --accent: #818cf8;
        --accent-hover: #6366f1;
        --danger: #f87171;
        --success: #34d399;
        --warning: #fbbf24;
        --shadow: 0 2px 8px rgba(0,0,0,0.3);
        --shadow-hover: 0 4px 16px rgba(0,0,0,0.4);
        --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
        --radius: 8px;
        --radius-sm: 4px;
        --radius-lg: 12px;
      `
    }
  }

  // 初始化应用主题
  applyTheme()

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
    theme,
    openModal, closeModal, showContextMenu, hideContextMenu, showToast,
    setTheme, applyTheme
  }
})
