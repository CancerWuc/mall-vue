import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from './auth'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 30000
})

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 文件下载等非标准 JSON 数据直接返回
    if (response.config.responseType === 'blob') {
      return response
    }
    if (!res || typeof res.code === 'undefined') {
      return res
    }
    if (res.code === 0) {
      return res
    }
    // 401 未授权 / Token 失效
    if (res.code === 401) {
      handleUnauthorized(res.msg || '登录状态已失效，请重新登录')
      return Promise.reject(new Error(res.msg || 'Unauthorized'))
    }
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || 'Error'))
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      handleUnauthorized('登录状态已失效，请重新登录')
    } else {
      ElMessage.error(error.response?.data?.msg || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

let unauthorizedShown = false
function handleUnauthorized(msg) {
  if (unauthorizedShown) return
  unauthorizedShown = true
  ElMessageBox.confirm(msg, '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      removeToken()
      router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
    })
    .finally(() => {
      unauthorizedShown = false
    })
}

export default service
