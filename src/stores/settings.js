import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 从 localStorage 获取初始值
  const isElderlyMode = ref(localStorage.getItem('elderlyMode') === 'true')

  // 初始化时应用老人模式
  if (isElderlyMode.value) {
    document.documentElement.classList.add('elderly-mode')
  }

  const toggleElderlyMode = () => {
    isElderlyMode.value = !isElderlyMode.value
    // 更新 localStorage
    localStorage.setItem('elderlyMode', isElderlyMode.value)
    // 更新 HTML 根元素的类名
    document.documentElement.classList.toggle('elderly-mode', isElderlyMode.value)
  }

  return {
    isElderlyMode,
    toggleElderlyMode
  }
}) 