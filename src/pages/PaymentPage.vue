<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- 顶部导航 -->
    <div class="bg-card border shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <button @click="goBack" class="text-muted-foreground hover:text-foreground">
                <ArrowLeftIcon class="w-6 h-6" />
              </button>
            </div>
            <div class="ml-6 flex items-center">
              <h1 class="text-xl font-semibold text-foreground">确认支付</h1>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="flex-1 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 课程信息 -->
        <div class="bg-card border shadow rounded-lg overflow-hidden mb-6">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-20 w-20 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookIcon class="w-10 h-10 text-primary" />
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h2 class="text-lg font-medium text-foreground">{{ course.name }}</h2>
                <p class="mt-1 text-sm text-muted-foreground">{{ course.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付金额 -->
        <div class="bg-card border shadow rounded-lg overflow-hidden mb-6">
          <div class="p-6">
            <div class="flex justify-between items-center">
              <span class="text-foreground">支付金额</span>
              <span class="text-2xl font-semibold text-primary">{{ amount === 0 ? '免费' : `¥${(amount / 100).toFixed(2)}` }}</span>
            </div>
          </div>
        </div>

        <!-- 支付按钮 -->
        <div class="mt-6">
          <button
            @click="handlePayment"
            :disabled="loading"
            class="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoaderIcon v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 inline-block" />
            {{ loading ? '处理中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 非微信环境提示弹窗 -->
    <div v-if="showWechatTip" class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div class="mb-4">
            <SmartphoneIcon class="mx-auto h-12 w-12 text-primary" />
            <h3 class="mt-2 text-lg font-medium text-foreground">请在微信中打开</h3>
            <p class="mt-1 text-sm text-muted-foreground">请使用微信扫描下方二维码完成支付</p>
          </div>
          <div class="mt-6 mb-4">
            <div v-if="qrCodeUrl" class="flex justify-center">
              <img :src="qrCodeUrl" alt="微信扫码支付" class="w-48 h-48" />
            </div>
            <div v-else class="w-48 h-48 mx-auto flex items-center justify-center">
              <LoaderIcon class="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <div class="mt-4">
            <button
              @click="showWechatTip = false"
              class="w-full bg-secondary text-secondary-foreground rounded-lg py-2 px-4 hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付结果弹窗 -->
    <div v-if="showResult" class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div v-if="paymentStatus === 'success'" class="mb-4">
            <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500" />
            <h3 class="mt-2 text-lg font-medium text-foreground">支付成功</h3>
            <p class="mt-1 text-sm text-muted-foreground">您已成功购买该课程</p>
          </div>
          <div v-else-if="paymentStatus === 'failed'" class="mb-4">
            <XCircleIcon class="mx-auto h-12 w-12 text-destructive" />
            <h3 class="mt-2 text-lg font-medium text-foreground">支付失败</h3>
            <p class="mt-1 text-sm text-muted-foreground whitespace-pre-line">{{ error }}</p>
            <p class="mt-2 text-xs text-muted-foreground">如果问题持续存在，请联系客服</p>
          </div>
          <div class="mt-4 space-y-2">
            <button
              v-if="paymentStatus === 'success'"
              @click="goToCourse"
              class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              查看课程
            </button>
            <template v-else>
              <button
                @click="retryPayment"
                class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                重新支付
              </button>
              <button
                @click="cancelPayment"
                class="w-full bg-secondary text-secondary-foreground rounded-lg py-2 px-4 hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                取消支付
              </button>
              <button
                @click="goToHome"
                class="w-full bg-muted text-muted-foreground rounded-lg py-2 px-4 hover:bg-muted/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted mt-2"
              >
                返回首页
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 二维码显示 -->
    <div v-if="showQrCode" class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <h3 class="text-lg font-medium text-foreground">请使用微信扫描二维码支付</h3>
          <img :src="qrCodeUrl" alt="二维码" class="mt-4 w-32 h-32 mx-auto" />
          <div class="mt-4">
            <button
              @click="retryPayment"
              class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              重试支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  LoaderIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookIcon,
  SmartphoneIcon
} from 'lucide-vue-next'
import { createPayment, queryPayment, notifyPayment } from '@/api/payment'
import { useUserStore } from '@/stores/user'
import { API_URLS, BASE_CONSTANTS } from '@/config'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const showResult = ref(false)
const paymentStatus = ref('')
const error = ref('')
const amount = ref(0)
const course = ref({})
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const showWechatTip = ref(false)
const currentPageUrl = ref('')
let pollTimer = null
let queryTimer = null

// 获取路由参数
const courseId = route.params.courseId

// 防止页面缩放
const preventZoom = () => {
  // 添加viewport meta标签
  let viewportMeta = document.querySelector('meta[name="viewport"]')
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta')
    viewportMeta.setAttribute('name', 'viewport')
    document.head.appendChild(viewportMeta)
  }
  viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  
  // 阻止双击缩放
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  }, { passive: false })
  
  // 阻止双指缩放
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  }, { passive: false })
}

// 生成二维码
const generateQrCode = async (url) => {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('生成二维码失败:', err)
    throw new Error('生成二维码失败')
  }
}

onMounted(async () => {
  try {
    // 防止页面缩放
    preventZoom()
    
    // 检查是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent)
    if (!isWechat) {
      // 生成当前页面的二维码
      qrCodeUrl.value = await generateQrCode(window.location.href)
    }

    // 初始化课程信息和金额
    course.value = {
      id: courseId,
      name: route.query.courseName || '课程名称',
      description: route.query.courseDesc || '课程描述'
    }
    amount.value = parseInt(route.query.amount) || 0
  } catch (err) {
    console.error('页面初始化失败:', err)
    error.value = err.message || '初始化失败，请刷新页面重试'
  }
})

onUnmounted(async () => {
  // 清除轮询定时器
  if (pollTimer) {
    clearInterval(pollTimer)
  }
  if (queryTimer) {
    clearInterval(queryTimer)
  }

  // 如果页面关闭时有未完成的订单，自动取消
  const orderNo = localStorage.getItem('last-order-no')
  if (orderNo) {
    try {
      await fetch(API_URLS.PAYMENT.CANCEL(orderNo), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      localStorage.removeItem('last-order-no')
    } catch (err) {
      console.error('自动取消支付失败:', err)
    }
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 修改调用微信支付的函数
const callWxPay = (payData) => {
  return new Promise((resolve, reject) => {
    // 检查是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent)
    if (!isWechat) {
      reject(new Error('请在微信中打开'))
      return
    }

    function onBridgeReady() {
      // 1. 检查 package 参数是否存在
      if (!payData.package) {
        reject(new Error('支付失败：缺少 package 参数'))
        return
      }

      // 2. 检查 prepay_id 是否为空
      const prepayId = payData.package.split('prepay_id=')[1]
      if (!prepayId) {
        reject(new Error('支付失败：预支付会话标识为空'))
        return
      }

      // 3. 确保 package 参数格式正确：必须以 prepay_id=wx 开头
      const packageValue = prepayId.startsWith('wx') ? 
        payData.package : 
        `prepay_id=wx${prepayId}`

      // 4. 按照官方文档，构造支付参数
      const payParams = {
        appId: payData.appId,      // 公众号id
        timeStamp: payData.timeStamp,  // 时间戳
        nonceStr: payData.nonceStr,    // 随机字符串
        package: packageValue,         // 订单详情扩展字符串
        signType: payData.signType || 'MD5',  // 签名方式，默认为 MD5
        paySign: payData.paySign       // 签名
      }

      console.log('准备调用支付，参数：', payParams)

      // 修改 WeixinJSBridge 回调处理
      window.WeixinJSBridge.invoke('getBrandWCPayRequest', payParams, async function(res) {
        console.log('支付结果:', res)
        if (res.err_msg === "get_brand_wcpay_request:ok") {
          // 支付成功，直接返回成功
          resolve(res)
        } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
          reject(new Error('支付已取消'))
        } else {
          // 支付可能成功但返回其他状态，先查询订单状态
          try {
            const orderNo = localStorage.getItem('last-order-no')
            if (!orderNo) {
              reject(new Error('未找到订单号'))
              return
            }

            // 立即查询一次订单状态
            const result = await queryPayment(orderNo)
            if (result.code === 200 && result.data.status === 'paid') {
              // 如果订单实际已支付，返回成功
              console.log('虽然微信返回失败，但订单已支付:', result.data)
              resolve(result)
              return
            }
          } catch (err) {
            console.error('查询订单状态失败:', err)
          }

          // 如果查询失败或订单未支付，才返回错误
          const errorMsg = res.err_msg ? `支付失败：${res.err_msg}` : '支付失败，请重试'
          reject(new Error(errorMsg))
        }
      })
    }

    // 如果WeixinJSBridge对象已经存在，则直接调用
    if (typeof window.WeixinJSBridge !== 'undefined') {
      onBridgeReady()
    } else {
      // 如果WeixinJSBridge对象不存在，监听注入的事件
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
      }
    }
  })
}

// 修改错误信息处理函数
const getErrorMessage = (err) => {
  if (!err) return '支付失败，请重试'
  
  // 处理登录过期的情况
  if (err.message === '登录已过期，请重新登录') {
    // 保存当前URL作为重定向地址
    const currentPath = window.location.pathname + window.location.search
    router.replace({
      name: 'Login',
      query: { redirect: currentPath }
    })
    return err.message
  }
  
  // 微信支付错误信息处理
  if (err.message && err.message.includes('get_brand_wcpay_request')) {
    if (err.message.includes('fail, the permission value is offline verifying')) {
      return '支付失败：商户号正在审核中，请稍后再试'
    }
    if (err.message.includes('fail, invalid total_fee')) {
      return '支付失败：支付金额无效，请刷新页面重试'
    }
    if (err.message.includes('fail, invalid appid')) {
      return '支付失败：商户配置错误，请联系客服'
    }
    if (err.message.includes('fail, invalid sign')) {
      return '支付失败：签名验证失败，请重新发起支付'
    }
    return `支付失败：${err.message}`
  }

  // 其他常见错误
  if (err.message.includes('商户审核')) {
    return '支付失败：商户正在审核中，请稍后再试'
  }
  if (err.message === '支付已取消') {
    return '您已取消支付，可以重新点击支付按钮'
  }
  if (err.message.includes('获取用户信息失败')) {
    return '支付失败：获取用户信息失败，请退出重新登录'
  }
  if (err.message.includes('支付金额无效')) {
    return '支付失败：订单金额异常，请刷新页面重试'
  }
  if (err.message.includes('未找到订单号')) {
    return '支付失败：订单信息丢失，请重新发起支付'
  }
  if (err.message.includes('订单状态查询超时')) {
    return '支付结果查询超时，请在订单中心查看支付结果'
  }
  if (err.message.includes('创建订单失败')) {
    return '创建支付订单失败，请重试'
  }

  return err.message || '支付失败，请重试'
}

// 修改处理支付的函数
const handlePayment = async () => {
  try {
    // 检查是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent)
    if (!isWechat) {
      if (!qrCodeUrl.value) {
        // 如果二维码还没有生成，重新生成
        qrCodeUrl.value = await generateQrCode(window.location.href)
      }
      showWechatTip.value = true
      return
    }

    if (error.value) {
      throw new Error(error.value)
    }

    loading.value = true
    error.value = ''
    
    // 获取用户openId
    const openId = await userStore.getOpenId()
    if (!openId) {
      throw new Error('获取用户信息失败')
    }
    
    console.log('开始创建支付订单...')
    // 确保金额为整数（分）
    const payAmount = Math.round(parseInt(amount.value))
    if (payAmount < 0) {
      throw new Error('支付金额无效')
    }

    // 获取路由中的订单号（如果存在）
    const existingOrderNo = route.query.orderNo

    // 免费课程（金额为0）特殊处理
    if (payAmount === 0) {
      console.log('免费课程，直接创建订单')
      // 调用统一下单接口
      const response = await createPayment({
        course_id: courseId,
        total_fee: payAmount,
        open_id: openId,
        order_no: existingOrderNo
      })
      
      console.log('创建免费订单响应:', response)
      
      if (response.code === 200) {
        const orderNo = response.data.orderNo || existingOrderNo
        
        // 将订单号保存到 LocalStorage
        localStorage.setItem('last-order-no', orderNo)
        
        // 确保页面不会缩放
        const viewportMeta = document.querySelector('meta[name="viewport"]')
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        }
        
        // 免费课程直接跳转到支付成功页面
        router.replace({
          name: 'PaymentSuccess',
          query: {
            orderNo: orderNo,
            courseId: courseId,
            amount: 0,
            payTime: new Date().toISOString()
          }
        })
        return
      } else {
        throw new Error(response.message || '开通免费课程失败')
      }
    }

    // 调用统一下单接口
    const response = await createPayment({
      course_id: courseId,
      total_fee: payAmount,
      open_id: openId,
      order_no: existingOrderNo // 添加订单号参数，用于重新发起支付
    })
    
    console.log('创建支付订单响应:', response)
    
    if (response.code === 200) {
      const orderNo = response.data.orderNo || existingOrderNo
      // 将订单号保存到 LocalStorage
      localStorage.setItem('last-order-no', orderNo)
      
      const payData = {
        ...response.data.params
      }
      
      // 检查必要的支付参数
      if (!payData.timeStamp || !payData.nonceStr || 
          !payData.package || !payData.signType || !payData.paySign) {
        throw new Error('创建订单失败：支付参数不完整')
      }

      // 检查是否在微信开发者工具中
      const isWxDevTools = /wechatdevtools/i.test(navigator.userAgent)
      
      if (isWxDevTools && payData.code_url) {
        showQrCode.value = true
        qrCodeUrl.value = payData.code_url
        startQueryPaymentStatus()
      } else {
        console.log('准备调用支付，订单号:', orderNo)
        
        try {
          await callWxPay(payData)
          
          // 支付成功后，不立即跳转，而是先查询订单状态
          loading.value = true
          error.value = ''
          
          // 增加延迟，等待后端处理完成
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // 验证支付状态
          const verifyResult = await verifyPaymentStatus()
          
          if (verifyResult.success) {
            // 调用支付成功通知接口
            try {
              await notifyPayment({
                order_id: orderNo,
                status: 'SUCCESS'
              })
            } catch (notifyErr) {
              console.error('通知支付状态失败，但不影响流程:', notifyErr)
            }

            console.log('支付状态已更新，订单信息:', verifyResult.data)
            
            // 确保页面不会缩放
            const viewportMeta = document.querySelector('meta[name="viewport"]')
            if (viewportMeta) {
              viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
            }
            
            // 跳转到支付成功页面
            const amountInCents = result.data.amount ? Math.round(parseFloat(result.data.amount) * 100) : 0
            router.replace({
              name: 'PaymentSuccess',
              query: {
                orderNo: orderNo,
                courseId: courseId,
                amount: amountInCents,
                payTime: result.data.pay_time || new Date().toISOString()
              }
            })
          } else {
            throw new Error('支付状态异常，请在订单中心查看')
          }
        } catch (err) {
          // 如果是支付失败，再查询一次订单状态
          try {
            const result = await queryPayment(orderNo)
            if (result.code === 200 && result.data.status === 'paid') {
              // 订单实际已支付，跳转成功页面
              const amountInCents = Math.round(parseFloat(result.data.amount) * 100)
              router.replace({
                name: 'PaymentSuccess',
                query: {
                  orderNo: orderNo,
                  courseId: courseId,
                  amount: amountInCents,
                  payTime: result.data.pay_time
                }
              })
              return
            }
          } catch (queryErr) {
            console.error('最终查询订单状态失败:', queryErr)
          }
          
          // 如果确实未支付，才显示错误
          console.error('支付失败:', err)
          error.value = getErrorMessage(err)
          showPaymentResult('failed')
        } finally {
          loading.value = false
        }
      }
    } else {
      throw new Error(response.message || '创建支付订单失败')
    }
  } catch (err) {
    // 如果是微信认证重定向，不显示错误
    if (err.message === 'WECHAT_AUTH_REDIRECT') {
      return
    }
    console.error('支付失败:', err)
    error.value = getErrorMessage(err)
    showPaymentResult('failed')
  } finally {
    loading.value = false
  }
}

// 显示支付结果
const showPaymentResult = (status) => {
  // 如果是登录过期，不显示错误弹窗
  if (error.value === '登录已过期，请重新登录') {
    return
  }
  
  paymentStatus.value = status
  showResult.value = true
  
  // 如果是支付失败，显示详细的错误提示
  if (status === 'failed') {
    const errorMessage = getErrorMessage(new Error(error.value))
    error.value = errorMessage
  }
}

// 重试支付
const retryPayment = () => {
  // 如果是登录过期，重定向到登录页
  if (error.value === '登录已过期，请重新登录') {
    const currentPath = window.location.pathname + window.location.search
    router.replace({
      name: 'Login',
      query: { redirect: currentPath }
    })
    return
  }
  
  showResult.value = false
  error.value = ''
  handlePayment()
}

// 跳转到课程页面
const goToCourse = () => {
  router.push(`/course/${courseId}`)
}

// 修改验证支付状态的函数
const verifyPaymentStatus = async () => {
  let retryCount = 0
  const maxRetries = 12

  while (retryCount < maxRetries) {
    try {
      // 从 LocalStorage 获取订单号
      const orderNo = localStorage.getItem('last-order-no')
      if (!orderNo) {
        throw new Error('未找到订单号')
      }

      console.log(`正在查询支付结果，第 ${retryCount + 1} 次，订单号：${orderNo}`)
      const result = await queryPayment(orderNo)
      
      if (result.code === 200) {
        console.log('查询支付状态结果:', result.data)
        if (result.data.status === 'paid') {
          console.log('支付状态验证成功:', result.data)
          // 将金额从元转换为分
          const amountInCents = result.data.amount ? Math.round(parseFloat(result.data.amount) * 100) : 0
          return {
            success: true,
            data: {
              ...result.data,
              amount: amountInCents,
              orderNo: orderNo
            }
          }
        } else if (result.data.message && result.data.message.includes('免费课程')) {
          // 处理免费课程的情况
          console.log('免费课程已开通:', result.data)
          return {
            success: true,
            data: {
              ...result.data,
              amount: 0,
              orderNo: orderNo,
              status: 'paid'
            }
          }
        } else {
          console.log('订单未支付，状态:', result.data.status)
        }
      } else {
        console.log('查询支付状态接口返回错误:', result)
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      retryCount++
    } catch (err) {
      console.error('查询支付状态失败:', err)
      await new Promise(resolve => setTimeout(resolve, 5000))
      retryCount++
    }
  }

  throw new Error('订单状态查询超时，请在订单中心查看支付结果')
}

// 修改轮询支付状态的函数
const startQueryPaymentStatus = () => {
  if (queryTimer) {
    clearInterval(queryTimer)
  }

  let count = 0
  const maxAttempts = 60
  
  queryTimer = setInterval(async () => {
    try {
      count++
      // 从 LocalStorage 获取订单号
      const orderNo = localStorage.getItem('last-order-no')
      if (!orderNo) {
        throw new Error('未找到订单号')
      }

      console.log(`轮询查询支付结果，第 ${count} 次，订单号：${orderNo}`)
      const result = await queryPayment(orderNo)
      
      if (result.code === 200) {
        console.log('查询支付状态结果:', result.data)
        if (result.data.status === 'paid') {
          clearInterval(queryTimer)
          
          try {
            await notifyPayment({
              order_id: orderNo,
              status: 'SUCCESS'
            })
            console.log('支付状态已更新，订单信息:', result.data)

            // 将金额从元转换为分
            const amountInCents = result.data.amount ? Math.round(parseFloat(result.data.amount) * 100) : 0
            
            // 确保页面不会缩放
            const viewportMeta = document.querySelector('meta[name="viewport"]')
            if (viewportMeta) {
              viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
            }
            
            router.replace({
              name: 'PaymentSuccess',
              query: {
                orderNo: orderNo,
                courseId: courseId,
                amount: amountInCents,
                payTime: result.data.pay_time || new Date().toISOString()
              }
            })
          } catch (err) {
            console.error('更新支付状态失败:', err)
            error.value = '更新支付状态失败，请在订单中心查看'
            showPaymentResult('failed')
          }
        } else if (result.data.message && result.data.message.includes('免费课程')) {
          // 处理免费课程的情况
          clearInterval(queryTimer)
          console.log('免费课程已开通:', result.data)
          
          // 确保页面不会缩放
          const viewportMeta = document.querySelector('meta[name="viewport"]')
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
          }
          
          router.replace({
            name: 'PaymentSuccess',
            query: {
              orderNo: orderNo,
              courseId: courseId,
              amount: 0,
              payTime: new Date().toISOString()
            }
          })
        } else if (count >= maxAttempts) {
          clearInterval(queryTimer)
          error.value = '支付超时，请重新扫码'
          showPaymentResult('failed')
        }
      }
    } catch (err) {
      console.error('查询支付结果失败:', err)
      if (count >= maxAttempts) {
        clearInterval(queryTimer)
        error.value = '查询支付结果失败，请刷新页面重试'
        showPaymentResult('failed')
      }
    }
  }, 5000)
}

// 取消支付
const cancelPayment = async () => {
  try {
    const orderNo = localStorage.getItem('last-order-no')
    if (!orderNo) {
      console.error('未找到订单号')
      return
    }

    loading.value = true
    
    // 调用取消支付接口
    const response = await fetch(API_URLS.PAYMENT.CANCEL(orderNo), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      console.log('取消支付成功')
      // 清除本地存储的订单号
      localStorage.removeItem('last-order-no')
      // 跳转到订单列表页
      router.replace('/orders')
    } else {
      throw new Error(result.msg || '取消支付失败')
    }
  } catch (err) {
    console.error('取消支付失败:', err)
    error.value = err.message || '取消支付失败，请重试'
  } finally {
    loading.value = false
  }
}

// 添加返回首页的方法
const goToHome = () => {
  router.replace('/')
}
</script> 