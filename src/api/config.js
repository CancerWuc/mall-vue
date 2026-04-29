import request from '@/utils/request'

export function listConfig(params) {
  return request({ url: '/admin/sys/config/list', method: 'get', params })
}

export function getConfig(id) {
  return request({ url: `/admin/sys/config/info/${id}`, method: 'get' })
}

export function saveConfig(data) {
  return request({ url: '/admin/sys/config/save', method: 'post', data })
}

export function updateConfig(data) {
  return request({ url: '/admin/sys/config/update', method: 'post', data })
}

export function deleteConfig(ids) {
  return request({ url: '/admin/sys/config/delete', method: 'post', data: ids })
}
