<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 -->
    <div class="flex-none border-b">
      <div class="p-4 flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold">确认订单</h1>
      </div>
    </div>

    <!-- 订单内容 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="router.back()">返回</button>
      </div>

      <div v-else class="space-y-6">
        <!-- 课程信息 -->
        <div v-if="selectedCourse" class="card p-4">
          <h2 class="text-lg font-semibold mb-2">课程信息</h2>
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-primary/10 rounded-md flex-shrink-0 flex items-center justify-center">
              <BookOpenIcon class="w-10 h-10 text-primary" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ selectedCourse.name }}</h3>
              <p v-if="selectedCourse.description" class="text-sm text-muted-foreground mt-1">
                {{ selectedCourse.description }}
              </p>
              <div class="mt-2">
                <span class="text-sm font-semibold text-primary">￥{{ selectedCourse.price }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="card p-4">
          <h2 class="text-lg font-semibold mb-4">支付方式</h2>
          <div class="space-y-3">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="flex items-center justify-between p-3 border rounded-lg cursor-pointer"
              :class="{'border-primary bg-primary/5': selectedPayment === method.id}"
              @click="selectedPayment = method.id"
            >
              <div class="flex items-center gap-3">
                <component :is="method.icon" class="w-5 h-5 text-primary" />
                <span>{{ method.name }}</span>
              </div>
              <div class="w-5 h-5 rounded-full border flex items-center justify-center" 
                   :class="{'border-primary': selectedPayment === method.id}">
                <div v-if="selectedPayment === method.id" class="w-3 h-3 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单金额 -->
        <div v-if="selectedCourse" class="card p-4">
          <h2 class="text-lg font-semibold mb-4">订单金额</h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>课程费用</span>
              <span>¥{{ selectedCourse.price }}</span>
            </div>
            <div class="flex justify-between text-primary font-bold">
              <span>实付金额</span>
              <span>¥{{ selectedCourse.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部支付按钮 -->
    <div class="flex-none p-4 border-t">
      <div class="flex justify-between items-center">
        <div>
          <span class="text-sm text-muted-foreground">实付金额：</span>
          <span class="text-primary font-bold" v-if="selectedCourse">¥{{ selectedCourse.price }}</span>
          <span class="text-primary font-bold" v-else>¥0.00</span>
        </div>
        <button class="btn btn-primary" @click="handlePayment" :disabled="loading || submitting">
          <LoaderIcon v-if="submitting" class="w-4 h-4 mr-2 animate-spin" />
          {{ submitting ? '处理中...' : '立即支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChevronLeftIcon,
  CreditCardIcon,
  WalletIcon,
  BookOpenIcon,
  LoaderIcon,
  XCircleIcon
} from 'lucide-vue-next'
import { payOrder } from '@/api/order'
import { createPayment } from '@/api/payment'
import { getCourseList } from '@/api/course'
import { message } from '@/utils/message'

const router = useRouter()
const route = useRoute()

// 从路由参数获取课程信息
const orderId = route.query.orderId
const courseId = route.query.courseId
const courseName = route.query.courseName
const amount = Number(route.query.amount) || 0

const loading = ref(false)
const error = ref('')
const submitting = ref(false)

// 支付方式
const paymentMethods = [
  { id: 'wechat', name: '微信支付', icon: WalletIcon },
  { id: 'alipay', name: '支付宝', icon: CreditCardIcon }
]
const selectedPayment = ref('wechat')

// 获取课程信息
const selectedCourse = ref(null)

const fetchCourseInfo = async () => {
  const courseId = route.query.courseId
  if (!courseId) {
    message.error('未提供课程ID')
    return
  }
  
  try {
    loading.value = true
    const response = await getCourseList()
    
    if (response.code !== 200) {
      throw new Error(response.message || '获取课程信息失败')
    }
    
    // 在课程数据中查找指定ID的课程
    let found = false
    for (const category of response.data) {
      for (const subCategory of category.children) {
        for (const course of subCategory.children) {
          if (course.id.toString() === courseId.toString()) {
            selectedCourse.value = course
            found = true
            break
          }
        }
        if (found) break
      }
      if (found) break
    }
    
    if (!found) {
      throw new Error('未找到指定课程')
    }
    
  } catch (err) {
    message.error(err.message || '获取课程信息失败')
    console.error('获取课程信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 处理支付
const handlePayment = async () => {
  if (!selectedCourse.value || !selectedPayment.value) {
    return
  }
  
  try {
    submitting.value = true
    
    // 如果有订单ID，直接支付
    if (orderId) {
      const payResponse = await payOrder(orderId, {
        paymentType: selectedPayment.value
      })
      
      if (payResponse.code === 200) {
        message.success('支付成功')
        // 支付成功，跳转到支付成功页面
        router.replace('/payment-success')
      } else {
        throw new Error(payResponse.message || '支付失败')
      }
    } else {
      // 创建新订单
      const createResponse = await createPayment({
        course_id: selectedCourse.value.id,
        total_fee: Math.round(selectedCourse.value.price * 100), // 转换为分
        trade_type: 'JSAPI',
        body: selectedCourse.value.name
      })
      
      if (createResponse.code === 200) {
        // 创建订单成功，跳转到支付页面
        router.push({
          name: 'Payment',
          params: { courseId: selectedCourse.value.id },
          query: {
            courseName: selectedCourse.value.name,
            courseDesc: selectedCourse.value.description || '',
            amount: Math.round(selectedCourse.value.price * 100),
            orderNo: createResponse.data.orderNo
          }
        })
      } else {
        throw new Error(createResponse.message || '创建订单失败')
      }
    }
  } catch (err) {
    message.error(err.message || '支付过程中出现错误，请重试')
    console.error('支付失败:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCourseInfo()
})
</script>

<style scoped>
/* 添加过渡动画 */
.card {
  transition: all 0.2s ease;
}

/* 老人模式下的底部按钮区域调整 */
.elderly-mode .btn-primary {
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
}
</style> 