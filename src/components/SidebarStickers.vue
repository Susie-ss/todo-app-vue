<template>
  <div class="sidebar-panel stickers-panel">
    <div class="stickers-grid">
      <div
        class="sticker-card"
        v-for="s in stickers"
        :key="s.id"
        :style="{borderTopColor: s.color}"
        @click="openSticker(s)"
      >
        <div class="sticker-title">{{ s.title }}</div>
        <div class="sticker-preview">{{ s.content.slice(0, 40) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'

const noteStore = useNoteStore()
const { stickers } = storeToRefs(noteStore)

function openSticker(s) {
  noteStore.openNote(s.sourceId || s.id)
}
</script>

<style scoped>
.stickers-panel { padding: 12px; }
.stickers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sticker-card {
  background: var(--bg-card); border-radius: 8px; padding: 10px;
  border-top: 3px solid var(--accent); cursor: pointer;
  transition: var(--transition); font-size: 12px;
}
.sticker-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.sticker-title { font-weight: 600; margin-bottom: 4px; color: var(--text-primary); }
.sticker-preview { color: var(--text-muted); font-size: 11px; line-height: 1.4; }
</style>
