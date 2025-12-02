import request from '@/utils/request'
import { API_URLS } from '@/config'

// 获取错题列表
export const getWrongQuestions = (params) => {
  return request(API_URLS.PRACTICE.WRONG_QUESTIONS, {
    method: 'GET',
    params
  })
}

// 提交答案
export const submitAnswer = (data) => {
  return request(API_URLS.PRACTICE.SUBMIT_ANSWER, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 获取练习历史
export const getPracticeHistory = () => {
  return request(API_URLS.PRACTICE.HISTORY)
} 