<template>
  <div class="h-screen overflow-hidden">
    <!-- 路由视图，让它填充剩余空间 -->
    <main class="h-screen overflow-hidden flex flex-col">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 延迟预加载路由组件
  setTimeout(() => {
    router.getRoutes().forEach(route => {
      if (typeof route.component === 'function') {
        route.component().catch(err => {
          console.warn('预加载路由组件失败:', err)
        })
      }
    })
  }, 1000)
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style> 