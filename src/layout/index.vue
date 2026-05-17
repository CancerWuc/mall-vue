<template>
  <el-container class="app-wrapper">
    <el-aside :width="sidebarWidth" class="sidebar-container">
      <div class="logo" :class="{ collapsed }">
        <span class="logo-mark">M</span>
        <span v-if="!collapsed" class="logo-text">Mall Admin</span>
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
  background:
    linear-gradient(180deg, rgba(232, 240, 255, 0.82) 0%, rgba(245, 247, 251, 0) 260px),
    $page-bg;
}

.sidebar-container {
  background:
    linear-gradient(180deg, #132843 0%, $sidebar-bg 58%, #0d1a2a 100%);
  color: $sidebar-text;
  transition: width 0.2s;
  overflow: hidden;
  box-shadow: 10px 0 28px rgba(15, 31, 51, 0.16);
  z-index: 3;
}

.logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 18px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  &.collapsed {
    justify-content: center;
    padding: 0;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #2f7df6, #16a085);
    box-shadow: 0 8px 18px rgba(47, 125, 246, 0.28);
    font-size: 17px;
    font-weight: 800;
  }

  .logo-text {
    line-height: 1;
    letter-spacing: 0;
  }
}

.navbar {
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(230, 237, 247, 0.9);
  backdrop-filter: blur(14px);
  height: $header-height;
  line-height: $header-height;
  padding: 0;
  z-index: 2;
}
</style>
