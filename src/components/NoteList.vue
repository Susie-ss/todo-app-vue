<template>
  <div class="note-list-panel">
    <div class="note-list-header">
      <div class="note-list-title">
        <span v-if="!selectMode">{{ listTitle }}</span>
        <span v-else>已选 {{ selectedIds.length }} 项</span>
      </div>
      <div class="note-list-actions">
        <button class="icon-btn" :class="{active: selectMode}" @click="toggleSelectMode" title="批量选择">☑</button>
        <button class="icon-btn" @click="sortDesc = !sortDesc" title="切换排序">↕</button>
        <button class="icon-btn" @click="openNewNoteModal" title="新建笔记">＋</button>
      </div>
    </div>
    <!-- 批量操作栏 -->
    <div v-if="selectMode && selectedIds.length > 0" class="batch-actions">
      <button class="batch-btn" @click="batchMove">📁 移动</button>
      <button class="batch-btn danger" @click="batchDelete">🗑 删除</button>
    </div>
    <div class="note-list" ref="noteListRef">
      <div
        class="note-item"
        v-for="note in displayedNotes"
        :key="note.id"
        :class="{
          active: activeNoteId === note.id && !selectMode,
          selected: selectedIds.includes(note.id),
          dragging: dragId === note.id
        }"
        @click="handleClick(note.id)"
        @dragstart="onDragStart(note.id)"
        @dragend="onDragEnd"
        draggable="true"
      >
        <div v-if="selectMode" class="note-check" @click.stop>
          <input type="checkbox" :checked="selectedIds.includes(note.id)" @change="toggleSelect(note.id)">
        </div>
        <div class="note-item-icon">{{ note.type === 'todo' ? '✅' : '📄' }}</div>
        <div class="note-item-body">
          <div class="note-item-title">{{ note.title || '无标题' }}</div>
          <div class="note-item-meta">
            <span class="note-item-dot" :style="{background: colorMap[note.color] || colorMap.default}"></span>
            <span>{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
        <div class="note-item-actions" @click.stop v-if="!selectMode">
          <button class="icon-btn-sm" @click="showCtx($event, note.id)">⋯</button>
        </div>
      </div>
      <div v-if="displayedNotes.length === 0" class="empty-hint">
        暂无笔记，点击 ＋ 新建
      </div>
    </div>
    <!-- 批量移动弹窗 -->
    <Teleport to="body">
      <div v-if="showBatchMove" class="modal-overlay" @click.self="showBatchMove = false">
        <div class="batch-move-modal">
          <div class="modal-header">
            <h3>移动到文件夹</h3>
            <button class="modal-close" @click="showBatchMove = false">×</button>
          </div>
          <div class="modal-body">
            <div class="move-option" :class="{active: moveTargetId === null}" @click="moveTargetId = null">📂 未分类</div>
            <div v-for="f in folders" :key="f.id" class="move-option" :class="{active: moveTargetId === f.id}" @click="moveTargetId = f.id">{{ f.name }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showBatchMove = false">取消</button>
            <button class="btn-primary" @click="confirmMove">确认移动</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { notes, folders, activeNoteId, sortDesc, activeFolder } = storeToRefs(noteStore)

const selectMode = ref(false)
const selectedIds = ref([])
const showBatchMove = ref(false)
const moveTargetId = ref(null)
const dragId = ref(null)

const colorMap = {
  blue: '#4f8ef7', yellow: '#f6e05e', pink: '#f687b3',
  green: '#68d391', purple: '#b794f4', teal: '#63b3ed', default: '#9aa3bc'
}

const displayedNotes = computed(() => {
  let list = [...notes.value]
  if (activeFolder.value) {
    list = list.filter(n => n.folderId === activeFolder.value)
  }
  list.sort((a, b) => {
    const fa = sortDesc.value ? 1 : -1
    return (new Date(b.updatedAt) - new Date(a.updatedAt)) * fa
  })
  return list
})

const listTitle = computed(() => {
  if (activeFolder.value) {
    const f = noteStore.folders.find(f => f.id === activeFolder.value)
    return f ? f.name : '笔记'
  }
  return '全部笔记'
})

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getMonth()+1}/${dt.getDate()}`
}

function handleClick(id) {
  if (selectMode.value) {
    toggleSelect(id)
  } else {
    noteStore.openNote(id)
  }
}

function openNewNoteModal() { uiStore.openModal('new-note-modal') }
function showCtx(e, id) { uiStore.showContextMenu(e, id) }

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) selectedIds.value = []
}
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

function batchMove() {
  if (selectedIds.value.length === 0) return
  moveTargetId.value = null
  showBatchMove.value = true
}
function confirmMove() {
  noteStore.moveNotesToFolder(selectedIds.value, moveTargetId.value)
  uiStore.showToast(`已移动 ${selectedIds.value.length} 项`, 'success')
  selectedIds.value = []
  showBatchMove.value = false
}
function batchDelete() {
  if (selectedIds.value.length === 0) return
  if (confirm(`确定删除 ${selectedIds.value.length} 篇笔记？`)) {
    noteStore.deleteNotes(selectedIds.value)
    uiStore.showToast(`已删除 ${selectedIds.value.length} 项`, 'success')
    selectedIds.value = []
    selectMode.value = false
  }
}

// 拖拽
function onDragStart(id) {
  dragId.value = id
  if (window.__noteDragState) window.__noteDragState.noteId = id
}
function onDragEnd() {
  dragId.value = null
}
</script>

<style scoped>
.note-list-panel {
  width: 280px; border-right: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
}
.note-list-header {
  padding: 12px 16px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid var(--border-light);
}
.note-list-title { font-size: 13px; font-weight: 600; }
.note-list-actions { display: flex; gap: 4px; }
.batch-actions {
  padding: 8px 16px; background: var(--bg-active); display: flex; gap: 8px;
  border-bottom: 1px solid var(--border);
}
.batch-btn {
  padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-primary); font-size: 12px; cursor: pointer;
}
.batch-btn:hover { background: var(--bg-hover); }
.batch-btn.danger { color: var(--danger); border-color: var(--danger); }
.note-list { flex: 1; overflow-y: auto; }
.note-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  cursor: pointer; border-bottom: 1px solid var(--border-light);
  transition: var(--transition);
}
.note-item:hover { background: var(--bg-hover); }
.note-item.active { background: var(--bg-active); }
.note-item.selected { background: var(--accent); opacity: 0.2; }
.note-item.dragging { opacity: 0.5; }
.note-check { flex-shrink: 0; }
.note-check input { width: 16px; height: 16px; cursor: pointer; }
.note-item-icon { font-size: 16px; flex-shrink: 0; }
.note-item-body { flex: 1; min-width: 0; }
.note-item-title {
  font-size: 13px; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.note-item-meta {
  display: flex; align-items: center; gap: 6px;
  margin-top: 4px; font-size: 11px; color: var(--text-muted);
}
.note-item-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.note-item-actions { opacity: 0; transition: var(--transition); }
.note-item:hover .note-item-actions { opacity: 1; }
.icon-btn {
  width: 26px; height: 26px; border-radius: 4px; border: none;
  background: transparent; color: var(--text-muted); cursor: pointer; font-size: 13px;
}
.icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.icon-btn.active { color: var(--accent); }
.icon-btn-sm {
  width: 24px; height: 24px; border-radius: 4px; border: none;
  background: transparent; color: var(--text-muted); cursor: pointer; font-size: 14px;
}
.icon-btn-sm:hover { background: var(--bg-hover); color: var(--text-primary); }
.empty-hint { text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px; }
/* 批量移动弹窗 */
.batch-move-modal {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); width: 300px; overflow: hidden;
}
.modal-header {
  padding: 16px; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 { margin: 0; font-size: 15px; }
.modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 8px 0; max-height: 300px; overflow-y: auto; }
.move-option {
  padding: 10px 16px; cursor: pointer; font-size: 13px;
  transition: var(--transition);
}
.move-option:hover { background: var(--bg-hover); }
.move-option.active { background: var(--bg-active); color: var(--accent); }
.modal-footer {
  padding: 12px 16px; display: flex; gap: 8px; justify-content: flex-end;
  border-top: 1px solid var(--border);
}
.btn-primary {
  padding: 6px 16px; border-radius: 6px; border: none;
  background: var(--accent); color: white; font-size: 13px; cursor: pointer;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary {
  padding: 6px 16px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-primary); font-size: 13px; cursor: pointer;
}
.btn-secondary:hover { background: var(--bg-hover); }
</style>
