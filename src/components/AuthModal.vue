<template>
  <div class="auth-wrap">
    <!-- 登录 Tab -->
    <div class="auth-tabs">
      <div class="auth-tab" :class="{active: mode === 'login'}" @click="mode = 'login'">登录</div>
      <div class="auth-tab" :class="{active: mode === 'register'}" @click="mode = 'register'">注册</div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errMsg" class="auth-err">{{ errMsg }}</div>

    <!-- 登录表单 -->
    <div v-if="mode === 'login'" class="auth-form">
      <div class="form-field">
        <label>用户名</label>
        <input v-model="loginForm.username" type="text" placeholder="输入用户名" @keydown.enter="doLogin" />
      </div>
      <div class="form-field">
        <label>密码</label>
        <input v-model="loginForm.password" type="password" placeholder="输入密码" @keydown.enter="doLogin" />
      </div>
      <button class="auth-btn primary" @click="doLogin">登录</button>
      <div class="auth-hint">还没有账号？<span @click="mode='register'">立即注册</span></div>
    </div>

    <!-- 注册表单 -->
    <div v-if="mode === 'register'" class="auth-form">
      <div class="form-field">
        <label>用户名 <span class="tip">（3 位以上，用于登录）</span></label>
        <input v-model="regForm.username" type="text" placeholder="设置用户名" @keydown.enter="doRegister" />
      </div>
      <div class="form-field">
        <label>昵称 <span class="tip">（可选）</span></label>
        <input v-model="regForm.nickname" type="text" placeholder="设置显示昵称" @keydown.enter="doRegister" />
      </div>
      <div class="form-field">
        <label>密码 <span class="tip">（6 位以上）</span></label>
        <input v-model="regForm.password" type="password" placeholder="设置密码" @keydown.enter="doRegister" />
      </div>
      <div class="form-field">
        <label>确认密码</label>
        <input v-model="regForm.confirm" type="password" placeholder="再次输入密码" @keydown.enter="doRegister" />
      </div>
      <button class="auth-btn primary" @click="doRegister">注册并登录</button>
      <div class="auth-hint">已有账号？<span @click="mode='login'">直接登录</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()
const uiStore = useUIStore()

const mode = ref('login')
const errMsg = ref('')

const loginForm = ref({ username: '', password: '' })
const regForm = ref({ username: '', nickname: '', password: '', confirm: '' })

function doLogin() {
  errMsg.value = ''
  const r = authStore.login(loginForm.value.username, loginForm.value.password)
  if (!r.ok) { errMsg.value = r.msg; return }
  uiStore.showToast(`欢迎回来，${r.user.nickname}！`, 'success')
  emit('success')
  emit('close')
}

function doRegister() {
  errMsg.value = ''
  if (regForm.value.password !== regForm.value.confirm) {
    errMsg.value = '两次密码输入不一致'; return
  }
  const r = authStore.register(regForm.value.username, regForm.value.password, regForm.value.nickname)
  if (!r.ok) { errMsg.value = r.msg; return }
  uiStore.showToast(`注册成功，欢迎 ${r.user.nickname}！`, 'success')
  emit('success')
  emit('close')
}
</script>

<style scoped>
.auth-wrap { padding: 0 4px; }
.auth-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
.auth-tab {
  flex: 1; text-align: center; padding: 10px; font-size: 14px; cursor: pointer;
  color: var(--text-muted); border-bottom: 2px solid transparent; transition: var(--transition);
}
.auth-tab:hover { color: var(--text-secondary); }
.auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.auth-err {
  background: rgba(248, 113, 113, 0.1); border: 1px solid var(--danger);
  color: var(--danger); padding: 8px 12px; border-radius: 6px; font-size: 13px;
  margin-bottom: 14px;
}
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 13px; color: var(--text-secondary); }
.tip { color: var(--text-muted); font-size: 11px; }
.form-field input {
  padding: 9px 12px; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg-input); color: var(--text-primary); font-size: 13px;
  outline: none; transition: var(--transition); font-family: var(--font);
}
.form-field input:focus { border-color: var(--accent); }
.auth-btn {
  width: 100%; padding: 10px; border-radius: 6px; border: none;
  font-size: 14px; cursor: pointer; font-weight: 600; transition: var(--transition);
}
.auth-btn.primary { background: var(--accent); color: #fff; }
.auth-btn.primary:hover { background: var(--accent-hover); }
.auth-hint { text-align: center; font-size: 12px; color: var(--text-muted); }
.auth-hint span { color: var(--accent); cursor: pointer; }
.auth-hint span:hover { text-decoration: underline; }
</style>
