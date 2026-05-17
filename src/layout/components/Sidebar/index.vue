<template>
  <el-scrollbar class="sidebar-scroll">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapse"
      :unique-opened="true"
      background-color="transparent"
      text-color="#c8d3df"
      active-text-color="#ffffff"
      router
    >
      <SidebarItem v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router'
import SidebarItem from './SidebarItem.vue'

defineProps({ collapse: { type: Boolean, default: false } })
const route = useRoute()
const activeMenu = computed(() => route.meta?.activeMenu || route.path)

// 合并：常量路由（取根路径下的子路由）+ 动态业务路由
const routes = computed(() => {
  const list = []
  // 取根 Layout 下的可见子路由
  const rootChildren = constantRoutes.find((r) => r.path === '/')?.children || []
  rootChildren.forEach((c) => {
    if (!c.meta?.hidden) {
      list.push({ ...c, path: '/' + c.path, fullPath: '/' + c.path })
    }
  })
  asyncRoutes.forEach((r) => {
    if (r.meta?.hidden || r.path === '/:pathMatch(.*)*') return
    list.push(r)
  })
  return list
})
</script>

<style scoped>
.sidebar-scroll {
  height: calc(100vh - 56px);
  padding: 10px 10px 14px;
}
:deep(.el-menu) {
  border-right: 0;
  background: transparent;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  margin: 4px 0;
  border-radius: 8px;
  color: #c8d3df;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #2f7df6, #16a085);
  box-shadow: 0 10px 22px rgba(47, 125, 246, 0.24);
  color: #fff;
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  justify-content: center;
}

:deep(.el-sub-menu .el-menu) {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 4px;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 0;
  height: 40px;
  line-height: 40px;
}
</style>
