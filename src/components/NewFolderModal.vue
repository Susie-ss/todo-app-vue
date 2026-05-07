<template>
  <Modal name="new-folder-modal" title="新建文件夹">
    <div class="form-group">
      <label>文件夹名称</label>
      <input type="text" v-model="folderName" placeholder="文件夹名称..." ref="nameInput" @keydown.enter="submit">
    </div>
    <div class="form-actions">
      <button class="btn-cancel" @click="close">取消</button>
      <button class="btn-submit" @click="submit" :disabled="!folderName.trim()">创建</button>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import Modal from './Modal.vue'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { openModals } = storeToRefs(uiStore)

const folderName = ref('')
const nameInput = ref(null)

watch(() => openModals.value['new-folder-modal'], (val) => {
  if (val) {
    folderName.value = ''
    setTimeout(() => nameInput.value?.focus(), 100)
  }
})

function close() { uiStore.closeModal('new-folder-modal') }
function submit() {
  if (!folderName.value.trim()) return
  noteStore.createFolder(folderName.value.trim())
  close()
  uiStore.showToast('文件夹已创建', 'success')
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
