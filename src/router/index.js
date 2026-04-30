import { createRouter, createWebHistory } from 'vue-router'

const ResourceCrud = () => import('@/views/product/ProductCrud.vue')
const CategoryTree = () => import('@/views/product/CategoryTree.vue')
const ProductPublish = () => import('@/views/product/ProductPublish.vue')

const legacyProductRedirects = [
  { path: '/product/category', redirect: '/category/list', meta: { hidden: true } },
  { path: '/product/brand', redirect: '/category/brand', meta: { hidden: true } },
  { path: '/product/category-brand', redirect: '/category/category-brand', meta: { hidden: true } },
  { path: '/product/attr-group', redirect: '/attribute/group', meta: { hidden: true } },
  { path: '/product/attr', redirect: '/attribute/list', meta: { hidden: true } },
  { path: '/product/attr-relation', redirect: '/attribute/relation', meta: { hidden: true } },
  { path: '/product/spu-attr-value', redirect: '/attribute/spu-value', meta: { hidden: true } },
  { path: '/product/sku-sale-attr', redirect: '/attribute/sku-sale', meta: { hidden: true } }
]

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
    path: '/category',
    component: () => import('@/layout/index.vue'),
    redirect: '/category/list',
    meta: { title: '分类管理', icon: 'Grid' },
    children: [
      {
        path: 'list',
        name: 'CategoryList',
        component: CategoryTree,
        meta: { title: '商品分类', icon: 'Grid', moduleKey: 'product', resourceKey: 'category', apiBase: 'product' }
      },
      {
        path: 'brand',
        name: 'CategoryBrand',
        component: ResourceCrud,
        meta: { title: '品牌管理', icon: 'PriceTag', moduleKey: 'product', resourceKey: 'brand', apiBase: 'product' }
      },
      {
        path: 'category-brand',
        name: 'CategoryBrandRelation',
        component: ResourceCrud,
        meta: {
          title: '分类品牌',
          icon: 'Link',
          moduleKey: 'product',
          resourceKey: 'categorybrandrelation',
          apiBase: 'product'
        }
      }
    ]
  },
  {
    path: '/attribute',
    component: () => import('@/layout/index.vue'),
    redirect: '/attribute/group',
    meta: { title: '属性管理', icon: 'CollectionTag' },
    children: [
      {
        path: 'group',
        name: 'AttributeGroup',
        component: ResourceCrud,
        meta: {
          title: '属性分组',
          icon: 'CollectionTag',
          moduleKey: 'product',
          resourceKey: 'attrgroup',
          apiBase: 'product'
        }
      },
      {
        path: 'list',
        name: 'AttributeList',
        component: ResourceCrud,
        meta: { title: '商品属性', icon: 'SetUp', moduleKey: 'product', resourceKey: 'attr', apiBase: 'product' }
      },
      {
        path: 'relation',
        name: 'AttributeRelation',
        component: ResourceCrud,
        meta: {
          title: '属性关联',
          icon: 'Connection',
          moduleKey: 'product',
          resourceKey: 'attrattrgrouprelation',
          apiBase: 'product'
        }
      },
      {
        path: 'spu-value',
        name: 'AttributeSpuValue',
        component: ResourceCrud,
        meta: {
          title: 'SPU 属性值',
          icon: 'List',
          moduleKey: 'product',
          resourceKey: 'productattrvalue',
          apiBase: 'product'
        }
      },
      {
        path: 'sku-sale',
        name: 'AttributeSkuSale',
        component: ResourceCrud,
        meta: {
          title: 'SKU 销售属性',
          icon: 'Sell',
          moduleKey: 'product',
          resourceKey: 'skusaleattrvalue',
          apiBase: 'product'
        }
      }
    ]
  },
  {
    path: '/inventory',
    component: () => import('@/layout/index.vue'),
    redirect: '/inventory/stock',
    meta: { title: '库存管理', icon: 'House' },
    children: [
      {
        path: 'stock',
        name: 'InventoryStock',
        component: ResourceCrud,
        meta: { title: '商品库存', icon: 'Box', moduleKey: 'ware', resourceKey: 'waresku', apiBase: 'ware' }
      },
      {
        path: 'warehouse',
        name: 'InventoryWarehouse',
        component: ResourceCrud,
        meta: { title: '仓库信息', icon: 'OfficeBuilding', moduleKey: 'ware', resourceKey: 'wareinfo', apiBase: 'ware' }
      },
      {
        path: 'purchase',
        name: 'InventoryPurchase',
        component: ResourceCrud,
        meta: { title: '采购单', icon: 'ShoppingCart', moduleKey: 'ware', resourceKey: 'purchase', apiBase: 'ware' }
      },
      {
        path: 'purchase-detail',
        name: 'InventoryPurchaseDetail',
        component: ResourceCrud,
        meta: {
          title: '采购明细',
          icon: 'Tickets',
          moduleKey: 'ware',
          resourceKey: 'purchasedetail',
          apiBase: 'ware'
        }
      },
      {
        path: 'task',
        name: 'InventoryTask',
        component: ResourceCrud,
        meta: {
          title: '库存工作单',
          icon: 'DocumentChecked',
          moduleKey: 'ware',
          resourceKey: 'wareordertask',
          apiBase: 'ware'
        }
      },
      {
        path: 'task-detail',
        name: 'InventoryTaskDetail',
        component: ResourceCrud,
        meta: {
          title: '工作单明细',
          icon: 'Document',
          moduleKey: 'ware',
          resourceKey: 'wareordertaskdetail',
          apiBase: 'ware'
        }
      }
    ]
  },
  {
    path: '/product',
    component: () => import('@/layout/index.vue'),
    redirect: '/product/publish',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      {
        path: 'publish',
        name: 'ProductPublish',
        component: ProductPublish,
        meta: { title: '商品发布', icon: 'Promotion', perms: 'product:publish:info' }
      },
      {
        path: 'spu',
        name: 'ProductSpu',
        component: ResourceCrud,
        meta: { title: 'SPU 管理', icon: 'Box', moduleKey: 'product', resourceKey: 'spuinfo', apiBase: 'product' }
      },
      {
        path: 'sku',
        name: 'ProductSku',
        component: ResourceCrud,
        meta: { title: 'SKU 管理', icon: 'Tickets', moduleKey: 'product', resourceKey: 'skuinfo', apiBase: 'product' }
      },
      {
        path: 'comment',
        name: 'ProductComment',
        component: ResourceCrud,
        meta: {
          title: '商品评价',
          icon: 'ChatDotRound',
          moduleKey: 'product',
          resourceKey: 'spucomment',
          apiBase: 'product'
        }
      },
      {
        path: 'comment-replay',
        name: 'ProductCommentReplay',
        component: ResourceCrud,
        meta: {
          title: '评价回复',
          icon: 'ChatLineRound',
          moduleKey: 'product',
          resourceKey: 'commentreplay',
          apiBase: 'product'
        }
      }
    ]
  },
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
  ...legacyProductRedirects,
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
