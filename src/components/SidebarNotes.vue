<template>
  <div class="sidebar-panel">
    <div class="sidebar-search">
      <input type="text" v-model="searchQuery" placeholder="搜索笔记...">
    </div>
    <div class="sidebar-tree">
      <div class="tree-section">
        <div class="tree-section-label">快捷入口</div>
        <div class="tree-item" :class="{active: !activeFolder && !filterType}" @click="clearFilter">
          <span class="tree-icon">📋</span>
          <span class="tree-label">全部笔记</span>
          <span class="tree-count">{{ notes.length }}</span>
        </div>
        <div class="tree-item" :class="{active: filterType === 'todo'}" @click="setFilter('todo')">
          <span class="tree-icon">✅</span>
          <span class="tree-label">待办清单</span>
          <span class="tree-count">{{ todoCount }}</span>
        </div>
        <div class="tree-item" :class="{active: filterType === 'stickied'}" @click="setFilter('stickied')">
          <span class="tree-icon">📌</span>
          <span class="tree-label">便签</span>
          <span class="tree-count">{{ stickerCount }}</span>
        </div>
      </div>
      <div class="tree-section">
        <div class="tree-section-label">
          文件夹
          <button class="tree-add" @click="showFolderModal">＋</button>
        </div>
        <div
          class="tree-item"
          :class="{active: activeFolder === f.id, dropTarget: isDragging && activeFolder !== f.id}"
          v-for="f in folders"
          :key="f.id"
          @click="activeFolder = f.id; filterType = ''"
          @dragover.prevent="onDragOver(f.id)"
          @dragleave="onDragLeave"
          @drop="onDrop(f.id)"
        >
          <span class="tree-icon">📁</span>
          <span class="tree-label">{{ f.name }}</span>
          <span class="tree-count">{{ getFolderCount(f.id) }}</span>
        </div>
        <!-- 未分类作为拖放目标 -->
        <div
          class="tree-item"
          :class="{active: activeFolder === null && !filterType, dropTarget: isDragging && activeFolder !== null}"
          @click="clearFilter"
          @dragover.prevent="onDragOver(null)"
          @dragleave="onDragLeave"
          @drop="onDrop(null)"
        >
          <span class="tree-icon">📂</span>
          <span class="tree-label">未分类</span>
          <span class="tree-count">{{ getFolderCount(null) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { notes, folders, activeFolder } = storeToRefs(noteStore)

const searchQuery = ref('')
const filterType = ref('')
const isDragging = ref(false)

const todoCount = computed(() => notes.value.filter(n => n.type === 'todo').length)
const stickerCount = computed(() => noteStore.stickers.length)

function getFolderCount(id) {
  return notes.value.filter(n => n.folderId === id).length
}
function clearFilter() {
  activeFolder.value = null
  filterType.value = ''
  noteStore.setFilter('')
}
function setFilter(type) {
  activeFolder.value = null
  filterType.value = type
  noteStore.setFilter(type)
}
function showFolderModal() {
  uiStore.openModal('new-folder-modal')
}

// 拖拽支持
function onDragOver(folderId) {
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}
function onDrop(folderId) {
  isDragging.value = false
  const noteId = dragState.noteId
  if (noteId) {
    noteStore.updateNote(noteId, { folderId })
    uiStore.showToast('已移动到' + (folderId ? getFolderName(folderId) : '未分类'), 'success')
  }
  dragState.noteId = null
}
function getFolderName(id) {
  const f = folders.value.find(f => f.id === id)
  return f?.name || '未分类'
}

// 暴露拖拽状态给 NoteList
const dragState = window.__noteDragState = { noteId: null }
</script>

<style scoped>
.sidebar-panel { flex: 1; overflow-y: auto; }
.sidebar-search { padding: 8px 12px; }
.sidebar-search input {
  width: 100%; padding: 6px 10px; border-radius: 6px;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-primary); font-size: 12px; outline: none; font-family: var(--font);
}
.sidebar-search input:focus { border-color: var(--accent); }
.tree-section { padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.tree-section-label {
  padding: 4px 16px; font-size: 11px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; justify-content: space-between;
}
.tree-add { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px; }
.tree-add:hover { color: var(--accent); }
.tree-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 16px;
  cursor: pointer; font-size: 13px; color: var(--text-secondary);
  transition: var(--transition);
}
.tree-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.tree-item.active { background: var(--bg-active); color: var(--text-primary); }
.tree-item.dropTarget { background: var(--accent); color: white; opacity: 0.8; }
.tree-icon { font-size: 14px; }
.tree-label { flex: 1; }
.tree-count { font-size: 11px; color: var(--text-muted); background: var(--bg); padding: 1px 6px; border-radius: 8px; }
.tree-item.dropTarget .tree-count { background: rgba(255,255,255,0.2); color: white; }
</style>
