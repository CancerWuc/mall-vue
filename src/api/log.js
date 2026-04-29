import request from '@/utils/request'

export function listLoginLog(params) {
  return request({ url: '/admin/sys/loginlog/list', method: 'get', params })
}

export function listOperationLog(params) {
  return request({ url: '/admin/sys/operationlog/list', method: 'get', params })
}
