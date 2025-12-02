<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 固定高度 -->
    <div class="flex-none border-b">
      <div class="px-4 py-3 flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-base font-semibold text-nowrap">{{ course?.name || '课程详情' }}</h1>
      </div>
    </div>

    <!-- 内容区域 自适应高度 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchCourseDetail">重试</button>
      </div>

      <div v-else-if="course" class="p-4 space-y-4">
        <!-- 学习选项 -->
        <div class="p-2 space-y-4">
          <!-- 练习模式 -->
          <div class="card p-3">
            <div class="relative">
              <div>
                <h3 class="font-semibold mb-2">练习模式</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  按照题型分类练习，帮助您掌握各类题目的解题技巧
                </p>
                <div class="grid grid-cols-3 gap-1 pb-6">
                  <div v-for="type in questionTypes" :key="type.id"
                       class="text-center p-2 bg-secondary/50 rounded-lg">
                    <div class="text-muted-foreground text-sm">{{ type.name }}</div>
                    <div class="text-sm mt-1">{{ type.total }} 题</div>
                  </div>
                </div>
              </div>
              <button 
                class="btn btn-primary whitespace-nowrap absolute bottom-0 right-0" 
                @click="startPractice"
              >
                开始练习
              </button>
            </div>
          </div>

          <!-- 模拟考试 -->
          <div class="card p-3">
            <div class="relative">
              <div>
                <h3 class="font-semibold mb-2">模拟考试</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  完整模拟实际考试流程，限时作答，提前适应考试节奏
                </p>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <ClockIcon class="w-4 h-4" />
                    <span>考试时长：{{ examInfo.duration }}分钟</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <ListIcon class="w-4 h-4" />
                    <span>题目数量：{{ examInfo.questionCount }}题</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" />
                    <span>及格分数：{{ examInfo.passScore }}分</span>
                  </div>
                </div>
              </div>
              <button 
                class="btn btn-primary whitespace-nowrap absolute bottom-0 right-0" 
                @click="startExam"
              >
                开始考试
              </button>
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
import { 
  ChevronLeftIcon, 
  ClockIcon, 
  ListIcon, 
  CheckCircleIcon,
  CircleDotIcon,
  CheckSquareIcon,
  SplitSquareHorizontalIcon,
  LoaderIcon,
  XCircleIcon
} from 'lucide-vue-next'
import { getCourseDetail } from '@/api/course'

const router = useRouter()
const route = useRoute()

const course = ref(null)
const loading = ref(false)
const error = ref('')

// 获取课程详情
const fetchCourseDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await getCourseDetail(route.params.id)
    if (response.code === 200) {
      course.value = response.data
    } else {
      throw new Error(response.message || '获取课程详情失败')
    }
  } catch (err) {
    error.value = err.message || '获取课程详情失败，请重试'
    console.error('获取课程详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 题型数据
const questionTypes = computed(() => {
  if (!course.value || !course.value.question_stats) return []
  
  return [
    {
      id: 1,
      name: '单选题',
      total: course.value.question_stats.single || 0,
      icon: CircleDotIcon
    },
    {
      id: 2,
      name: '多选题',
      total: course.value.question_stats.multiple || 0,
      icon: CheckSquareIcon
    },
    {
      id: 3,
      name: '判断题',
      total: course.value.question_stats.judge || 0,
      icon: SplitSquareHorizontalIcon
    }
  ].filter(type => type.total > 0) // 只显示有题目的题型
})

// 考试信息
const examInfo = computed(() => {
  if (!course.value) {
    return { duration: 0, questionCount: 0, passScore: 0 }
  }
  
  // 使用服务器返回的模拟考试配置
  const mockConfig = course.value.mock_exam_config || {}
  
  return {
    duration: mockConfig.min || 0,
    questionCount: mockConfig.count || 0,
    passScore: mockConfig.score || 0
  }
})

const startPractice = () => {
  router.push(`/course/${course.value.id}/practice`)
}

const startExam = () => {
  router.push(`/course/${course.value.id}/exam`)
}

// 处理购买课程
const handlePurchase = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 跳转到支付页面，传递必要的参数
    router.push({
      name: 'Payment',
      params: { courseId: course.value.id },
      query: {
        courseName: course.value.name,
        courseDesc: course.value.description,
        courseCover: course.value.cover,
        amount: course.value.price * 100, // 转换为分
        openId: localStorage.getItem('openId') // 从本地存储获取openId
      }
    })
  } catch (err) {
    console.error('购买失败:', err)
    error.value = '服务器错误，请重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourseDetail()
})
</script>

<style scoped>
/* 为内容区域添加下边距，避免按钮遮挡 */
.relative > div:first-child {
  padding-bottom: 3rem;
}

/* 优化按钮位置 */
.btn {
  margin: 1rem;
}
</style> 