<template>
  <div class="sidebar-panel todo-panel">
    <div class="todo-quick-list">
      <div class="todo-quick-item" v-for="n in todoNotes" :key="n.id" @click="openNote(n.id)">
        <span class="todo-quick-icon">✅</span>
        <span class="todo-quick-title">{{ n.title }}</span>
        <span class="todo-quick-count">{{ doneCount(n) }}/{{ n.todos.length }}</span>
      </div>
      <div v-if="todoNotes.length === 0" class="empty-hint">暂无待办笔记</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'

const noteStore = useNoteStore()
const { notes } = storeToRefs(noteStore)

const todoNotes = computed(() => notes.value.filter(n => n.type === 'todo'))

function doneCount(n) {
  return n.todos.filter(t => t.done).length
}
function openNote(id) {
  noteStore.openNote(id)
}
</script>

<style scoped>
.todo-panel { padding: 12px; }
.todo-quick-list { display: flex; flex-direction: column; gap: 4px; }
.todo-quick-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 6px; cursor: pointer;
  font-size: 13px; color: var(--text-secondary); transition: var(--transition);
}
.todo-quick-item:hover { background: var(--bg-hover); }
.todo-quick-icon { font-size: 14px; }
.todo-quick-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.todo-quick-count { font-size: 11px; color: var(--text-muted); }
.empty-hint { text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px; }
</style>
