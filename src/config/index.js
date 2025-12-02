import { Result } from "postcss"

// 定义基础常量
export const BASE_CONSTANTS = {
  // 后端域名
  BACKEND_DOMAIN: '',
  // 微信appId
  WECHAT_APP_ID: 'wx8d42beec7b9daec5',
}

// API 基础配置
export const API_CONFIG = {
  // API 基础路径
  BASE_URL: BASE_CONSTANTS.BACKEND_DOMAIN,
  // API 超时时间
  TIMEOUT: 10000,
}

// 微信配置
export const WX_CONFIG = {
  // 微信认证地址
  AUTH_URL: `${BASE_CONSTANTS.BACKEND_DOMAIN}/api/v1/auth/wechat/auth`,
  // 微信回调地址 - 这是后端需要设置的前端回调地址（完整URL）
  CALLBACK_URL: '',
  // 后端API回调路径 - 调用后端API获取用户信息时使用
  API_CALLBACK_URL: `${BASE_CONSTANTS.BACKEND_DOMAIN}/api/v1/wechat/oauth/callback`,
}

// API 接口路径
export const API_URLS = {
  // 用户相关
  USER: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    PROFILE: '/api/v1/user/profile',
    UPDATE_PROFILE: '/api/v1/user/profile/update',
    FEEDBACK: '/api/v1/user/feedback',
  },
  
  // 微信认证相关
  AUTH: {
    WECHAT_AUTH: '/api/v1/wechat/oauth/url',
    WECHAT_CALLBACK: '/api/v1/wechat/oauth/callback'
  },
  
  // 课程相关
  COURSE: {
    LIST: '/api/v1/courses',
    DETAIL: (id) => `/api/v1/courses/${id}`,
    EXAM: (id) => `/api/v1/courses/${id}/exam`,
    PRACTICE: (id) => `/api/v1/courses/${id}/practice`,
  },
  
  // 订单相关
  ORDER: {
    LIST: '/api/v1/orders',
    DETAIL: (id) => `/api/v1/orders/${id}`,
    PAY: (id) => `/api/v1/orders/${id}/pay`,
  },
  
  // 练习相关
  PRACTICE: {
    HOME: '/api/v1/practice/home',
    WRONG_QUESTIONS: '/api/v1/practice/wrong-questions',
    COURSE_WRONG_QUESTIONS: (courseId, questionType = '') =>
      `/api/v1/practice/wrong-questions/${courseId}${questionType ? `?type=${questionType}` : ''}`,
    HISTORY: '/api/v1/practice/history',
    SUBMIT: '/api/v1/practice/submit',
    COURSE_QUESTIONS: (courseId, typeId) =>
      `/course/${courseId}/practice/${typeId}`,
  },
  
  // 考试相关
  EXAM: {
    START: (id) => `/api/v1/exams/${id}/start`,
    SUBMIT: (id) => `/api/v1/exams/${id}/submit`,
    RESULT: (id) => `/api/v1/exams/${id}/result`,
    RESULTS: '/api/v1/exams/result',
  },
  
  // 支付相关
  PAYMENT: {
    CREATE: '/api/v1/payments/create',
    NOTIFY: '/api/v1/payments/notify',
    QUERY: (orderNo) => `/api/v1/payments/query/${orderNo}`,
    CANCEL: (orderNo) => `/api/v1/payments/cancel/${orderNo}`,
    REDEEM_CARD: '/api/v1/payments/redeem-card', // 兑换码创建订单
  },
  
  // 微信相关
  WECHAT: {
    AUTH_URL: '/api/v1/wechat/oauth/url', // 获取授权URL
    AUTH_CALLBACK: '/api/v1/wechat/oauth/callback', // 授权回调
    QR_CODE: '/api/v1/wechat/qrcode/create', // 创建登录二维码
    QR_CHECK: '/api/v1/wechat/qrcode/check', // 检查二维码状态
    QR_CALLBACK: '/api/v1/wechat/qrcode/callback', // 二维码回调处理
  },
}

// 微信配置常量
export const WECHAT_CONSTANTS = {
  QR_CHECK_INTERVAL: 3000, // 检查间隔（毫秒）
  QR_EXPIRE_TIME: 5 * 60 * 1000 // 二维码过期时间（毫秒）
}

// 路由路径
export const ROUTE_PATHS = {
  // 主页
  HOME: '/',
  
  // 认证相关
  LOGIN: '/login',
  REGISTER: '/register',
  
  // 用户相关
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // 课程相关
  COURSE: {
    LIST: '/courses',
    DETAIL: (id) => `/courses/${id}`,
    EXAM: (id) => `/courses/${id}/exam`,
    PRACTICE: (id) => `/courses/${id}/practice`,
  },
  
  // 订单相关
  ORDER: {
    LIST: '/orders',
    DETAIL: (id) => `/orders/${id}`,
  },
  
  // 练习相关
  PRACTICE: {
    HOME: '/practice',
    WRONG_QUESTIONS: (courseId, typeId) => 
      `/course/${courseId}/wrong-questions?type=${typeId}`,
  },
  
  // 考试相关
  EXAM: {
    RESULT: '/exam-result',
  }
} 