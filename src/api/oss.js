import request from '@/utils/request'

export function listOss(params) {
  return request({ url: '/admin/sys/oss/list', method: 'get', params })
}

export function uploadOss(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request({
    url: '/admin/sys/oss/upload',
    method: 'post',
    data: fd,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteOss(ids) {
  return request({ url: '/admin/sys/oss/delete', method: 'post', data: ids })
}

// 直接拼接上传地址，便于 el-upload 使用
export function ossUploadUrl() {
  return (import.meta.env.VITE_APP_BASE_API || '/api') + '/admin/sys/oss/upload'
}
