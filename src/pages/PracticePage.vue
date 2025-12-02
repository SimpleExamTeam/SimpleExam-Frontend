<template>
  <div class="flex flex-col h-screen">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <XCircleIcon class="w-12 h-12 mx-auto mb-2" />
        <p>{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchWrongQuestions">
          重试
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else class="flex-1 overflow-y-auto p-4 pb-24">
      <!-- 错题分类统计 -->
      
      <!-- 无错题数据状态 -->
      <div v-if="wrongQuestions.courses?.length === 0" class="flex flex-col items-center justify-center h-full py-12">
        <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ClipboardListIcon class="w-12 h-12 text-primary" />
        </div>
        <div class="text-center max-w-sm">
          <h3 class="text-lg font-semibold mb-2">暂无练习记录</h3>
          <p class="text-muted-foreground mb-6">开始练习题目，系统会记录您的错题，帮助您查漏补缺！</p>
          <button 
            class="btn btn-primary shadow-sm"
            @click="router.push('/schedule')"
          >
            立即练习
          </button>
        </div>
      </div>
      
      <!-- 课程列表 -->
      <div v-else-if="wrongQuestions.courses" class="space-y-4">
        <div 
          v-for="course in wrongQuestions.courses" 
          :key="course.course_id" 
          class="card p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <BookOpenIcon class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 class="font-medium">{{ course.course_name }}</h3>
                <p class="text-sm text-muted-foreground">错题总数: {{ course.total }}</p>
              </div>
            </div>
            <button 
              class="btn btn-sm btn-primary whitespace-nowrap md:whitespace-normal"
              @click="startReview(course.course_id)"
            >
              开始复习
            </button>
          </div>
          
          <!-- 题型统计 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <!-- 单选题 -->
            <div 
              v-if="course.single > 0"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-accent/10 hover:border-primary transition-colors"
              @click="startReview(course.course_id, 'single')"
            >
              <CircleDotIcon class="w-5 h-5 mr-3 text-primary" />
              <div>
                <div class="font-medium">单选题</div>
                <div class="text-sm text-muted-foreground">{{ course.single }}题</div>
              </div>
            </div>
            
            <!-- 多选题 -->
            <div 
              v-if="course.multiple > 0"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-accent/10 hover:border-primary transition-colors"
              @click="startReview(course.course_id, 'multiple')"
            >
              <CheckSquareIcon class="w-5 h-5 mr-3 text-primary" />
              <div>
                <div class="font-medium">多选题</div>
                <div class="text-sm text-muted-foreground">{{ course.multiple }}题</div>
              </div>
            </div>
            
            <!-- 判断题 -->
            <div 
              v-if="course.judge > 0"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-accent/10 hover:border-primary transition-colors"
              @click="startReview(course.course_id, 'judge')"
            >
              <SplitSquareHorizontalIcon class="w-5 h-5 mr-3 text-primary" />
              <div>
                <div class="font-medium">判断题</div>
                <div class="text-sm text-muted-foreground">{{ course.judge }}题</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URLS } from '@/config'
import { 
  BookOpenIcon, 
  CircleDotIcon, 
  CheckSquareIcon, 
  SplitSquareHorizontalIcon,
  LoaderIcon,
  XCircleIcon,
  ClipboardListIcon
} from 'lucide-vue-next'
import TabBar from '../components/TabBar.vue'
import request from '@/utils/request'

const router = useRouter()
const wrongQuestions = ref({})
const loading = ref(true)
const error = ref('')

// 获取错题统计
const fetchWrongQuestions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await request(API_URLS.PRACTICE.WRONG_QUESTIONS)
    
    if (response.code === 200) {
      wrongQuestions.value = response.data
    } else {
      error.value = response.message || '获取错题数据失败'
    }
  } catch (err) {
    console.error('获取错题统计失败:', err)
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}

// 开始复习
const startReview = (courseId, typeId = '') => {
  let path = `/course/${courseId}/wrong-questions`
  if (typeId) {
    path += `?type=${typeId}`
  }
  router.push({
    path: path
  })
}

onMounted(() => {
  fetchWrongQuestions()
})
</script> 