<template>
  <div class="app">
    <TitleBar />
    <div class="app-body">
      <Sidebar />
      <main class="main">
        <NoteList />
        <Editor />
      </main>
    </div>
    <StickyContainer />
    <ContextMenu />
    <Toast />
    <Modal name="new-note-modal">
      <NewNoteModal />
    </Modal>
    <Modal name="new-folder-modal">
      <NewFolderModal />
    </Modal>
  </div>
</template>

<script setup>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import NoteList from './components/NoteList.vue'
import Editor from './components/Editor.vue'
import StickyContainer from './components/StickyContainer.vue'
import ContextMenu from './components/ContextMenu.vue'
import Toast from './components/Toast.vue'
import Modal from './components/Modal.vue'
import NewNoteModal from './components/NewNoteModal.vue'
import NewFolderModal from './components/NewFolderModal.vue'
import { useNoteStore } from './stores/noteStore'

const noteStore = useNoteStore()
noteStore.init()
</script>
