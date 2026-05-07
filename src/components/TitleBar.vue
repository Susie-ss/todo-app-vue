<template>
  <div class="titlebar">
    <div class="titlebar-dot red"></div>
    <div class="titlebar-dot yellow"></div>
    <div class="titlebar-dot green"></div>
    <div class="titlebar-title">Jotto</div>
    <div class="titlebar-actions">
      <div class="theme-switch" v-click-outside="closeThemePanel">
        <button class="theme-btn" @click="showThemePanel = !showThemePanel" :title="uiStore.theme === 'light' ? '浅色模式' : '深色模式'">
          {{ uiStore.theme === 'light' ? '☀️' : '🌙' }}
        </button>
        <div v-if="showThemePanel" class="theme-panel">
          <div class="theme-option" :class="{ active: uiStore.theme === 'light' }" @click="selectTheme('light')">
            <span class="theme-icon">☀️</span>
            <span>浅色</span>
          </div>
          <div class="theme-option" :class="{ active: uiStore.theme === 'dark' }" @click="selectTheme('dark')">
            <span class="theme-icon">🌙</span>
            <span>深色</span>
          </div>
        </div>
      </div>
      <button class="titlebar-btn" @click="createSticker">＋ 便签</button>
      <button class="titlebar-btn primary" @click="openNewNoteModal">＋ 新建笔记</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const showThemePanel = ref(false)

function selectTheme(t) {
  uiStore.setTheme(t)
  showThemePanel.value = false
}

function closeThemePanel() {
  showThemePanel.value = false
}

function createSticker() {
  noteStore.createSticker()
}

function openNewNoteModal() {
  uiStore.openModal('new-note-modal')
}
</script>

<style scoped>
.titlebar {
  height: 40px;
  background: var(--bg-sidebar);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  -webkit-app-region: drag;
  user-select: none;
  position: relative;
}
.titlebar-dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; -webkit-app-region: no-drag; }
.titlebar-dot.red { background: #ff5f57; }
.titlebar-dot.yellow { background: #febc2e; }
.titlebar-dot.green { background: #28c840; }
.titlebar-title { margin-left: 8px; font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.titlebar-actions { margin-left: auto; display: flex; gap: 8px; -webkit-app-region: no-drag; align-items: center; }
.titlebar-btn {
  padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: var(--transition); font-family: var(--font);
}
.titlebar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.titlebar-btn.primary { background: var(--accent); border-color: var(--accent); color: white; }
.titlebar-btn.primary:hover { background: var(--accent-hover); }

/* 主题切换按钮 */
.theme-switch { position: relative; }
.theme-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.theme-btn:hover { background: var(--bg-hover); }
.theme-panel {
  position: absolute; top: 34px; right: 0; width: 120px;
  background: var(--bg-note); border: 1px solid var(--border); border-radius: 8px;
  box-shadow: var(--shadow-hover); padding: 4px; z-index: 999;
  -webkit-app-region: no-drag;
}
.theme-option {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px; cursor: pointer;
  font-size: 13px; color: var(--text-primary); transition: var(--transition);
}
.theme-option:hover { background: var(--bg-hover); }
.theme-option.active { background: var(--accent); color: white; }
.theme-icon { font-size: 16px; }
</style>
