<template>
  <div class="h-screen flex flex-col overscroll-none"
    ref="swipeTarget"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    :data-question-type="questionType.id"
  >
    <!-- 标题 -->
    <header class="sticky top-0 bg-background z-50">
      <div class="p-3 border-b flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost p-1" @click="router.back()">
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <h1 class="text-lg font-bold">{{ questionType.name }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <template v-if="questions.length > 0">
            <!-- 题号跳转下拉框 -->
            <div class="relative" ref="jumpMenuContainer">
              <button 
                @click="toggleJumpMenu"
                class="btn btn-sm btn-secondary flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              >
                <span class="font-medium">{{ currentIndex + 1 }}/{{ questions.length }}</span>
                <ChevronDownIcon class="w-3 h-3" />
              </button>
              
              <!-- 跳转菜单 -->
              <div v-if="showJumpMenu" class="absolute right-0 mt-1 p-2 bg-card border rounded-lg shadow-lg z-10 w-64">
                <div class="text-xs font-medium mb-2 text-muted-foreground flex items-center">
                  <MapPinIcon class="w-3 h-3 mr-1" />
                  跳转到题号
                </div>
                <div class="grid grid-cols-5 gap-1 max-h-64 overflow-y-auto">
                  <button
                    v-for="(_, index) in questions" 
                    :key="index"
                    @click="jumpToQuestion(index)"
                    class="w-full h-8 flex items-center justify-center rounded text-xs font-medium transition-all"
                    :class="{
                      'bg-primary text-primary-foreground': currentIndex === index,
                      'hover:bg-secondary border': currentIndex !== index
                    }"
                  >
                    {{ index + 1 }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1 overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center p-8">
        <LoaderIcon class="w-6 h-6 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-6">
        <XCircleIcon class="w-10 h-10 text-red-500 mb-3" />
        <p class="text-center text-red-500 text-sm">{{ error }}</p>
        <button class="btn btn-primary mt-3 text-sm" @click="fetchQuestions">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="questions.length === 0 && !loading" class="flex flex-col items-center justify-center p-6">
        <BookXIcon class="w-12 h-12 text-muted-foreground mb-3" />
        <p class="text-muted-foreground text-sm">该题型暂无练习题</p>
      </div>

      <!-- 题目内容区域 -->
      <div v-else class="h-full overflow-y-auto pb-36">
        <div class="p-3">
          <div class="card p-3 space-y-4">
            <!-- 题目 -->
            <div class="space-y-3">
              <div class="flex">
                <span class="font-medium inline-block w-6 mt-0.5 text-sm">{{ currentIndex + 1 }}.</span>
                <div class="flex-1">
                  <div class="question-text text-sm">
                    {{ currentQuestion.question }}
                  </div>
                </div>
              </div>
              <div class="space-y-1">
                <label 
                  v-for="option in currentQuestion.options" 
                  :key="option.value"
                  class="block p-2 border rounded-lg cursor-pointer mb-2 transition-all hover:bg-accent/10 hover:border-primary relative"
                  :class="{
                    'border-primary bg-primary/5': isOptionSelected(option.value) && 
                      (questionType.id === 2 ? !showAnswer : (!showAnswerFeedback && !showAnswer)),
                    'border-green-500 bg-green-50 dark:bg-green-900/30': isCorrectOption(option.value) && (showAnswerFeedback || showAnswer),
                    'border-red-500 bg-red-50 dark:bg-red-900/30': isSelectedWrongOption(option.value) && (showAnswerFeedback || showAnswer)
                  }"
                  @click="handleOptionClick(option.value)"
                >
                  <div class="flex items-center">
                    <!-- 选项前面的单选/多选按钮 -->
                    <div
                      class="w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center mr-2"
                      :class="{
                        'rounded-full': true, 
                        'custom-radio': true,
                        'with-dot': questionType.id !== 2,  // 只对单选题和判断题使用带点样式
                        'checked': isOptionSelected(option.value)
                      }"
                    ></div>
                    
                    <!-- 选项文本 -->
                    <div class="option-text text-sm">
                      <span v-if="option.label" class="font-medium">{{ option.label }}.</span>
                      <span>{{ option.text }}</span>
                    </div>
                    
                    <!-- 正确/错误图标 -->
                    <CheckCircle2Icon 
                      v-if="(showAnswerFeedback || showAnswer) && isCorrectOption(option.value)" 
                      class="w-4 h-4 text-green-500 ml-auto flex-shrink-0" 
                    />
                    <XCircleIcon 
                      v-if="(showAnswerFeedback || showAnswer) && isSelectedWrongOption(option.value)" 
                      class="w-4 h-4 text-red-500 ml-auto flex-shrink-0" 
                    />
                  </div>
                </label>
              </div>
            </div>

            <!-- 题目解析 -->
            <div v-if="(questionType.id === 2 && showAnswer) || (questionType.id !== 2 && (showAnswer || showAnswerFeedback))" class="space-y-3">
              <!-- 答案区块 -->
              <div class="p-3 grid rounded-lg border bg-secondary/50">
                <h3 class="font-medium mb-1 text-sm">
                  <span v-if="isUserAnswerCorrect()" class="text-green-600">恭喜您回答正确</span>
                  <span v-else class="text-red-600">您的回答有误</span>
                </h3>
                <p class="text-muted-foreground text-sm">
                  参考答案是：{{ currentQuestion.answer }}
                </p>
              </div>
              
              <!-- 解析区块 -->
              <div v-if="currentQuestion.explanation" class="p-3 grid rounded-lg border bg-secondary/50">
                <h3 class="font-medium mb-1 text-sm">解析</h3>
                <p class="text-muted-foreground text-sm">{{ currentQuestion.explanation }}</p>
              </div>
              
              <!-- 错题反馈按钮 -->
              <div class="flex justify-end mt-2">
                <button 
                  @click="openFeedbackDialog"
                  class="btn btn-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 text-xs shadow-sm"
                >
                  <FlagIcon class="w-4 h-4" />
                  <span>反馈题目问题</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部操作栏 -->
    <footer class="sticky bottom-0 bg-card border-t p-3 z-10">
      <!-- 滑动提示 -->
      <div class="flex items-center justify-center mb-2 text-xs text-muted-foreground">
        <ChevronLeftIcon class="w-3 h-3" />
        <span class="mx-1">左右滑动可切换题目</span>
        <ChevronRightIcon class="w-3 h-3" />
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <button 
          class="btn btn-outline w-full text-sm py-1"
          @click="prevQuestion"
          :disabled="currentIndex === 0"
        >
          上一题
        </button>
        
        <button 
          class="btn btn-primary w-full text-sm py-1"
          @click="nextQuestion"
        >
          {{ hasNext ? '下一题' : '完成' }}
        </button>
        
        <!-- 多选题的查看答案按钮 -->
        <div v-if="questionType.id === 2" class="col-span-2 mt-2">
          <button 
            class="btn btn-secondary w-full text-sm py-1"
            @click="checkAnswer"
            :disabled="showAnswer"
          >
            {{ showAnswer ? '已显示答案' : '查看答案' }}
          </button>
        </div>
      </div>
    </footer>
    
    <!-- 错题反馈对话框 -->
    <div v-if="showFeedbackDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">题目反馈</h3>
          <button @click="closeFeedbackDialog" class="text-muted-foreground hover:text-foreground">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div v-if="!feedbackSuccess">
          <p class="text-sm text-muted-foreground mb-4">
            请描述您发现的问题，我们会尽快处理
          </p>
          
          <div class="mb-4">
            <textarea
              v-model="feedbackContent"
              class="w-full border rounded-md p-3 min-h-[100px] bg-background"
              placeholder="例如：题目描述不清晰、答案有误等"
            ></textarea>
          </div>
          
          <div class="flex justify-end gap-2">
            <button 
              class="btn btn-outline"
              @click="closeFeedbackDialog"
              :disabled="submittingFeedback"
            >
              取消
            </button>
            <button 
              class="btn btn-primary"
              @click="submitQuestionFeedback"
              :disabled="submittingFeedback || !feedbackContent.trim()"
            >
              <LoaderIcon v-if="submittingFeedback" class="w-4 h-4 mr-2 animate-spin" />
              提交
            </button>
          </div>
          
          <div v-if="feedbackError" class="mt-3 text-sm text-red-500">
            {{ feedbackError }}
          </div>
        </div>
        
        <div v-else class="text-center">
          <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 class="text-lg font-medium text-foreground mb-2">提交成功</h3>
          <p class="text-muted-foreground mb-6">感谢您的反馈，我们会尽快处理</p>
          <button 
            class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            @click="closeFeedbackDialog"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChevronLeftIcon, 
  LoaderIcon, 
  XCircleIcon, 
  BookXIcon, 
  CheckCircle2Icon, 
  ChevronDownIcon,
  ChevronRightIcon,
  MapPinIcon,
  FlagIcon,
  CheckCircleIcon,
  XIcon
} from 'lucide-vue-next'
import { useSwipe } from '@vueuse/core'
import { getCourseQuestions } from '@/api/question'
import { submitFeedback } from '@/api/user'

const router = useRouter()
const route = useRoute()

const questionTypeMap = {
  '1': { id: 1, name: '单选题', type: 'single' },
  '2': { id: 2, name: '多选题', type: 'multiple' },
  '3': { id: 3, name: '判断题', type: 'judge' }
}

// 获取路由参数中的题型ID
const typeId = route.params.typeId
const questionType = questionTypeMap[typeId] || { id: 1, name: '单选题', type: 'single' }

const loading = ref(false)
const error = ref('')
const currentIndex = ref(0)
const questions = ref([])
const userAnswers = ref({}) // 使用对象存储所有题目的答案
const showAnswer = ref(false)
const showAnswerFeedback = ref(false)
const lastSelectedOption = ref(null)
const showJumpMenu = ref(false)
const showFeedbackDialog = ref(false)
const feedbackContent = ref('')
const submittingFeedback = ref(false)
const feedbackSuccess = ref(false)
const feedbackError = ref('')

// 多选题需要使用数组存储选择的答案
const initUserAnswer = () => {
  return questionType.id === 2 ? [] : ''
}

// 是否已答题
const hasUserAnswered = computed(() => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return false
  
  const answer = userAnswers.value[currentQuestionId]
  if (questionType.id === 2) {
    return Array.isArray(answer) && answer.length > 0
  }
  return !!answer
})

// 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || {}
})

// 是否有下一题
const hasNext = computed(() => {
  return currentIndex.value < questions.value.length - 1
})

// 检查选项是否被选中
const isOptionSelected = (value) => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return false
  
  const answer = userAnswers.value[currentQuestionId]
  if (questionType.id === 2) {
    return Array.isArray(answer) && answer.includes(value)
  }
  return answer === value
}

// 判断选项是否为正确答案
const isCorrectOption = (value) => {
  const correctAnswer = currentQuestion.value?.answer
  if (!correctAnswer) return false
  
  // 处理多选题答案
  if (questionType.id === 2) {
    // 从选项中获取当前选项的标签(label)
    const option = currentQuestion.value.options.find(opt => opt.value === value)
    if (!option || !option.label) return false

    // 检查选项的label是否在答案字符串中
    return correctAnswer.includes(option.label)
  }
  
  // 处理单选题和判断题答案
  return correctAnswer === value
}

// 判断是否为用户选择的错误选项
const isSelectedWrongOption = (value) => {
  // 首先确认这个选项是被用户选中的
  if (!isOptionSelected(value)) return false
  
  // 检查是否是错误答案
  return !isCorrectOption(value)
}

// 处理选项点击
const handleOptionClick = (value) => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return
  
  if (questionType.id === 2) {
    // 多选题逻辑
    const currentAnswers = userAnswers.value[currentQuestionId] || []
    const index = currentAnswers.indexOf(value)
    if (index === -1) {
      currentAnswers.push(value)
    } else {
      currentAnswers.splice(index, 1)
    }
    userAnswers.value[currentQuestionId] = [...currentAnswers] // 强制触发响应式更新
  } else {
    // 单选题或判断题，直接更新答案并显示反馈
    userAnswers.value[currentQuestionId] = value
    lastSelectedOption.value = value
    showAnswer.value = true
    showAnswerFeedback.value = true
  }
}

// 判断用户当前答案是否正确
const isUserAnswerCorrect = () => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId || !userAnswers.value[currentQuestionId]) return false
  
  const userAnswer = userAnswers.value[currentQuestionId]
  const correctAnswer = currentQuestion.value.answer
  
  // 处理多选题的情况
  if (questionType.id === 2) {
    // 获取用户选择的所有选项的label
    const selectedLabels = Array.isArray(userAnswer) 
      ? userAnswer.map(value => {
          const option = currentQuestion.value.options.find(opt => opt.value === value)
          return option ? option.label : ''
        }).filter(label => label)
      : []
    
    // 将用户选择的标签合并成一个字符串
    const userAnswerString = selectedLabels.sort().join('')
    
    // 正确答案字符串
    const correctAnswerString = correctAnswer.split('').sort().join('')
    
    // 用户答案字符串必须与正确答案字符串完全匹配
    return userAnswerString === correctAnswerString
  }
  
  // 单选题或判断题直接比较
  // 对于单选题和判断题，需要比较value和answer
  // 注意：单选题和判断题的answer可能是选项的label值
  if (userAnswer === correctAnswer) return true
  
  // 尝试根据label匹配
  const selectedOption = currentQuestion.value.options.find(opt => opt.value === userAnswer)
  return selectedOption && selectedOption.label === correctAnswer
}

const swipeTarget = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isHorizontalSwipe = ref(false)

// 滑动切换处理
const { direction } = useSwipe(swipeTarget, {
  onSwipeEnd(e, direction) {
    if (!isHorizontalSwipe.value) return
    
    if (direction === 'left') {
      nextQuestion()
    } else if (direction === 'right') {
      prevQuestion()
    }
    
    isHorizontalSwipe.value = false
  }
})

const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isHorizontalSwipe.value = false
}

const onTouchMove = (e) => {
  if (!touchStartX.value || !touchStartY.value) return
  
  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value)
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
  
  if (deltaX > deltaY && deltaX > 10) {
    isHorizontalSwipe.value = true
    e.preventDefault()
  }
}

// 获取题目数据
const fetchQuestions = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const courseId = route.params.id
    const response = await getCourseQuestions(courseId, questionType.type)
    
    if (response.code === 200) {
      // 处理API返回的数据
      const filteredData = response.data.filter(q => 
        q.question && q.options && q.options.length > 0
      )
      
      questions.value = filteredData.map(item => {
        // 确保选项具有label属性
        const processedOptions = item.options.map((opt, index) => {
          const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
          return { 
            value: opt.value || opt.label, 
            text: opt.text,
            label: opt.label || labels[index]
          }
        })
        
        return {
          id: item.id,
          question: item.question,
          options: processedOptions,
          answer: item.answer,
          explanation: item.explanation
        }
      })
      
      // 重置答题状态
      currentIndex.value = 0
      userAnswers.value = {} 
      showAnswer.value = false
      showAnswerFeedback.value = false
    } else {
      error.value = response.msg || '获取题目失败'
    }
  } catch (err) {
    console.error('获取题目失败:', err)
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

// 格式化答案显示
const formatAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.join('、')
  }
  return answer
}

const checkAnswer = () => {
  showAnswer.value = true
  showAnswerFeedback.value = true
}

const nextQuestion = () => {
  if (hasNext.value) {
    currentIndex.value++
    // 对所有题型，在切换题目时重置状态
    showAnswer.value = false
    showAnswerFeedback.value = false
    lastSelectedOption.value = null
  } else {
    // 完成练习，返回题型选择页面
    router.back()
  }
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showAnswer.value = false
  }
}

const getAnswerText = () => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return ''
  
  const answer = userAnswers.value[currentQuestionId]
  if (questionType.id === 2) {
    return answer.map(value => currentQuestion.value.options.find(o => o.value === value)?.text).join('、')
  }
  return currentQuestion.value.options.find(o => o.value === answer)?.text || ''
}

watch(showAnswer, (newValue) => {
  if (newValue) {
    showAnswerFeedback.value = false
    
    // 如果用户之前未选择任何选项，自动选择正确答案
    if (!userAnswers.value[currentQuestion.value.id]) {
      userAnswers.value[currentQuestion.value.id] = currentQuestion.value.answer
    }
  }
})

// 每次题目变化时重置状态
watch(currentIndex, () => {
  showAnswer.value = false
  showAnswerFeedback.value = false
  lastSelectedOption.value = null
})

watch(() => currentQuestion.value?.id, (newId) => {
  if (newId) {
    // 确保新题目的答案状态正确初始化
    if (!userAnswers.value[newId]) {
      if (questionType.id === 2) {
        userAnswers.value[newId] = []
      } else {
        userAnswers.value[newId] = null
      }
    }
  }
}, { immediate: true })

const jumpMenuContainer = ref(null)

// 切换跳转菜单的显示状态
const toggleJumpMenu = (e) => {
  // 阻止事件冒泡，防止立即被关闭
  e.stopPropagation()
  showJumpMenu.value = !showJumpMenu.value 
}

// 修改关闭跳转菜单的逻辑
const closeJumpMenu = (event) => {
  // 只有当菜单打开且点击的不是菜单或其子元素时才关闭
  if (showJumpMenu.value && jumpMenuContainer.value && !jumpMenuContainer.value.contains(event.target)) {
    showJumpMenu.value = false
  }
}

// 跳转方法需要阻止事件冒泡
const jumpToQuestion = (index) => {
  // 先关闭跳转菜单，再跳转到指定题目
  showJumpMenu.value = false
  
  if (index >= 0 && index < questions.value.length) {
    currentIndex.value = index
    showAnswer.value = false
    showAnswerFeedback.value = false
    lastSelectedOption.value = null
  }
}

onMounted(() => {
  fetchQuestions()
  document.addEventListener('click', closeJumpMenu)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', closeJumpMenu)
})

const openFeedbackDialog = () => {
  showFeedbackDialog.value = true
  feedbackContent.value = ''
  feedbackSuccess.value = false
  feedbackError.value = ''
}

const closeFeedbackDialog = () => {
  showFeedbackDialog.value = false
  // 如果成功提交后，重置状态
  if (feedbackSuccess.value) {
    feedbackSuccess.value = false
  }
}

const submitQuestionFeedback = async () => {
  if (!feedbackContent.value.trim()) return
  
  try {
    submittingFeedback.value = true
    feedbackError.value = ''
    
    // 构建反馈内容
    const questionId = currentQuestion.value.id
    const questionText = currentQuestion.value.question
    const feedbackText = `错题反馈：[ID: ${questionId}] - ${questionText}\n\n反馈内容：${feedbackContent.value.trim()}`
    
    // 调用API提交反馈
    const response = await submitFeedback(feedbackText)
    
    if (response.code === 200) {
      feedbackSuccess.value = true
    } else {
      throw new Error(response.msg || '提交反馈失败')
    }
  } catch (err) {
    console.error('提交反馈失败:', err)
    feedbackError.value = err.message || '提交失败，请重试'
  } finally {
    submittingFeedback.value = false
  }
}
</script>

<style scoped>
/* 添加滑动过渡动画 */
.card {
  transition: all 0.3s ease;
}

/* 添加滑动状态样式 */
.card.swiping {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 确保题目序号和文字对齐 */
.font-medium.w-6 {
  line-height: 1.5;
}

/* 修复选项文字自动换行 */
label {
  width: 100%;
}

.option-text {
  word-break: break-word;
  overflow-wrap: break-word;
  display: inline;
}

/* 判断题选项样式调整 */
[data-question-type="3"] .option-text {
  min-width: 50px;
}

/* 自定义单选框和复选框容器 */
.custom-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  min-height: 20px;
  flex-shrink: 0;
}

/* 自定义单选框和复选框 */
.custom-radio {
  border-radius: 50%;
}

.custom-checkbox {
  border-radius: 4px;
}

.custom-radio.checked {
  border-color: hsl(var(--primary));
  background-color: hsl(var(--primary));
}

.custom-checkbox.checked {
  border-color: hsl(var(--primary));
  background-color: hsl(var(--primary));
}

/* 只对带有with-dot类的元素显示白点 */
.custom-radio.with-dot.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
}

/* 加大选项文字的大小 */
.option-text {
  font-size: 14px;
  line-height: 1.4;
}

/* 题目文本样式 */
.question-text {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 12px;
}

/* 添加跳转菜单样式 */
.grid-cols-5 button {
  transition: all 0.2s ease;
}

/* 美化题号按钮样式 */
.grid-cols-5 button {
  position: relative;
  overflow: hidden;
}

.grid-cols-5 button:hover {
  transform: translateY(-2px);
}

.grid-cols-5 button:active {
  transform: translateY(0);
}

/* 当前题号高亮效果 */
.grid-cols-5 button.bg-primary {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 确保跳转菜单在移动设备上也能正常工作 */
@media (max-width: 640px) {
  .grid-cols-5 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 修改滑动提示动画，移除 MapPinIcon 的动画 */
@keyframes slideHint {
  0% { opacity: 0.7; transform: translateX(-3px); }
  50% { opacity: 1; transform: translateX(3px); }
  100% { opacity: 0.7; transform: translateX(-3px); }
}

.text-muted-foreground .w-3:not(.mr-1) {
  animation: slideHint 2s infinite alternate;
}

.text-muted-foreground .w-3:last-child:not(.mr-1) {
  animation-delay: 1s;
}

/* 防止页面滚动 */
.overscroll-none {
  overscroll-behavior: none;
}

/* 卡片内容可滚动但不影响整体 */
.card {
  overscroll-behavior: contain;
}

/* 修复选项样式，防止白色小点遮盖文字 */
input[type="radio"],
input[type="checkbox"] {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  width: 1rem !important;
  height: 1rem !important;
  border: 1.5px solid var(--border) !important;
  border-radius: 50% !important;
  outline: none !important;
  margin-right: 0.5rem !important;
  position: relative !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

input[type="checkbox"] {
  border-radius: 4px !important;
}

input[type="radio"]:checked,
input[type="checkbox"]:checked {
  border-color: var(--primary) !important;
  background-color: var(--primary) !important;
}

input[type="radio"]:checked::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 0.4rem !important;
  height: 0.4rem !important;
  border-radius: 50% !important;
  background-color: white !important;
  box-shadow: none !important;
}

input[type="checkbox"]:checked::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) rotate(45deg) !important;
  width: 0.2rem !important;
  height: 0.4rem !important;
  border-right: 1.5px solid white !important;
  border-bottom: 1.5px solid white !important;
  background-color: transparent !important;
}

/* 修复选项布局，确保文字不被遮挡 */
label {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  padding: 0.5rem 0.75rem !important;
  border-radius: 0.5rem !important;
  transition: background-color 0.2s ease !important;
}

/* 使图标靠右显示 */
label .text-green-500,
label .text-red-500 {
  position: absolute !important;
  right: 0.75rem !important;
  margin-left: 0 !important;
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

/* 确保标题栏固定 */
header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
}

/* 修改选项样式，确保背景色变化立即生效 */
label {
  transition: all 0.2s ease !important;
}

label:hover {
  background-color: hsl(var(--accent) / 0.1);
}

label.selected {
  background-color: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
}

label.correct {
  background-color: hsl(var(--success) / 0.1);
  border-color: hsl(var(--success));
}

label.incorrect {
  background-color: hsl(var(--destructive) / 0.1);
  border-color: hsl(var(--destructive));
}
</style> 