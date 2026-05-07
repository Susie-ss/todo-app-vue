<template>
  <div class="titlebar">
    <div class="titlebar-dot red"></div>
    <div class="titlebar-dot yellow"></div>
    <div class="titlebar-dot green"></div>
    <div class="titlebar-title">Jotto</div>
    <div class="titlebar-actions">
      <button class="titlebar-btn" @click="createSticker">＋ 便签</button>
      <button class="titlebar-btn primary" @click="openNewNoteModal">＋ 新建笔记</button>
    </div>
  </div>
</template>

<script setup>
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()

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
}
.titlebar-dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; -webkit-app-region: no-drag; }
.titlebar-dot.red { background: #ff5f57; }
.titlebar-dot.yellow { background: #febc2e; }
.titlebar-dot.green { background: #28c840; }
.titlebar-title { margin-left: 8px; font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.titlebar-actions { margin-left: auto; display: flex; gap: 8px; -webkit-app-region: no-drag; }
.titlebar-btn {
  padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: var(--transition); font-family: var(--font);
}
.titlebar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.titlebar-btn.primary { background: var(--accent); border-color: var(--accent); color: white; }
.titlebar-btn.primary:hover { background: var(--accent-hover); }
</style>
