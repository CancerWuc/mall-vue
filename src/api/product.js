import request from '@/utils/request'

export function listProductResource(resource, params) {
  return request({ url: `/product/${resource}/list`, method: 'get', params })
}

export function listCategoryTree() {
  return request({ url: '/product/category/list/tree', method: 'get' })
}

export function listCategoryChildren(parentCid = 0) {
  return request({ url: '/product/category/list/children', method: 'get', params: { parentCid } })
}

export function getProductResource(resource, id) {
  return request({ url: `/product/${resource}/info/${id}`, method: 'get' })
}

export function saveProductResource(resource, data) {
  return request({ url: `/product/${resource}/save`, method: 'post', data })
}

export function updateProductResource(resource, data) {
  return request({ url: `/product/${resource}/update`, method: 'post', data })
}

export function deleteProductResource(resource, ids) {
  return request({ url: `/product/${resource}/delete`, method: 'post', data: ids })
}
