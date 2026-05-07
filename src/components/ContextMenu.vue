<template>
  <Teleport to="body">
    <div
      class="ctx-menu"
      v-if="contextMenu.show"
      :style="{left: contextMenu.x + 'px', top: contextMenu.y + 'px', zIndex: 1001}"
      @click.stop
    >
      <div class="ctx-item" @click="act('open')">📄 打开</div>
      <div class="ctx-item" @click="act('sticky')">📌 创建便签</div>
      <div class="ctx-item" @click="act('copy')">📋 复制</div>
      <div class="ctx-divider"></div>
      <div class="ctx-submenu">
        <span class="ctx-label">📁 移动到</span>
        <div class="ctx-submenu-items">
          <div class="ctx-item" :class="{active: !currentFolderId}" @click="moveToFolder(null)">未分类</div>
          <div v-for="f in folders" :key="f.id" class="ctx-item" :class="{active: currentFolderId === f.id}" @click="moveToFolder(f.id)">{{ f.name }}</div>
        </div>
      </div>
      <div class="ctx-divider"></div>
      <div class="ctx-submenu">
        <span class="ctx-label">🎨 颜色</span>
        <div class="ctx-submenu-items">
          <div class="ctx-color-row">
            <span v-for="c in colors" :key="c.key" class="ctx-dot" :style="{background:c.val}" @click="setColor(c.key)"></span>
          </div>
        </div>
      </div>
      <div class="ctx-divider"></div>
      <div class="ctx-item danger" @click="act('delete')">🗑 删除</div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)
const { folders } = storeToRefs(noteStore)

const colors = [
  { key: 'blue', val: '#4f8ef7' },
  { key: 'yellow', val: '#f6e05e' },
  { key: 'pink', val: '#f687b3' },
  { key: 'green', val: '#68d391' },
  { key: 'purple', val: '#b794f4' },
  { key: 'teal', val: '#63b3ed' },
]

const currentFolderId = computed(() => {
  const id = contextMenu.value.noteId
  if (!id) return null
  const note = noteStore.notes.find(n => n.id === id)
  return note?.folderId || null
})

function act(type) {
  const id = contextMenu.value.noteId
  if (!id) { uiStore.hideContextMenu(); return }
  if (type === 'open') {
    noteStore.openNote(id)
  } else if (type === 'sticky') {
    const note = noteStore.notes.find(n => n.id === id)
    if (note) noteStore.createSticker(note)
  } else if (type === 'copy') {
    noteStore.copyNote(id)
    uiStore.showToast('笔记已复制', 'success')
  } else if (type === 'delete') {
    noteStore.deleteNote(id)
  }
  uiStore.hideContextMenu()
}

function moveToFolder(folderId) {
  const id = contextMenu.value.noteId
  if (id) {
    noteStore.updateNote(id, { folderId })
    uiStore.showToast('已移动', 'success')
  }
  uiStore.hideContextMenu()
}

function setColor(c) {
  const id = contextMenu.value.noteId
  if (id) noteStore.updateNote(id, { color: c })
  uiStore.hideContextMenu()
}

// Close on outside click
function onClickOutside() {
  uiStore.hideContextMenu()
}
onMounted(() => {
  window.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.ctx-menu {
  position: fixed; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 8px; padding: 4px 0; min-width: 180px;
  box-shadow: var(--shadow-lg); color: var(--text-primary); font-size: 13px;
}
.ctx-item {
  padding: 6px 16px; cursor: pointer; display: flex; align-items: center;
  gap: 6px; transition: var(--transition);
}
.ctx-item:hover { background: var(--bg-hover); }
.ctx-item.active { color: var(--accent); }
.ctx-item.danger { color: var(--danger); }
.ctx-divider { height: 1px; background: var(--border-light); margin: 4px 0; }
.ctx-color-row { display: flex; gap: 6px; padding: 0 16px; }
.ctx-dot { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
.ctx-dot:hover { border-color: var(--text-primary); }
.ctx-submenu { position: relative; }
.ctx-submenu > .ctx-label { padding: 6px 16px; display: block; color: var(--text-muted); font-size: 11px; }
.ctx-submenu-items { padding-left: 8px; }
</style>
