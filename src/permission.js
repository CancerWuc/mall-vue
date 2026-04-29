import router, { asyncRoutes } from './router'
import { useUserStore } from './store/modules/user'
import { getToken } from './utils/auth'
import NProgress from 'nprogress'
import { ElMessage } from 'element-plus'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
      return
    }
    if (!userStore.userInfo) {
      try {
        await userStore.fetchInfo()
        // 注入业务路由
        asyncRoutes.forEach((r) => {
          if (!router.hasRoute(r.path)) {
            const route = { ...r, name: r.name || r.path }
            router.addRoute(route)
          }
        })
        // 重新进入，确保新路由匹配
        next({ ...to, replace: true })
      } catch (e) {
        userStore.resetState()
        ElMessage.error(e?.message || '获取用户信息失败，请重新登录')
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        NProgress.done()
      }
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
