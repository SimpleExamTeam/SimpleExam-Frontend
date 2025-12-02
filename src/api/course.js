import request from '@/utils/request'
import { API_URLS } from '@/config'

// 获取课程列表
export const getCourseList = (params) => {
  return request(API_URLS.COURSE.LIST, {
    method: 'GET',
    params
  })
}

// 获取课程详情
export const getCourseDetail = (id) => {
  return request(API_URLS.COURSE.DETAIL(id))
}

// 获取课程练习题
export const getCoursePractice = (id, params) => {
  return request(API_URLS.COURSE.PRACTICE(id), {
    method: 'GET',
    params
  })
}

// 获取课程考试题
export const getCourseExam = (id) => {
  return request(API_URLS.COURSE.EXAM(id))
} 