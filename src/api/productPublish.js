import request from '@/utils/request'

export function listPublishBrands(catelogId) {
  return request({ url: '/product/publish/brands', method: 'get', params: { catelogId } })
}

export function listPublishAttrs(catelogId) {
  return request({ url: '/product/publish/attrs', method: 'get', params: { catelogId } })
}

export function saveProductPublish(data) {
  return request({ url: '/product/publish/save', method: 'post', data })
}
