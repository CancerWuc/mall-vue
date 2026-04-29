import request from '@/utils/request'

export function listUser(params) {
  return request({ url: '/admin/sys/user/list', method: 'get', params })
}

export function getUser(userId) {
  return request({ url: `/admin/sys/user/info/${userId}`, method: 'get' })
}

export function saveUser(data) {
  return request({ url: '/admin/sys/user/save', method: 'post', data })
}

export function updateUser(data) {
  return request({ url: '/admin/sys/user/update', method: 'post', data })
}

export function deleteUser(userIds) {
  return request({ url: '/admin/sys/user/delete', method: 'post', data: userIds })
}
