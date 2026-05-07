<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal ai-settings-modal">
      <div class="modal-header">
        <h3>🤖 AI 设置</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="setting-row">
          <label class="toggle-label">
            <input type="checkbox" v-model="config.enabled">
            <span class="toggle-switch"></span>
            <span>启用 AI 功能</span>
          </label>
        </div>

        <div class="setting-section" :class="{disabled: !config.enabled}">
          <div class="setting-row">
            <label>服务提供商</label>
            <select v-model="config.provider" :disabled="!config.enabled">
              <option value="openai">OpenAI</option>
              <option value="siliconflow">SiliconFlow</option>
              <option value="custom">自定义 API</option>
            </select>
          </div>

          <div class="setting-row">
            <label>API 地址</label>
            <input
              type="text"
              v-model="config.apiUrl"
              :disabled="!config.enabled || config.provider !== 'custom'"
              :placeholder="apiUrlPlaceholder"
            >
          </div>

          <div class="setting-row">
            <label>API Key</label>
            <input
              type="password"
              v-model="config.apiKey"
              :disabled="!config.enabled"
              placeholder="sk-..."
            >
          </div>

          <div class="setting-row">
            <label>模型</label>
            <input
              type="text"
              v-model="config.model"
              :disabled="!config.enabled"
              :placeholder="modelPlaceholder"
            >
          </div>

          <div class="setting-tips">
            <p>💡 <strong>提示：</strong></p>
            <ul>
              <li v-for="(tip, i) in tips" :key="i">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

const emit = defineEmits(['close'])
const uiStore = useUIStore()

const config = ref({ ...uiStore.aiConfig })

const apiUrlPlaceholder = computed(() => {
  if (config.value.provider === 'openai') return 'https://api.openai.com/v1'
  if (config.value.provider === 'siliconflow') return 'https://api.siliconflow.cn/v1'
  return 'https://api.example.com/v1'
})

const modelPlaceholder = computed(() => {
  if (config.value.provider === 'openai') return 'gpt-3.5-turbo / gpt-4'
  if (config.value.provider === 'siliconflow') return 'Qwen/Qwen2.5-7B-Instruct'
  return 'gpt-3.5-turbo'
})

const tips = computed(() => {
  if (config.value.provider === 'openai') return [
    'OpenAI API 需要科学上网',
    '推荐使用 gpt-3.5-turbo 性价比最高'
  ]
  if (config.value.provider === 'siliconflow') return [
    'SiliconFlow 提供国内可访问的 AI API',
    '注册地址: siliconflow.cn',
    '推荐模型: Qwen2.5 系列'
  ]
  return [
    '支持任何兼容 OpenAI 格式的 API',
    '确保 API 可正常访问'
  ]
})

function save() {
  uiStore.saveAIConfig(config.value)
  uiStore.showToast('AI 设置已保存', 'success')
  emit('close')
}
</script>

<style scoped>
.ai-settings-modal { width: 440px; }
.setting-section { margin-top: 16px; }
.setting-section.disabled { opacity: 0.5; pointer-events: none; }
.setting-row { margin-bottom: 16px; }
.setting-row label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--text-secondary); }
.setting-row input, .setting-row select {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border);
  border-radius: 6px; background: var(--bg-input); color: var(--text-primary);
  font-size: 13px;
}
.setting-row input:focus, .setting-row select:focus { outline: none; border-color: var(--accent); }
.toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; }
.toggle-label input { display: none; }
.toggle-switch {
  width: 40px; height: 22px; background: var(--border); border-radius: 11px;
  position: relative; transition: var(--transition);
}
.toggle-switch::after {
  content: ''; position: absolute; width: 18px; height: 18px;
  background: white; border-radius: 50%; top: 2px; left: 2px;
  transition: var(--transition);
}
.toggle-label input:checked + .toggle-switch { background: var(--accent); }
.toggle-label input:checked + .toggle-switch::after { left: 20px; }
.setting-tips {
  background: var(--bg-hover); padding: 12px; border-radius: 6px;
  font-size: 12px; color: var(--text-secondary);
}
.setting-tips p { margin-bottom: 6px; }
.setting-tips ul { margin: 0; padding-left: 16px; }
.setting-tips li { margin: 4px 0; }
</style>
