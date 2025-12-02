<template>
  <div class="h-screen flex flex-col overscroll-none"
    ref="swipeTarget"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
  >
    <!-- 页面标题和题号导航 -->
    <div class="sticky top-0 bg-background z-50">
      <div class="p-4 border-b flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost p-2" @click="confirmExit">
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-bold">模拟考试</h1>
        </div>
        <!-- 考试计时器 -->
        <div class="px-3 py-1.5 bg-secondary/50 rounded-full flex items-center gap-1">
          <ClockIcon class="w-4 h-4 text-primary" />
          <span class="font-medium">
            {{ formatTime(examTime) }}
          </span>
        </div>
      </div>

      <!-- 题号导航 -->
      <div v-if="!loading && !error && questions.length > 0" class="border-b bg-background">
        <div class="p-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">
              <span class="text-primary font-medium">{{ currentIndex + 1 }}</span> / {{ questions.length }}
            </span>
            <!-- 题号跳转下拉框 -->
            <div class="relative" ref="jumpMenuContainer">
              <button 
                @click="toggleJumpMenu"
                class="btn btn-sm btn-secondary flex items-center gap-1 px-3 py-1 rounded-full"
              >
                <span class="font-medium">跳转题号</span>
                <ChevronDownIcon class="w-4 h-4" />
              </button>
              
              <!-- 跳转菜单 -->
              <div v-if="showJumpMenu" class="absolute right-0 mt-2 p-4 bg-card border rounded-lg shadow-lg z-10 w-72">
                <div class="text-sm font-medium mb-3 text-muted-foreground flex items-center">
                  <MapPinIcon class="w-4 h-4 mr-1" />
                  跳转到题号
                </div>
                <div class="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                  <button
                    v-for="(_, index) in questions" 
                    :key="index"
                    @click="jumpToQuestion(index)"
                    class="w-full h-10 flex items-center justify-center rounded text-sm font-medium transition-all"
                    :class="{
                      'bg-primary text-primary-foreground': currentIndex === index,
                      'hover:bg-secondary border': currentIndex !== index,
                      'bg-green-100 border-green-500 text-green-700': isQuestionAnswered(index) && currentIndex !== index
                    }"
                  >
                    {{ index + 1 }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center p-12">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-6">
        <XCircleIcon class="w-10 h-10 text-red-500 mb-3" />
        <p class="text-center text-red-500 text-sm">{{ error }}</p>
        <button class="btn btn-primary mt-3 text-sm" @click="fetchQuestions">重试</button>
      </div>

      <!-- 题目内容区域 -->
      <div v-else class="h-full overflow-y-auto pb-24">
        <div class="p-4">
          <div class="card p-4 space-y-6">
            <!-- 题目 -->
            <div class="space-y-4">
              <div class="flex justify-between">
                <div class="flex">
                  <span class="font-medium inline-block w-7 mt-0.5">{{ currentIndex + 1 }}.</span>
                  <div class="flex-1">
                    <div class="question-text">
                      {{ currentQuestion.question }}
                    </div>
                  </div>
                </div>
                <!-- 题型标签 -->
                <div class="flex items-start ml-2 flex-shrink-0">
                  <span class="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                    {{ getQuestionTypeLabel(currentQuestion.type) }}
                  </span>
                </div>
              </div>
              <div class="space-y-2">
                <label 
                  v-for="option in currentQuestion.options" 
                  :key="option.value || option.label"
                  class="block p-3 border rounded-lg cursor-pointer mb-3 transition-all hover:bg-accent/10 hover:border-primary relative"
                  :class="{ 'border-primary bg-primary/5': isOptionSelected(option.value || option.label) }"
                  @click="handleOptionClick(option.value || option.label)"
                >
                  <div class="flex items-center">
                    <!-- 选项前面的单选/多选按钮 -->
                    <div
                      class="w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center mr-3"
                      :class="{
                        'rounded-full': currentQuestion.type !== 'multiple', 
                        'custom-radio': true,
                        'with-dot': currentQuestion.type !== 'multiple',
                        'checked': isOptionSelected(option.value || option.label)
                      }"
                    ></div>
                    
                    <!-- 选项文本 -->
                    <div class="option-text">
                      <span class="font-medium mr-1">{{ option.label }}.</span>
                      <span>{{ option.text }}</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="sticky bottom-0 bg-background border-t p-4 z-10">
      <!-- 滑动提示 -->
      <div class="text-center text-xs text-muted-foreground mb-2 flex justify-center items-center">
        <ChevronLeftIcon class="w-4 h-4" />
        <span class="mx-1">左右滑动切换题目</span>
        <ChevronRightIcon class="w-4 h-4" />
      </div>
      <!-- 操作按钮 -->
      <div class="grid grid-cols-3 gap-2">
        <button 
          class="btn btn-outline text-nowrap"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          上一题
        </button>
        <button 
          class="btn bg-red-500 hover:bg-red-600 text-white text-nowrap"
          @click="showSubmitDialog = true"
        >
          交卷
        </button>
        <button 
          class="btn btn-outline text-nowrap"
          :disabled="currentIndex === questions.length - 1"
          @click="nextQuestion"
        >
          下一题
        </button>
      </div>
    </div>

    <!-- 确认交卷对话框 -->
    <div v-if="showSubmitDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-card p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">确认交卷</h3>
        <p class="mb-4">您确定要提交试卷吗？提交后将无法修改答案。</p>
        <div class="flex justify-end gap-4">
          <button class="btn btn-outline" @click="showSubmitDialog = false">取消</button>
          <button class="btn btn-primary" @click="submitExamAnswers">确认交卷</button>
        </div>
      </div>
    </div>
    
    <!-- 确认退出对话框 -->
    <div v-if="showExitDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-card p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">确认退出</h3>
        <p class="mb-4">退出后考试进度将不会保存，确定要退出吗？</p>
        <div class="flex justify-end gap-4">
          <button class="btn btn-outline" @click="showExitDialog = false">取消</button>
          <button class="btn btn-primary" @click="exitExam">确认退出</button>
        </div>
      </div>
    </div>

    <!-- 简易通知组件 -->
    <div 
      v-if="showNotification" 
      class="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md transition-all duration-300"
      :class="{
        'bg-amber-100 border-amber-300 text-amber-800': notification?.type === 'warning',
        'bg-red-100 border-red-300 text-red-800': notification?.type === 'error',
        'bg-green-100 border-green-300 text-green-800': notification?.type === 'success'
      }"
    >
      <div class="flex items-start">
        <div class="flex-1">
          <h4 class="font-bold mb-1">{{ notification?.title }}</h4>
          <p class="text-sm">{{ notification?.message }}</p>
        </div>
        <button 
          @click="showNotification = false"
          class="ml-4 p-1 rounded-full hover:bg-black/10"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ChevronLeftIcon, 
  LoaderIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CheckIcon,
  ChevronRightIcon,
  XIcon,
  ChevronDownIcon,
  MapPinIcon
} from 'lucide-vue-next'
import { useSwipe } from '@vueuse/core'
import { getExam, submitExam } from '@/api/exam'
import { getCourseDetail } from '@/api/course'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { onClickOutside } from '@vueuse/core'

const router = useRouter()
const route = useRoute()
const courseId = route.params.id
const courseName = ref('')

const loading = ref(false)
const error = ref('')
const examData = ref({})
const questions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const examTime = ref(0)
const showSubmitDialog = ref(false)
const showExitDialog = ref(false)
const timer = ref(null)
const startTime = ref(0)
const usedTime = ref(0)

// 添加通知状态
const notification = ref(null)
const showNotification = ref(false)

// 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || {}
})

// 是否是最后一题
const isLastQuestion = computed(() => {
  return currentIndex.value === questions.value.length - 1
})

// 获取考试题目
const fetchQuestions = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const courseId = route.params.id
    const response = await getCourseDetail(courseId)
    
    if (response.code === 200) {
      courseName.value = response.data.name || '未命名课程'
    }
    
    const res = await getExam(courseId)
    if (res.code === 200) {
      examData.value = res.data
      questions.value = res.data.questions || []
      
      startTime.value = Date.now()
      startTimer()
    } else {
      error.value = res.message || '获取考试题目失败'
    }
  } catch (err) {
    console.error('获取考试题目失败:', err)
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

// 处理选项点击
const handleOptionClick = (value) => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return
  
  // 判断是否为多选题
  if (currentQuestion.value.type === 'multiple') {
    // 获取当前多选题的答案数组
    const currentAnswers = userAnswers.value[currentQuestionId] || []
    const index = currentAnswers.indexOf(value)
    
    if (index === -1) {
      // 如果选项不在答案中，添加它
      currentAnswers.push(value)
    } else {
      // 如果选项已在答案中，移除它
      currentAnswers.splice(index, 1)
    }
    
    userAnswers.value[currentQuestionId] = currentAnswers
  } else {
    // 单选题或判断题，直接设置答案
    userAnswers.value[currentQuestionId] = value
  }
}

// 检查选项是否被选中
const isOptionSelected = (value) => {
  const currentQuestionId = currentQuestion.value?.id
  if (!currentQuestionId) return false
  
  // 针对多选题的情况
  if (currentQuestion.value.type === 'multiple') {
    const answer = userAnswers.value[currentQuestionId]
    return Array.isArray(answer) && answer.includes(value)
  }
  
  // 针对单选题和判断题
  return userAnswers.value[currentQuestionId] === value
}

// 检查题目是否已答
const isQuestionAnswered = (index) => {
  const question = questions.value[index]
  if (!question) return false
  
  const answer = userAnswers.value[question.id]
  if (question.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0
  }
  
  return !!answer
}

// 获取题型标签
const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题'
  }
  return typeMap[type] || '未知题型'
}

// 跳转到指定题目
const jumpToQuestion = (index) => {
  if (index >= 0 && index < questions.value.length) {
    currentIndex.value = index
    showJumpMenu.value = false
  }
}

// 下一题
const nextQuestion = () => {
  // 直接进入下一题，不再处理交卷逻辑
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 开始计时
const startTimer = () => {
  // 设置初始时间
  examTime.value = examData.value.duration * 60 || 7200 // 默认120分钟
  
  // 开始倒计时
  timer.value = setInterval(() => {
    if (examTime.value > 0) {
      examTime.value--
    } else {
      // 时间到，自动交卷
      clearInterval(timer.value)
      submitExamAnswers()
    }
  }, 1000)
}

// 计算考试结果详情
const calculateExamDetails = () => {
  // 记录总用时（秒）
  usedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  
  // 初始化计数器
  let correctCount = 0
  let wrongCount = 0
  let unansweredCount = 0
  
  // 遍历所有题目
  questions.value.forEach(question => {
    const userAnswer = userAnswers.value[question.id]
    
    // 未答题
    if (!userAnswer) {
      unansweredCount++
      return
    }
    
    // 获取正确答案
    const correctAnswer = question.answer
    
    // 比较答案
    let isCorrect = false
    if (question.type === 'multiple') {
      // 多选题：用户答案需要完全匹配
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      const correctAnswerStr = typeof correctAnswer === 'string' ? correctAnswer.split('').sort().join('') : ''
      isCorrect = userAnswerStr === correctAnswerStr
    } else {
      // 单选题和判断题
      isCorrect = userAnswer === correctAnswer
    }
    
    // 统计正确和错误的题目
    if (isCorrect) {
      correctCount++
    } else {
      wrongCount++
    }
  })
  
  return {
    totalQuestions: questions.value.length,
    correctCount,
    wrongCount,
    unansweredCount,
    examDuration: usedTime.value,
    courseName: courseName.value
  }
}

// 本地计算成绩
const calculateLocalScore = () => {
  let totalScore = 0
  let earnedScore = 0
  
  // 遍历所有题目
  questions.value.forEach(question => {
    const questionScore = question.score || 0
    totalScore += questionScore
    
    // 获取用户答案
    const userAnswer = userAnswers.value[question.id]
    if (!userAnswer) return
    
    // 获取正确答案
    const correctAnswer = question.answer
    
    // 比较答案
    let isCorrect = false
    if (question.type === 'multiple') {
      // 多选题：用户答案需要完全匹配
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      const correctAnswerStr = typeof correctAnswer === 'string' ? correctAnswer.split('').sort().join('') : ''
      isCorrect = userAnswerStr === correctAnswerStr
    } else {
      // 单选题和判断题
      isCorrect = userAnswer === correctAnswer
    }
    
    // 如果答案正确，加分
    if (isCorrect) {
      earnedScore += questionScore
    }
  })
  
  // 计算最终得分（四舍五入到整数）
  return Math.round((earnedScore / totalScore) * examData.value.total_score || 0)
}

// 收集错题ID
const collectWrongQuestionIds = () => {
  const wrongQuestionIds = []
  
  // 遍历所有题目
  questions.value.forEach(question => {
    // 获取用户答案
    const userAnswer = userAnswers.value[question.id]
    
    if (!userAnswer) {
      return // 跳过未回答的题目
    }
    
    // 获取正确答案
    const correctAnswer = question.answer
    
    // 比较答案
    let isCorrect = false
    if (question.type === 'multiple') {
      // 多选题：用户答案需要完全匹配
      const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.sort().join('') : userAnswer
      const correctAnswerStr = typeof correctAnswer === 'string' ? correctAnswer.split('').sort().join('') : ''
      isCorrect = userAnswerStr === correctAnswerStr
    } else {
      // 单选题和判断题
      isCorrect = userAnswer === correctAnswer
    }
    
    // 如果答案错误，添加到错题ID列表
    if (!isCorrect) {
      wrongQuestionIds.push(question.id)
    }
  })
  
  return wrongQuestionIds
}

// 提交考试答案
const submitExamAnswers = async () => {
  loading.value = true
  showSubmitDialog.value = false
  
  // 计算本地成绩
  const localScore = calculateLocalScore()
  
  // 计算详细的考试统计信息
  const examDetails = calculateExamDetails()
  
  // 收集错题ID
  const wrongQuestionIds = collectWrongQuestionIds()
  
  // 判断是否通过考试
  const isPassed = localScore >= (examData.value.pass_score || 60)
  
  // 延迟跳转的函数
  const delayedRedirect = (result) => {
    // 延迟3秒再跳转，确保通知显示足够时间
    setTimeout(() => {
      localStorage.setItem('lastExamResult', JSON.stringify(result))
      router.push('/exam-result')
    }, 3000)
  }
  
  try {
    // 根据接口文档构建请求数据
    const requestData = {
      user_id: localStorage.getItem('userId') || 0, // 从localStorage获取userId，如果没有则默认为0
      course_id: Number(courseId),
      score: localScore,
      wrong_answers: wrongQuestionIds // 直接使用收集的错题ID
    }
    
    const res = await submitExam(courseId, requestData)
    if (res.code === 200) {
      // 清除计时器
      clearInterval(timer.value)
      
      // 保存考试结果到 localStorage
      const examResult = {
        score: res.data.score || 0,
        totalScore: examData.value.total_score || 100,
        passScore: examData.value.pass_score || 60,
        courseId,
        examTime: new Date().toISOString(),
        totalQuestions: examDetails.totalQuestions,
        correctCount: examDetails.correctCount,
        wrongCount: examDetails.wrongCount,
        unansweredCount: examDetails.unansweredCount,
        answeredQuestions: Object.keys(userAnswers.value).length,
        timeUsed: examDetails.examDuration,
        courseName: examDetails.courseName,
        passed: isPassed,
        wrongQuestionIds: wrongQuestionIds
      }
      
      // 成功情况下立即跳转
      localStorage.setItem('lastExamResult', JSON.stringify(examResult))
      router.push('/exam-result')
    } else {
      // 使用本地计算的成绩
      console.error('提交答案失败:', res.message)
      showToast('提交失败', '提交答案到服务器失败，但您仍然可以查看成绩', 'warning')
      
      // 保存本地计算的考试结果到 localStorage
      const examResult = {
        score: localScore,
        totalScore: examData.value.total_score || 100,
        passScore: examData.value.pass_score || 60,
        courseId,
        examTime: new Date().toISOString(),
        totalQuestions: examDetails.totalQuestions,
        correctCount: examDetails.correctCount,
        wrongCount: examDetails.wrongCount,
        unansweredCount: examDetails.unansweredCount,
        answeredQuestions: Object.keys(userAnswers.value).length,
        timeUsed: examDetails.examDuration,
        courseName: examDetails.courseName,
        passed: isPassed,
        isLocalScore: true,  // 标记这是本地计算的分数
        wrongQuestionIds: wrongQuestionIds
      }
      
      // 延迟跳转，确保用户能看到通知
      delayedRedirect(examResult)
    }
  } catch (err) {
    // 使用本地计算的成绩
    console.error('提交考试失败:', err)
    showToast('提交失败', '网络错误，无法提交答案，但您仍然可以查看成绩', 'error')
    
    // 保存本地计算的考试结果到 localStorage，并标记网络错误
    const examResult = {
      score: localScore,
      totalScore: examData.value.total_score || 100,
      passScore: examData.value.pass_score || 60,
      courseId,
      examTime: new Date().toISOString(),
      totalQuestions: examDetails.totalQuestions,
      correctCount: examDetails.correctCount,
      wrongCount: examDetails.wrongCount,
      unansweredCount: examDetails.unansweredCount,
      answeredQuestions: Object.keys(userAnswers.value).length,
      timeUsed: examDetails.examDuration,
      courseName: examDetails.courseName,
      passed: isPassed,
      isLocalScore: true,
      networkError: true,
      wrongQuestionIds: wrongQuestionIds
    }
    
    // 延迟跳转，确保用户能看到通知
    delayedRedirect(examResult)
  } finally {
    loading.value = false
    // 清除计时器
    clearInterval(timer.value)
  }
}

// 确认退出
const confirmExit = () => {
  showExitDialog.value = true
}

// 退出考试
const exitExam = () => {
  // 清除计时器
  clearInterval(timer.value)
  
  // 返回上一页
  router.back()
}

// 添加滑动功能
const swipeTarget = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isHorizontalSwipe = ref(false)

const onTouchStart = (e) => {
  // 记录开始触摸的位置
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isHorizontalSwipe.value = false
}

// 处理触摸移动事件
const onTouchMove = (e) => {
  if (!touchStartX.value || !touchStartY.value) return
  
  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value)
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
  
  // 如果水平移动距离大于垂直移动距离，判定为水平滑动
  if (deltaX > deltaY && deltaX > 10) {
    isHorizontalSwipe.value = true
    // 阻止默认滚动行为
    e.preventDefault()
  }
}

// 使用vueuse的useSwipe钩子实现滑动导航
const { direction } = useSwipe(swipeTarget, {
  onSwipeEnd(e, direction) {
    // 只有当识别为水平滑动时才切换题目
    if (!isHorizontalSwipe.value) return
    
    if (direction === 'left') {
      // 向左滑动，下一题
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value++
      }
    } else if (direction === 'right') {
      // 向右滑动，上一题
      if (currentIndex.value > 0) {
        currentIndex.value--
      }
    }
    
    // 重置滑动状态
    isHorizontalSwipe.value = false
  }
})

// 显示通知函数
const showToast = (title, message, type = 'warning') => {
  notification.value = {
    title,
    message,
    type
  }
  showNotification.value = true
  
  // 5秒后自动关闭
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

// 题号跳转下拉框
const jumpMenuContainer = ref(null)
const showJumpMenu = ref(false)
const toggleJumpMenu = () => {
  showJumpMenu.value = !showJumpMenu.value
}

// 点击菜单外部关闭菜单
onClickOutside(jumpMenuContainer, () => {
  showJumpMenu.value = false
})

onMounted(() => {
  fetchQuestions()
})
</script>

<style scoped>
/* 优化选项样式 */
.option-text {
  word-break: break-word;
  overflow-wrap: break-word;
  display: inline;
  flex-wrap: wrap;
  flex: 1;
  align-items: center;
  padding-right: 8px;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
}

/* 题目文本样式 */
.question-text {
  font-size: 17px;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* 题号跳转按钮样式 */
.grid-cols-5 button {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.grid-cols-5 button:hover {
  transform: translateY(-2px);
}

.grid-cols-5 button:active {
  transform: translateY(0);
}

/* 移动设备适配 */
@media (max-width: 640px) {
  .grid-cols-5 {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 480px) {
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

.text-muted-foreground .w-4:not(.mr-1) {
  animation: slideHint 2s infinite alternate;
}

.text-muted-foreground .w-4:last-child:not(.mr-1) {
  animation-delay: 1s;
}

/* 添加滑动过渡动画 */
.card {
  transition: all 0.3s ease;
}

/* 添加滑动状态样式 */
.card.swiping {
  transform: scale(0.98);
  opacity: 0.8;
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
  width: 1.25rem !important;
  height: 1.25rem !important;
  border: 2px solid var(--border) !important;
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
  width: 0.5rem !important;
  height: 0.5rem !important;
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
  width: 0.25rem !important;
  height: 0.5rem !important;
  border-right: 2px solid white !important;
  border-bottom: 2px solid white !important;
  background-color: transparent !important;
}

/* 修复选项布局，确保文字不被遮挡 */
label {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  padding: 0.75rem 1rem !important;
  border-radius: 0.5rem !important;
  transition: background-color 0.2s ease !important;
}

/* 使图标靠右显示 */
label .text-green-500,
label .text-red-500 {
  position: absolute !important;
  right: 1rem !important;
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
</style> 