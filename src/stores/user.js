import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserProfile, login as loginApi, logout as logoutApi, getWechatQrCode as getQrCode, checkQrCodeStatus as checkQrStatus, handleQrCallback as handleQrCallbackApi } from '@/api/user'
import { getWxAuthUrl } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)
  const error = ref(null)
  const isProfileComplete = ref(false)

  const setUserInfo = (info) => {
    userInfo.value = info
    isProfileComplete.value = !!(info && info.avatar)
  }

  const setToken = (newToken) => {
    console.log('存储token到localStorage:', newToken)
    if (!newToken) {
      console.error('尝试存储空token')
      return
    }
    
    // 先设置到localStorage
    try {
      localStorage.setItem('token', newToken)
      console.log('localStorage设置token成功')
    } catch (err) {
      console.error('localStorage设置token失败:', err)
    }
    
    // 再设置到状态
    token.value = newToken
    console.log('状态中的token已更新:', token.value)
  }

  const fetchUserInfo = async () => {
    try {
      loading.value = true
      const response = await getUserProfile()
      if (response.code === 200) {
        userInfo.value = response.data
        isProfileComplete.value = true
        return response.data
      }
      throw new Error(response.message || '获取用户信息失败')
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户openId
  const getOpenId = async () => {
    try {
      // 如果已经有用户信息且有openId，直接返回
      if (userInfo.value?.open_id) {
        return userInfo.value.open_id
      }
      
      // 否则重新获取用户信息
      const userProfile = await fetchUserInfo()
      return userProfile.open_id
    } catch (err) {
      console.error('获取openId失败:', err)
      throw new Error('获取用户信息失败，请重试')
    }
  }

  const logout = async () => {
    try {
      // 先清除本地状态
      userInfo.value = null
      token.value = ''
      isProfileComplete.value = false
      localStorage.removeItem('token')
      
      // 如果有 token，尝试调用登出 API
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        try {
          await logoutApi()
        } catch (error) {
          console.error('登出 API 调用失败:', error)
        }
      }
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await loginApi(credentials)
      if (response.code === 200) {
        const { token, user } = response.data
        setToken(token)
        setUserInfo(user)
        isProfileComplete.value = false
        return response.data
      }
      throw new Error(response.message || '登录失败')
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const wechatLogin = async () => {
    try {
      loading.value = true
      // 获取微信授权URL
      const authUrl = await getWxAuthUrl()
      
      // 保存当前页面URL作为重定向地址
      localStorage.setItem('redirect_url', window.location.href)
      
      // 重定向到微信授权页面
      window.location.href = authUrl
      
      return { redirected: true }
    } catch (error) {
      console.error('微信登录失败:', error)
      loading.value = false
      throw error
    }
  }

  const isLoggedIn = () => {
    return !!token.value
  }

  // 获取微信登录二维码
  const getWechatQrCode = async () => {
    try {
      loading.value = true
      const response = await getQrCode()
      
      if (response.code === 200 && response.data) {
        return {
          code: 200,
          sceneStr: response.data.scene_str,
          qrcode: response.data.url
        }
      }
      
      return {
        code: response.code,
        msg: response.msg || '获取二维码失败'
      }
    } catch (err) {
      console.error('获取二维码失败:', err)
      return {
        code: 500,
        msg: err.message || '网络错误，请重试'
      }
    } finally {
      loading.value = false
    }
  }

  // 检查二维码扫码状态
  const checkQrCodeStatus = async (sceneStr) => {
    try {
      const response = await checkQrStatus(sceneStr)
      
      if (response.code === 200 && response.data) {
        const { status, token } = response.data
        
        // 如果已确认，设置token并获取用户信息
        if (status === 'confirmed' && token) {
          setToken(token)
          // 获取用户信息
          await fetchUserInfo()
        }
        
        // 返回当前状态
        return {
          code: 200,
          status,
          isExpired: status === 'expired',
          isConfirmed: status === 'confirmed',
          isScanned: status === 'scanned'
        }
      }
      
      return {
        code: response.code,
        msg: response.msg || '检查扫码状态失败'
      }
    } catch (err) {
      console.error('检查扫码状态失败:', err)
      return {
        code: 500,
        msg: err.message || '网络错误，请重试'
      }
    }
  }

  // 处理微信二维码回调
  const handleQrCallback = async (code, state) => {
    try {
      loading.value = true
      const response = await handleQrCallbackApi(code, state)
      
      if (response.code === 200) {
        // 检查响应中是否包含token
        const token = response.data?.token
        if (!token) {
          throw new Error('未获取到登录凭证')
        }
        
        // 设置token
        setToken(token)
        // 获取用户信息
        await fetchUserInfo()
        return { success: true }
      }
      
      throw new Error(response.message || '处理回调失败')
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    userInfo,
    token,
    loading,
    error,
    isProfileComplete,
    setUserInfo,
    setToken,
    fetchUserInfo,
    getOpenId,
    logout,
    login,
    wechatLogin,
    isLoggedIn,
    getWechatQrCode,
    checkQrCodeStatus,
    handleQrCallback
  }
}) 