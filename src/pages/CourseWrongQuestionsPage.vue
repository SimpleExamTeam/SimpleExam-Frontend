<template>
  <div class="h-screen flex flex-col overscroll-none"
    ref="swipeTarget"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click.stop
  >
    <!-- 固定的页面标题 -->
    <div class="sticky top-0 bg-background z-50 border-b">
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost p-2" @click.stop="router.back()">
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-bold">错题复习</h1>
        </div>
        <!-- 题号选择器 -->
        <div class="relative" ref="jumpMenuContainer">
          <button
            class="btn btn-sm"
            @click.stop="toggleJumpMenu"
          >
            题号 <ChevronDownIcon class="h-4 w-4 ml-1" />
          </button>
          <div
            v-if="showJumpMenu"
            class="absolute right-0 mt-1 py-2 w-48 bg-background border rounded-lg shadow-lg z-50"
          >
            <div class="max-h-60 overflow-y-auto p-2">
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="i in questions.length"
                  :key="i"
                  class="btn btn-sm"
                  :class="{ 'btn-primary': i === currentIndex + 1, 'btn-outline': i !== currentIndex + 1 }"
                  @click.stop="jumpToQuestion(i-1)"
                >
                  {{ i }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="questions.length > 0" class="py-3 px-4 flex items-center justify-between border-b">
        <div class="flex items-center gap-3">
          <!-- 更醒目的题型显示 -->
          <div class="flex items-center gap-2">
            <div class="px-3 py-1 rounded-full text-xs font-medium border" :class="questionTypeStyle">
              {{ questionTypeText(currentQuestionData) }}
            </div>
            <span class="text-sm font-medium text-foreground">{{ currentIndex + 1 }}/{{ questions.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 flex flex-col overflow-hidden" @click.stop>
      <!-- 加载状态 -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-6">
        <XCircleIcon class="w-10 h-10 text-red-500 mb-3" />
        <p class="text-center text-red-500 text-sm">{{ error }}</p>
        <button class="btn btn-primary mt-3 text-sm" @click="fetchQuestions">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="questions.length === 0" class="flex-1 flex flex-col items-center justify-center p-4">
        <ClipboardListIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <p class="text-xl font-medium text-center mb-2">暂无错题</p>
        <p class="text-muted-foreground text-center mb-6">您在此课程中暂无错题记录</p>
        <button class="btn btn-primary" @click.stop="router.back()">返回</button>
      </div>

      <!-- 题目内容 -->
      <div v-else class="flex-1 overflow-hidden" @click.stop>
        <!-- 滑动容器 -->
        <div
          class="h-full overflow-y-auto transition-transform content-container"
          :style="swipeStyle"
          @click.stop
        >
          <!-- 题目内容 -->
          <div class="px-4 pt-4 pb-32">
            <!-- 问题题干 -->
            <div class="card p-3 mb-4">
              <div class="prose">
                <p v-html="currentQuestionData?.question"></p>
              </div>
            </div>

            <!-- 问题选项 -->
            <div class="space-y-2 mb-4">
              <label 
                  v-for="(option, optionIndex) in currentQuestionData?.options" 
                  :key="optionIndex"
                  class="block border rounded-lg cursor-pointer"
                  :class="{
                    'bg-green-50 border-green-300': answerShown[currentQuestionData?.id] && isOptionCorrect(currentQuestionData?.id, option.label),
                    'bg-red-50 border-red-300': answerShown[currentQuestionData?.id] && isOptionSelected(currentQuestionData?.id, option.label) && !isOptionCorrect(currentQuestionData?.id, option.label),
                    'hover:bg-accent': !answerShown[currentQuestionData?.id]
                  }"
                  @click.stop
                >
                  <div class="flex items-center p-2 pr-6">
                    <input 
                      v-if="currentQuestionData?.type === 'judge' || currentQuestionData?.type === 'single'" 
                      type="radio"
                      :name="'question-' + currentQuestionData?.id"
                      :value="option.label"
                      v-model="questionAnswers[currentQuestionData?.id]"
                      class="mr-2 h-4 w-4"
                      :disabled="answerShown[currentQuestionData?.id]"
                      @change="singleQuestionAnswered(currentQuestionData?.id)"
                      @click.stop
                    />
                    <input 
                      v-else-if="currentQuestionData?.type === 'multiple'" 
                      type="checkbox"
                      :value="option.label"
                      v-model="questionAnswers[currentQuestionData?.id]"
                      class="mr-2 h-4 w-4"
                      :disabled="answerShown[currentQuestionData?.id]"
                      @click.stop
                    />
                    <span v-html="option.label + '. ' + option.text"></span>
                    
                    <!-- 更新图标显示逻辑 -->
                    <CheckCircleIcon 
                      v-if="answerShown[currentQuestionData?.id] && isOptionCorrect(currentQuestionData?.id, option.label)"
                      class="ml-auto w-5 h-5 text-green-500" 
                    />
                    <XIcon 
                      v-if="answerShown[currentQuestionData?.id] && isOptionSelected(currentQuestionData?.id, option.label) && !isOptionCorrect(currentQuestionData?.id, option.label)"
                      class="ml-auto w-5 h-5 text-red-500" 
                    />
                  </div>
                </label>
            </div>

            
            <!-- 多选题查看答案按钮 -->
            <div v-if="currentQuestionData?.type === 'multiple' && !answerShown[currentQuestionData?.id]" class="mt-4">
              <button 
                class="btn btn-primary w-full"
                @click.stop="checkAnswer(currentQuestionData?.id)"
              >
                查看答案
              </button>
            </div>
            
            <!-- 答案反馈 -->
            <div v-if="answerShown[currentQuestionData?.id]" class="mt-4">
              <div class="card p-4 bg-accent/10">
                <!-- 答题结果 -->
                <div class="mb-3 flex items-center gap-2">
                  <span class="font-medium">答题结果:</span>
                  <div v-if="isCorrect(currentQuestionData)" class="flex items-center text-green-500 gap-1">
                    <CheckCircleIcon class="w-5 h-5" /> 回答正确
                  </div>
                  <div v-else class="flex items-center text-red-500 gap-1">
                    <XCircleIcon class="w-5 h-5" /> 回答错误
                  </div>
                </div>
                
                <!-- 正确答案 -->
                <div class="mb-3">
                  <div class="font-medium mb-1">正确答案: </div>
                  <div class="pl-2 text-green-600">{{ currentQuestionData?.answer }}</div>
                </div>
                
                <!-- 解析 -->
                <div>
                  <div class="font-medium mb-1">解析: </div>
                  <div class="pl-2" v-if="currentQuestionData?.explanation">
                    <p class="text-muted-foreground" v-html="currentQuestionData?.explanation"></p>
                  </div>
                  <div v-else class="pl-2">
                    <p class="text-muted-foreground italic">暂无解析</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 滑动提示 -->
        <div v-if="swiping" class="fixed inset-0 pointer-events-none flex items-center justify-between px-6 z-10">
          <div v-if="swipeDirection === 'right'" class="bg-black/20 text-white p-3 rounded-full">
            <ChevronLeftIcon class="w-6 h-6" />
          </div>
          <div v-if="swipeDirection === 'left'" class="ml-auto bg-black/20 text-white p-3 rounded-full">
            <ChevronRightIcon class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="sticky bottom-0 bg-background border-t p-4 z-10">
      <!-- 滑动提示 -->
      <div class="text-center text-xs text-muted-foreground mb-3 flex justify-center items-center">
        <ChevronLeftIcon class="w-4 h-4" />
        <span class="mx-1">左右滑动切换题目</span>
        <ChevronRightIcon class="w-4 h-4" />
      </div>

      <!-- 操作按钮 -->
      <div class="grid grid-cols-2 gap-3">
        <button
          class="btn btn-outline text-nowrap"
          :disabled="currentIndex === 0"
          @click.stop="prevQuestion"
        >
          上一题
        </button>
        <button
          class="btn btn-primary text-nowrap"
          :disabled="currentIndex === questions.length - 1"
          @click.stop="nextQuestion"
        >
          下一题
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChevronLeftIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  LoaderIcon,
  XCircleIcon,
  CheckCircleIcon,
  XIcon
} from 'lucide-vue-next'
import request from '@/utils/request'
import { API_URLS } from '@/config'

const router = useRouter()
const route = useRoute()
const courseId = route.params.id
const questionType = route.query.type || ''
const jumpMenuContainer = ref(null)

// 状态变量
const loading = ref(true)
const error = ref('')
const questions = ref([])
const currentIndex = ref(0)
const showJumpMenu = ref(false)
const answerShown = ref({})
const questionAnswers = ref({})
const swipeTarget = ref(null)

// 滑动状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchMoveX = ref(null)
const touchMoveY = ref(null)
const swiping = ref(false)
const swipeDirection = ref(null)
const swipeOffset = ref(0)

// 计算属性
const currentQuestionData = computed(() => questions.value[currentIndex.value] || {})
const swipeStyle = computed(() => {
  return {
    transform: `translateX(${swipeOffset.value}px)`
  }
})

// 题目类型文本
const questionTypeText = (question) => {
  if (!question) return ''
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题'
  }
  return typeMap[question.type] || '未知题型'
}

// 题目类型样式
const questionTypeStyle = computed(() => {
  if (!currentQuestionData.value) return ''
  const styleMap = {
    'single': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    'multiple': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'judge': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
  }
  return styleMap[currentQuestionData.value.type] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
})

// 切换题目下拉菜单
const toggleJumpMenu = () => {
  showJumpMenu.value = !showJumpMenu.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (jumpMenuContainer.value && !jumpMenuContainer.value.contains(event.target)) {
    showJumpMenu.value = false
  }
}

// 跳转到指定题目
const jumpToQuestion = (index) => {
  currentIndex.value = index
  showJumpMenu.value = false
}

// 检查选项是否被选中
const isOptionSelected = (questionId, optionLabel) => {
  if (!questionId || !questionAnswers.value[questionId]) return false
  
  if (Array.isArray(questionAnswers.value[questionId])) {
    // 多选题
    return questionAnswers.value[questionId].includes(optionLabel)
  } else {
    // 单选题或判断题
    return questionAnswers.value[questionId] === optionLabel
  }
}

// 检查答案是否正确
const isCorrect = (question) => {
  if (!question || !question.id || !questionAnswers.value[question.id]) return false
  
  if (question.type === 'multiple') {
    // 多选题需要全部选项匹配
    const selectedOptions = questionAnswers.value[question.id].sort().join('')
    const correctOptions = question.answer.split('').sort().join('')
    return selectedOptions === correctOptions
  } else {
    // 单选题或判断题
    return questionAnswers.value[question.id] === question.answer
  }
}

// 获取错题
const fetchQuestions = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await request(API_URLS.PRACTICE.COURSE_WRONG_QUESTIONS(courseId, questionType))
    
    if (response.code === 200) {
      questions.value = response.data.questions || []
      
      // 初始化答案记录
      questions.value.forEach(question => {
        // 初始化答案显示状态
        answerShown.value[question.id] = false
        
        // 根据题型初始化答案
        if (question.type === 'single' || question.type === 'judge') {
          // 单选题或判断题
          questionAnswers.value[question.id] = null
        } else if (question.type === 'multiple') {
          // 多选题
          questionAnswers.value[question.id] = []
        }
      })
    } else {
      error.value = response.message || '获取错题失败'
    }
  } catch (err) {
    console.error('获取错题失败:', err)
    error.value = err.message || '网络错误，请重试'
    
    // 处理登录过期的情况
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

// 单选题和判断题选择选项后立即显示答案
const singleQuestionAnswered = (questionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (!question || (question.type !== 'single' && question.type !== 'judge')) return
  
  // 立即显示答案
  answerShown.value[questionId] = true
}

// 多选题点击查看答案按钮
const checkAnswer = (questionId) => {
  answerShown.value[questionId] = true
}

// 触摸相关事件处理 - 参考自 CourseExamPage.vue
const onTouchStart = (event) => {
  if (event.touches.length !== 1) return
  
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
  touchMoveX.value = null // 重置为null表示未移动
  touchMoveY.value = null
}

const onTouchMove = (event) => {
  if (!touchStartX.value || event.touches.length !== 1) return
  
  touchMoveX.value = event.touches[0].clientX
  touchMoveY.value = event.touches[0].clientY
  
  const diffX = touchMoveX.value - touchStartX.value
  const diffY = touchMoveY.value - touchStartY.value
  
  // 如果是垂直滑动，则不处理
  if (Math.abs(diffY) > Math.abs(diffX)) return
  
  // 水平滑动距离太小，不处理
  if (Math.abs(diffX) < 10) return
  
  // 显示滑动方向提示
  swiping.value = true
  swipeDirection.value = diffX > 0 ? 'right' : 'left'
  
  // 添加阻尼效果，越往边缘，滑动越困难
  let dampenedDiff = diffX
  if ((currentIndex.value === 0 && diffX > 0) || 
      (currentIndex.value === questions.value.length - 1 && diffX < 0)) {
    dampenedDiff = diffX * 0.3  // 阻尼系数
  }
  
  swipeOffset.value = dampenedDiff
  
  // 阻止默认滚动行为
  event.preventDefault()
}

const onTouchEnd = () => {
  if (!touchStartX.value || touchMoveX.value === null) {
    resetSwipe()
    return // 无滑动时直接退出
  }
  
  swiping.value = false
  swipeDirection.value = null
  
  const minSwipeDistance = 80
  const diff = touchMoveX.value - touchStartX.value
  
  if (diff > minSwipeDistance && currentIndex.value > 0) {
    prevQuestion()
  } else if (diff < -minSwipeDistance && currentIndex.value < questions.value.length - 1) {
    nextQuestion()
  }
  
  resetSwipe()
}

// 恢复原位置
const resetSwipe = () => {
  swipeOffset.value = 0
  touchStartX.value = 0
  touchStartY.value = 0
  touchMoveX.value = 0
  touchMoveY.value = 0
}

// 导航到下一题
const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

// 导航到上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}



// 监听当前题目变化
watch(currentIndex, async () => {
  await nextTick()
  
  // 重置滑动状态
  resetSwipe()
  
  // 滚动到顶部
  if (swipeTarget.value) {
    swipeTarget.value.scrollTop = 0
  }
})

onMounted(() => {
  fetchQuestions()
  // 添加点击外部关闭下拉菜单的事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})

const isOptionCorrect = (questionId, optionLabel) => {
  const question = questions.value.find(q => q.id === questionId)
  if (!question) return false
  
  // 多选题的answer是字符串形式的选项组合（如"AB"）
  return question.answer.includes(optionLabel)
}
</script>

<style scoped>
/* 防止iOS橡皮筋效果 */
.overscroll-none {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* 更紧凑的选项布局 */
label {
  display: flex !important;
  align-items: flex-start !important;
  position: relative !important;
  padding: 0.75rem !important;
  border-radius: 0.5rem !important;
  transition: background-color 0.2s ease !important;
  min-height: 3rem !important;
}

/* 使图标靠右显示 */
label .text-green-500,
label .text-red-500 {
  position: absolute !important;
  right: 0.75rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* 选项文本样式 */
label span {
  padding-right: 2rem !important;
  flex: 1 !important;
  word-break: break-word !important;
}

/* 阻止浏览器默认小点 */
input[type="radio"]::-ms-check,
input[type="checkbox"]::-ms-check {
  display: none !important;
}

input[type="radio"]::-webkit-media-controls-panel,
input[type="checkbox"]::-webkit-media-controls-panel {
  display: none !important;
}

/* 确保内容容器覆盖整个区域，防止点击事件穿透 */
.content-container {
  height: 100%;
  position: relative;
  z-index: 5;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 滑动提示动画 */
@keyframes slideHint {
  0% { opacity: 0.6; transform: translateX(-2px); }
  50% { opacity: 1; transform: translateX(2px); }
  100% { opacity: 0.6; transform: translateX(-2px); }
}

.text-muted-foreground .w-4 {
  animation: slideHint 2s infinite alternate;
}

.text-muted-foreground .w-4:last-child {
  animation-delay: 1s;
}

/* 答案反馈卡片样式 */
.card.bg-accent\/10 {
  border: 1px solid hsl(var(--border));
  background: hsl(var(--accent) / 0.05);
}

/* 响应式优化 */
@media (max-width: 480px) {
  .grid-cols-5 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 


