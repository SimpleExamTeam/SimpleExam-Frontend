import request from '@/utils/request'
import { API_URLS } from '@/config'

export const login = (data) => {
  return request(API_URLS.USER.LOGIN, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export const getUserProfile = () => {
  return request(API_URLS.USER.PROFILE)
}

export const updateUserProfile = (data) => {
  return request(API_URLS.USER.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export const logout = () => {
  return request(API_URLS.USER.LOGOUT, {
    method: 'POST'
  })
}

// 获取微信登录二维码
export const getWechatQrCode = () => {
  return request(API_URLS.WECHAT.QR_CODE, {
    method: 'POST'
  })
}

// 检查二维码扫码状态
export const checkQrCodeStatus = (sceneStr) => {
  return request(`${API_URLS.WECHAT.QR_CHECK}?scene_str=${sceneStr}`, {
    method: 'GET'
  })
}

// 处理微信二维码回调
export const handleQrCallback = (code, state) => {
  return request(`${API_URLS.WECHAT.QR_CALLBACK}?code=${code}&state=${state}`, {
    method: 'GET'
  })
}

// 获取用户信息 (与getUserProfile功能相同，保留这个更明确的命名)
export const getUserInfo = () => {
  return request(API_URLS.USER.PROFILE)
}

// 更新用户信息 (与updateUserProfile功能相同，但使用POST方法)
export const updateUserInfo = (data) => {
  return request(API_URLS.USER.UPDATE_PROFILE, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 获取用户反馈列表
export const getFeedbackList = (page = 1, size = 10) => {
  return request(`${API_URLS.USER.FEEDBACK}?page=${page}&size=${size}`)
}

// 提交用户反馈
export const submitFeedback = (content) => {
  return request(API_URLS.USER.FEEDBACK, {
    method: 'POST',
    body: JSON.stringify({
      feedback_content: content
    })
  })
} 