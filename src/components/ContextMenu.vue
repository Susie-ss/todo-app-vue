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
      <div class="ctx-divider"></div>
      <div class="ctx-item color-item">
        颜色标记
        <span class="ctx-color-row">
          <span v-for="c in colors" :key="c.key" class="ctx-dot" :style="{background:c.val}" @click.stop="setColor(c.key)"></span>
        </span>
      </div>
      <div class="ctx-divider"></div>
      <div class="ctx-item danger" @click="act('delete')">🗑 删除</div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)

const colors = [
  { key: 'blue', val: '#4f8ef7' },
  { key: 'yellow', val: '#f6e05e' },
  { key: 'pink', val: '#f687b3' },
  { key: 'green', val: '#68d391' },
  { key: 'purple', val: '#b794f4' },
  { key: 'teal', val: '#63b3ed' },
]

function act(type) {
  const id = contextMenu.value.noteId
  if (!id) { uiStore.hideContextMenu(); return }
  if (type === 'open') {
    noteStore.openNote(id)
  } else if (type === 'sticky') {
    const note = noteStore.notes.find(n => n.id === id)
    if (note) noteStore.createSticker(note)
  } else if (type === 'delete') {
    noteStore.deleteNote(id)
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
.ctx-item.danger { color: var(--danger); }
.ctx-item.color-item { flex-wrap: wrap; }
.ctx-divider { height: 1px; background: var(--border-light); margin: 4px 0; }
.ctx-color-row { display: flex; gap: 4px; margin-left: auto; }
.ctx-dot { width: 14px; height: 14px; border-radius: 50%; cursor: pointer; border: 1.5px solid var(--border); }
</style>
