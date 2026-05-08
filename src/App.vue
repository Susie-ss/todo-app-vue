<template>
  <div class="app" :data-theme="uiStore.theme">
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
    <Modal name="ai-settings-modal">
      <AISettings />
    </Modal>
    <!-- 登录注册弹窗 -->
    <Modal name="auth-modal" title="账号登录 / 注册" maxWidth="380px">
      <AuthModal @close="uiStore.closeModal('auth-modal')" @success="uiStore.closeModal('auth-modal')" />
    </Modal>
    <!-- 个人资料弹窗 -->
    <Modal name="profile-modal" title="个人资料" maxWidth="400px">
      <ProfileModal @close="uiStore.closeModal('profile-modal')" />
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
import AISettings from './components/AISettings.vue'
import AuthModal from './components/AuthModal.vue'
import ProfileModal from './components/ProfileModal.vue'
import { useNoteStore } from './stores/noteStore'
import { useUIStore } from './stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
noteStore.init()
</script>
