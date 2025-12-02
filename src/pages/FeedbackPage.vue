<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部导航 -->
    <div class="p-4 border-b flex items-center gap-2">
      <button class="btn btn-ghost p-2" @click="goBack">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-bold">用户反馈</h1>
    </div>

    <!-- 主要内容 -->
    <div class="flex-1 overflow-y-auto p-4 pb-20" ref="contentRef">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-40">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-40 p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="loadFeedbackList">重试</button>
      </div>
      
      <!-- 反馈列表 -->
      <div v-else class="max-w-3xl mx-auto">
        <!-- 提交新反馈 -->
        <div class="mb-6 bg-card rounded-lg p-4 border">
          <h2 class="font-semibold mb-3 flex items-center">
            <MessageSquareIcon class="w-5 h-5 mr-2 text-primary flex-shrink-0" />
            <span class="flex-shrink-0">提交新反馈</span>
          </h2>
          <textarea
            v-model="newFeedback"
            class="w-full border rounded-md p-3 min-h-[100px] bg-background"
            placeholder="请描述您遇到的问题或建议..."
          ></textarea>
          <div class="flex justify-end mt-3">
            <button 
              class="btn btn-primary"
              :disabled="submitting || !newFeedback.trim()"
              @click="submitNewFeedback"
            >
              <LoaderIcon v-if="submitting" class="w-4 h-4 mr-2 animate-spin" />
              提交反馈
            </button>
          </div>
        </div>
        
        <!-- 历史反馈列表 -->
        <div v-if="feedbackList.length > 0">
          <h2 class="font-semibold mb-3 flex items-center">
            <ClipboardListIcon class="w-5 h-5 mr-2 text-primary flex-shrink-0" />
            <span class="flex-shrink-0">历史反馈</span>
          </h2>
          <div class="space-y-4">
            <div 
              v-for="item in feedbackList" 
              :key="item.id"
              class="bg-card rounded-lg p-4 border"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="getStatusClass(item.status)"
                  >
                    {{ getStatusText(item.status) }}
                  </span>
                </div>
                <span class="text-xs text-muted-foreground">{{ formatDate(item.created_at) }}</span>
              </div>
              <p class="mb-3 text-sm">{{ item.feedback_content }}</p>
              
              <!-- 回复内容 -->
              <div v-if="item.reply_content" class="bg-muted/50 p-3 rounded-md mt-2">
                <div class="flex items-center mb-1">
                  <ReplyIcon class="w-4 h-4 mr-1 text-primary" />
                  <span class="text-xs font-medium">管理员回复</span>
                  <span class="text-xs text-muted-foreground ml-2">{{ formatDate(item.updated_at) }}</span>
                </div>
                <p class="text-sm">{{ item.reply_content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div v-if="hasMore && loadingMore" class="flex justify-center mt-4 py-4">
            <LoaderIcon class="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center h-40 bg-card rounded-lg border p-4">
          <AlertCircleIcon class="w-12 h-12 text-muted-foreground mb-4" />
          <p class="text-muted-foreground">暂无反馈记录</p>
        </div>
      </div>
    </div>
    
    <!-- 成功提示对话框 -->
    <div v-if="showSuccessDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="text-center">
          <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 class="text-lg font-medium text-foreground mb-2">提交成功</h3>
          <p class="text-muted-foreground mb-6">您的反馈已成功提交，我们会尽快处理</p>
          <button 
            class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            @click="showSuccessDialog = false"
          >
            确定
          </button>
        </div>
      </div>
    </div>
    
    <!-- 错误提示对话框 -->
    <div v-if="showErrorDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-card border shadow-lg rounded-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="text-center">
          <XCircleIcon class="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 class="text-lg font-medium text-foreground mb-2">提交失败</h3>
          <p class="text-muted-foreground mb-6">{{ errorMessage }}</p>
          <button 
            class="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            @click="showErrorDialog = false"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  MessageSquareIcon,
  ClipboardListIcon,
  ReplyIcon,
  LoaderIcon,
  XCircleIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-vue-next'
import { getFeedbackList, submitFeedback } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const feedbackList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(false)
const loadingMore = ref(false)
const newFeedback = ref('')
const submitting = ref(false)
const showSuccessDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref('')
const contentRef = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await getFeedbackList(page.value, pageSize.value)
    
    if (response.code === 200) {
      feedbackList.value = response.data.items || []
      hasMore.value = feedbackList.value.length < response.data.total
    } else {
      error.value = response.msg || '获取反馈列表失败'
    }
  } catch (err) {
    console.error('获取反馈列表失败:', err)
    error.value = err.message || '获取反馈列表失败，请重试'
  } finally {
    loading.value = false
  }
}

// 加载更多反馈
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  try {
    loadingMore.value = true
    page.value++
    
    const response = await getFeedbackList(page.value, pageSize.value)
    
    if (response.code === 200) {
      const newItems = response.data.items || []
      feedbackList.value = [...feedbackList.value, ...newItems]
      hasMore.value = feedbackList.value.length < response.data.total
    } else {
      page.value--
      throw new Error(response.msg || '加载更多失败')
    }
  } catch (err) {
    console.error('加载更多失败:', err)
    // 不显示错误，只在控制台记录
  } finally {
    loadingMore.value = false
  }
}

// 监听滚动事件，实现自动加载更多
const handleScroll = () => {
  if (!contentRef.value) return
  
  const scrollElement = contentRef.value
  const scrollBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight
  
  // 当滚动到距离底部100px以内时，加载更多
  if (scrollBottom < 100 && hasMore.value && !loadingMore.value) {
    loadMore()
  }
}

// 提交新反馈
const submitNewFeedback = async () => {
  if (!newFeedback.value.trim()) return
  
  try {
    submitting.value = true
    
    const response = await submitFeedback(newFeedback.value.trim())
    
    if (response.code === 200) {
      // 添加到列表顶部
      feedbackList.value.unshift(response.data)
      newFeedback.value = ''
      // 显示成功提示
      showSuccessDialog.value = true
    } else {
      throw new Error(response.msg || '提交反馈失败')
    }
  } catch (err) {
    console.error('提交反馈失败:', err)
    errorMessage.value = err.message || '提交失败，请重试'
    showErrorDialog.value = true
  } finally {
    submitting.value = false
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待处理'
    case 1: return '已回复'
    case 2: return '已解决'
    case 3: return '已关闭'
    default: return '未知状态'
  }
}

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
    case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500'
    case 2: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
    case 3: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadFeedbackList()
  if (contentRef.value) {
    contentRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script> 