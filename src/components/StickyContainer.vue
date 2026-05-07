<template>
  <Teleport to="body">
    <!-- 便签层 -->
    <div class="sticky-layer">
      <!-- 隐藏到右边界的小标签 -->
      <div
        v-for="s in hiddenStickers"
        :key="'hidden-' + s.id"
        class="sticky-dock"
        :style="{top: (s.dockY || 100) + 'px'}"
        @click="restoreSticker(s.id)"
        :title="s.title + '（点击展开）'"
      >
        <div class="dock-tab" :style="{background: themeMap[s.theme]?.headerBg || '#4f8ef7'}">
          {{ s.title?.slice(0, 1) || '📝' }}
        </div>
      </div>

      <!-- 展开的便签 -->
      <TransitionGroup name="sticker">
        <div
          v-for="s in visibleStickers"
          :key="s.id"
          class="sticker-window"
          :class="['theme-' + (s.theme || 'default'), {pinned: s.pinned, hiding: s.hiding}]"
          :style="stickerStyle(s)"
          @mousedown="bringToFront(s.id)"
        >
          <!-- 标题栏 -->
          <div class="sticker-titlebar" @mousedown.prevent="startDrag(s.id, $event)">
            <div class="titlebar-left">
              <button
                class="pin-btn"
                :class="{active: s.pinned}"
                @click.stop="togglePin(s.id)"
                :title="s.pinned ? '取消固定' : '固定位置'"
              >📌</button>
              <span class="sticker-title">{{ s.title || '便签' }}</span>
            </div>
            <div class="titlebar-right">
              <!-- 主题切换 -->
              <button class="sticker-action-btn" @click.stop="showThemeMenu(s.id)" title="切换主题">🎨</button>
              <button class="sticker-action-btn" @click="removeSticker(s.id)" title="关闭">×</button>
            </div>
          </div>

          <!-- 主题选择菜单 -->
          <div v-if="activeThemeMenu === s.id" class="theme-picker" @click.stop>
            <div
              v-for="(t, key) in themeMap"
              :key="key"
              class="theme-swatch"
              :class="{active: s.theme === key}"
              :style="{background: t.headerBg, color: t.textColor}"
              @click="applyTheme(s.id, key)"
            >
              <span class="theme-label">{{ t.label }}</span>
            </div>
          </div>

          <!-- 内容 -->
          <div class="sticker-body" @dblclick="openSource(s)">
            {{ s.content }}
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteStore } from '../stores/noteStore'

const noteStore = useNoteStore()
const { stickers } = storeToRefs(noteStore)

// 隐藏便签列表（拖到右边界后）
const hiddenStickers = ref([])

// 当前打开的主题菜单
const activeThemeMenu = ref(null)

// 便签主题映射
const themeMap = {
  default: {
    label: '默认蓝',
    headerBg: '#4f8ef7',
    bodyBg: '#1e2a4a',
    textColor: '#e8eaf6',
    border: '#4f8ef7',
  },
  macaron: {
    label: '马卡龙',
    headerBg: '#ffb3c6',
    bodyBg: '#fff5f7',
    textColor: '#6b3a4a',
    border: '#ffb3c6',
  },
  dark: {
    label: '暗夜',
    headerBg: '#1a1a2e',
    bodyBg: '#16213e',
    textColor: '#e8eaf6',
    border: '#2a3a60',
  },
  gradient: {
    label: '渐变',
    headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bodyBg: 'linear-gradient(135deg, #f5f7fa 0%, #e8d5f7 100%)',
    textColor: '#2d1b4e',
    border: 'transparent',
  },
  planner: {
    label: '手账',
    headerBg: '#f6e05e',
    bodyBg: '#fffef0',
    textColor: '#5d4e37',
    border: '#f6e05e',
  },
  neon: {
    label: '霓虹',
    headerBg: '#0f0f23',
    bodyBg: '#0f0f23',
    textColor: '#00ffcc',
    border: '#00ffcc',
    glow: '0 0 10px #00ffcc, 0 0 20px #00ffcc33',
  },
  sunset: {
    label: '日落',
    headerBg: 'linear-gradient(90deg, #ff6b6b, #ffa07a)',
    bodyBg: '#fff5f0',
    textColor: '#7a3b2e',
    border: 'transparent',
  },
  mint: {
    label: '薄荷',
    headerBg: '#81e6d9',
    bodyBg: '#f0fff4',
    textColor: '#234e52',
    border: '#81e6d9',
  },
}

// 可见便签（未隐藏的）
const visibleStickers = computed(() => stickers.value.filter(s => !s.hidden))

function stickerStyle(s) {
  const t = themeMap[s.theme] || themeMap.default
  return {
    left: s.x + 'px',
    top: s.y + 'px',
    width: (s.w || 220) + 'px',
    zIndex: s.z || 10,
    '--t-header-bg': t.headerBg,
    '--t-body-bg': t.bodyBg,
    '--t-text-color': t.textColor,
    '--t-border': t.border,
    '--t-glow': t.glow || 'none',
  }
}

function bringToFront(id) {
  if (activeThemeMenu.value === id) return
  noteStore.updateStickerZ(id)
  activeThemeMenu.value = null
}

function togglePin(id) {
  const s = stickers.value.find(s => s.id === id)
  if (s) noteStore.updateSticker(id, { pinned: !s.pinned })
  activeThemeMenu.value = null
}

function showThemeMenu(id) {
  activeThemeMenu.value = activeThemeMenu.value === id ? null : id
}

function applyTheme(id, theme) {
  noteStore.updateSticker(id, { theme })
  activeThemeMenu.value = null
}

function startDrag(id, e) {
  const s = stickers.value.find(s => s.id === id)
  if (!s || s.pinned) return // 固定的不能拖

  const startX = e.clientX
  const startY = e.clientY
  const origX = s.x || 100
  const origY = s.y || 100
  let moved = false

  function onMove(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true

    const newX = origX + dx
    const newY = origY + dy

    // 检测是否拖到右边界（屏幕右侧边缘 30px 内）
    if (newX + (s.w || 220) > window.innerWidth - 30) {
      // 隐藏到边界
      noteStore.hideSticker(id, origY)
      const st = stickers.value.find(x => x.id === id)
      if (st) {
        hiddenStickers.value.push({
          id,
          title: st.title,
          dockY: Math.max(40, Math.min(st.y, window.innerHeight - 60))
        })
      }
      e.preventDefault()
    } else {
      noteStore.moveSticker(id, newX, newY)
    }
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function restoreSticker(id) {
  noteStore.restoreSticker(id)
  // 从隐藏列表移除
  hiddenStickers.value = hiddenStickers.value.filter(h => h.id !== id)
}

function removeSticker(id) {
  noteStore.removeSticker(id)
  hiddenStickers.value = hiddenStickers.value.filter(h => h.id !== id)
  activeThemeMenu.value = null
}

function openSource(s) {
  if (s.sourceId) noteStore.openNote(s.sourceId)
}

// 点击其他地方关闭主题菜单
function onDocClick() {
  activeThemeMenu.value = null
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.sticky-layer { position: fixed; inset: 0; pointer-events: none; z-index: 999; }

/* === 隐藏的便签标签 === */
.sticky-dock {
  position: absolute; right: 0;
  pointer-events: all; cursor: pointer;
}
.dock-tab {
  width: 28px; height: 40px; border-radius: 8px 0 0 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}
.sticky-dock:hover .dock-tab { transform: scaleX(1.1); }

/* === 便签窗口 === */
.sticker-window {
  position: absolute; border-radius: 10px;
  box-shadow: var(--shadow-lg);
  pointer-events: all; overflow: visible;
  display: flex; flex-direction: column;
  max-height: 260px;
  border-top: 3px solid var(--t-border);
  border-left: 1px solid var(--t-border);
  border-right: 1px solid var(--t-border);
}
.sticker-window.theme-default { background: var(--t-body-bg); }
.sticker-window.theme-dark { background: var(--t-body-bg); }
.sticker-window.theme-neon { box-shadow: var(--t-glow), var(--shadow-lg); }

/* 固定状态 */
.sticker-window.pinned { border: 1px solid var(--t-border); }

/* === 标题栏 === */
.sticker-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 8px; font-size: 12px; font-weight: 600;
  cursor: grab; background: var(--t-header-bg);
  border-radius: 8px 8px 0 0; flex-shrink: 0;
  color: white;
}
.sticker-window.theme-macaron .sticker-titlebar,
.sticker-window.theme-planner .sticker-titlebar,
.sticker-window.theme-gradient .sticker-titlebar,
.sticker-window.theme-sunset .sticker-titlebar,
.sticker-window.theme-mint .sticker-titlebar { color: rgba(0,0,0,0.7); }
.titlebar-left { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.titlebar-right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.sticker-title {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: inherit; max-width: 130px;
}
.pin-btn {
  background: none; border: none; cursor: pointer; font-size: 11px;
  padding: 1px 2px; border-radius: 3px; flex-shrink: 0;
  opacity: 0.5; transition: opacity 0.2s, transform 0.2s;
}
.pin-btn.active { opacity: 1; transform: rotate(15deg); }
.pin-btn:hover { opacity: 1; }
.sticker-action-btn {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 12px; padding: 1px 3px; border-radius: 3px; opacity: 0.6;
  transition: opacity 0.2s;
}
.sticker-action-btn:hover { opacity: 1; }

/* === 主题选择器 === */
.theme-picker {
  position: absolute; top: 32px; left: 4px; z-index: 100;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 8px; padding: 6px; display: flex; flex-direction: column; gap: 4px;
  box-shadow: var(--shadow-lg); min-width: 90px;
}
.theme-swatch {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-radius: 5px; cursor: pointer;
  font-size: 11px; transition: transform 0.15s; border: 2px solid transparent;
}
.theme-swatch:hover { transform: scale(1.05); }
.theme-swatch.active { border-color: white; box-shadow: 0 0 0 1px var(--accent); }
.theme-label { font-weight: 600; }

/* === 内容区 === */
.sticker-body {
  padding: 10px; font-size: 12px; line-height: 1.6;
  color: var(--t-text-color); overflow-y: auto; flex: 1;
  white-space: pre-wrap; cursor: pointer;
  border-radius: 0 0 8px 8px;
  background: var(--t-body-bg);
}

/* 动画 */
.sticker-enter-active { animation: stickerIn 0.25s ease; }
.sticker-leave-active { animation: stickerOut 0.2s ease; }
@keyframes stickerIn { from { opacity: 0; transform: scale(0.85) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes stickerOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.85); } }
</style>
