<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">会员中心</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 会员套餐卡片 -->
      <div v-for="(plan, index) in membershipPlans" 
           :key="index" 
           class="card p-6 hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-semibold mb-2">{{ plan.name }}</h2>
        <p class="text-3xl font-bold text-primary mb-4">¥{{ plan.price }}</p>
        <ul class="text-muted-foreground mb-6 space-y-2">
          <li v-for="(feature, fIndex) in plan.features" 
              :key="fIndex"
              class="flex items-center">
            <CheckIcon class="w-5 h-5 mr-2 text-primary" />
            {{ feature }}
          </li>
        </ul>
        <button class="btn btn-primary w-full">立即开通</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon } from 'lucide-vue-next'

const membershipPlans = [
  {
    name: "月度会员",
    price: 29,
    features: ["所有题库使用权限", "考试模式", "答案解析"]
  },
  {
    name: "季度会员",
    price: 79,
    features: ["所有题库使用权限", "考试模式", "答案解析", "错题本"]
  },
  {
    name: "年度会员",
    price: 299,
    features: ["所有题库使用权限", "考试模式", "答案解析", "错题本", "专属客服"]
  }
]
</script> 