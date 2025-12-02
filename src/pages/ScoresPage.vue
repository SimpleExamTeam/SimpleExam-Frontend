<template>
  <div class="flex flex-col h-screen">
    <!-- 标题 -->
    <div class="p-4 border-b flex items-center gap-2">
      <button class="btn btn-ghost p-2" @click="router.back()">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-bold">我的成绩</h1>
    </div>

    <!-- 成绩列表 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-8">
        <p class="text-center text-red-500 mb-4">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchScores">重试</button>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="scores.length === 0" class="flex flex-col items-center justify-center p-8">
        <p class="text-center text-muted-foreground">暂无考试记录</p>
      </div>
      
      <!-- 成绩列表 -->
      <div v-else v-for="score in scores" :key="score.id" class="card p-4">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-medium mb-2 text-nowrap">{{ score.courseName }}</h4>
            <div class="space-y-1 text-sm text-muted-foreground">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                <span>考试时间：{{ formatDateTime(score.examTime) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircleIcon class="w-4 h-4" />
                <span>得分：{{ score.score }}分</span>
              </div>
            </div>
          </div>
          <div class="text-sm px-2 py-1 rounded-full text-nowrap whitespace-nowrap min-w-[3rem] text-center inline-block" 
               :class="getScoreClass(score.score)">
            {{ getScoreStatus(score.score) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URLS } from '@/config'
import { ChevronLeftIcon, ClockIcon, CheckCircleIcon } from 'lucide-vue-next'
import { formatDateTime, formatDate } from '../utils/date'
import TabBar from '../components/TabBar.vue'
import request from '@/utils/request'

const router = useRouter()

const scores = ref([])
const loading = ref(false)
const error = ref('')

// 获取成绩列表
const fetchScores = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await request(API_URLS.EXAM.RESULTS)
    if (res.code === 200) {
      // 检查数据是否存在
      if (!res.data) {
        scores.value = []
        return
      }
      
      // 按创建时间从新到旧排序
      const sortedData = res.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })
      
      // 转换数据结构以匹配组件期望
      scores.value = sortedData.map(item => ({
        id: item.id,
        courseName: item.course_name,
        examTime: item.created_at,
        score: item.score,
        passed: item.passed
      }))
    } else {
      error.value = res.message || '获取成绩列表失败'
    }
  } catch (err) {
    error.value = err.message || '网络错误，请重试'
    console.error('获取成绩列表失败:', err)
  } finally {
    loading.value = false
  }
}

const formatDuration = (minutes) => {
  return `${minutes}分钟`
}

const getScoreClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 80) return 'bg-blue-100 text-blue-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getScoreStatus = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '不及格'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchScores()
})
</script> 