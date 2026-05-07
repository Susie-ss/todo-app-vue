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
      <!-- 工具栏 -->
      <div class="editor-toolbar">
        <button class="toolbar-btn" :class="{active: editorMode === 'edit'}" @click="editorMode = 'edit'">编辑</button>
        <button class="toolbar-btn" :class="{active: editorMode === 'preview'}" @click="editorMode = 'preview'">预览</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="insertMd('**','**')"><b>B</b></button>
        <button class="toolbar-btn" style="font-style:italic" @click="insertMd('*','*')"><i>I</i></button>
        <button class="toolbar-btn" @click="insertMd('~~','~~')"><s>S</s></button>
        <button class="toolbar-btn" @click="insertMd('`','`')">&lt;/&gt;</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="insertMd('# ','')">H1</button>
        <button class="toolbar-btn" @click="insertMd('## ','')">H2</button>
        <button class="toolbar-btn" @click="insertMd('### ','')">H3</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="insertMd('- [ ] ','')">☐</button>
        <button class="toolbar-btn" @click="insertMd('- ','')">•</button>
        <button class="toolbar-btn" @click="insertMd('1. ','')">1.</button>
        <button class="toolbar-btn" @click="insertMd('> ','')">❝</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="insertMd('[','](')" title="插入链接">🔗</button>
        <button class="toolbar-btn" @click="insertMd('![alt](',')')" title="插入图片">🖼️</button>
        <button class="toolbar-btn" @click="insertCodeBlock" title="插入代码块">📦</button>
        <button class="toolbar-btn" @click="insertMd('\n---\n','')" title="分割线">—</button>
        <button class="toolbar-btn" @click="insertMd('| 列1 | 列2 |\n| --- | --- |\n| ','')">📊</button>
        <button class="toolbar-btn" @click="insertMd(':$1$','')" title="公式块">∑</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn ai-btn" @click="aiSummarize">✨ AI总结</button>
        <button class="toolbar-btn mic-btn" :class="{recording: isRecording}" @click="toggleVoice">
          🎤 {{ isRecording ? '录音中' : '语音' }}
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="openSticky">📌 便签</button>
        <button class="toolbar-btn" @click="duplicateNote">复制</button>
        <!-- 文件操作 -->
        <button class="toolbar-btn" @click="triggerImport" title="导入本地文件">📂 导入</button>
        <button class="toolbar-btn" @click="exportNote" title="导出为 Markdown 文件">💾 导出</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn danger" @click="deleteNote">删除</button>
        <!-- 隐藏的文件输入框 -->
        <input ref="fileInput" type="file" accept=".txt,.md,.markdown" style="display:none" @change="importFile">
      </div>

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
            <!-- 文件夹下拉菜单 -->
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
        </div>
      </div>

      <!-- 主体：编辑/预览/待办 -->
      <div class="editor-body">
        <!-- Markdown 编辑模式 -->
        <textarea
          v-if="editorMode === 'edit' && activeNote.type !== 'todo'"
          class="editor-textarea"
          ref="textareaRef"
          v-model="activeNote.content"
          @input="onEditorChange"
          @keydown="handleKeydown"
          placeholder="开始输入，支持 Markdown 语法..."
        ></textarea>

        <!-- Markdown 预览模式 -->
        <div v-else-if="editorMode === 'preview'" class="note-rendered" v-html="renderedContent"></div>

        <!-- 待办模式 -->
        <div v-else-if="activeNote.type === 'todo'" class="todo-mode">
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'

const noteStore = useNoteStore()
const uiStore = useUIStore()
const { activeNote, editorMode } = storeToRefs(noteStore)

const newTodoText = ref('')
const isRecording = ref(false)
const textareaRef = ref(null)
const fileInput = ref(null)
const showFolderMenu = ref(false)
let recognition = null

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

const renderedContent = computed(() => {
  const md = activeNote.value?.content || ''
  if (!md) return '<p style="color:var(--text-muted)">暂无内容</p>'
  let html = md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 代码块（先处理，防止内部被转换）
    .replace(/```([\w]*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 文本样式
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 链接和图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 引用
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // 任务列表
    .replace(/^- \[x\] (.+)$/gm, '<div class="rendered-todo"><span class="rt-check checked">✓</span>$1</div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="rendered-todo"><span class="rt-check"></span>$1</div>')
    // 无序列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>')
    // 合并连续的 li
    .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')
    // 合并连续的 blockquote
    .replace(/(<blockquote>[\s\S]*?<\/blockquote>)+/g, (m) => '<blockquote>' + m.replace(/<\/?blockquote>/g, '') + '</blockquote>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
  // 包裹为段落
  html = '<p>' + html + '</p>'
  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '')
  // hr 需要独立
  html = html.replace(/<\/p><hr><p>/g, '<hr>')
  return html
})

function formatFullDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`
}

function onTitleChange() {
  if (!activeNote.value) return
  noteStore.updateNote(activeNote.value.id, { title: activeNote.value.title })
}
function onEditorChange() {
  if (!activeNote.value) return
  noteStore.updateNote(activeNote.value.id, { content: activeNote.value.content })
}

// 处理回车保持列表样式
function handleKeydown(e) {
  // 快捷键处理
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const mod = isMac ? e.metaKey : e.ctrlKey
  if (mod) {
    if (e.key === 'b') { e.preventDefault(); insertMd('**','**') }
    if (e.key === 'i') { e.preventDefault(); insertMd('*','*') }
    if (e.key === 'd') { e.preventDefault(); insertMd('~~','~~') }
    if (e.key === 'k') { e.preventDefault(); insertMd('[',']()') }
    return
  }

  if (e.key !== 'Enter') return
  const ta = e.target
  const pos = ta.selectionStart
  const text = ta.value
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1
  const line = text.slice(lineStart, pos)

  // 检测当前行是否是列表项
  const todoMatch = line.match(/^(\s*)(- \[[ x]\]\s*)$/)
  const ulMatch = line.match(/^(\s*)(-\s+)(.*)$/)
  const olMatch = line.match(/^(\s*)(\d+)(\.\s+)(.*)$/)
  const blockquoteMatch = line.match(/^(\s*)(>\s*)$/)
  const headingMatch = line.match(/^(\s*)(#{1,6})(\s*)$/)

  if (todoMatch) {
    e.preventDefault()
    const prefix = todoMatch[1] + todoMatch[2]
    const insert = '\n' + prefix
    ta.value = text.slice(0, pos) + insert + text.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos + insert.length
    onEditorChange()
  } else if (ulMatch) {
    // 检查下一行是否是空行，如果是则结束列表
    const nextLineStart = pos
    const nextLineEnd = text.indexOf('\n', nextLineStart)
    const nextLine = nextLineEnd === -1 ? text.slice(nextLineStart) : text.slice(nextLineStart, nextLineEnd)
    if (nextLine.trim() === '') {
      // 列表后是空行，不续前缀，让用户自然结束列表
      return
    }
    e.preventDefault()
    const prefix = ulMatch[1] + ulMatch[2]
    const insert = '\n' + prefix
    ta.value = text.slice(0, pos) + insert + text.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos + insert.length
    onEditorChange()
  } else if (olMatch) {
    // 有序列表：回车自动递增序号
    e.preventDefault()
    const prefix = olMatch[1] + olMatch[2] + olMatch[3]
    const nextNum = parseInt(olMatch[2]) + 1
    const insert = '\n' + olMatch[1] + nextNum + '. '
    ta.value = text.slice(0, pos) + insert + text.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos + insert.length
    onEditorChange()
  } else if (blockquoteMatch) {
    e.preventDefault()
    const prefix = blockquoteMatch[1] + blockquoteMatch[2]
    const insert = '\n' + prefix
    ta.value = text.slice(0, pos) + insert + text.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos + insert.length
    onEditorChange()
  } else if (headingMatch) {
    // 标题行回车，延续同级标题
    e.preventDefault()
    const prefix = headingMatch[1] + headingMatch[2] + ' '
    const insert = '\n' + prefix
    ta.value = text.slice(0, pos) + insert + text.slice(pos)
    ta.selectionStart = ta.selectionEnd = pos + insert.length
    onEditorChange()
  }
}
function toggleTodo(todoId) {
  if (!activeNote.value) return
  noteStore.toggleTodo(activeNote.value.id, todoId)
}
function deleteTodo(todoId) {
  if (!activeNote.value) return
  noteStore.deleteTodo(activeNote.value.id, todoId)
}
function addTodo() {
  if (!activeNote.value || !newTodoText.value.trim()) return
  noteStore.addTodo(activeNote.value.id, newTodoText.value.trim())
  newTodoText.value = ''
}
function openSticky() {
  if (!activeNote.value) return
  noteStore.createSticker(activeNote.value)
  uiStore.showToast('已创建便签', 'success')
}
function duplicateNote() {
  if (!activeNote.value) return
  noteStore.createNote(
    activeNote.value.title + ' (副本)',
    activeNote.value.type,
    activeNote.value.color,
    activeNote.value.folderId
  )
  uiStore.showToast('已复制笔记', 'success')
}
function deleteNote() {
  if (!activeNote.value) return
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
  if (!activeNote.value) return
  const colors = Object.keys(colorMap)
  const idx = colors.indexOf(activeNote.value.color)
  const next = colors[(idx + 1) % colors.length]
  noteStore.updateNote(activeNote.value.id, { color: next })
}
function toggleFolderMenu() {
  showFolderMenu.value = !showFolderMenu.value
}
function setFolder(folderId) {
  if (!activeNote.value) return
  noteStore.updateNote(activeNote.value.id, { folderId })
  showFolderMenu.value = false
}
// 点击外部关闭菜单
function handleDocClick() {
  showFolderMenu.value = false
}
function insertMd(before, after) {
  nextTick(() => {
    const ta = textareaRef.value
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = ta.value.slice(start, end)
    ta.value = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end)
    ta.selectionStart = start + before.length
    ta.selectionEnd = start + before.length + sel.length
    ta.focus()
    onEditorChange()
  })
}
function insertCodeBlock() {
  nextTick(() => {
    const ta = textareaRef.value
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = ta.value.slice(start, end)
    const block = '\n```\n' + (sel || '代码') + '\n```\n'
    ta.value = ta.value.slice(0, start) + block + ta.value.slice(end)
    ta.selectionStart = start + 5
    ta.selectionEnd = start + 5 + (sel || '代码').length
    ta.focus()
    onEditorChange()
  })
}
function aiSummarize() {
  if (!activeNote.value || (activeNote.value.content || '').length < 20) {
    uiStore.showToast('内容太少，无法总结', 'info')
    return
  }

  const config = uiStore.aiConfig
  if (!config.enabled || !config.apiKey) {
    uiStore.showToast('请先在 AI 设置中配置 API', 'info')
    return
  }

  const note = activeNote.value
  const content = note.content.slice(0, 2000) // 限制内容长度

  uiStore.showToast('正在生成总结...', 'info')

  // 构建请求
  const apiUrl = config.apiUrl || (config.provider === 'siliconflow'
    ? 'https://api.siliconflow.cn/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions')

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  }

  const body = {
    model: config.model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个笔记助手，请用简洁的中文总结用户提供的笔记内容，提取核心要点。'
      },
      {
        role: 'user',
        content: `请总结以下笔记内容：\n\n${content}`
      }
    ],
    temperature: 0.7
  }

  fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  .then(res => {
    if (!res.ok) throw new Error('API 请求失败')
    return res.json()
  })
  .then(data => {
    const summary = data.choices?.[0]?.message?.content
    if (summary) {
      noteStore.updateNote(note.id, {
        content: note.content + '\n\n---\n## 🤖 AI 总结\n\n' + summary
      })
      uiStore.showToast('AI 总结已添加', 'success')
    } else {
      throw new Error('无有效响应')
    }
  })
  .catch(err => {
    console.error('AI Summary Error:', err)
    uiStore.showToast('AI 总结失败，请检查 API 配置', 'error')
  })
}
function toggleVoice() {
  if (!isRecording.value) startVoice()
  else stopVoice()
}
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) { uiStore.showToast('浏览器不支持语音识别', 'info'); return }
  recognition = new SR()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true
  isRecording.value = true
  recognition.onresult = (e) => {
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript
    }
    if (final && activeNote.value) {
      activeNote.value.content += '\n- ' + final.trim()
      onEditorChange()
    }
  }
  recognition.onerror = () => { stopVoice() }
  recognition.start()
}
function stopVoice() {
  if (recognition) recognition.stop()
  isRecording.value = false
}
function openNewNoteModal() { uiStore.openModal('new-note-modal') }

// 全局点击监听，关闭菜单
onMounted(() => { document.addEventListener('click', handleDocClick) })
onUnmounted(() => { document.removeEventListener('click', handleDocClick) })

// === 文件导入导出 ===
function triggerImport() {
  fileInput.value?.click()
}
function importFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!activeNote.value) {
    // 如果没有打开笔记，先创建一个
    const newN = noteStore.createNote(file.name.replace(/\.[^.]+$/, ''), 'note', 'blue', null)
    loadFileContent(file, newN.id)
  } else {
    // 追加到当前笔记
    if (confirm('导入文件将替换当前笔记内容，确定继续？')) {
      loadFileContent(file, activeNote.value.id)
    }
  }
  // 清空 input 值，允许重复选择同一文件
  event.target.value = ''
}
function loadFileContent(file, noteId) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    noteStore.updateNote(noteId, { content })
    // 如果是新建的笔记，打开它
    if (!activeNote.value || activeNote.value.id !== noteId) {
      noteStore.openNote(noteId)
    }
    uiStore.showToast(`已导入：${file.name}`, 'success')
  }
  reader.onerror = () => {
    uiStore.showToast('文件读取失败', 'error')
  }
  reader.readAsText(file)
}
function exportNote() {
  if (!activeNote.value) return
  const note = activeNote.value
  // 标题作为文件名
  const filename = (note.title || '无标题').replace(/[\\/:*?"<>|]/g, '_') + '.md'
  // 如果是待办笔记，格式化输出
  let exportContent = note.content
  if (note.type === 'todo' && note.todos?.length) {
    exportContent = '# ' + note.title + '\n\n' +
      note.todos.map(t => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')
  } else {
    exportContent = '# ' + note.title + '\n\n' + note.content
  }
  const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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
.editor-toolbar {
  padding: 6px 12px; display: flex; align-items: center; gap: 3px;
  border-bottom: 1px solid var(--border); flex-shrink: 0; flex-wrap: wrap;
}
.toolbar-btn {
  padding: 4px 8px; border-radius: 4px; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; font-size: 12px; transition: var(--transition);
  font-family: var(--font);
}
.toolbar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.toolbar-btn.active { background: var(--bg-active); color: var(--accent); font-weight: 600; }
.toolbar-btn.danger { color: var(--danger); }
.toolbar-btn.danger:hover { background: rgba(229,62,108,0.1); }
.toolbar-btn.ai-btn { color: var(--accent); }
.toolbar-btn.mic-btn.recording { color: var(--danger); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.toolbar-divider { width: 1px; height: 16px; background: var(--border); margin: 0 4px; }
.editor-header { padding: 12px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.editor-title-input {
  width: 100%; background: none; border: none; outline: none;
  color: var(--text-primary); font-size: 18px; font-weight: 700; font-family: var(--font);
}
.editor-meta { display: flex; gap: 12px; margin-top: 8px; position: relative; }
.meta-tag {
  display: flex; align-items: center; gap: 4px; font-size: 12px;
  color: var(--text-secondary); cursor: pointer; position: relative;
}
.meta-tag:hover { color: var(--text-primary); }
.meta-tag .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.meta-arrow { font-size: 8px; opacity: 0.6; margin-left: 2px; }
/* 下拉菜单 */
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
.editor-body { flex: 1; overflow-y: auto; padding: 16px 24px; min-height: 0; }
.editor-textarea {
  width: 100%; height: 100%; background: none; border: none; outline: none;
  color: var(--text-primary); font-size: 14px; line-height: 1.8; resize: none; font-family: var(--font);
}
.note-rendered { line-height: 1.8; color: var(--text-primary); }
.note-rendered :deep(h1) { font-size: 22px; margin: 16px 0 8px; }
.note-rendered :deep(h2) { font-size: 18px; margin: 14px 0 6px; }
.note-rendered :deep(h3) { font-size: 15px; margin: 12px 0 4px; }
.note-rendered :deep(code) { background: var(--bg-hover); padding: 1px 4px; border-radius: 3px; font-size: 13px; }
.note-rendered :deep(pre) { background: var(--bg-hover); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0; }
.note-rendered :deep(pre code) { background: none; padding: 0; }
.note-rendered :deep(blockquote) { border-left: 3px solid var(--accent); padding-left: 12px; color: var(--text-secondary); margin: 8px 0; }
.note-rendered :deep(ul) { padding-left: 20px; }
.note-rendered :deep(li) { margin: 4px 0; }
.note-rendered :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
.note-rendered :deep(a) { color: var(--accent); text-decoration: none; }
.note-rendered :deep(a:hover) { text-decoration: underline; }
.note-rendered :deep(img) { max-width: 100%; border-radius: 6px; margin: 8px 0; }
.note-rendered :deep(.rendered-todo) { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
.note-rendered :deep(.rt-check) { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid var(--border); display: inline-block; }
.note-rendered :deep(.rt-check.checked) { background: var(--accent); border-color: var(--accent); color: white; font-size: 10px; text-align: center; line-height: 14px; }
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
.todo-del {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  font-size: 12px; flex-shrink: 0;
}
.todo-del:hover { color: var(--danger); }
.todo-add-bar {
  display: flex; align-items: center; gap: 8px; padding: 8px 0;
  border-top: 1px solid var(--border); margin-top: 8px;
}
.todo-add-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text-primary); font-size: 13px; font-family: var(--font);
}
.todo-add-submit {
  padding: 4px 10px; border-radius: 4px; background: var(--accent);
  border: none; color: white; font-size: 12px; cursor: pointer;
}
.editor-statusbar {
  padding: 6px 24px; border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 16px;
  background: var(--bg-sidebar); font-size: 11px; color: var(--text-muted); flex-shrink: 0;
}
.statusbar-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--success); display: inline-block; }
</style>
