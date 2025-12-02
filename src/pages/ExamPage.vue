<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">考试中心</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 考试模式卡片 -->
      <div class="card p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-4 mb-4">
          <PencilRulerIcon class="w-8 h-8 text-primary" />
          <h2 class="text-xl font-semibold">正式考试</h2>
        </div>
        <p class="text-muted-foreground mb-6">模拟真实考试环境，限时作答，系统自动评分</p>
        <button class="btn btn-primary w-full">进入考试</button>
      </div>
      
      <!-- 练习模式卡片 -->
      <div class="card p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-4 mb-4">
          <BookOpenIcon class="w-8 h-8 text-primary" />
          <h2 class="text-xl font-semibold">模拟练习</h2>
        </div>
        <p class="text-muted-foreground mb-6">自由练习模式，不限时，可查看答案解析</p>
        <button class="btn btn-secondary w-full">开始练习</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PencilRulerIcon, BookOpenIcon } from 'lucide-vue-next'
</script> 