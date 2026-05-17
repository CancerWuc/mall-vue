import request from '@/utils/request'

export function listResource(apiBase, resource, params) {
  return request({ url: `/${apiBase}/${resource}/list`, method: 'get', params })
}

export function getResource(apiBase, resource, id) {
  return request({ url: `/${apiBase}/${resource}/info/${id}`, method: 'get' })
}

export function saveResource(apiBase, resource, data) {
  return request({ url: `/${apiBase}/${resource}/save`, method: 'post', data })
}

export function updateResource(apiBase, resource, data) {
  return request({ url: `/${apiBase}/${resource}/update`, method: 'post', data })
}

export function deleteResource(apiBase, resource, ids) {
  return request({ url: `/${apiBase}/${resource}/delete`, method: 'post', data: ids })
}

export function postAction(apiBase, path, data) {
  return request({ url: `/${apiBase}/${path}`, method: 'post', data })
}
