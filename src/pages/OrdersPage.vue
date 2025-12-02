<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 固定高度 -->
    <div class="flex-none border-b">
      <div class="px-4 py-3 flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold">我的订单</h1>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-8">
        <p class="text-center text-red-500 mb-4">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchOrders">重试</button>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center p-8">
        <p class="text-center text-muted-foreground">暂无订单记录</p>
      </div>
      
      <!-- 订单列表 -->
      <div v-else v-for="order in orders" :key="order.id" 
           class="card p-4 cursor-pointer hover:shadow-md transition-shadow"
           @click="viewOrderDetail(order)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium mb-2">{{ order.course_name }}</h3>
            <div class="space-y-1 text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-3 h-4" />
                <span>下单时间：{{ formatDateTime(order.created_at) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CreditCardIcon class="w-3 h-4" />
                <span>订单金额：¥{{ (order.amount).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <TagIcon class="w-3 h-4" />
                <span>订单号：{{ order.order_no }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-10 whitespace-nowrap">
            <div class="text-sm px-2 py-1 rounded-full" 
                 :class="getOrderStatusClass(order.status)">
              {{ getOrderStatusText(order.status) }}
            </div>
            <button v-if="order.status === 'unpaid'"
                    @click.stop="goToPayment(order)"
                    class="btn btn-primary btn-sm">
              立即支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChevronLeftIcon, 
  ClockIcon, 
  CreditCardIcon,
  TagIcon
} from 'lucide-vue-next'
import { formatDateTime } from '@/utils/date'
import request from '@/utils/request'
import { API_URLS } from '@/config'

const router = useRouter()
const orders = ref([])
const loading = ref(false)
const error = ref('')

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await request(API_URLS.ORDER.LIST)
    if (response.code === 200) {
      // 检查数据是否存在
      if (!response.data) {
        orders.value = []
        return
      }
      
      // 对订单按创建时间从新到旧排序（降序）
      orders.value = response.data.sort((a, b) => {
        // 将日期字符串转换为Date对象进行比较
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        // 降序排列（新订单在前）
        return dateB - dateA
      })
    } else {
      throw new Error(response.message || '获取订单失败')
    }
  } catch (err) {
    error.value = err.message || '获取订单失败，请重试'
    console.error('获取订单失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取订单状态样式
const getOrderStatusClass = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700'
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-700'
    case 'pending':
      return 'bg-red-100 text-red-700'
    case 'cancelled':
      return 'bg-gray-100 text-gray-700'
    case 'refunded':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  switch (status) {
    case 'unpaid':
      return '未支付'
    case 'paid':
      return '已支付'
    case 'pending':
      return '待支付'
    case 'cancelled':
      return '已取消'
    case 'refunded':
      return '已退款'
    default:
      return '未知状态'
  }
}

// 跳转到支付页面
const goToPayment = (order) => {
  router.push({
    name: 'Payment',
    params: { courseId: order.course_id },
    query: {
      courseName: order.course_name,
      courseDesc: order.course_description || '',
      amount: Math.round(order.amount * 100), // 转换为分
      orderNo: order.order_no // 添加订单号
    }
  })
}

// 查看订单详情
const viewOrderDetail = (order) => {
  router.push({
    name: 'OrderDetail',
    params: { id: order.id }
  })
}

onMounted(() => {
  fetchOrders()
})
</script> 