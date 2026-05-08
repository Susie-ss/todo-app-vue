<template>
  <div class="editor-panel">
    <!-- 空状态 -->
    <div v-if="!activeNote" class="empty-state">
      <div class="empty-state-icon">✍️</div>
      <div class="empty-state-title">选择或新建笔记</div>
      <div class="empty-state-desc">点击左侧列表打开笔记，或者新建一篇开始记录</div>
      <button class="empty-action-btn" @click="openNewNoteModal">＋ 新建笔记</button>
    </div>

    <!-- 编辑区域 -->
    <div v-else class="editor-content-area">
      <!-- 标题区 -->
      <div class="editor-header">
        <input
          class="editor-title-input"
          v-model="activeNote.title"
          @input="onTitleChange"
          placeholder="笔记标题..."
        >
        <div class="editor-meta">
          <div class="meta-tag" @click="cycleColor">
            <span class="dot" :style="{background: colorMap[activeNote.color] || colorMap.default}"></span>
            <span>{{ colorLabel(activeNote.color) }}</span>
            <span class="meta-arrow">▼</span>
          </div>
          <div class="meta-tag folder-selector" @click.stop="toggleFolderMenu">
            <span>📁</span>
            <span>{{ getFolderName(activeNote.folderId) }}</span>
            <span class="meta-arrow">▼</span>
            <div v-if="showFolderMenu" class="meta-dropdown">
              <div
                class="dropdown-item"
                :class="{active: !activeNote.folderId}"
                @click.stop="setFolder(null)"
              >未分类</div>
              <div
                v-for="folder in noteStore.folders"
                :key="folder.id"
                class="dropdown-item"
                :class="{active: activeNote.folderId === folder.id}"
                @click.stop="setFolder(folder.id)"
              >{{ folder.name }}</div>
            </div>
          </div>
          <div class="meta-tag">
            <span>{{ activeNote.type === 'todo' ? '✅ 待办' : '📄 笔记' }}</span>
          </div>
          <!-- 工具按钮组 -->
          <div class="meta-toolbar">
            <button class="toolbar-btn ai-btn" @click="aiSummarize" title="AI 总结">✨ AI总结</button>
            <button class="toolbar-btn mic-btn" :class="{recording: isRecording}" @click="toggleVoice">
              🎤 {{ isRecording ? '录音中' : '语音' }}
            </button>
            <button class="toolbar-btn" @click="openSticky">📌 便签</button>
            <button class="toolbar-btn" @click="triggerImport" title="导入">📂 导入</button>
            <button class="toolbar-btn" @click="exportNote" title="导出">💾 导出</button>
            <button class="toolbar-btn danger" @click="deleteNote">删除</button>
            <input ref="fileInput" type="file" accept=".txt,.md,.markdown" style="display:none" @change="importFile">
          </div>
        </div>
      </div>

      <!-- Vditor 编辑器（笔记模式） -->
      <div v-if="activeNote.type !== 'todo'" class="vditor-wrap">
        <div :id="vditorId" class="vditor-container"></div>
      </div>

      <!-- 待办模式 -->
      <div v-else class="editor-body">
        <div class="todo-mode">
          <div class="todo-item" v-for="t in activeNote.todos" :key="t.id">
            <div class="todo-checkbox" :class="{checked: t.done}" @click="toggleTodo(t.id)"></div>
            <span class="todo-text" :class="{done: t.done}" @click="toggleTodo(t.id)">{{ t.text }}</span>
            <span class="todo-priority" :class="t.priority">{{ priorityLabel(t.priority) }}</span>
            <button class="todo-del" @click="deleteTodo(t.id)">×</button>
          </div>
          <div class="todo-add-bar">
            <span style="color:var(--text-muted)">＋</span>
            <input
              class="todo-add-input"
              v-model="newTodoText"
              @keydown.enter="addTodo"
              placeholder="添加待办事项..."
            >
            <button class="todo-add-submit" @click="addTodo">添加</button>
          </div>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="editor-statusbar">
        <div class="statusbar-item"><span class="statusbar-dot"></span> 已保存</div>
        <div class="statusbar-item">{{ wordCount }} 字</div>
        <div class="statusbar-item">{{ activeNote.updatedAt ? '更新于 ' + formatFullDate(activeNote.updatedAt) : '' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const { activeNote } = storeToRefs(noteStore)

const newTodoText = ref('')
const isRecording = ref(false)
const fileInput = ref(null)
const showFolderMenu = ref(false)
let recognition = null

// ===================== 登录检查 =====================
function requireLogin() {
  if (!authStore.isLoggedIn) {
    uiStore.showToast('请先登录后操作', 'info')
    return false
  }
  return true
}

// Vditor 实例
let vditor = null
let vditorIniting = false
const vditorId = 'jotto-vditor'

const colorMap = {
  blue: '#4f8ef7', yellow: '#f6e05e', pink: '#f687b3',
  green: '#68d391', purple: '#b794f4', teal: '#63b3ed', default: '#9aa3bc'
}
const colorLabels = {
  blue: '蓝色', yellow: '黄色', pink: '粉色',
  green: '绿色', purple: '紫色', teal: '青色', default: '默认'
}

function colorLabel(c) { return colorLabels[c] || '默认' }
function priorityLabel(p) {
  return p === 'high' ? '高优' : p === 'medium' ? '中优' : '低优'
}

const wordCount = computed(() => {
  if (!activeNote.value?.content) return 0
  return activeNote.value.content.replace(/\s/g, '').length
})

function formatFullDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`
}

// ===================== Vditor 管理 =====================
function destroyVditor() {
  if (vditor) {
    try { vditor.destroy() } catch (e) {}
    vditor = null
  }
}

function initVditor(content) {
  if (vditorIniting) return
  vditorIniting = true
  destroyVditor()

  nextTick(() => {
    const el = document.getElementById(vditorId)
    if (!el) { vditorIniting = false; return }

    // 未登录时禁用编辑器
    const disabled = !authStore.isLoggedIn

    // 确保 Vditor 已加载
    const tryInit = () => {
      if (typeof window.Vditor === 'undefined') {
        setTimeout(tryInit, 100)
        return
      }
      vditor = new window.Vditor(vditorId, {
        height: '100%',
        placeholder: disabled ? '请先登录后编辑笔记' : '开始输入，支持 Markdown 语法...',
        theme: 'dark',
        icon: 'ant',
        cache: { enable: false },
        toolbarConfig: { pin: true },
        toolbar: disabled ? [] : [
          'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
          'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
          'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
          'table', '|',
          'undo', 'redo', '|',
          'fullscreen', 'edit-mode', 'preview',
          {
            name: 'more',
            toolbar: ['content-theme', 'export', 'outline']
          }
        ],
        counter: { enable: true },
        mode: disabled ? 'sv' : 'ir',
        preview: {
          math: { engine: 'KaTeX' },
          hljs: { style: 'github' }
        },
        input(val) {
          if (!activeNote.value || disabled) return
          noteStore.updateNote(activeNote.value.id, { content: val })
        },
        after() {
          vditor.setValue(content || '')
          if (disabled) {
            // 未登录时禁用输入
            el.style.pointerEvents = 'none'
            el.style.opacity = '0.7'
          }
          vditorIniting = false
        }
      })
    }
    tryInit()
  })
}

// 监听 activeNote 变化，重新初始化 Vditor
watch(
  () => activeNote.value?.id,
  (newId) => {
    if (!newId || activeNote.value?.type === 'todo') {
      destroyVditor()
      return
    }
    initVditor(activeNote.value?.content || '')
  },
  { flush: 'post' }
)

// 监听登录状态变化，重新初始化 Vditor
watch(
  () => authStore.isLoggedIn,
  () => {
    if (activeNote.value && activeNote.value.type !== 'todo') {
      nextTick(() => initVditor(activeNote.value?.content || ''))
    }
  }
)

// 监听内容变化（外部修改，比如 AI 总结）
watch(
  () => activeNote.value?.content,
  (newContent) => {
    if (!vditor || vditorIniting) return
    try {
      const current = vditor.getValue()
      if (current !== newContent) {
        vditor.setValue(newContent || '')
      }
    } catch (e) {}
  }
)

onMounted(() => {
  document.addEventListener('click', handleDocClick)
  if (activeNote.value && activeNote.value.type !== 'todo') {
    initVditor(activeNote.value.content || '')
  }
})

onBeforeUnmount(() => {
  destroyVditor()
  document.removeEventListener('click', handleDocClick)
})

// ===================== 功能函数 =====================
function onTitleChange() {
  if (!activeNote.value || !requireLogin()) return
  noteStore.updateNote(activeNote.value.id, { title: activeNote.value.title })
}

function toggleTodo(todoId) {
  if (!activeNote.value || !requireLogin()) return
  noteStore.toggleTodo(activeNote.value.id, todoId)
}
function deleteTodo(todoId) {
  if (!activeNote.value || !requireLogin()) return
  noteStore.deleteTodo(activeNote.value.id, todoId)
}
function addTodo() {
  if (!activeNote.value || !newTodoText.value.trim() || !requireLogin()) return
  noteStore.addTodo(activeNote.value.id, newTodoText.value.trim())
  newTodoText.value = ''
}
function openSticky() {
  if (!activeNote.value || !requireLogin()) return
  noteStore.createSticker(activeNote.value)
  uiStore.showToast('已创建便签', 'success')
}
function deleteNote() {
  if (!activeNote.value || !requireLogin()) return
  if (confirm('确定删除这篇笔记？')) {
    noteStore.deleteNote(activeNote.value.id)
  }
}
function getFolderName(id) {
  if (!id) return '未分类'
  const f = noteStore.folders.find(f => f.id === id)
  return f ? f.name : '未分类'
}
function cycleColor() {
  if (!activeNote.value || !requireLogin()) return
  const colors = Object.keys(colorMap)
  const idx = colors.indexOf(activeNote.value.color)
  const next = colors[(idx + 1) % colors.length]
  noteStore.updateNote(activeNote.value.id, { color: next })
}
function toggleFolderMenu() { 
  if (!authStore.isLoggedIn) { uiStore.showToast('请先登录后操作', 'info'); return }
  showFolderMenu.value = !showFolderMenu.value 
}
function setFolder(folderId) {
  if (!activeNote.value || !requireLogin()) return
  noteStore.updateNote(activeNote.value.id, { folderId })
  showFolderMenu.value = false
}
function handleDocClick() { showFolderMenu.value = false }
function openNewNoteModal() { 
  if (!requireLogin()) return
  uiStore.openModal('new-note-modal') 
}

// AI 总结
function aiSummarize() {
  if (!activeNote.value || !requireLogin()) return
  if ((activeNote.value.content || '').length < 20) {
    uiStore.showToast('内容太少，无法总结', 'info'); return
  }
  const config = uiStore.aiConfig
  if (!config.enabled || !config.apiKey) {
    uiStore.showToast('请先在 AI 设置中配置 API', 'info'); return
  }
  const note = activeNote.value
  const content = note.content.slice(0, 2000)
  uiStore.showToast('正在生成总结...', 'info')
  const apiUrl = config.apiUrl || (config.provider === 'siliconflow'
    ? 'https://api.siliconflow.cn/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions')
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一个笔记助手，请用简洁的中文总结用户提供的笔记内容，提取核心要点。' },
        { role: 'user', content: `请总结以下笔记内容：\n\n${content}` }
      ],
      temperature: 0.7
    })
  })
  .then(res => { if (!res.ok) throw new Error('API 请求失败'); return res.json() })
  .then(data => {
    const summary = data.choices?.[0]?.message?.content
    if (summary) {
      noteStore.updateNote(note.id, { content: note.content + '\n\n---\n## 🤖 AI 总结\n\n' + summary })
      uiStore.showToast('AI 总结已添加', 'success')
    } else throw new Error('无有效响应')
  })
  .catch(err => { console.error(err); uiStore.showToast('AI 总结失败，请检查 API 配置', 'error') })
}

// 语音
function toggleVoice() { 
  if (!requireLogin()) return
  isRecording.value ? stopVoice() : startVoice() 
}
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) { uiStore.showToast('浏览器不支持语音识别', 'info'); return }
  recognition = new SR()
  recognition.lang = 'zh-CN'; recognition.continuous = true; recognition.interimResults = true
  isRecording.value = true
  recognition.onresult = (e) => {
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript
    }
    if (final && activeNote.value) {
      const newContent = (activeNote.value.content || '') + '\n- ' + final.trim()
      noteStore.updateNote(activeNote.value.id, { content: newContent })
    }
  }
  recognition.onerror = () => { stopVoice() }
  recognition.start()
}
function stopVoice() { if (recognition) recognition.stop(); isRecording.value = false }

// 导入导出
function triggerImport() { 
  if (!requireLogin()) return
  fileInput.value?.click() 
}
function importFile(event) {
  if (!requireLogin()) return
  const file = event.target.files?.[0]
  if (!file) return
  if (!activeNote.value) {
    const newN = noteStore.createNote(file.name.replace(/\.[^.]+$/, ''), 'note', 'blue', null)
    loadFileContent(file, newN.id)
  } else {
    if (confirm('导入文件将替换当前笔记内容，确定继续？')) loadFileContent(file, activeNote.value.id)
  }
  event.target.value = ''
}
function loadFileContent(file, noteId) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    noteStore.updateNote(noteId, { content })
    if (!activeNote.value || activeNote.value.id !== noteId) noteStore.openNote(noteId)
    uiStore.showToast(`已导入：${file.name}`, 'success')
  }
  reader.onerror = () => { uiStore.showToast('文件读取失败', 'error') }
  reader.readAsText(file)
}
function exportNote() {
  if (!activeNote.value) return
  const note = activeNote.value
  const filename = (note.title || '无标题').replace(/[\\/:*?"<>|]/g, '_') + '.md'
  let exportContent = note.type === 'todo' && note.todos?.length
    ? '# ' + note.title + '\n\n' + note.todos.map(t => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')
    : '# ' + note.title + '\n\n' + note.content
  const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  uiStore.showToast(`已导出：${filename}`, 'success')
}
</script>

<style scoped>
.editor-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 12px; color: var(--text-muted); text-align: center; padding: 40px;
}
.empty-state-icon { font-size: 48px; opacity: 0.4; }
.empty-state-title { font-size: 15px; font-weight: 600; }
.empty-state-desc { font-size: 12px; max-width: 260px; line-height: 1.6; }
.empty-action-btn {
  padding: 8px 20px; border-radius: 6px; background: var(--accent);
  border: none; color: white; font-size: 13px; cursor: pointer;
}
.editor-content-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.editor-header { padding: 12px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.editor-title-input {
  width: 100%; background: none; border: none; outline: none;
  color: var(--text-primary); font-size: 18px; font-weight: 700; font-family: var(--font);
}
.editor-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; position: relative; flex-wrap: wrap; }
.meta-tag {
  display: flex; align-items: center; gap: 4px; font-size: 12px;
  color: var(--text-secondary); cursor: pointer; position: relative;
}
.meta-tag:hover { color: var(--text-primary); }
.meta-tag .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.meta-arrow { font-size: 8px; opacity: 0.6; margin-left: 2px; }
.meta-dropdown {
  position: absolute; top: 100%; left: 0; z-index: 100;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 120px; padding: 4px 0; margin-top: 4px;
}
.dropdown-item {
  padding: 6px 12px; font-size: 12px; cursor: pointer;
  color: var(--text-secondary); transition: var(--transition);
}
.dropdown-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.dropdown-item.active { color: var(--accent); font-weight: 600; }
/* 工具栏按钮（在 meta 行里） */
.meta-toolbar { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.toolbar-btn {
  padding: 3px 8px; border-radius: 4px; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; font-size: 12px; transition: var(--transition);
  font-family: var(--font);
}
.toolbar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.toolbar-btn.danger { color: var(--danger); }
.toolbar-btn.danger:hover { background: rgba(229,62,108,0.1); }
.toolbar-btn.ai-btn { color: var(--accent); }
.toolbar-btn.mic-btn.recording { color: var(--danger); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* Vditor 包裹层 */
.vditor-wrap { flex: 1; overflow: hidden; min-height: 0; display: flex; flex-direction: column; }
.vditor-container { flex: 1; height: 100%; }

/* 覆盖 Vditor 主题适配深色背景 */
:deep(.vditor) { background: transparent !important; border: none !important; }
:deep(.vditor-toolbar) { background: var(--bg-sidebar) !important; border-bottom: 1px solid var(--border) !important; }
:deep(.vditor-content) { background: transparent !important; }
:deep(.vditor-ir) { background: transparent !important; color: var(--text-primary) !important; }
:deep(.vditor-reset) { color: var(--text-primary) !important; }

/* 待办模式 */
.editor-body { flex: 1; overflow-y: auto; padding: 16px 24px; min-height: 0; }
.todo-mode { padding: 16px 0; }
.todo-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 6px 0;
  border-bottom: 1px solid var(--border-light);
}
.todo-checkbox {
  width: 16px; height: 16px; border-radius: 4px; border: 2px solid var(--border);
  cursor: pointer; flex-shrink: 0; margin-top: 2px; transition: var(--transition);
}
.todo-checkbox.checked { background: var(--accent); border-color: var(--accent); }
.todo-text { flex: 1; font-size: 13px; cursor: pointer; }
.todo-text.done { text-decoration: line-through; color: var(--text-muted); }
.todo-priority { font-size: 10px; padding: 1px 5px; border-radius: 3px; flex-shrink: 0; }
.todo-priority.high { background: rgba(229,62,108,0.15); color: var(--danger); }
.todo-priority.medium { background: rgba(246,173,85,0.15); color: var(--warning); }
.todo-priority.low { background: rgba(72,187,120,0.15); color: var(--success); }
.todo-del { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px; flex-shrink: 0; }
.todo-del:hover { color: var(--danger); }
.todo-add-bar { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid var(--border); margin-top: 8px; }
.todo-add-input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; font-family: var(--font); }
.todo-add-submit { padding: 4px 10px; border-radius: 4px; background: var(--accent); border: none; color: white; font-size: 12px; cursor: pointer; }

/* 状态栏 */
.editor-statusbar {
  padding: 6px 24px; border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 16px;
  background: var(--bg-sidebar); font-size: 11px; color: var(--text-muted); flex-shrink: 0;
}
.statusbar-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--success); display: inline-block; }
</style>
