<template>
  <div class="min-h-screen flex flex-col">
    
    <!-- 登录表单 -->
    <div class="flex-1 flex flex-col justify-center p-6">
      <div class="max-w-md w-full mx-auto space-y-8">
        <!-- Logo -->
        <div class="text-center">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCapIcon class="w-10 h-10 text-primary" />
          </div>
          <h2 class="text-2xl font-bold">SimpleExam</h2>
          <p class="text-muted-foreground mt-2">登录您的账号，开始学习之旅</p>
        </div>
        
        <!-- 账号密码登录表单 -->
        <form @submit.prevent="handlePasswordLogin" class="space-y-4">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium mb-1">用户名</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <input 
                  id="username" 
                  v-model="username" 
                  type="text" 
                  placeholder="请输入用户名" 
                  class="w-full h-12 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium mb-1">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <input 
                  id="password" 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="请输入密码" 
                  class="w-full h-12 pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button 
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" class="w-5 h-5" />
                  <EyeOffIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                id="remember" 
                v-model="rememberMe" 
                type="checkbox" 
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label for="remember" class="ml-2 text-sm text-gray-600">记住我</label>
            </div>
            <router-link to="/forgot-password" class="text-sm text-primary hover:underline font-medium">
              忘记密码?
            </router-link>
          </div>
          
          <!-- 显示登录错误信息 -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md shadow-sm animate-fadeIn" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <XCircleIcon class="h-5 w-5 text-red-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="w-full h-12 bg-primary text-white rounded-md font-medium shadow-md hover:shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <LoaderIcon v-if="loading" class="inline-block w-5 h-5 animate-spin mr-2" />
            登录
          </button>
          
          <!-- 分割线 -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm font-medium">
              <span class="px-3 bg-white dark:bg-gray-900 text-muted-foreground">或</span>
            </div>
          </div>
          
          <!-- 微信登录按钮 -->
          <button 
            type="button"
            @click="handleWechatLogin" 
            class="w-full h-12 bg-[#07C160] hover:bg-[#06AE56] text-white rounded-md font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#07C160]/50 focus:ring-offset-2 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111.36600000000001 90"  class="mr-2 flex-shrink-0"><linearGradient id="a" x1="50.056%" x2="50.056%" y1="94.15%" y2=".437%"><stop offset="0" stop-color="#05cd66"/><stop offset="1" stop-color="#61f380"/><stop offset="1" stop-color="#9eee69"/></linearGradient><linearGradient id="b" x1="50.089%" x2="50.089%" y1="93.535%" y2="-.036%"><stop offset="0" stop-color="#e4e6e6"/><stop offset="1" stop-color="#f0f0f0"/></linearGradient><g fill="none" fill-rule="evenodd"><path d="M0 33.466c0 10.04 5.474 19.213 13.933 25.286.746.496 1.12 1.24 1.12 2.231 0 .248-.125.62-.125.868-.622 2.479-1.742 6.57-1.866 6.693-.124.372-.249.62-.249.992 0 .744.622 1.363 1.369 1.363.248 0 .497-.124.746-.248l8.832-5.082c.622-.371 1.369-.62 2.115-.62.374 0 .871 0 1.244.125 4.106 1.24 8.584 1.859 13.187 1.859 22.267 0 40.306-14.998 40.306-33.467S62.573 0 40.306 0C18.038 0 0 14.998 0 33.466" fill="url(#a)"/><path d="M77.86 86.628c3.847 0 7.57-.5 10.92-1.498.249-.125.621-.125.993-.125.62 0 1.241.25 1.738.5l7.322 4.245c.248.125.372.25.62.25.62 0 1.117-.5 1.117-1.124 0-.25-.124-.5-.124-.874 0-.125-.993-3.497-1.49-5.62-.123-.25-.123-.5-.123-.749 0-.75.372-1.374.993-1.873 7.073-5.12 11.54-12.738 11.54-21.23 0-15.485-15.015-28.098-33.506-28.098S44.353 42.92 44.353 58.53c0 15.485 15.016 28.098 33.507 28.098z" fill="url(#b)"/><path d="M32.05 22.662c0 2.891-2.288 5.18-5.18 5.18s-5.18-2.289-5.18-5.18 2.29-5.18 5.18-5.18 5.18 2.289 5.18 5.18M58.92 22.662c0 2.891-2.288 5.18-5.179 5.18s-5.18-2.289-5.18-5.18 2.289-5.18 5.18-5.18 5.18 2.289 5.18 5.18" fill="#168743"/><g fill="#919191"><path d="M84.82 49.856c0 2.518 2.015 4.532 4.533 4.532s4.532-2.014 4.532-4.532-2.014-4.532-4.532-4.532-4.533 2.014-4.533 4.532M62.482 49.856c0 2.518 2.014 4.532 4.532 4.532s4.533-2.014 4.533-4.532-2.015-4.532-4.533-4.532-4.532 2.014-4.532 4.532"/></g></g></svg>
            微信一键登录
          </button>
        </form>
        
        <div class="text-center text-sm text-muted-foreground">
          <p>还没有账号? <router-link to="/register" class="text-primary hover:underline font-medium">立即注册</router-link></p>
        </div>
      </div>
    </div>
    
    <!-- 底部版权信息 -->
    <div class="flex-none p-6 text-center text-sm text-muted-foreground">
      <p>© 2025 SimpleExam. 保留所有权利.</p>
    </div>
    
    <!-- 微信二维码登录弹窗 -->
    <div v-if="showQrDialog" class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-foreground">微信扫码登录</h3>
          <button @click="showQrDialog = false" class="text-muted-foreground hover:text-foreground">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex flex-col items-center space-y-4">
          <div v-if="qrCode" class="w-64 h-64 flex items-center justify-center border rounded-lg relative bg-white">
            <img :src="qrCode" alt="微信登录二维码" class="w-full h-full" :class="{ 'opacity-50': qrStatus === 'expired' }" />
            <div v-if="qrStatus === 'expired'" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <button @click="refreshQrCode" class="btn btn-primary">
                重新获取
              </button>
            </div>
            <div v-else-if="qrStatus === 'scanned'" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <p class="text-white">请在手机上确认登录</p>
            </div>
          </div>
          <div v-else class="w-64 h-64 flex items-center justify-center border rounded-lg bg-white">
            <LoaderIcon class="w-8 h-8 animate-spin text-primary" />
          </div>
          <p class="text-sm text-muted-foreground">
            {{ 
              qrStatus === 'expired' ? '二维码已过期' :
              qrStatus === 'scanned' ? '已扫码，请确认' :
              qrStatus === 'confirmed' ? '登录成功' :
              '请使用微信扫描二维码登录'
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { API_CONFIG, API_URLS } from '@/config'
import { WECHAT_CONSTANTS } from '@/config'
import QRCode from 'qrcode'
import { 
  EyeIcon, 
  EyeOffIcon,
  LoaderIcon,
  GraduationCapIcon,
  UserIcon,
  LockIcon,
  AlertCircleIcon,
  XCircleIcon,
  XIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const showQrDialog = ref(false)
const qrCode = ref('')
const qrStatus = ref('pending')
let qrCheckTimer = null
let qrSceneStr = null
let qrExpireTimer = null

// 检查是否在微信环境
const isWeixinBrowser = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('micromessenger') !== -1
}

// 生成二维码图片
const generateQrCode = async (url) => {
  try {
    // 使用 qrcode 库生成二维码图片的 base64 字符串
    const qrImageUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    return qrImageUrl
  } catch (err) {
    console.error('生成二维码失败:', err)
    throw new Error('生成二维码失败')
  }
}

// 获取登录二维码
const getLoginQrCode = async () => {
  try {
    const result = await userStore.getWechatQrCode()
    
    if (result.code === 200) {
      qrSceneStr = result.sceneStr
      // 生成二维码图片
      qrCode.value = await generateQrCode(result.qrcode)
      qrStatus.value = 'pending'
      error.value = ''
      
      // 开始轮询检查扫码状态
      startQrCodeCheck()
      
      // 设置过期定时器
      qrExpireTimer = setTimeout(() => {
        qrStatus.value = 'expired'
        clearInterval(qrCheckTimer)
      }, WECHAT_CONSTANTS.QR_EXPIRE_TIME)
    } else {
      error.value = result.msg
      showQrDialog.value = false
    }
  } catch (err) {
    console.error('获取二维码失败:', err)
    error.value = err.message || '获取二维码失败，请重试'
    showQrDialog.value = false
  }
}

// 开始轮询检查扫码状态
const startQrCodeCheck = () => {
  if (qrCheckTimer) {
    clearInterval(qrCheckTimer)
  }
  
  qrCheckTimer = setInterval(async () => {
    try {
      if (!qrSceneStr) return
      
      const result = await userStore.checkQrCodeStatus(qrSceneStr)
      
      if (result.code === 200) {
        qrStatus.value = result.status
        
        if (result.isExpired) {
          clearInterval(qrCheckTimer)
          error.value = '二维码已过期，请重新获取'
        } else if (result.isScanned) {
          // 已扫码，等待确认
          console.log('用户已扫码，等待确认')
        } else if (result.isConfirmed) {
          console.log('用户已确认登录，准备跳转')
          clearInterval(qrCheckTimer)
          clearTimeout(qrExpireTimer)
          
          // 检查登录状态
          if (userStore.isLoggedIn()) {
            showQrDialog.value = false
            // 获取重定向地址
            const redirect = route.query.redirect || '/'
            router.replace(redirect)
          }
        }
      } else {
        error.value = result.msg
        clearInterval(qrCheckTimer)
      }
    } catch (err) {
      console.error('检查扫码状态失败:', err)
      // 如果是网络错误，继续检查
      if (err.message === '网络错误，请重试') {
        return
      }
      // 其他错误则停止检查
      clearInterval(qrCheckTimer)
      error.value = err.message || '检查状态失败，请重新获取二维码'
    }
  }, WECHAT_CONSTANTS.QR_CHECK_INTERVAL)
}

// 处理账号密码登录
const handlePasswordLogin = async () => {
  // 重置错误信息
  error.value = ''
  
  // 表单验证
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请填写完整信息'
    return
  }
  
  try {
    loading.value = true
    
    // 调用登录API
    await userStore.login({
      username: username.value,
      password: password.value,
      remember: rememberMe.value
    })
    
    // 登录成功，跳转到首页或重定向页面
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } catch (err) {
    console.error('登录失败:', err)
    error.value = err.message || '网络错误，请重试'
  } finally {
    loading.value = false
  }
}

// 处理微信登录
const handleWechatLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (isWeixinBrowser()) {
      // 微信内直接跳转授权
      const result = await userStore.wechatLogin()
      if (result.code !== 200) {
        error.value = result.msg || '微信授权失败，请重试'
        return
      }
      console.log('微信授权重定向结果:', result)
    } else {
      // 非微信环境显示二维码
      showQrDialog.value = true
      await getLoginQrCode()
    }
  } catch (err) {
    console.error('微信登录失败:', err)
    error.value = err.message || '网络错误，请重试'
  } finally {
    loading.value = false
  }
}

// 重新获取二维码
const refreshQrCode = async () => {
  error.value = ''
  clearInterval(qrCheckTimer)
  clearTimeout(qrExpireTimer)
  qrCode.value = ''
  qrStatus.value = 'pending'
  await getLoginQrCode()
}

// 组件挂载时检查登录状态
onMounted(() => {
  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn()) {
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (qrCheckTimer) {
    clearInterval(qrCheckTimer)
  }
  if (qrExpireTimer) {
    clearTimeout(qrExpireTimer)
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style> 