<template>
  <div class="flex flex-col h-screen">
    <!-- 标题栏 -->
    <div class="flex-none border-b">
      <div class="p-4 flex items-center gap-2">
        <button class="btn btn-ghost p-2" @click="router.back()">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold">练习模式</h1>
      </div>
    </div>

    <!-- 内容区域 -->
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

      <div v-else-if="questionTypes.length === 0" class="flex flex-col items-center justify-center h-full p-4">
        <BookXIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <p class="text-muted-foreground">该课程暂无练习题</p>
      </div>

      <div v-else class="p-4 space-y-4">
        <div 
          v-for="type in questionTypes" 
          :key="type.id"
          class="card p-4 cursor-pointer hover:shadow-lg transition-all"
          @click="selectType(type)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <component :is="type.icon" class="w-6 h-6 text-primary" />
              <div>
                <h3 class="font-medium">{{ type.name }}</h3>
                <p class="text-sm text-muted-foreground">
                  题目数量: {{ type.total }}
                </p>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CircleDotIcon,
  CheckSquareIcon,
  SplitSquareHorizontalIcon,
  LoaderIcon,
  XCircleIcon,
  BookXIcon
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
    
    const courseId = route.params.id
    const response = await getCourseDetail(courseId)
    
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

// 题型列表
const questionTypes = computed(() => {
  if (!course.value) return []
  
  return [
    {
      id: 3,
      name: '判断题',
      total: course.value.question_stats.judge || 0,
      icon: SplitSquareHorizontalIcon
    },
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
    }
  ].filter(type => type.total > 0) // 只显示有题目的题型
})

const selectType = (type) => {
  router.push(`/course/${route.params.id}/practice/${type.id}`)
}

onMounted(() => {
  fetchCourseDetail()
})
</script> 