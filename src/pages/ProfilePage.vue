<template>
  <div class="flex flex-col h-screen">
    <!-- 用户信息 -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full border overflow-hidden bg-secondary/50 flex items-center justify-center">
          <img 
            v-if="userStore.userInfo?.avatar" 
            :src="userStore.userInfo?.avatar" 
            alt="用户头像" 
            class="w-full h-full object-cover"
            @error="handleAvatarError"
          />
          <UserIcon 
            v-else
            class="w-8 h-8 text-muted-foreground"
          />
        </div>
        <div>
          <h2 class="text-xl font-bold">{{ userStore.userInfo?.nickname || '未设置昵称' }}</h2>
          <p class="text-sm text-muted-foreground">用户ID: {{ userStore.userInfo?.id || '未知' }}</p>
        </div>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="space-y-2 p-4">
      <!-- 主题切换 -->
      <div 
        class="flex items-center justify-between p-3 rounded-lg bg-card cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <component 
            :is="isDark ? MoonIcon : SunIcon" 
            class="w-5 h-5 text-primary"
          />
          <span>深色模式</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox"
            class="sr-only peer"
            v-model="isDark"
            @change="toggleTheme"
          >
          <div class="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <!-- 菜单项 -->
      <div
        v-for="item in menuItems"
        :key="item.name"
        class="flex items-center justify-between p-3 rounded-lg bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
        @click="router.push(item.path)"
      >
        <div class="flex items-center gap-3">
          <component :is="item.icon" class="w-5 h-5 text-primary" />
          <span>{{ item.name }}</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- 用户反馈未读数量提醒 -->
          <div
            v-if="item.name === '用户反馈' && unreadFeedbackCount > 0"
            class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-medium"
          >
            {{ unreadFeedbackCount > 99 ? '99+' : unreadFeedbackCount }}
          </div>
          <ChevronRightIcon class="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
      
      <!-- 兑换码入口 -->
      <div 
        class="flex items-center justify-between p-3 rounded-lg bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
        @click="router.push('/redeem-code')"
      >
        <div class="flex items-center gap-3">
          <GiftIcon class="w-5 h-5 text-primary" />
          <span>兑换码</span>
        </div>
        <ChevronRightIcon class="w-5 h-5 text-muted-foreground" />
      </div>
      
      <!-- 退出登录 -->
      <div 
        class="flex items-center justify-between p-3 rounded-lg bg-card cursor-pointer hover:bg-secondary/50 transition-colors mt-8"
        @click="showLogoutConfirm = true"
      >
        <div class="flex items-center gap-3">
          <LogOutIcon class="w-5 h-5 text-primary" />
          <span>退出登录</span>
        </div>
        <ChevronRightIcon class="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
    
    <!-- 退出登录确认对话框 -->
    <div v-if="showLogoutConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card p-6 rounded-lg w-80 max-w-full shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <LogOutIcon class="w-6 h-6 text-primary" />
          <h3 class="text-lg font-semibold">确认退出登录</h3>
        </div>
        <p class="text-muted-foreground mb-6">您确定要退出当前账号吗？退出后需要重新登录。</p>
        <div class="flex justify-end gap-3">
          <button 
            class="btn btn-outline"
            @click="showLogoutConfirm = false"
          >
            取消
          </button>
          <button 
            class="btn btn-primary shadow-sm"
            @click="handleLogout"
          >
            确认退出
          </button>
        </div>
      </div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  HelpCircleIcon,
  LogOutIcon,
  UserIcon,
  MessageSquareIcon,
  GiftIcon
} from 'lucide-vue-next'
import TabBar from '../components/TabBar.vue'
import request from '@/utils/request'
import { API_URLS } from '@/config'

const router = useRouter()
const userStore = useUserStore()
const isDark = ref(document.documentElement.classList.contains('dark'))
const isLoading = ref(false)
const unreadFeedbackCount = ref(0)

// 切换主题
const toggleTheme = () => {
  try {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  } catch (error) {
    console.error('切换主题失败:', error)
  }
}

const showLogoutConfirm = ref(false)

// 菜单项配置
const menuItems = [
  { name: '我的成绩', path: '/scores', icon: ClipboardListIcon },
  { name: '我的订单', path: '/orders', icon: ClipboardListIcon },
  { name: '用户反馈', path: '/feedback', icon: MessageSquareIcon },
  { name: '帮助与文档', path: '/help', icon: HelpCircleIcon }
]

// 获取用户反馈数量
const fetchFeedbackCount = async () => {
  try {
    const response = await request(API_URLS.USER.FEEDBACK)
    if (response.code === 200 && response.data?.items) {
      // 统计 status 为 1 的反馈数量
      const repliedFeedbacks = response.data.items.filter(item => item.status === 1)
      unreadFeedbackCount.value = repliedFeedbacks.length
    }
  } catch (error) {
    console.error('获取反馈数量失败:', error)
    // 静默失败，不影响页面正常显示
  }
}

// 处理头像加载错误
const handleAvatarError = (e) => {
  e.target.style.display = 'none'
  // 显示默认的用户图标
  e.target.parentNode.querySelector('svg').style.display = 'block'
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  router.replace({ name: 'Login' })
  showLogoutConfirm.value = false
}

// 获取用户信息
onMounted(async () => {
  if (!userStore.userInfo || !userStore.isProfileComplete) {
    isLoading.value = true
    try {
      // 确保用户信息被正确加载
      const result = await userStore.fetchUserInfo()

      // 如果获取用户信息失败但没有抛出错误，手动处理
      if (!result && !userStore.userInfo) {
        console.error('Failed to fetch user info')
        router.replace('/login')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      router.replace('/login')
    } finally {
      isLoading.value = false
    }
  }

  // 获取反馈数量
  await fetchFeedbackCount()
})
</script> 