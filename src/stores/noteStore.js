import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'workbuddy-notes-data'

export const useNoteStore = defineStore('notes', () => {
  // State
  const notes = ref([])
  const folders = ref([])
  const stickers = ref([])
  const activeNoteId = ref(null)
  const activeFolder = ref(null)
  const sidebarTab = ref('notes')
  const editorMode = ref('edit')
  const selectedNoteType = ref('note')
  const selectedColor = ref('blue')
  const sortDesc = ref(true)
  const filterType = ref('')

  // Computed
  const activeNote = computed(() => notes.value.find(n => n.id === activeNoteId.value))
  const filteredNotes = computed(() => {
    let result = notes.value
    if (activeFolder.value) {
      result = result.filter(n => n.folderId === activeFolder.value)
    }
    return sortDesc.value
      ? [...result].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : [...result].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
  })

  // Helpers
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
  }

  function now() {
    return new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // LocalStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('加载数据失败')
    }
    return getDefaultData()
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        notes: notes.value,
        folders: folders.value,
        stickers: stickers.value
      }))
    } catch (e) {
      console.warn('保存数据失败')
    }
  }

  function getDefaultData() {
    return {
      folders: [
        { id: 'f1', name: '工作' },
        { id: 'f2', name: '学习' },
        { id: 'f3', name: '生活' },
      ],
      notes: [
        {
          id: 'n1', title: '项目周报', type: 'note', color: 'blue', folderId: 'f1',
          content: '# 本周进度\n\n## 完成的工作\n- 完成了前端框架搭建\n- 接入了用户认证模块\n- 代码 Review 已完成\n\n## 下周计划\n- 开发数据可视化模块\n- 编写单元测试\n\n> 注意：周五需要提交给产品确认',
          tags: ['工作', '周报'], createdAt: now(), updatedAt: now(), hasStickyNote: false,
          todos: []
        },
        {
          id: 'n2', title: '学习笔记 - TypeScript', type: 'note', color: 'purple', folderId: 'f2',
          content: '# TypeScript 核心概念\n\n## 类型系统\n\nTypeScript 在 JavaScript 基础上添加了静态类型系统，编译时可发现类型错误。\n\n## 接口与类型别名\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n  email?: string;\n}\n```\n\n## 泛型\n\n泛型允许编写可复用的类型安全代码。',
          tags: ['学习', '前端'], createdAt: now(), updatedAt: now(), hasStickyNote: false,
          todos: []
        },
        {
          id: 'n3', title: '今日待办', type: 'todo', color: 'yellow', folderId: null,
          content: '', tags: [], createdAt: now(), updatedAt: now(), hasStickyNote: true,
          todos: [
            { id: 't1', text: '完成 UI 设计稿', done: true, priority: 'high' },
            { id: 't2', text: '和产品对齐需求', done: true, priority: 'medium' },
            { id: 't3', text: '提交代码到 main 分支', done: false, priority: 'high' },
            { id: 't4', text: '更新技术文档', done: false, priority: 'low' },
            { id: 't5', text: '周报撰写', done: false, priority: 'medium' },
          ]
        },
        {
          id: 'n4', title: '读书笔记 - 深度工作', type: 'note', color: 'green', folderId: 'f2',
          content: '# 《深度工作》读书笔记\n\n## 核心观点\n\n深度工作（Deep Work）是指在无干扰状态下专注进行的职业活动，使个人的认知能力达到极限。\n\n## 关键原则\n\n1. **工作深度** - 减少浅层工作\n2. **接受无聊** - 戒掉分心的习惯\n3. **远离社交媒体** - 选择性使用工具\n4. **排干浅工作** - 规划每一小时\n\n> "深度工作的能力正日益稀缺，同时也日益宝贵。"',
          tags: ['读书', '效率'], createdAt: now(), updatedAt: now(), hasStickyNote: false,
          todos: []
        },
        {
          id: 'n5', title: '购物清单', type: 'todo', color: 'pink', folderId: 'f3',
          content: '', tags: ['生活'], createdAt: now(), updatedAt: now(), hasStickyNote: false,
          todos: [
            { id: 't10', text: '牛奶 × 2', done: false, priority: 'low' },
            { id: 't11', text: '面包', done: true, priority: 'low' },
            { id: 't12', text: '蔬菜（西兰花、胡萝卜）', done: false, priority: 'medium' },
            { id: 't13', text: '洗发水', done: false, priority: 'low' },
          ]
        },
      ],
      stickers: [
        {
          id: 's1', title: '今日待办', content: '✅ 完成 UI 设计稿\n✅ 和产品对齐需求\n⬜ 提交代码\n⬜ 更新文档\n⬜ 写周报',
          theme: 'planner', pinned: false, hidden: false,
          x: 60, y: 100, w: 220, z: 10, dockY: 100,
          sourceId: 'n3'
        },
      ]
    }
  }

  // Init
  function init() {
    const saved = loadState()
    folders.value = saved.folders
    notes.value = saved.notes
    stickers.value = saved.stickers
  }

  // Note Actions
  function createNote(name, type = 'note', color = 'blue', folderId = null) {
    const note = {
      id: genId(), title: name || '新建笔记', type,
      color, folderId,
      content: '',
      tags: [], createdAt: now(), updatedAt: now(),
      hasStickyNote: false, todos: [],
    }
    if (type === 'todo') {
      note.todos = [{ id: genId(), text: '第一项待办', done: false, priority: 'medium' }]
    }
    notes.value.unshift(note)
    activeNoteId.value = note.id
    saveState()
    return note
  }

  function updateNote(id, updates) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      Object.assign(note, updates, { updatedAt: now() })
      saveState()
    }
  }

  function deleteNote(id) {
    notes.value = notes.value.filter(n => n.id !== id)
    if (activeNoteId.value === id) {
      activeNoteId.value = null
    }
    saveState()
  }

  function openNote(id) {
    activeNoteId.value = id
    editorMode.value = notes.value.find(n => n.id === id)?.type === 'todo' ? 'todo' : 'edit'
  }

  // Todo Actions
  function addTodo(noteId, text) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.todos.push({ id: genId(), text, done: false, priority: 'medium' })
      note.updatedAt = now()
      saveState()
    }
  }

  function toggleTodo(noteId, todoId) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      const todo = note.todos.find(t => t.id === todoId)
      if (todo) {
        todo.done = !todo.done
        note.updatedAt = now()
        saveState()
      }
    }
  }

  function deleteTodo(noteId, todoId) {
    const note = notes.value.find(n => n.id === noteId)
    if (note) {
      note.todos = note.todos.filter(t => t.id !== todoId)
      note.updatedAt = now()
      saveState()
    }
  }

  // Folder Actions
  function createFolder(name) {
    folders.value.push({ id: genId(), name })
    saveState()
  }

  function deleteFolder(id) {
    folders.value = folders.value.filter(f => f.id !== id)
    notes.value.forEach(n => {
      if (n.folderId === id) n.folderId = null
    })
    saveState()
  }

  // 批量移动笔记到文件夹
  function moveNotesToFolder(noteIds, folderId) {
    noteIds.forEach(id => {
      const note = notes.value.find(n => n.id === id)
      if (note) {
        note.folderId = folderId
        note.updatedAt = now()
      }
    })
    saveState()
  }

  // 批量删除笔记
  function deleteNotes(noteIds) {
    notes.value = notes.value.filter(n => !noteIds.includes(n.id))
    if (noteIds.includes(activeNoteId.value)) {
      activeNoteId.value = null
    }
    saveState()
  }

  // 复制笔记
  function copyNote(id) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      return createNote(note.title + ' (副本)', note.type, note.color, note.folderId)
    }
    return null
  }

  // Sticker Actions
  function createSticker(note = null) {
    const sticker = {
      id: genId(),
      title: note?.title || '新便签',
      content: note?.type === 'todo'
        ? note.todos.map(t => (t.done ? '✅' : '⬜') + ' ' + t.text).join('\n')
        : note?.content?.replace(/#+\s/g, '').slice(0, 200) || '在这里输入内容...',
      color: note?.color || ['yellow', 'pink', 'green', 'blue', 'purple', 'teal'][Math.floor(Math.random() * 6)],
      pinned: false, hidden: false,
      x: 80 + Math.random() * 200, y: 80 + Math.random() * 150, w: 220, z: 10,
      sourceId: note?.id || null,
    }
    stickers.value.push(sticker)
    if (note) {
      note.hasStickyNote = true
    }
    saveState()
    return sticker
  }

  function updateSticker(id, updates) {
    const sticker = stickers.value.find(s => s.id === id)
    if (sticker) {
      Object.assign(sticker, updates)
      saveState()
    }
  }

  function removeSticker(id) {
    stickers.value = stickers.value.filter(s => s.id !== id)
    saveState()
  }

  function hideSticker(id, dockY) {
    const sticker = stickers.value.find(s => s.id === id)
    if (sticker) {
      sticker.hidden = true
      sticker.dockY = dockY
      saveState()
    }
  }

  function restoreSticker(id) {
    const sticker = stickers.value.find(s => s.id === id)
    if (sticker) {
      sticker.hidden = false
      // 恢复到靠右位置
      sticker.x = window.innerWidth - (sticker.w || 220) - 10
      sticker.y = sticker.dockY || sticker.y
      saveState()
    }
  }

  function moveSticker(id, x, y) {
    const sticker = stickers.value.find(s => s.id === id)
    if (sticker) {
      sticker.x = x
      sticker.y = y
      // No saveState here for performance during drag
    }
  }

  function updateStickerZ(id) {
    const maxZ = Math.max(10, ...stickers.value.map(s => s.z || 10))
    const sticker = stickers.value.find(s => s.id === id)
    if (sticker) {
      sticker.z = maxZ + 1
    }
  }

  function setFilter(type) {
    filterType.value = type
  }

  // AI Summary
  function generateSummary(content) {
    const lines = content.split('\n').filter(l => l.trim())
    const keyPoints = []

    lines.forEach(line => {
      if (line.startsWith('#')) return
      if (line.startsWith('```')) return
      if (line.length > 15 && line.length < 200) {
        keyPoints.push(line.replace(/^[-*•]\s*/, '').trim())
      }
    })

    let summary = ''
    if (keyPoints.length > 0) {
      summary = '**核心要点：**\n'
      keyPoints.slice(0, 5).forEach((point, i) => {
        summary += `${i + 1}. ${point}\n`
      })
    }

    const hasTodo = content.includes('- [ ]') || content.includes('- [x]')
    if (hasTodo) {
      const todos = content.match(/- \[ \]/g)
      if (todos) {
        summary += `\n📋 **待完成事项：** ${todos.length} 项\n`
      }
    }

    return summary || '该笔记内容暂无明确要点可提取。'
  }

  function appendSummary(noteId) {
    const note = notes.value.find(n => n.id === noteId)
    if (note && note.content.length > 20) {
      const summary = generateSummary(note.content)
      note.content += `\n\n---\n## 🤖 AI 总结\n\n${summary}`
      note.updatedAt = now()
      saveState()
    }
  }

  return {
    // State
    notes, folders, stickers, activeNoteId, activeFolder, sidebarTab, editorMode,
    selectedNoteType, selectedColor, sortDesc, filterType,
    // Computed
    activeNote, filteredNotes,
    // Methods
    init, saveState, genId, now,
    createNote, updateNote, deleteNote, openNote,
    addTodo, toggleTodo, deleteTodo,
    createFolder, deleteFolder, moveNotesToFolder, deleteNotes, copyNote,
    createSticker, updateSticker, removeSticker, moveSticker, updateStickerZ,
    hideSticker, restoreSticker,
    generateSummary, appendSummary, setFilter
  }
})
