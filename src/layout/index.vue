<template>
  <el-container class="app-wrapper">
    <el-aside :width="sidebarWidth" class="sidebar-container">
      <div class="logo" :class="{ collapsed }">
        <span v-if="!collapsed">Mall Admin</span>
        <span v-else>M</span>
      </div>
      <Sidebar :collapse="collapsed" />
    </el-aside>
    <el-container>
      <el-header class="navbar">
        <Navbar />
      </el-header>
      <Breadcrumb />
      <AppMain />
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import AppMain from './components/AppMain.vue'

const appStore = useAppStore()
const collapsed = computed(() => appStore.sidebarCollapsed)
const sidebarWidth = computed(() => (collapsed.value ? '64px' : '220px'))
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.app-wrapper {
  height: 100vh;
}

.sidebar-container {
  background-color: $sidebar-bg;
  color: $sidebar-text;
  transition: width 0.2s;
  overflow: hidden;
}

.logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  background-color: #001b32;
  letter-spacing: 1px;
  &.collapsed {
    font-size: 20px;
  }
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  height: $header-height;
  line-height: $header-height;
  padding: 0;
}
</style>
