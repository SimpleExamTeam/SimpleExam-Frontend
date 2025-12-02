<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="card p-6 w-full max-w-sm text-center">
      <LoaderIcon v-if="loading" class="w-12 h-12 text-primary mx-auto animate-spin" />
      <div v-else-if="error" class="text-red-500">
        <XCircleIcon class="w-12 h-12 mx-auto mb-4" />
        <p>{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="retryLogin">
          重试
        </button>
      </div>
      <div v-else>
        <p class="text-green-500 mb-4">登录成功，正在跳转...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LoaderIcon, XCircleIcon } from 'lucide-vue-next'
import { handleWxAuth, getWxAuthUrl } from '../utils/auth'
import { useUserStore } from '@/stores/user'
import { API_CONFIG, WX_CONFIG, API_URLS } from '@/config'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const error = ref('')
const userStore = useUserStore()

// 检查登录状态
const checkLoginStatus = () => {
  const currentToken = localStorage.getItem('token')
  console.log('当前localStorage中的token:', currentToken)
  console.log('当前store中的token:', userStore.token)
  console.log('是否已登录:', userStore.isLoggedIn())
  return !!currentToken
}

const handleCallback = async () => {
  try {
    console.log('开始处理微信回调, 路由参数:', route.query)
    const { code } = route.query
    
    if (!code) {
      console.error('未找到授权码，需要重定向到微信认证')
      // 如果没有 code，说明是首次请求，需要重定向到微信认证
      const authUrl = await getWxAuthUrl()
      // 保存当前页面 URL 作为回调地址
      localStorage.setItem('redirect_url', window.location.href)
      console.log('重定向到微信授权页面:', authUrl)
      window.location.href = authUrl
      return
    }
    
    console.log('收到微信授权码:', code)
    console.log('登录前状态检查:', checkLoginStatus())
    
    // 直接调用API获取用户信息
    const apiUrl = `${API_CONFIG.BASE_URL}${WX_CONFIG.API_CALLBACK_URL}?code=${code}&state=STATE`
    console.log('调用后端API:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('微信登录API响应:', data)
    
    if (data.code === 200 && data.data) {
      const { token, user } = data.data
      console.log('获取到的token:', token)
      console.log('获取到的用户信息:', user)
      
      // 手动尝试设置localStorage
      try {
        localStorage.setItem('test-key', 'test-value')
        console.log('localStorage测试写入成功')
      } catch (e) {
        console.error('localStorage测试失败:', e)
      }
      
      // 使用store方法设置token和用户信息
      userStore.setToken(token)
      await nextTick()
      userStore.setUserInfo(user)
      await nextTick()
      
      // 再次验证登录状态
      console.log('设置后状态检查:', checkLoginStatus())
      
      // 登录成功后跳转
      // 获取之前保存的回调地址
      const redirectUrl = '/'
      console.log('跳转到:', redirectUrl)
      localStorage.removeItem('redirect_url')
      
      // 使用延时确保状态已更新
      setTimeout(() => {
        router.replace(redirectUrl)
      }, 1000)
    } else {
      throw new Error(data.message || '登录失败')
    }
  } catch (err) {
    console.error('微信登录处理错误:', err)
    error.value = err.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

const retryLogin = async () => {
  loading.value = true
  error.value = ''
  // 重试时重新获取认证地址
  const authUrl = await getWxAuthUrl()
  console.log('重试登录，重定向到:', authUrl)
  window.location.href = authUrl
}

onMounted(() => {
  console.log('微信回调页面已加载，开始处理回调')
  handleCallback()
})
</script> 