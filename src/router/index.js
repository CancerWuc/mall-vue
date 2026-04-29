import { createRouter, createWebHistory } from 'vue-router'

// 静态路由：所有不需要权限或必备路由
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true, title: '登录' }
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true, title: '404' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled', affix: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'UserFilled', hidden: true }
      }
    ]
  }
]

// 业务路由：受权限保护，登录后挂载到 Layout 下
export const asyncRoutes = [
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'SysUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', perms: 'sys:user:list' }
      },
      {
        path: 'role',
        name: 'SysRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'Avatar', perms: 'sys:role:list' }
      },
      {
        path: 'menu',
        name: 'SysMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'Menu', perms: 'sys:menu:list' }
      },
      {
        path: 'dict-type',
        name: 'SysDictType',
        component: () => import('@/views/system/dict/type.vue'),
        meta: { title: '字典类型', icon: 'Collection', perms: 'sys:dict:list' }
      },
      {
        path: 'dict-data/:dictType?',
        name: 'SysDictData',
        component: () => import('@/views/system/dict/data.vue'),
        meta: { title: '字典数据', icon: 'List', hidden: true, perms: 'sys:dict:list' }
      },
      {
        path: 'config',
        name: 'SysConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '参数设置', icon: 'Tools', perms: 'sys:config:list' }
      },
      {
        path: 'oss',
        name: 'SysOss',
        component: () => import('@/views/system/oss/index.vue'),
        meta: { title: '文件管理', icon: 'Files', perms: 'sys:oss:list' }
      }
    ]
  },
  {
    path: '/log',
    component: () => import('@/layout/index.vue'),
    redirect: '/log/login',
    meta: { title: '日志管理', icon: 'Tickets' },
    children: [
      {
        path: 'login',
        name: 'LoginLog',
        component: () => import('@/views/log/login-log.vue'),
        meta: { title: '登录日志', icon: 'Promotion', perms: 'sys:log:list' }
      },
      {
        path: 'operation',
        name: 'OperationLog',
        component: () => import('@/views/log/operation-log.vue'),
        meta: { title: '操作日志', icon: 'Document', perms: 'sys:log:list' }
      }
    ]
  },
  // 兜底 404
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { hidden: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes],
  scrollBehavior: () => ({ top: 0 })
})

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: [...constantRoutes]
  })
  router.matcher = newRouter.matcher
}

export default router
