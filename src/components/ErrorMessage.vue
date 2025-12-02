<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-2 opacity-0"
  >
    <div
      v-if="show"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg"
      :class="[
        type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
        type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
        'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
      ]"
    >
      <component 
        :is="icon" 
        class="w-5 h-5" 
      />
      <span class="text-sm">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const show = ref(false)
let timer = null

const icon = computed(() => {
  switch (props.type) {
    case 'error':
      return AlertCircleIcon
    case 'success':
      return CheckCircleIcon
    default:
      return InfoIcon
  }
})

// 显示消息
const showMessage = () => {
  show.value = true
  if (timer) clearTimeout(timer)
  if (props.duration > 0) {
    timer = setTimeout(() => {
      show.value = false
    }, props.duration)
  }
}

// 监听消息变化
watch(() => props.message, (newVal) => {
  if (newVal) {
    showMessage()
  }
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script> 