<template>
  <div class="sidebar">
    <!-- 顶部：Logo + 用户 + 操作 -->
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">📝</div>
        <div class="sidebar-logo-text">Jotto</div>
      </div>
      <div class="sidebar-actions">
        <button class="sidebar-settings-btn" @click="openAISettings" title="AI 设置">🤖</button>
        <!-- 已登录：头像按钮 -->
        <button
          v-if="isLoggedIn"
          class="sidebar-avatar-btn"
          :style="{ background: currentUser.avatarColor || '#818cf8' }"
          @click="openProfile"
          title="个人资料"
        >{{ avatarChar }}</button>
        <!-- 未登录：登录按钮 -->
        <button v-else class="sidebar-login-btn" @click="openAuth" title="登录 / 注册">
          👤
        </button>
        <button class="sidebar-add-btn" @click="openNewNoteModal">＋</button>
      </div>
    </div>

    <!-- 已登录：用户信息条 -->
    <div v-if="isLoggedIn" class="user-bar" @click="openProfile">
      <div class="user-avatar-sm" :style="{ background: currentUser.avatarColor || '#818cf8' }">
        {{ avatarChar }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ currentUser.nickname || currentUser.username }}</div>
        <div class="user-bio" v-if="currentUser.bio">{{ currentUser.bio }}</div>
      </div>
      <div class="user-arrow">›</div>
    </div>

    <div class="sidebar-tabs">
      <div class="sidebar-tab" :class="{active: sidebarTab === 'notes'}" @click="sidebarTab = 'notes'">笔记</div>
      <div class="sidebar-tab" :class="{active: sidebarTab === 'stickers'}" @click="sidebarTab = 'stickers'">便签</div>
      <div class="sidebar-tab" :class="{active: sidebarTab === 'todo'}" @click="sidebarTab = 'todo'">待办</div>
    </div>
    <SidebarNotes v-if="sidebarTab === 'notes'" />
    <SidebarStickers v-if="sidebarTab === 'stickers'" />
    <SidebarTodo v-if="sidebarTab === 'todo'" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import SidebarNotes from './SidebarNotes.vue'
import SidebarStickers from './SidebarStickers.vue'
import SidebarTodo from './SidebarTodo.vue'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const authStore = useAuthStore()

const { sidebarTab } = storeToRefs(noteStore)
const { currentUser, isLoggedIn } = storeToRefs(authStore)

const avatarChar = computed(() => {
  if (!currentUser.value) return '?'
  return (currentUser.value.nickname || currentUser.value.username || '?').slice(0, 1).toUpperCase()
})

function openNewNoteModal() { uiStore.openModal('new-note-modal') }
function openAISettings() { uiStore.openModal('ai-settings-modal') }
function openAuth() { uiStore.openModal('auth-modal') }
function openProfile() { uiStore.openModal('profile-modal') }
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}
.sidebar-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}
.sidebar-logo { display: flex; align-items: center; gap: 8px; }
.sidebar-logo-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--accent); display: flex; align-items: center;
  justify-content: center; font-size: 14px;
}
.sidebar-logo-text { font-size: 15px; font-weight: 700; }
.sidebar-actions { display: flex; gap: 4px; align-items: center; }
.sidebar-settings-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; cursor: pointer; font-size: 14px; transition: var(--transition);
}
.sidebar-settings-btn:hover { background: var(--bg-hover); }
.sidebar-avatar-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  cursor: pointer; font-size: 12px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition); flex-shrink: 0;
}
.sidebar-avatar-btn:hover { transform: scale(1.1); }
.sidebar-login-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; cursor: pointer; font-size: 14px; transition: var(--transition);
}
.sidebar-login-btn:hover { background: var(--bg-hover); }
.sidebar-add-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); cursor: pointer;
  font-size: 14px; transition: var(--transition);
}
.sidebar-add-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

/* 用户信息条 */
.user-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; cursor: pointer; transition: var(--transition);
  border-bottom: 1px solid var(--border-light);
}
.user-bar:hover { background: var(--bg-hover); }
.user-avatar-sm {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); truncate: true; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.user-bio { font-size: 11px; color: var(--text-muted); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.user-arrow { color: var(--text-muted); font-size: 16px; flex-shrink: 0; }

.sidebar-tabs { display: flex; border-bottom: 1px solid var(--border-light); }
.sidebar-tab {
  flex: 1; padding: 10px 0; text-align: center; font-size: 12px;
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent;
  transition: var(--transition);
}
.sidebar-tab:hover { color: var(--text-secondary); }
.sidebar-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
</style>
