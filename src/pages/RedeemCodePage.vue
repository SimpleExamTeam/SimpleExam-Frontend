<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部导航 -->
    <div class="p-4 border-b flex items-center gap-2">
      <button class="btn btn-ghost p-2" @click="goBack">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-bold">兑换码</h1>
    </div>

    <!-- 主要内容 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="max-w-lg mx-auto">
        <!-- 兑换码输入 -->
        <div class="bg-card p-4 rounded-lg border mb-4 shadow-sm hover:shadow transition-all">
          <h2 class="text-lg font-semibold mb-3">输入兑换码</h2>
          <div class="mb-3 relative">
            <input 
              v-model="cardNo" 
              type="text" 
              class="input input-bordered w-full h-12 text-base placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pl-4 pr-10 bg-background text-foreground dark:text-foreground dark:border-muted"
              placeholder="请输入兑换码"
              :disabled="loading"
            />
            <div v-if="cardNo.trim()" class="absolute right-3 top-1/2 -translate-y-1/2">
              <button 
                @click="cardNo = ''" 
                class="text-muted-foreground hover:text-foreground p-1 rounded-full"
                :disabled="loading"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button 
            class="btn btn-primary w-full h-11 font-medium transition-all text-primary-foreground dark:text-primary-foreground"
            @click="verifyCode"
            :disabled="!cardNo.trim() || loading"
          >
            <LoaderIcon v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            验证兑换码
          </button>
        </div>

        <!-- 课程选择 -->
        <div v-if="showCourseSelection" class="bg-card p-4 rounded-lg border">
          <h2 class="text-lg font-semibold mb-3">选择课程</h2>
          
          <div v-if="coursesLoading" class="flex justify-center py-8">
            <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
          </div>
          
          <div v-else-if="error" class="p-4 bg-red-50 text-red-600 rounded-md mb-4 dark:bg-red-900/20 dark:text-red-400">
            {{ error }}
          </div>
          
          <div v-else-if="courses.length === 0" class="p-4 bg-amber-50 text-amber-600 rounded-md mb-4 dark:bg-amber-900/20 dark:text-amber-400">
            没有可选择的课程
          </div>
          
          <div v-else>
            <!-- 步骤指示器 -->
            <div class="flex items-center mb-6 relative">
              <div class="absolute top-4 left-0 right-0 h-1 bg-muted/70 -z-10"></div>
              <div 
                v-for="(step, index) in steps" 
                :key="index" 
                class="flex flex-col items-center flex-1 z-10"
              >
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center font-medium mb-2 shadow-sm transition-all border-2"
                  :class="currentStep === index 
                    ? 'bg-primary text-primary-foreground border-primary scale-110' 
                    : (currentStep > index 
                      ? 'bg-primary/20 text-primary border-primary/20 dark:text-primary-foreground dark:border-primary/40' 
                      : 'bg-card text-muted-foreground border-muted dark:border-muted-foreground/50 dark:text-foreground')"
                >
                  {{ index + 1 }}
                </div>
                <span 
                  class="text-xs text-center font-medium px-1 py-0.5 rounded transition-colors"
                  :class="currentStep === index 
                    ? 'text-primary bg-primary/10' 
                    : (currentStep > index 
                      ? 'text-primary/70' 
                      : 'text-muted-foreground')"
                >
                  {{ step }}
                </span>
              </div>
            </div>
            
            <!-- 第一步：选择一级分类 -->
            <div v-if="currentStep === 0">
              <h3 class="font-medium mb-3">选择分类</h3>
              <div class="grid grid-cols-1 gap-3">
                <div 
                  v-for="(category, categoryIndex) in courses" 
                  :key="'cat-' + categoryIndex"
                  class="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  :class="{ 'border-primary': selectedCategoryIndex === categoryIndex }"
                  @click="selectCategory(categoryIndex)"
                >
                  <div class="flex items-center gap-3">
                    <div class="h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0">
                      <div v-if="selectedCategoryIndex === categoryIndex" class="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <span class="font-medium">{{ category.name }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button 
                  class="btn btn-primary w-full" 
                  :disabled="selectedCategoryIndex === null"
                  @click="nextStep"
                >
                  下一步
                </button>
              </div>
            </div>
            
            <!-- 第二步：选择二级分类 -->
            <div v-else-if="currentStep === 1">
              <div class="flex items-center gap-2 mb-3">
                <button class="btn btn-ghost btn-sm p-1" @click="prevStep">
                  <ArrowLeftIcon class="w-4 h-4" />
                </button>
                <h3 class="font-medium">{{ courses[selectedCategoryIndex].name }} - 选择子分类</h3>
              </div>
              
              <div class="grid grid-cols-1 gap-3">
                <div 
                  v-for="(subcategory, subIndex) in courses[selectedCategoryIndex].children" 
                  :key="'sub-' + subIndex"
                  class="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  :class="{ 'border-primary': selectedSubcategoryIndex === subIndex }"
                  @click="selectSubcategory(subIndex)"
                >
                  <div class="flex items-center gap-3">
                    <div class="h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0">
                      <div v-if="selectedSubcategoryIndex === subIndex" class="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <span class="font-medium">{{ subcategory.name }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button 
                  class="btn btn-primary w-full" 
                  :disabled="selectedSubcategoryIndex === null"
                  @click="nextStep"
                >
                  下一步
                </button>
              </div>
            </div>
            
            <!-- 第三步：选择具体课程 -->
            <div v-else-if="currentStep === 2">
              <div class="flex items-center gap-2 mb-3">
                <button class="btn btn-ghost btn-sm p-1" @click="prevStep">
                  <ArrowLeftIcon class="w-4 h-4" />
                </button>
                <h3 class="font-medium">
                  {{ courses[selectedCategoryIndex].name }} - 
                  {{ courses[selectedCategoryIndex].children[selectedSubcategoryIndex].name }} - 
                  选择课程
                </h3>
              </div>
              
              <div class="grid grid-cols-1 gap-3">
                <div 
                  v-for="course in availableCourses" 
                  :key="course.id"
                  class="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  :class="{ 'border-primary': selectedCourseId === getCourseId(course) }"
                  @click="selectCourse(course)"
                >
                  <div class="flex items-center gap-3">
                    <div class="h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0">
                      <div v-if="selectedCourseId === getCourseId(course)" class="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p class="font-medium">{{ course.name }}</p>
                      <p class="text-sm text-muted-foreground">ID: {{ getCourseId(course) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="availableCourses.length === 0" class="p-4 bg-amber-50 text-amber-600 rounded-md mb-4 dark:bg-amber-900/20 dark:text-amber-400">
                该分类下没有可兑换的课程
              </div>
              
              <div class="mt-6">
                <button 
                  class="btn btn-primary w-full" 
                  :disabled="!selectedCourseId || submitting"
                  @click="submitRedeem"
                >
                  <LoaderIcon v-if="submitting" class="w-4 h-4 mr-2 animate-spin" />
                  确认兑换
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 成功提示对话框 -->
    <div v-if="showSuccessDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="text-center">
          <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 class="text-lg font-medium text-foreground mb-2">兑换成功</h3>
          <p class="text-muted-foreground mb-6">您已成功兑换课程，可在"我的订单"中查看</p>
          <div class="flex gap-3">
            <button 
              class="flex-1 btn btn-outline"
              @click="goToOrders"
            >
              查看订单
            </button>
            <button 
              class="flex-1 btn btn-primary"
              @click="goHome"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, LoaderIcon, CheckCircleIcon, XIcon } from 'lucide-vue-next'
import { getCourseList } from '@/api/course'
import { redeemCard } from '@/api/payment'

const router = useRouter()
const cardNo = ref('')
const loading = ref(false)
const coursesLoading = ref(false)
const courses = ref([])
const selectedCourseId = ref(null)
const showCourseSelection = ref(false)
const error = ref('')
const submitting = ref(false)
const showSuccessDialog = ref(false)

// 分步选择相关
const steps = ['选择分类', '选择子分类', '选择课程']
const currentStep = ref(0)
const selectedCategoryIndex = ref(null)
const selectedSubcategoryIndex = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 步骤控制
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 选择一级分类
const selectCategory = (index) => {
  selectedCategoryIndex.value = index
  selectedSubcategoryIndex.value = null
  selectedCourseId.value = null
}

// 选择二级分类
const selectSubcategory = (index) => {
  selectedSubcategoryIndex.value = index
  selectedCourseId.value = null
}

// 可用课程列表
const availableCourses = computed(() => {
  if (selectedCategoryIndex.value === null || selectedSubcategoryIndex.value === null) {
    return []
  }
  
  const subcategory = courses.value[selectedCategoryIndex.value]?.children[selectedSubcategoryIndex.value]
  if (!subcategory || !subcategory.children || !Array.isArray(subcategory.children)) {
    return []
  }
  
  return filterCourses(subcategory.children)
})

// 验证兑换码
const verifyCode = async () => {
  if (!cardNo.value.trim()) return
  
  try {
    loading.value = true
    error.value = ''
    
    // 这里仅验证兑换码格式，实际兑换在选择课程后进行
    if (cardNo.value.trim().length < 6) {
      error.value = '请输入有效的兑换码'
      return
    }
    
    // 获取课程列表
    await fetchCourses()
    
    // 重置选择状态
    currentStep.value = 0
    selectedCategoryIndex.value = null
    selectedSubcategoryIndex.value = null
    selectedCourseId.value = null
    
    // 显示课程选择界面
    showCourseSelection.value = true
  } catch (err) {
    console.error('验证兑换码失败:', err)
    error.value = err.message || '验证兑换码失败，请重试'
  } finally {
    loading.value = false
  }
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    coursesLoading.value = true
    error.value = ''
    
    const response = await getCourseList()
    
    if (response.code === 200) {
      // 确保数据结构完整
      const data = response.data || []
      
      // 处理每个分类
      courses.value = data.map(category => {
        // 确保每个分类有children字段
        if (!category.children) category.children = []
        
        // 处理每个子分类
        category.children = category.children.map(subcategory => {
          // 确保每个子分类有children字段
          if (!subcategory.children) subcategory.children = []
          return subcategory
        })
        
        return category
      })
    } else {
      throw new Error(response.msg || '获取课程列表失败')
    }
  } catch (err) {
    console.error('获取课程列表失败:', err)
    throw new Error(err.message || '获取课程列表失败，请重试')
  } finally {
    coursesLoading.value = false
  }
}

// 过滤掉已购买的课程
const filterCourses = (courseList) => {
  if (!courseList || !Array.isArray(courseList)) return []
  
  // 创建结果数组
  let result = []
  
  // 处理每个课程或课程组
  courseList.forEach(course => {
    // 如果有courses字段，检查其中的课程
    if (course.courses && Array.isArray(course.courses) && course.courses.length > 0) {
      // 只有未购买的课程才添加到结果中
      if (!course.courses[0].purchased) {
        result.push(course)
      }
    } else {
      // 直接检查课程本身是否已购买
      if (!course.purchased) {
        result.push(course)
      }
    }
  })
  
  // 按照sort字段排序（如果有）
  result.sort((a, b) => {
    const sortA = a.sort !== undefined ? a.sort : 999
    const sortB = b.sort !== undefined ? b.sort : 999
    return sortA - sortB
  })
  
  return result
}

// 获取课程ID
const getCourseId = (course) => {
  if (course.courses && course.courses.length > 0) {
    return course.courses[0].id
  }
  return course.id
}

// 选择课程
const selectCourse = (course) => {
  selectedCourseId.value = getCourseId(course)
}

// 提交兑换
const submitRedeem = async () => {
  if (!cardNo.value.trim() || !selectedCourseId.value) return
  
  try {
    submitting.value = true
    error.value = ''
    
    const response = await redeemCard({
      card_no: cardNo.value.trim(),
      course_id: selectedCourseId.value
    })
    
    if (response.code === 200) {
      // 显示成功对话框
      showSuccessDialog.value = true
    } else {
      throw new Error(response.msg || '兑换失败')
    }
  } catch (err) {
    console.error('兑换失败:', err)
    error.value = err.message || '兑换失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 跳转到订单页面
const goToOrders = () => {
  showSuccessDialog.value = false
  router.push('/orders')
}

// 返回首页
const goHome = () => {
  showSuccessDialog.value = false
  router.push('/')
}
</script> 