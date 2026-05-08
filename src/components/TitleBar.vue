<template>
  <div class="titlebar">
    <div class="titlebar-dot red"></div>
    <div class="titlebar-dot yellow"></div>
    <div class="titlebar-dot green"></div>
    <div class="titlebar-title">Jotto</div>
    <div class="titlebar-actions">
      <!-- 未登录：显示登录按钮 -->
      <template v-if="!authStore.isLoggedIn">
        <button class="titlebar-btn" @click="openAuthModal">登录 / 注册</button>
      </template>
      <!-- 已登录：显示头像下拉菜单 -->
      <template v-else>
        <div class="user-avatar-wrap" @click.stop="toggleMenu">
          <div class="user-avatar" :style="{ background: authStore.currentUser.avatarColor }">
            {{ avatarChar }}
          </div>
          <!-- 下拉菜单 -->
          <div v-if="showMenu" class="avatar-dropdown">
            <div class="dropdown-user-info">
              <div class="dropdown-avatar" :style="{ background: authStore.currentUser.avatarColor }">
                {{ avatarChar }}
              </div>
              <div class="dropdown-user-text">
                <div class="dropdown-nickname">{{ authStore.currentUser.nickname || authStore.currentUser.username }}</div>
                <div class="dropdown-username">@{{ authStore.currentUser.username }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="openProfile">
              <span class="dropdown-icon">👤</span> 个人资料
            </div>
            <div class="dropdown-item danger" @click="handleLogout">
              <span class="dropdown-icon">🚪</span> 退出登录
            </div>
          </div>
        </div>
      </template>
      <button class="titlebar-btn" @click="createSticker">＋ 便签</button>
      <button class="titlebar-btn primary" @click="openNewNoteModal">＋ 新建笔记</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const authStore = useAuthStore()

const showMenu = ref(false)

const avatarChar = computed(() => {
  const u = authStore.currentUser
  return (u?.nickname || u?.username || '?').slice(0, 1).toUpperCase()
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
}

function openAuthModal() {
  uiStore.openModal('auth-modal')
}

function openProfile() {
  showMenu.value = false
  uiStore.openModal('profile-modal')
}

function createSticker() {
  noteStore.createSticker()
}

function openNewNoteModal() {
  uiStore.openModal('new-note-modal')
}

function handleLogout() {
  showMenu.value = false
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    uiStore.showToast('已退出登录', 'info')
  }
}

// 点击其他区域关闭菜单
onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.titlebar {
  height: 40px;
  background: var(--bg-sidebar);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  -webkit-app-region: drag;
  user-select: none;
}
.titlebar-dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; -webkit-app-region: no-drag; }
.titlebar-dot.red { background: #ff5f57; }
.titlebar-dot.yellow { background: #febc2e; }
.titlebar-dot.green { background: #28c840; }
.titlebar-title { margin-left: 8px; font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.titlebar-actions { margin-left: auto; display: flex; gap: 8px; -webkit-app-region: no-drag; align-items: center; }
.titlebar-btn {
  padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: var(--transition); font-family: var(--font);
}
.titlebar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.titlebar-btn.primary { background: var(--accent); border-color: var(--accent); color: white; }
.titlebar-btn.primary:hover { background: var(--accent-hover); }

/* 用户头像 */
.user-avatar-wrap {
  position: relative;
  cursor: pointer;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  transition: var(--transition);
}
.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* 下拉菜单 */
.avatar-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  z-index: 1000;
  overflow: hidden;
}
.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-hover);
}
.dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.dropdown-user-text {
  flex: 1;
  min-width: 0;
}
.dropdown-nickname {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-username {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-divider {
  height: 1px;
  background: var(--border);
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}
.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.dropdown-item.danger {
  color: var(--danger);
}
.dropdown-item.danger:hover {
  background: rgba(248,113,113,0.1);
}
.dropdown-icon {
  font-size: 14px;
}
</style>
