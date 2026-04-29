<template>
  <el-scrollbar class="sidebar-scroll">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapse"
      :unique-opened="true"
      background-color="#001529"
      text-color="#bfcbd9"
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
}
:deep(.el-menu) {
  border-right: 0;
}
</style>
