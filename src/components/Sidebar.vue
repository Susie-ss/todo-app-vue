<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">📝</div>
        <div class="sidebar-logo-text">Todo</div>
      </div>
      <button class="sidebar-add-btn" @click="openNewNoteModal">＋</button>
    </div>
    <div class="sidebar-tabs">
      <div class="sidebar-tab" :class="{active: sidebarTab === 'notes'}" @click="sidebarTab = 'notes'">笔记</div>
      <div class="sidebar-tab" :class="{active: sidebarTab === 'stickers'}" @click="sidebarTab = 'stickers'">便签</div>
      <div class="sidebar-tab" :class="{active: sidebarTab === 'todo'}" @click="sidebarTab = 'todo'">待办</div>
    </div>
    <SidebarNotes v-if="sidebarTab === 'notes'" />
    <SidebarStickers v-if="sidebarTab === 'stickers'" />
    <SidebarTodo v-if="sidebarTab === 'todo'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import SidebarNotes from './SidebarNotes.vue'
import SidebarStickers from './SidebarStickers.vue'
import SidebarTodo from './SidebarTodo.vue'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { sidebarTab } = storeToRefs(noteStore)

function openNewNoteModal() {
  uiStore.openModal('new-note-modal')
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}
.sidebar-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}
.sidebar-logo { display: flex; align-items: center; gap: 8px; }
.sidebar-logo-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--accent); display: flex; align-items: center;
  justify-content: center; font-size: 14px;
}
.sidebar-logo-text { font-size: 15px; font-weight: 700; }
.sidebar-add-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); cursor: pointer;
  font-size: 14px; transition: var(--transition);
}
.sidebar-add-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.sidebar-tabs { display: flex; border-bottom: 1px solid var(--border-light); }
.sidebar-tab {
  flex: 1; padding: 10px 0; text-align: center; font-size: 12px;
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent;
  transition: var(--transition);
}
.sidebar-tab:hover { color: var(--text-secondary); }
.sidebar-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
</style>
