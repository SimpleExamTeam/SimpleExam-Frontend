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
          <!-- 错题内容保持不变 -->
        </div>
      </div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ClipboardListIcon,
  LoaderIcon,
  XCircleIcon
} from 'lucide-vue-next'
import TabBar from '../components/TabBar.vue'
import { getWrongQuestions } from '@/api/question'

// 其余代码保持不变
</script> 