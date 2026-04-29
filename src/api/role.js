import request from '@/utils/request'

export function listRole(params) {
  return request({ url: '/admin/sys/role/list', method: 'get', params })
}

export function getRole(roleId) {
  return request({ url: `/admin/sys/role/info/${roleId}`, method: 'get' })
}

export function saveRole(data) {
  return request({ url: '/admin/sys/role/save', method: 'post', data })
}

export function updateRole(data) {
  return request({ url: '/admin/sys/role/update', method: 'post', data })
}

export function deleteRole(roleIds) {
  return request({ url: '/admin/sys/role/delete', method: 'post', data: roleIds })
}

export function selectRole() {
  return request({ url: '/admin/sys/role/select', method: 'get' })
}
