<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t">
    <nav class="flex justify-around items-center py-2">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center text-muted-foreground px-2 min-w-[4rem]"
        :class="{ 'text-primary': $route.path === item.path }"
      >
        <component 
          :is="item.icon" 
          class="icon-base"
        />
        <span class="tab-bar-text truncate text-center">{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { HomeIcon, ListIcon, BookOpenIcon, UserIcon } from 'lucide-vue-next'

const navItems = [
  { name: '首页', path: '/', icon: HomeIcon },
  { name: '课程表', path: '/schedule', icon: ListIcon },
  { name: '错题集', path: '/practice', icon: BookOpenIcon },
  { name: '我的', path: '/profile', icon: UserIcon }
]
</script>

<style>
/* 非老人模式下的间距 */
.icon-base {
  margin-bottom: 0.375rem;
}
</style> 