import request from '@/utils/request'
import { API_CONFIG } from '@/config'

// 获取课程的练习题
export const getCourseQuestions = (courseId, type) => {
  // 如果指定了题型，则添加到查询参数中
  const url = type ? `/api/v1/questions/${courseId}?type=${type}` : `/api/v1/questions/${courseId}`
  return request(url)
} 