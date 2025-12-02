<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 -->
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold">考试结果</h1>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 结果展示 -->
    <div v-else-if="result" class="flex-1 overflow-y-auto p-4 pb-20">
      <div class="card p-6 flex flex-col items-center">
        <!-- 成绩展示 -->
        <div class="text-center mb-8">
          <div class="mb-2">
            <span v-if="result.passed" class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2Icon class="w-12 h-12 text-green-600 dark:text-green-400" />
            </span>
            <span v-else class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircleIcon class="w-12 h-12 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <h2 class="text-2xl font-bold">
            <span v-if="result.passed" class="text-green-600 dark:text-green-400">通过</span>
            <span v-else class="text-red-600 dark:text-red-400">未通过</span>
          </h2>
          <p class="text-lg">
            得分: <span class="font-bold" :class="{'text-green-600 dark:text-green-400': result.passed, 'text-red-600 dark:text-red-400': !result.passed}">{{ result.score }}</span>
            <span class="text-sm text-muted-foreground">/ {{ result.totalScore || 100 }}</span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            及格分数: {{ result.passScore }}
          </p>
        </div>
        
        <!-- 详细统计 -->
        <div class="w-full space-y-4 mb-8">
          <div class="grid grid-cols-4 gap-4 text-center">
            <div class="p-3 rounded-lg bg-accent/30">
              <p class="text-sm text-muted-foreground whitespace-nowrap">总题数</p>
              <p class="text-xl font-bold">{{ result.totalQuestions }}</p>
            </div>
            <div class="p-3 rounded-lg bg-accent/30">
              <p class="text-sm text-muted-foreground">未答</p>
              <p class="text-xl font-bold">{{ result.unansweredCount }}</p>
            </div>
            <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <p class="text-sm text-muted-foreground">答对</p>
              <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ result.correctCount }}</p>
            </div>
            <div class="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <p class="text-sm text-muted-foreground">答错</p>
              <p class="text-xl font-bold text-red-600 dark:text-red-400">{{ result.wrongCount }}</p>
            </div>
          </div>
          
          <div class="p-4 rounded-lg bg-accent/20">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-muted-foreground">课程名称</span>
              <span>{{ result.courseName }}</span>
            </div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-muted-foreground">考试用时</span>
              <span>{{ formattedTimeUsed }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">考试时间</span>
              <span>{{ new Date(result.examTime).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="grid grid-cols-2 gap-4 w-full">
          <button class="btn btn-outline flex-1" @click="goHome">
            <HomeIcon class="w-4 h-4 mr-2" />
            返回首页
          </button>
          <button class="btn btn-primary flex-1" @click="goToPractice">
            <BookOpenIcon class="w-4 h-4 mr-2" />
            错题集
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  HomeIcon, 
  ChevronLeftIcon,
  CheckCircle2Icon,
  XCircleIcon,
  BookOpenIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const result = ref(null)
const loading = ref(false)

// 获取考试结果
const fetchExamResult = () => {
  loading.value = true
  
  // 从localStorage获取考试结果
  try {
    const storedResult = localStorage.getItem('lastExamResult')
    if (storedResult) {
      result.value = JSON.parse(storedResult)
    } else {
      // 如果没有考试结果，返回考试页面
      router.replace(`/course/${route.query.id}/exam`)
    }
  } catch (err) {
    console.error('获取考试结果失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取使用时间的格式化显示
const formattedTimeUsed = computed(() => {
  if (!result.value) return ''
  
  const timeInSeconds = result.value.timeUsed
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = timeInSeconds % 60
  
  let timeString = ''
  if (hours > 0) {
    timeString += `${hours}小时`
  }
  if (minutes > 0 || hours > 0) {
    timeString += `${minutes}分钟`
  }
  timeString += `${seconds}秒`
  
  return timeString
})

// 回到错题集页面
const goToPractice = () => {
  router.push(`/practice`)
}

// 返回首页
const goHome = () => {
  router.push('/')
}

onMounted(() => {
  fetchExamResult()
})
</script> 