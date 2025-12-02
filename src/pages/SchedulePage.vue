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
        <button class="btn btn-primary mt-4" @click="fetchCourses">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="courses.length === 0" class="flex flex-col items-center justify-center h-full p-4">
        <BookXIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <p class="text-muted-foreground text-center">暂无课程</p>
        <button class="btn btn-primary mt-4" @click="fetchCourses">刷新</button>
      </div>

      <div v-else class="p-4 space-y-4 pb-20">
        <div 
          v-for="(category, categoryIndex) in courses" 
          :key="`cat-${categoryIndex}-${category.id}`"
          class="space-y-4"
        >
          <!-- 主课程卡片 -->
          <div class="card p-4">
            <div 
              class="flex items-center justify-between mb-4 cursor-pointer"
              @click.stop="toggleCategory(categoryIndex, category.id)"
            >
              <div class="flex items-center gap-3">
                <BookOpenIcon class="w-6 h-6 text-primary" />
                <h3 class="font-semibold text-nowrap">{{ category.name }}</h3>
              </div>
              <button class="btn btn-ghost p-2" @click.stop="toggleCategory(categoryIndex, category.id)">
                <ChevronDownIcon 
                  class="w-5 h-5 transition-transform"
                  :class="{ 'rotate-180': isCategoryExpanded(categoryIndex, category.id) }"
                />
              </button>
            </div>
            
            <!-- 二级分类列表 -->
            <div v-show="isCategoryExpanded(categoryIndex, category.id)">
              <div 
                v-for="(subCategory, subIndex) in category.children" 
                :key="`subcat-${categoryIndex}-${subIndex}-${subCategory.id}`"
                class="border-t first:border-t-0 py-4 first:pt-0 last:pb-0"
              >
                <div 
                  class="flex items-center justify-between cursor-pointer"
                  @click.stop="toggleSubCategory(categoryIndex, subIndex, subCategory.id)"
                >
                  <div class="flex items-center gap-3">
                    <FolderIcon class="w-5 h-5 text-primary" />
                    <h4 class="font-medium">{{ subCategory.name }}</h4>
                  </div>
                  <button class="btn btn-ghost p-2" @click.stop="toggleSubCategory(categoryIndex, subIndex, subCategory.id)">
                    <ChevronDownIcon 
                      class="w-5 h-5 transition-transform"
                      :class="{ 'rotate-180': isSubCategoryExpanded(categoryIndex, subIndex, subCategory.id) }"
                    />
                  </button>
                </div>

                <!-- 三级分类列表 -->
                <div v-show="isSubCategoryExpanded(categoryIndex, subIndex, subCategory.id)"
                     class="mt-4 ml-8 space-y-4">
                  <div 
                    v-for="(course, courseIndex) in subCategory.children" 
                    :key="`course-${categoryIndex}-${subIndex}-${courseIndex}-${course.id}`"
                    class="card p-3 hover:bg-accent/50 transition-colors cursor-pointer relative"
                    @click.stop="selectCourse(course)"
                  >
                    <div class="flex flex-col min-h-[70px]">
                      <!-- 左侧内容 -->
                      <div>
                        <h5 class="font-medium truncate">{{ course.name }}</h5>
                        <div class="text-sm text-muted-foreground mt-1">
                          <div class="flex items-center gap-2">
                            <CreditCardIcon class="w-4 h-4 shrink-0" />
                            <span>价格：{{ getCoursePrice(course) === 0 ? '免费' : `${getCoursePrice(course)}元` }}</span>
                          </div>
                        </div>
                      </div>
                      <!-- 右侧状态和按钮 -->
                      <div class="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                        <span class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" 
                              :class="course.courses[0]?.purchased ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary text-secondary-foreground'">
                          {{ course.courses[0]?.purchased ? '已购买' : '未购买' }}
                        </span>
                        <button 
                          class="btn btn-xs whitespace-nowrap"
                          :class="course.courses[0]?.purchased ? 'btn-secondary' : 'btn-primary'"
                          @click.stop="course.courses[0]?.purchased ? viewCourse(course.courses[0]) : purchaseCourse(course)"
                        >
                          {{ course.courses[0]?.purchased ? '查看课程' : (getCoursePrice(course) === 0 ? '免费获取' : '购买课程') }}
                        </button>
                      </div>
                    </div>
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
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BookOpenIcon, 
  BookXIcon,
  ChevronDownIcon,
  FolderIcon,
  FileTextIcon,
  CreditCardIcon,
  GraduationCapIcon,
  RefreshCcwIcon,
  LoaderIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import TabBar from '../components/TabBar.vue'
import { getCourseList } from '@/api/course'

const router = useRouter()
const courses = ref([])
const loading = ref(false)
const error = ref('')

// 使用嵌套对象来存储展开状态，每个分类有自己的状态
const expandedState = reactive({
  categories: {}, // 存储一级分类的展开状态
  subCategories: {} // 存储二级分类的展开状态
})

// 切换一级分类展开状态
const toggleCategory = (index, categoryId) => {
  // 使用索引和ID组合的键
  const key = `${index}-${categoryId}`
  expandedState.categories[key] = !expandedState.categories[key]
}

// 切换二级分类展开状态
const toggleSubCategory = (parentIndex, index, subCategoryId) => {
  // 使用父索引、当前索引和ID的组合键
  const key = `${parentIndex}-${index}-${subCategoryId}`
  expandedState.subCategories[key] = !expandedState.subCategories[key]
}

// 检查分类是否展开
const isCategoryExpanded = (index, categoryId) => {
  const key = `${index}-${categoryId}`
  return !!expandedState.categories[key]
}

// 检查子分类是否展开
const isSubCategoryExpanded = (parentIndex, index, subCategoryId) => {
  const key = `${parentIndex}-${index}-${subCategoryId}`
  return !!expandedState.subCategories[key]
}

// 根据sort字段排序数组
const sortBySort = (arr) => {
  if (!Array.isArray(arr)) {
    return []
  }
  return [...arr].sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await getCourseList()
    if (response.code === 200) {
      // 处理后端返回 null 的情况
      const data = response.data || []
      
      // 对所有三级分类数据按sort进行排序
      const sortedData = sortBySort(data).map(category => {
        return {
          ...category,
          children: sortBySort(category.children || []).map(subCategory => {
            return {
              ...subCategory,
              children: sortBySort(subCategory.children || [])
            }
          })
        }
      })
      
      courses.value = sortedData
      
      // 默认展开第一个分类
      if (courses.value.length > 0) {
        expandedState.categories[`0-${courses.value[0].id}`] = true
      }
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
    error.value = err.message || '获取课程失败，请重试'
    console.error('获取课程失败:', err)
  } finally {
    loading.value = false
  }
}

// 选择课程
const selectCourse = (course) => {
  if (course.courses[0]?.purchased) {
    // 如果已购买，跳转到题库页面
    viewCourse(course.courses[0])
  }
}

// 购买课程
const purchaseCourse = (course) => {
  // 使用getCoursePrice函数获取正确的价格
  const price = getCoursePrice(course)
  
  router.push({
    name: 'Payment',
    params: { courseId: course.id },
    query: {
      courseName: course.name,
      courseDesc: course.description || '',
      amount: price * 100, // 转换为分
    }
  })
}

// 查看课程
const viewCourse = (course) => {
  router.push(`/course/${course.id}`)
}

// 获取课程价格
const getCoursePrice = (course) => {
  return course.courses[0]?.price || course.price || 0
}

onMounted(() => {
  fetchCourses()
})
</script> 