import request from '@/utils/request'

export function listMenu() {
  return request({ url: '/admin/sys/menu/list', method: 'get' })
}

export function getMenu(menuId) {
  return request({ url: `/admin/sys/menu/info/${menuId}`, method: 'get' })
}

export function saveMenu(data) {
  return request({ url: '/admin/sys/menu/save', method: 'post', data })
}

export function updateMenu(data) {
  return request({ url: '/admin/sys/menu/update', method: 'post', data })
}

export function deleteMenu(menuId) {
  return request({ url: `/admin/sys/menu/delete/${menuId}`, method: 'post' })
}

export function selectMenu() {
  return request({ url: '/admin/sys/menu/select', method: 'get' })
}
