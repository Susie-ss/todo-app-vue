import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)

// 注册 v-click-outside 指令
app.directive('click-outside', {
  mounted(el, binding) {
    el.__clickOutside = (event) => {
      if (!el.contains(event.target) && typeof binding.value === 'function') {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.__clickOutside, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside, true)
  }
})

app.use(createPinia())
app.mount('#app')
