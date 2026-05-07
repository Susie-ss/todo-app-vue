import { defineStore } from 'pinia'
import { ref } from 'vue'

const AI_CONFIG_KEY = 'workbuddy-ai-config'

export const useUIStore = defineStore('ui', () => {
  const openModals = ref({})
  const contextMenu = ref({ show: false, x: 0, y: 0, noteId: null })
  const toasts = ref([])
  const ctxTargetId = ref(null)

  // AI 配置
  const aiConfig = ref(loadAIConfig())

  function loadAIConfig() {
    try {
      const saved = localStorage.getItem(AI_CONFIG_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    // 默认配置
    return {
      enabled: false,
      provider: 'openai', // openai / siliconflow / custom
      apiUrl: '',
      apiKey: '',
      model: 'gpt-3.5-turbo'
    }
  }

  function saveAIConfig(config) {
    aiConfig.value = { ...config }
    try {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(aiConfig.value))
    } catch (e) {}
  }

  // 深色主题
  const theme = 'dark'

  function applyTheme() {
    const root = document.documentElement
    root.setAttribute('data-theme', 'dark')
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
    aiConfig,
    openModal, closeModal, showContextMenu, hideContextMenu, showToast,
    applyTheme, saveAIConfig
  }
})
