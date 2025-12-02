<template>
  <div class="flex flex-col h-screen">
    <!-- 标题 -->
    <div class="flex-none p-4 border-b flex items-center gap-2">
      <button class="btn btn-ghost p-2" @click="router.back()">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-bold">帮助与文档</h1>
    </div>

    <!-- 帮助内容 -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <div class="p-4">
        <div class="space-y-6">
          <div v-for="section in helpSections" :key="section.id">
            <h2 class="text-lg font-semibold mb-4">{{ section.title }}</h2>
            <div class="space-y-4">
              <div 
                v-for="item in section.items" 
                :key="item.id"
                class="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                @click="toggleItem(item)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" class="w-5 h-5 text-primary" />
                    <span>{{ item.question }}</span>
                  </div>
                  <ChevronDownIcon 
                    class="w-5 h-5 transition-transform"
                    :class="{ 'rotate-180': expandedItems.includes(item.id) }"
                  />
                </div>
                <div 
                  v-show="expandedItems.includes(item.id)"
                  class="mt-4 pl-8 text-sm text-muted-foreground overflow-y-auto max-h-[60vh]"
                >
                  {{ item.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChevronLeftIcon, 
  ChevronDownIcon,
  BookOpenIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HelpCircleIcon
} from 'lucide-vue-next'

const router = useRouter()
const expandedItems = ref([])

const helpSections = [
  {
    id: 1,
    title: '考试相关',
    items: [
      {
        id: 11,
        icon: BookOpenIcon,
        question: '如何开始练习题目？',
        answer: '购买课程后，进入题库页面选择对应的题型开始练习。系统会记录您的练习进度和正确率。'
      },
      {
        id: 12,
        icon: GraduationCapIcon,
        question: '考试成绩如何查询？',
        answer: '在"我的"页面中点击"我的成绩"即可查看所有考试的成绩记录。'
      }
    ]
  },
  {
    id: 2,
    title: '购买相关',
    items: [
      {
        id: 21,
        icon: CreditCardIcon,
        question: '如何购买课程？',
        answer: '在课程表页面选择需要的课程，点击"购买课程"按钮，选择支付方式完成支付即可。'
      }
    ]
  }
]

const toggleItem = (item) => {
  const index = expandedItems.value.indexOf(item.id)
  if (index === -1) {
    expandedItems.value.push(item.id)
  } else {
    expandedItems.value.splice(index, 1)
  }
}
</script>

<style scoped>
/* 优化滚动条样式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: var(--primary) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--primary);
  border-radius: 2px;
}

/* 防止iOS橡皮筋效果 */
.overscroll-contain {
  overscroll-behavior: contain;
}
</style> 