<template>
  <div class="profile-wrap">
    <!-- 头像区 -->
    <div class="profile-avatar-row">
      <div class="avatar-preview" :style="{ background: form.avatarColor }">
        {{ avatarChar }}
      </div>
      <div class="avatar-colors">
        <div
          v-for="c in COLORS"
          :key="c"
          class="color-dot"
          :class="{ active: form.avatarColor === c }"
          :style="{ background: c }"
          @click="form.avatarColor = c"
        ></div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="form-field">
      <label>用户名 <span class="tip">（注册后不可修改）</span></label>
      <input :value="authStore.currentUser.username" disabled />
    </div>
    <div class="form-field">
      <label>昵称</label>
      <input v-model="form.nickname" placeholder="输入显示昵称" />
    </div>
    <div class="form-field">
      <label>个人签名</label>
      <input v-model="form.bio" placeholder="一句话介绍自己..." />
    </div>

    <div class="profile-divider">修改密码（选填）</div>

    <div class="form-field">
      <label>旧密码</label>
      <input v-model="pwdForm.old" type="password" placeholder="输入当前密码" />
    </div>
    <div class="form-field">
      <label>新密码</label>
      <input v-model="pwdForm.new1" type="password" placeholder="输入新密码（6位以上）" />
    </div>
    <div class="form-field">
      <label>确认新密码</label>
      <input v-model="pwdForm.new2" type="password" placeholder="再次输入新密码" />
    </div>

    <div v-if="errMsg" class="err-msg">{{ errMsg }}</div>

    <div class="modal-footer">
      <button class="btn-secondary" @click="$emit('close')">取消</button>
      <button class="btn-danger" @click="doLogout">退出登录</button>
      <button class="btn-primary" @click="doSave">保存</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const uiStore = useUIStore()

const COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#fb7185', '#f97316']

const form = ref({
  nickname: '',
  bio: '',
  avatarColor: '#818cf8'
})
const pwdForm = ref({ old: '', new1: '', new2: '' })
const errMsg = ref('')

const avatarChar = computed(() => {
  return (form.value.nickname || authStore.currentUser?.username || '?').slice(0, 1).toUpperCase()
})

onMounted(() => {
  const u = authStore.currentUser
  if (u) {
    form.value.nickname = u.nickname || ''
    form.value.bio = u.bio || ''
    form.value.avatarColor = u.avatarColor || '#818cf8'
    form.value.avatar = u.avatar || (u.username || '').slice(0, 1).toUpperCase()
  }
})

function doSave() {
  errMsg.value = ''
  // 更新密码（如果填写了）
  if (pwdForm.value.old || pwdForm.value.new1 || pwdForm.value.new2) {
    if (!pwdForm.value.old) { errMsg.value = '请输入旧密码'; return }
    if (pwdForm.value.new1 !== pwdForm.value.new2) { errMsg.value = '两次密码不一致'; return }
    const r = authStore.changePassword(pwdForm.value.old, pwdForm.value.new1)
    if (!r.ok) { errMsg.value = r.msg; return }
  }
  // 更新资料
  const updated = authStore.updateProfile({
    nickname: form.value.nickname || authStore.currentUser.username,
    bio: form.value.bio,
    avatarColor: form.value.avatarColor,
    avatar: avatarChar.value
  })
  if (!updated.ok) { errMsg.value = updated.msg; return }
  uiStore.showToast('个人资料已保存', 'success')
  emit('close')
}

function doLogout() {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    uiStore.showToast('已退出登录', 'info')
    emit('close')
  }
}
</script>

<style scoped>
.profile-wrap { display: flex; flex-direction: column; gap: 14px; }
.profile-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 4px; }
.avatar-preview {
  width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 22px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.avatar-colors { display: flex; gap: 8px; flex-wrap: wrap; }
.color-dot {
  width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: var(--transition);
}
.color-dot:hover { transform: scale(1.15); }
.color-dot.active { border-color: #fff; box-shadow: 0 0 0 2px var(--accent); }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label { font-size: 13px; color: var(--text-secondary); }
.tip { color: var(--text-muted); font-size: 11px; }
.form-field input {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg-input); color: var(--text-primary); font-size: 13px;
  outline: none; transition: var(--transition); font-family: var(--font);
}
.form-field input:focus { border-color: var(--accent); }
.form-field input:disabled { opacity: 0.5; cursor: not-allowed; }
.profile-divider {
  font-size: 12px; color: var(--text-muted); padding: 6px 0;
  border-top: 1px solid var(--border); margin-top: 4px;
}
.err-msg {
  background: rgba(248,113,113,0.1); border: 1px solid var(--danger);
  color: var(--danger); padding: 7px 12px; border-radius: 6px; font-size: 13px;
}
.modal-footer { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border); }
.btn-primary {
  padding: 8px 20px; border-radius: 6px; border: none;
  background: var(--accent); color: #fff; font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary {
  padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-primary); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { background: var(--bg-hover); }
.btn-danger {
  padding: 8px 16px; border-radius: 6px; border: 1px solid var(--danger);
  background: transparent; color: var(--danger); font-size: 13px; cursor: pointer; transition: all 0.2s;
  margin-right: auto;
}
.btn-danger:hover { background: rgba(248,113,113,0.1); }
</style>
