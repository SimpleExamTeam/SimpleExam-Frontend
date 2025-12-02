<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <!-- 成功图标 -->
      <div class="mb-6">
        <CheckCircleIcon class="h-16 w-16 text-green-500 mx-auto" />
      </div>
      
      <!-- 标题和描述 -->
      <h1 class="text-2xl font-bold text-gray-900 mb-2">支付成功</h1>
      <p class="text-gray-600 mb-8">您已成功购买课程</p>
      
      <!-- 订单信息 -->
      <div class="bg-gray-50 rounded-lg p-4 mb-8">
        <div class="flex justify-between items-center mb-4">
          <span class="text-gray-600">订单金额</span>
          <span class="text-xl font-semibold text-primary">{{ orderInfo.amount === 0 ? '免费' : `¥${(orderInfo.amount / 100).toFixed(2)}` }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">订单编号</span>
          <span class="text-gray-900">{{ orderInfo.orderNo }}</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-4">
        <button
          @click="goToCourse"
          class="w-full bg-primary text-white rounded-lg py-3 px-4 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          立即学习
        </button>
        <button
          @click="goToOrders"
          class="w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          查看订单
        </button>
        <button
          @click="goToHome"
          class="w-full bg-gray-50 text-gray-600 border border-gray-200 rounded-lg py-3 px-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircleIcon } from 'lucide-vue-next'
import { getPaymentSuccess } from '@/api/payment'

const route = useRoute()
const router = useRouter()
const orderInfo = ref({
  amount: 0,
  orderNo: '',
  courseId: ''
})

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

onMounted(async () => {
  try {
    // 防止页面缩放
    preventZoom()
    
    // 从路由参数中获取订单信息
    const { orderNo, courseId, amount } = route.query
    
    // 如果有路由参数，直接使用
    if (orderNo && courseId && amount) {
      orderInfo.value = {
        orderNo,
        courseId,
        amount: parseInt(amount)
      }
    } else {
      // 否则调用API获取订单信息
      const response = await getPaymentSuccess()
      if (response.code === 200) {
        orderInfo.value = response.data
      }
    }
  } catch (err) {
    console.error('获取支付成功信息失败:', err)
    // 如果获取失败，尝试从路由参数中获取基本信息
    const { courseId } = route.query
    if (courseId) {
      orderInfo.value.courseId = courseId
    }
  }
})

const goToCourse = () => {
  router.push(`/course/${orderInfo.value.courseId}`)
}

const goToOrders = () => {
  router.push('/orders')
}

const goToHome = () => {
  router.push('/')
}
</script> 