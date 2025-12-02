<template>
  <div class="flex flex-col h-screen">
    <!-- 错题列表 -->
    <div class="flex-1 overflow-y-auto pt-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchWrongQuestions">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="wrongQuestions.length === 0" class="flex flex-col items-center justify-center h-full p-4">
        <ClipboardListIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <p class="text-muted-foreground text-center">暂无错题记录</p>
      </div>

      <div v-else class="p-4 space-y-4 pb-20">
        <div 
          v-for="question in wrongQuestions" 
          :key="question.id"
          class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewQuestion(question)"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary rounded-lg p-2 w-12 h-12 flex items-center justify-center font-bold">
                {{ question.id }}
              </div>
              <div>
                <span class="text-sm text-muted-foreground">{{ question.type }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-destructive font-medium">错误次数: {{ question.wrongCount }}</span>
                  <span class="text-muted-foreground">|</span>
                  <span class="text-muted-foreground">最后错误: {{ question.lastWrongDate }}</span>
                </div>
              </div>
            </div>
            <button class="text-muted-foreground hover:text-primary">
              <BookmarkIcon class="w-5 h-5" />
            </button>
          </div>
          <p class="text-foreground mb-4">{{ question.question }}</p>
          <div class="flex justify-end gap-3">
            <button class="btn btn-secondary">
              <EyeIcon class="w-4 h-4 mr-2" />
              查看解析
            </button>
            <button class="btn btn-primary">
              <PencilIcon class="w-4 h-4 mr-2" />
              重新作答
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { FilterIcon, BookmarkIcon, EyeIcon, PencilIcon } from 'lucide-vue-next'

const mistakes = [
  {
    type: '单选题',
    question: "在Vue 3中，如何定义响应式数据？",
    wrongCount: 2,
    lastWrongDate: '2024-01-15',
    analysis: "Vue 3中可以使用ref()或reactive()来定义响应式数据..."
  },
  {
    type: '多选题',
    question: "以下哪些是Vue 3的组合式API？",
    wrongCount: 1,
    lastWrongDate: '2024-01-16',
    analysis: "Vue 3的组合式API包括：ref、reactive、computed、watch等..."
  },
  {
    type: '判断题',
    question: "Vue 3完全不兼容Vue 2的选项式API写法",
    wrongCount: 3,
    lastWrongDate: '2024-01-17',
    analysis: "这种说法是错误的，Vue 3完全兼容Vue 2的选项式API..."
  }
]
</script> 