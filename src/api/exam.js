import request from '@/utils/request'

/**
 * 获取课程考试信息
 * @param {string|number} courseId 课程ID
 * @returns {Promise}
 */
export const getExam = (courseId) => {
  return request(`/api/v1/courses/${courseId}/exam`)
}

/**
 * 提交考试答案
 * @param {string|number} courseId 课程ID
 * @param {Object} data 答案数据
 * @returns {Promise}
 */
export const submitExam = (courseId, data) => {
  return request(`/api/v1/courses/${courseId}/exam/submit`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
} 