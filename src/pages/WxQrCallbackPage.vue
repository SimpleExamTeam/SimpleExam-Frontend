<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
    <div class="bg-card border shadow-md rounded-lg p-6 w-full max-w-sm text-center">
      <LoaderIcon v-if="loading" class="w-12 h-12 text-primary mx-auto animate-spin" />
      <div v-else-if="error" class="text-destructive">
        <XCircleIcon class="w-12 h-12 mx-auto mb-4" />
        <p class="font-medium">{{ error }}</p>
        <button @click="handleRetry" class="mt-6 bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary">
          重试
        </button>
      </div>
      <div v-else>
        <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p class="text-lg font-medium text-green-500 mb-4">登录成功</p>
        <p class="text-sm text-muted-foreground mb-6">您已完成微信登录授权，请关闭此页面</p>
        <div class="flex justify-center">
          <button @click="closeWindow" class="bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary">
            关闭页面
          </button>
        </div>
        <p v-if="closeMessage" class="mt-4 text-sm text-muted-foreground">{{ closeMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { LoaderIcon, XCircleIcon, CheckCircleIcon } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(true)
const error = ref('')
const closeMessage = ref('')

// 检查是否在微信环境
const isInWeChatEnv = /MicroMessenger/i.test(navigator.userAgent)

// 处理回调
const handleCallback = async () => {
  try {
    const { code, state } = route.query
    
    if (!code || !state) {
      throw new Error('参数不完整')
    }
    
    // 调用后端接口处理二维码回调
    await userStore.handleQrCallback(code, state)
    loading.value = false
  } catch (err) {
    console.error('处理回调失败:', err)
    error.value = err.message || '授权失败，请重试'
    loading.value = false
  }
}

// 重试处理
const handleRetry = () => {
  loading.value = true
  error.value = ''
  handleCallback()
}

// 关闭当前窗口
const closeWindow = () => {
  // 在微信环境中关闭页面
  if (isInWeChatEnv) {
    // 微信环境中，使用WeixinJSBridge关闭窗口
    if (typeof window.WeixinJSBridge !== 'undefined') {
      window.WeixinJSBridge.call('closeWindow')
    } else {
      // 如果WeixinJSBridge对象不存在，监听注入的事件
      document.addEventListener('WeixinJSBridgeReady', function() {
        window.WeixinJSBridge.call('closeWindow')
      }, false)
      
      // 显示提示信息
      closeMessage.value = '请点击右上角按钮，选择"关闭"来退出页面'
    }
  } else {
    // 非微信环境，尝试常规的关闭方法
    window.close()
    
    // 如果窗口无法关闭（某些浏览器限制），提示用户手动关闭
    setTimeout(() => {
      closeMessage.value = '请手动关闭此页面'
    }, 300)
  }
}

onMounted(() => {
  handleCallback()
})
</script> 