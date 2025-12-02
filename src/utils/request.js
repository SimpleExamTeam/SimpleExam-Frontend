import { API_CONFIG } from '@/config'
import { getWxAuthUrl } from '@/utils/auth'
import router from '@/router'

// 处理登录过期
const handleTokenExpired = async () => {
  // 清除 token
  localStorage.removeItem('token')
  
  // 检查是否在微信环境中
  const isWechat = /MicroMessenger/i.test(navigator.userAgent)
  
  if (isWechat) {
    try {
      const authUrl = await getWxAuthUrl()
      // 保存当前URL作为重定向地址
      const currentUrl = window.location.pathname + window.location.search
      localStorage.setItem('redirect_url', currentUrl)
      // 直接跳转到微信授权页面
      window.location.replace(authUrl)
      // 等待页面跳转
      await new Promise(() => {}) // 这会阻止后续代码执行
    } catch (error) {
      console.error('获取微信授权URL失败:', error)
      throw new Error('登录失败，请重试')
    }
  } else {
    // 非微信环境，使用路由导航
    const currentPath = window.location.pathname + window.location.search
    await router.replace({
      name: 'Login',
      query: { redirect: currentPath }
    })
    // 抛出特定错误，让上层组件知道是登录过期
    throw new Error('AUTH_EXPIRED')
  }
}

const request = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
  }

  // 添加 token
  const token = localStorage.getItem('token')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  // 合并配置
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, finalOptions)
    
    // 如果返回 401，说明未登录或 token 失效
    if (response.status === 401) {
      try {
        await handleTokenExpired()
      } catch (error) {
        if (error.message === 'AUTH_EXPIRED') {
          // 返回后端的原始错误响应
          const errorData = await response.json()
          return {
            code: 401,
            message: errorData.msg
          }
        }
        throw error
      }
    }

    // 处理500等服务器错误
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '服务器错误，请重试')
    }
    
    let data
    try {
      data = await response.json()
    } catch (error) {
      console.error('JSON解析错误:', error)
      throw new Error('服务器响应格式错误')
    }

    // 处理业务逻辑错误
    if (data.code !== 200) {
      throw new Error(data.msg || '请求失败')
    }

    return data
  } catch (error) {
    console.error('请求错误:', error)
    // 如果是登录过期错误，返回特定的错误响应
    if (error.message === 'AUTH_EXPIRED') {
      return {
        code: 401,
        message: error.message
      }
    }
    throw error
  }
}

export default request 