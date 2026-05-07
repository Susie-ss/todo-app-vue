<template>
  <Modal name="new-note-modal" title="新建笔记">
    <div class="form-group">
      <label>标题</label>
      <input type="text" v-model="form.title" placeholder="笔记标题..." ref="titleInput">
    </div>
    <div class="form-group">
      <label>类型</label>
      <div class="type-selector">
        <div class="type-opt" :class="{active: form.type === 'note'}" @click="form.type = 'note'">📄 笔记</div>
        <div class="type-opt" :class="{active: form.type === 'todo'}" @click="form.type = 'todo'">✅ 待办</div>
      </div>
    </div>
    <div class="form-group">
      <label>颜色标签</label>
      <div class="color-selector">
        <span
          v-for="c in colorKeys"
          :key="c.key"
          class="color-dot"
          :class="{active: form.color === c.key}"
          :style="{background: c.val}"
          @click="form.color = c.key"
        ></span>
      </div>
    </div>
    <div class="form-group">
      <label>文件夹</label>
      <select v-model="form.folderId">
        <option value="">未分类</option>
        <option v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </div>
    <div class="form-actions">
      <button class="btn-cancel" @click="close">取消</button>
      <button class="btn-submit" @click="submit" :disabled="!form.title.trim()">创建</button>
    </div>
  </Modal>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import Modal from './Modal.vue'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { folders } = storeToRefs(noteStore)
const { openModals } = storeToRefs(uiStore)

const titleInput = ref(null)

const colorKeys = [
  { key: 'blue', val: '#4f8ef7' },
  { key: 'yellow', val: '#f6e05e' },
  { key: 'pink', val: '#f687b3' },
  { key: 'green', val: '#68d391' },
  { key: 'purple', val: '#b794f4' },
  { key: 'teal', val: '#63b3ed' },
]

const form = reactive({
  title: '',
  type: 'note',
  color: 'blue',
  folderId: ''
})

// 每次打开弹窗时重置表单
watch(() => openModals.value['new-note-modal'], (val) => {
  if (val) {
    form.title = ''
    form.type = 'note'
    form.color = 'blue'
    form.folderId = noteStore.activeFolder || ''
    setTimeout(() => titleInput.value?.focus(), 100)
  }
})

function close() { uiStore.closeModal('new-note-modal') }
function submit() {
  if (!form.title.trim()) return
  const newNote = noteStore.createNote(form.title.trim(), form.type, form.color, form.folderId || null)
  close()
  noteStore.openNote(newNote.id)
  uiStore.showToast('笔记已创建', 'success')
}
</script>

<style scoped>
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input[type="text"] {
  width: 100%; padding: 8px 10px; border-radius: 6px;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-primary); font-size: 13px; outline: none; font-family: var(--font);
  box-sizing: border-box;
}
.form-group input:focus { border-color: var(--accent); }
.form-group select {
  width: 100%; padding: 8px 10px; border-radius: 6px;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-primary); font-size: 13px; outline: none; font-family: var(--font);
}
.type-selector { display: flex; gap: 8px; }
.type-opt {
  flex: 1; padding: 8px; border-radius: 6px; text-align: center;
  font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  color: var(--text-secondary); transition: var(--transition);
}
.type-opt.active { border-color: var(--accent); color: var(--accent); background: rgba(79,142,247,0.1); }
.type-opt:hover { background: var(--bg-hover); }
.color-selector { display: flex; gap: 6px; }
.color-dot {
  width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: var(--transition);
}
.color-dot.active { border-color: var(--text-primary); transform: scale(1.15); }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.btn-cancel {
  padding: 6px 16px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px;
}
.btn-cancel:hover { background: var(--bg-hover); }
.btn-submit {
  padding: 6px 16px; border-radius: 6px; border: none;
  background: var(--accent); color: white; cursor: pointer; font-size: 13px;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
