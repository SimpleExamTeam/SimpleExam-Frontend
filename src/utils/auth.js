import { WX_CONFIG, API_CONFIG, API_URLS } from '@/config'

// 获取微信登录链接
export const getWxAuthUrl = async () => {
  try {
    // 构建基于当前域名的完整前端回调URL
    const frontendCallbackUrl = window.location.origin + '/wechat/callback'
    
    console.log('构建的前端回调地址:', frontendCallbackUrl)
    
    // 请求微信授权URL，带上正确的前端回调地址
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_URLS.AUTH.WECHAT_AUTH}?redirect_uri=${encodeURIComponent(frontendCallbackUrl)}`)
    
    const data = await response.json()
    console.log('获取到的微信授权URL响应:', data)
    
    if (data.code === 200) {
      const url = data.data.url
      return url
    }
    throw new Error('获取微信认证地址失败')
  } catch (error) {
    console.error('获取微信认证地址失败:', error)
    // 如果是开发环境，可以提供一个测试用的跳过登录选项
    // if (import.meta.env.DEV) {
    //   const skipAuth = window.confirm('微信认证失败，是否跳过登录？')
    //   if (skipAuth) {
    //     localStorage.setItem('token', 'test-token')
    //     return '/'
    //   }
    // }
    throw error
  }
}

// 处理微信登录回调
export const handleWxAuth = async (code) => {
  try {
    // 这里应该调用后端 API 获取用户信息
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_URLS.AUTH.WECHAT_CALLBACK}?code=${code}&state=STATE`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log('微信认证回调API响应:', data)
    
    if (data.code === 200 && data.data) {
      // 直接返回完整的响应数据，让调用者处理token和用户信息
      return data.data
    }
    throw new Error('登录失败')
  } catch (error) {
    console.error('微信登录失败:', error)
    throw error
  }
} 