import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css' // 用于Tailwind CSS

// 预加载路由组件
const preloadRouteComponents = () => {
  const routes = router.getRoutes()
  routes.forEach(route => {
    if (typeof route.component === 'function') {
      route.component()
    }
  })
}

// 在空闲时预加载
if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(preloadRouteComponents)
} else {
  setTimeout(preloadRouteComponents, 1000)
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app') 