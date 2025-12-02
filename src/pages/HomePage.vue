<template>
  <div class="flex flex-col h-screen">
    <!-- 课程列表 -->
    <div class="flex-1 overflow-y-auto pt-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="handleRetry">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="purchasedCourses.length === 0" class="flex flex-col items-center justify-center h-full p-4">
        <BookXIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <div class="text-center">
          <p class="text-muted-foreground">您还没有购买任何课程</p>
          <button 
            class="btn btn-primary mt-4"
            @click="goToCourseStore"
          >
            浏览课程
          </button>
        </div>
      </div>

      <div v-else class="p-4 space-y-4 pb-20">
        <!-- 我的课程 -->
        <div>
          <h2 class="text-lg font-semibold mb-4 text-center">我的课程</h2>
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">课程列表</span>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div 
              v-for="course in purchasedCourses" 
              :key="course.id"
              class="card p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex gap-4">
                <div class="w-20 h-20 bg-primary/10 rounded-md flex-shrink-0 flex items-center justify-center">
                  <BookOpenIcon class="w-10 h-10 text-primary" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold">{{ course.subCategoryName ? ` ${course.subCategoryName} -  ` : '' }}{{ course.name }}</h3>
                  <p class="text-sm text-muted-foreground mt-1 line-clamp-2">{{ course.description || '暂无描述' }}</p>
                  
                  <!-- 显示到期天数 -->
                  <div v-if="course.expire_days !== undefined" class="mt-1">
                    <span 
                      class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" 
                      :class="{
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': course.expire_days <= 3,
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': course.expire_days > 3 && course.expire_days <= 15,
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': course.expire_days > 15
                      }"
                    >
                      {{ course.expire_days > 0 ? `还有 ${course.expire_days} 天到期` : '已到期' }}
                    </span>
                  </div>
                  
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">已购买</span>
                    <button 
                      class="btn btn-sm btn-primary"
                      @click="viewCourse(course)"
                    >
                      查看课程
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BookOpenIcon,
  BookXIcon,
  LoaderIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import TabBar from '../components/TabBar.vue'
import { getCourseList } from '@/api/course'

const router = useRouter()
const courseData = ref([])
const loading = ref(false)
const error = ref('')

// 计算已购买的课程
const purchasedCourses = computed(() => {
  const purchased = []
  
  if (!courseData.value || !Array.isArray(courseData.value)) {
    return []
  }
  
  courseData.value.forEach(category => {
    if (!category?.children) return
    
    category.children.forEach(subCategory => {
      if (!subCategory?.children) return
      
      subCategory.children.forEach(item => {
        if (!item?.courses) return
        
        item.courses.forEach(course => {
          if (course?.purchased) {
            // 添加二级分类名称到课程对象
            const enhancedCourse = {
              ...course,
              subCategoryName: subCategory.name
            }
            purchased.push(enhancedCourse)
          }
        })
      })
    })
  })
  
  return purchased
})

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await getCourseList()
    
    if (response.code === 200) {
      // 处理后端返回 null 的情况
      courseData.value = response.data || []
    } else if (response.code === 401) {
      error.value = response.message || '登录已过期，请重新登录'
      // 检查是否在微信环境中
      const isWechat = /MicroMessenger/i.test(navigator.userAgent)
      if (!isWechat) {
        // 非微信环境，跳转到登录页
        const currentPath = window.location.pathname + window.location.search
        router.replace({
          name: 'Login',
          query: { redirect: currentPath }
        })
      }
    } else {
      error.value = response.message || '获取课程失败'
    }
  } catch (err) {
    console.error('获取课程失败:', err)
    error.value = err.message || '网络错误，请重试'
    
    // 如果是登录过期错误，也需要处理重定向
    if (err.response?.code === 401) {
      const isWechat = /MicroMessenger/i.test(navigator.userAgent)
      if (!isWechat) {
        const currentPath = window.location.pathname + window.location.search
        router.replace({
          name: 'Login',
          query: { redirect: currentPath }
        })
      }
    }
  } finally {
    loading.value = false
  }
}

// 重试按钮点击处理
const handleRetry = () => {
  // 如果是登录过期错误，直接处理重定向
  if (error.value === '登录已过期，请重新登录') {
    const isWechat = /MicroMessenger/i.test(navigator.userAgent)
    if (!isWechat) {
      const currentPath = window.location.pathname + window.location.search
      router.replace({
        name: 'Login',
        query: { redirect: currentPath }
      })
    }
    return
  }
  // 其他错误才重新获取数据
  fetchCourses()
}

// 查看课程
const viewCourse = (course) => {
  router.push(`/course/${course.id}`)
}

// 前往课程商店
const goToCourseStore = () => {
  router.push('/schedule')
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 