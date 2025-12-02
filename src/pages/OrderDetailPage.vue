<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 -->
    <div class="flex-none border-b">
      <div class="p-4 flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold">{{ order.course_name || '订单详情' }}</h1>
      </div>
    </div>

    <!-- 订单详情 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchOrderDetail">重试</button>
      </div>

      <div v-else class="p-4 space-y-6">
        <!-- 订单状态 -->
        <div class="card p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">订单状态</h2>
            <div 
              class="text-sm px-2 py-1 rounded-full"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusText(order.status) }}
            </div>
          </div>
          <div class="mt-4 space-y-2 text-sm">
            <div v-for="(value, key) in orderDetails" :key="key" class="flex justify-between">
              <span class="text-muted-foreground">{{ key }}</span>
              <span>{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="card p-4">
          <h2 class="text-lg font-semibold mb-4">课程信息</h2>
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-secondary rounded-md flex items-center justify-center">
              <BookOpenIcon class="w-10 h-10 text-muted-foreground" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ order.course_name }}</h3>
              <div class="text-sm text-muted-foreground mt-1 space-y-1">
                <p>课程ID: {{ order.course_id }}</p>
                <p>课程类型: {{ getCourseType() }}</p>
              </div>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-primary font-bold">¥{{ order.price || order.amount || 0 }}</span>
                <button v-if="order.status === 'unpaid'" 
                        class="btn btn-sm btn-primary" 
                        @click="goToPayment(order)">
                  立即支付
                </button>
                <button v-else-if="order.status === 'paid'" 
                        class="btn btn-sm btn-secondary" 
                        @click="goToCourse(order.course_id)">
                  查看课程
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付信息 -->
        <div v-if="order.status === 'paid'" class="card p-4">
          <h2 class="text-lg font-semibold mb-4">支付信息</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">支付方式</span>
              <span>{{ getPaymentTypeText(order.payment_type) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">支付时间</span>
              <span>{{ formatDateTime(order.pay_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatDate, formatDateTime } from '@/utils/date'
import { 
  ChevronLeftIcon,
  BookOpenIcon,
  LoaderIcon,
  XCircleIcon
} from 'lucide-vue-next'
import { getOrderDetail } from '@/api/order'

const router = useRouter()
const route = useRoute()
const orderId = route.params.id

const order = ref({})
const loading = ref(true)
const error = ref('')

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await getOrderDetail(orderId)
    if (response.code === 200) {
      order.value = response.data
    } else {
      throw new Error(response.message || '获取订单详情失败')
    }
  } catch (err) {
    error.value = err.message || '获取订单详情失败，请重试'
    console.error('获取订单详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取课程类型
const getCourseType = () => {
  if (!order.value || !order.value.course_name) return '未知';
  
  // 从课程名称中提取类型信息
  const nameParts = order.value.course_name.split('-');
  if (nameParts.length >= 2) {
    return `${nameParts[0]}`;
  }
  
  return '未知';
}

// 获取支付方式文本
const getPaymentTypeText = (type) => {
  switch (type) {
    case 'wechat':
      return '微信支付';
    case 'alipay':
      return '支付宝';
    case 'free':
      return '免费';
    case 'card':
      return '兑换券';
    default:
      return '在线支付';
  }
}

// 格式化订单详情显示
const orderDetails = computed(() => {
  if (!order.value) return {}
  
  return {
    '订单编号': order.value.order_no,
    '课程名称': order.value.course_name,
    '下单时间': formatDateTime(order.value.created_at),
    '支付时间': order.value.status === 'paid' ? formatDateTime(order.value.pay_time) : '未支付',
    '订单状态': getStatusText(order.value.status)
  }
})

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'unpaid':
      return '待支付'
    case 'paid':
      return '已支付'
    case 'cancelled':
      return '已取消'
    case 'refunded':
      return '已退款'
    default:
      return '未知状态'
  }
}

// 去支付
const goToPayment = (order) => {
  // 获取正确的金额，保持与显示逻辑一致
  const amount = order.price || order.amount || 0
  router.push({
    name: 'Payment',
    params: { courseId: order.course_id },
    query: {
      courseName: order.course_name,
      courseDesc: order.course_description || '',
      amount: Math.round(amount * 100), // 转换为分
      orderNo: order.order_no // 添加订单号
    }
  })
}

// 查看课程
const goToCourse = (courseId) => {
  router.push({
    path: `/course/${courseId}`
  })
}

onMounted(() => {
  fetchOrderDetail()
})
</script> 