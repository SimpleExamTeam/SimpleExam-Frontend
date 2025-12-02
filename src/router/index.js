import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { title: 'SimpleExam - 首页' }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../pages/SchedulePage.vue')
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../pages/PracticePage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/ProfilePage.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('../pages/OrderPage.vue')
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../pages/PaymentSuccessPage.vue')
  },
  {
    path: '/scores',
    name: 'Scores',
    component: () => import('../pages/ScoresPage.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../pages/OrdersPage.vue')
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../pages/OrderDetailPage.vue')
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../pages/HelpPage.vue')
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../pages/FeedbackPage.vue'),
    meta: { 
      requiresAuth: true,
      title: '用户反馈'
    }
  },
  {
    path: '/course/:id',
    name: 'Course',
    component: () => import('../pages/CoursePage.vue')
  },
  {
    path: '/course/:id/practice',
    name: 'CoursePractice',
    component: () => import('../pages/CoursePracticePage.vue')
  },
  {
    path: '/course/:id/exam',
    name: 'CourseExam',
    component: () => import('../pages/CourseExamPage.vue')
  },
  {
    path: '/course/:id/practice/:typeId',
    name: 'CoursePracticeQuestions',
    component: () => import('../pages/CoursePracticeQuestionsPage.vue')
  },
  {
    path: '/course/:id/wrong-questions',
    name: 'CourseWrongQuestions',
    component: () => import('../pages/CourseWrongQuestionsPage.vue'),
    meta: {
      requiresAuth: true,
      title: '错题复习'
    }
  },
  {
    path: '/exam-result',
    name: 'ExamResult',
    component: () => import('../pages/ExamResultPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: {
      public: true,
      title: 'SimpleExam - 登录'
    }
  },
  {
    path: '/wechat/callback',
    name: 'WechatCallback',
    component: () => import('../pages/WxCallbackPage.vue'),
    meta: {
      public: true,
      title: 'SimpleExam - 微信登录'
    }
  },
  {
    path: '/wechat/qrcode/callback',
    name: 'WxQrCallback',
    component: () => import('@/pages/WxQrCallbackPage.vue'),
    meta: {
      title: 'SimpleExam - 微信授权',
      requiresAuth: false
    }
  },
  {
    path: '/payment/:courseId',
    name: 'Payment',
    component: () => import('@/pages/PaymentPage.vue'),
    meta: {
      requiresAuth: true,
      title: '确认支付'
    }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/pages/PaymentSuccessPage.vue'),
    meta: {
      requiresAuth: true,
      title: '支付成功'
    }
  },
  {
    path: '/redeem-code',
    name: 'RedeemCode',
    component: () => import('@/pages/RedeemCodePage.vue'),
    meta: {
      requiresAuth: true,
      title: '兑换码'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 确保组件已加载
  if (to.matched.length > 0) {
    const components = to.matched.map(record => record.components.default)
    await Promise.all(components.map(comp => {
      if (typeof comp === 'function') {
        return comp()
      }
      return Promise.resolve()
    }))
  }

  const token = localStorage.getItem('token')
  const isPublicPage = to.matched.some(record => record.meta.public)
  const requiresAuth = !isPublicPage

  if (requiresAuth && !token) {
    // 检查是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent)
    
    if (isWechat) {
      // 在微信环境中，获取授权URL并重定向
      try {
        const { getWxAuthUrl } = await import('@/utils/auth')
        const authUrl = await getWxAuthUrl()
        // 保存当前URL作为重定向地址
        localStorage.setItem('redirect_url', to.fullPath)
        window.location.replace(authUrl)
        return
      } catch (error) {
        console.error('获取微信授权URL失败:', error)
      }
    }
    
    // 非微信环境或获取授权URL失败时，跳转到登录页面
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 如果已登录且访问登录页，重定向到首页
  if (token && to.path === '/login') {
    next('/')
    return
  }

  // 设置页面标题
  document.title = to.meta.title || 'SimpleExam 考试系统'

  next()
})

export default router 