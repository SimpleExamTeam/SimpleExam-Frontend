<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  >
    <div class="card bg-background p-6 w-full max-w-sm animate-in fade-in zoom-in">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
      <p class="text-muted-foreground mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button 
          class="btn btn-outline"
          @click="onCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="btn btn-primary"
          @click="onConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script> 