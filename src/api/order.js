import request from '@/utils/request'
import { API_URLS } from '@/config'

// 获取订单列表
export const getOrderList = (params) => {
  return request(API_URLS.ORDER.LIST, {
    method: 'GET',
    params
  })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return request(API_URLS.ORDER.DETAIL(id))
}

// 支付订单
export const payOrder = (id, data) => {
  return request(API_URLS.ORDER.PAY(id), {
    method: 'POST',
    body: JSON.stringify(data)
  })
} 