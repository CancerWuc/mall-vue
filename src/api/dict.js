import request from '@/utils/request'

// 字典类型
export function listDictType(params) {
  return request({ url: '/admin/sys/dicttype/list', method: 'get', params })
}
export function getDictType(id) {
  return request({ url: `/admin/sys/dicttype/info/${id}`, method: 'get' })
}
export function saveDictType(data) {
  return request({ url: '/admin/sys/dicttype/save', method: 'post', data })
}
export function updateDictType(data) {
  return request({ url: '/admin/sys/dicttype/update', method: 'post', data })
}
export function deleteDictType(ids) {
  return request({ url: '/admin/sys/dicttype/delete', method: 'post', data: ids })
}
export function selectDictType() {
  return request({ url: '/admin/sys/dicttype/select', method: 'get' })
}

// 字典数据
export function listDictData(params) {
  return request({ url: '/admin/sys/dictdata/list', method: 'get', params })
}
export function getDictData(id) {
  return request({ url: `/admin/sys/dictdata/info/${id}`, method: 'get' })
}
export function saveDictData(data) {
  return request({ url: '/admin/sys/dictdata/save', method: 'post', data })
}
export function updateDictData(data) {
  return request({ url: '/admin/sys/dictdata/update', method: 'post', data })
}
export function deleteDictData(ids) {
  return request({ url: '/admin/sys/dictdata/delete', method: 'post', data: ids })
}
export function listDictDataByType(dictType) {
  return request({ url: `/admin/sys/dictdata/type/${dictType}`, method: 'get' })
}
