import request from '@/utils/request'
import { API_URLS } from '@/config'

/**
 * 创建支付订单
 * @param {Object} data 支付参数
 * @param {string} data.course_id 商品ID
 * @param {number} data.amount 支付金额（分）
 * @param {number} data.total_fee 支付金额（分）
 * @param {string} [data.open_id] 用户OpenID（JSAPI支付必需）
 * @param {string} data.body 商品描述
 * @param {string} [data.attach] 附加数据
 * @param {string} data.trade_type 交易类型（JSAPI或NATIVE）
 * @returns {Promise}
 */
export const createPayment = (data) => {
  return request(API_URLS.PAYMENT.CREATE, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 查询支付结果
 * @param {string} orderId 订单ID
 * @returns {Promise}
 */
export const queryPayment = (orderId) => {
  return request(API_URLS.PAYMENT.QUERY(orderId))
}

/**
 * 获取支付成功页面数据
 * @returns {Promise}
 */
export const getPaymentSuccess = () => {
  return request(API_URLS.PAYMENT.SUCCESS)
}

/**
 * 支付通知回调
 * @param {Object} data 通知数据
 * @param {string} data.order_id 订单ID
 * @param {string} data.status 支付状态
 * @returns {Promise}
 */
export const notifyPayment = (data) => {
  return request(API_URLS.PAYMENT.NOTIFY, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 使用兑换码创建订单
 * @param {Object} data 兑换参数
 * @param {string} data.card_no 兑换码
 * @param {number} data.course_id 课程ID
 * @returns {Promise}
 */
export const redeemCard = (data) => {
  return request(API_URLS.PAYMENT.REDEEM_CARD, {
    method: 'POST',
    body: JSON.stringify(data)
  })
} 