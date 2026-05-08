import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USERS_KEY = 'jotto-users'
const SESSION_KEY = 'jotto-session'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(loadSession())

  const isLoggedIn = computed(() => !!currentUser.value)

  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY)
  }

  // 注册
  function register(username, password, nickname) {
    if (!username || !password) return { ok: false, msg: '用户名和密码不能为空' }
    if (username.length < 3) return { ok: false, msg: '用户名至少 3 位' }
    if (password.length < 6) return { ok: false, msg: '密码至少 6 位' }

    const users = loadUsers()
    if (users.find(u => u.username === username)) {
      return { ok: false, msg: '用户名已存在' }
    }

    const newUser = {
      id: Date.now().toString(36),
      username,
      password, // 简单存储，真实项目请用哈希
      nickname: nickname || username,
      avatar: username.slice(0, 1).toUpperCase(),
      avatarColor: randomColor(),
      bio: '',
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    saveUsers(users)

    const session = { ...newUser }
    delete session.password
    currentUser.value = session
    saveSession(session)
    return { ok: true, user: session }
  }

  // 登录
  function login(username, password) {
    if (!username || !password) return { ok: false, msg: '请输入用户名和密码' }
    const users = loadUsers()
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) return { ok: false, msg: '用户名或密码错误' }

    const session = { ...user }
    delete session.password
    currentUser.value = session
    saveSession(session)
    return { ok: true, user: session }
  }

  // 登出
  function logout() {
    currentUser.value = null
    clearSession()
  }

  // 更新个人资料
  function updateProfile(fields) {
    if (!currentUser.value) return { ok: false, msg: '未登录' }
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === currentUser.value.id)
    if (idx === -1) return { ok: false, msg: '用户不存在' }

    const updated = { ...users[idx], ...fields }
    users[idx] = updated
    saveUsers(users)

    const session = { ...updated }
    delete session.password
    currentUser.value = session
    saveSession(session)
    return { ok: true, user: session }
  }

  // 修改密码
  function changePassword(oldPwd, newPwd) {
    if (!currentUser.value) return { ok: false, msg: '未登录' }
    if (newPwd.length < 6) return { ok: false, msg: '新密码至少 6 位' }
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === currentUser.value.id)
    if (idx === -1) return { ok: false, msg: '用户不存在' }
    if (users[idx].password !== oldPwd) return { ok: false, msg: '旧密码不正确' }

    users[idx].password = newPwd
    saveUsers(users)
    return { ok: true }
  }

  function randomColor() {
    const colors = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#fb7185']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return {
    currentUser,
    isLoggedIn,
    register,
    login,
    logout,
    updateProfile,
    changePassword
  }
})
