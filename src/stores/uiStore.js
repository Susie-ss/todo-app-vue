import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const DIY_KEY = 'diy-theme-colors'

function loadDIYColors() {
  try { return JSON.parse(localStorage.getItem(DIY_KEY)) || null } catch { return null }
}

export const useUIStore = defineStore('ui', () => {
  const openModals = ref({})
  const contextMenu = ref({ show: false, x: 0, y: 0, noteId: null })
  const toasts = ref([])
  const ctxTargetId = ref(null)

  // 主题: 'light' | 'dark' | 'diy'
  const theme = ref(localStorage.getItem('app-theme') || 'light')
  const diyColors = ref(loadDIYColors() || {
    primary: '#6366f1',
    bg: '#ffffff',
    bgSidebar: '#f8f9fa',
    textPrimary: '#1a1a2e',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    bgHover: '#f3f4f6',
    bgEditor: '#ffffff',
    bgNote: '#ffffff',
    shadow: '0 2px 8px rgba(0,0,0,0.08)',
    shadowHover: '0 4px 16px rgba(0,0,0,0.12)'
  })

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('app-theme', val)
    applyTheme()
  }

  function setDIYColors(colors) {
    diyColors.value = { ...diyColors.value, ...colors }
    localStorage.setItem(DIY_KEY, JSON.stringify(diyColors.value))
    if (theme.value === 'diy') applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement
    const t = theme.value
    root.setAttribute('data-theme', t)

    if (t === 'light') {
      root.style.cssText = ''
    } else if (t === 'dark') {
      root.style.cssText = `
        --bg: #0f172a; --bg-sidebar: #1e293b; --bg-hover: #334155;
        --bg-editor: #1e293b; --bg-note: #1e293b; --bg-input: #334155;
        --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #64748b;
        --border: #334155; --accent: #818cf8; --accent-hover: #6366f1;
        --danger: #f87171; --shadow: 0 2px 8px rgba(0,0,0,0.3);
        --shadow-hover: 0 4px 16px rgba(0,0,0,0.4);
      `
    } else if (t === 'diy') {
      const c = diyColors.value
      root.style.cssText = `
        --bg: ${c.bg}; --bg-sidebar: ${c.bgSidebar}; --bg-hover: ${c.bgHover};
        --bg-editor: ${c.bgEditor}; --bg-note: ${c.bgNote}; --bg-input: ${c.bgInput || '#f3f4f6'};
        --text-primary: ${c.textPrimary}; --text-secondary: ${c.textSecondary}; --text-muted: ${c.textMuted || '#9ca3af'};
        --border: ${c.border}; --accent: ${c.accent}; --accent-hover: ${c.accentHover};
        --danger: ${c.danger || '#ef4444'}; --shadow: ${c.shadow}; --shadow-hover: ${c.shadowHover};
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
    theme, diyColors,
    openModal, closeModal, showContextMenu, hideContextMenu, showToast,
    setTheme, setDIYColors, applyTheme
  }
})
