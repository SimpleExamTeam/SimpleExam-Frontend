<template>
  <div class="flex flex-col h-screen">
    <!-- 题库列表 -->
    <div class="flex-1 overflow-y-auto pt-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoaderIcon class="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <XCircleIcon class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-center text-red-500">{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchQuestionBanks">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="questionBanks.length === 0" class="flex flex-col items-center justify-center h-full p-4">
        <ClipboardListIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <p class="text-muted-foreground text-center">暂无题库</p>
      </div>

      <div v-else class="p-4 space-y-4 pb-20">
        <div 
          v-for="bank in questionBanks" 
          :key="bank.id"
          class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewQuestionBank(bank)"
        >
          <div class="flex gap-4">
            <div class="w-16 h-16 bg-secondary rounded-md flex items-center justify-center">
              <ClipboardListIcon class="w-8 h-8 text-muted-foreground" />
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ bank.name }}</h3>
              <p class="text-sm text-muted-foreground mt-1">{{ bank.description || '暂无描述' }}</p>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-muted-foreground">题目数量: {{ bank.questionCount }}</span>
                <button class="btn btn-sm btn-secondary">
                  开始练习
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <TabBar />
  </div>
</template> 