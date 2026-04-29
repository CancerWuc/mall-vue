<template>
  <div class="app-container dashboard">
    <el-row :gutter="16">
      <el-col v-for="item in stats" :key="item.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-row">
            <div class="stat-icon" :style="{ background: item.bg }">
              <el-icon :size="24" color="#fff"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <span>欢迎，{{ userStore.name || '管理员' }}</span>
          </template>
          <p>欢迎使用 Mall 后台管理系统。这里聚合了商城后端各业务模块的管理入口。</p>
          <p class="text-muted">提示：本前端基于 Vue 3 + Vite + Element Plus + Pinia 构建。</p>
          <el-divider />
          <div>
            <div><b>当前权限点数：</b>{{ userStore.permissions.length }}</div>
            <div><b>菜单数量：</b>{{ menuCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><span>快捷入口</span></template>
          <el-space wrap>
            <el-button type="primary" @click="$router.push('/system/user')">用户管理</el-button>
            <el-button type="success" @click="$router.push('/system/role')">角色管理</el-button>
            <el-button type="warning" @click="$router.push('/system/menu')">菜单管理</el-button>
            <el-button type="info" @click="$router.push('/system/dict-type')">字典管理</el-button>
            <el-button @click="$router.push('/system/config')">参数设置</el-button>
            <el-button @click="$router.push('/log/login')">登录日志</el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

function flatten(tree) {
  const arr = []
  const walk = (list) => {
    list.forEach((m) => {
      arr.push(m)
      if (m.children?.length) walk(m.children)
    })
  }
  walk(tree || [])
  return arr
}

const menuCount = computed(() => flatten(userStore.menuTree).length)

const stats = [
  { label: '权限点', value: () => userStore.permissions.length, icon: 'Key', bg: '#409EFF' },
  { label: '菜单数', value: () => menuCount.value, icon: 'Menu', bg: '#67C23A' },
  { label: '当前用户', value: () => userStore.name || '-', icon: 'UserFilled', bg: '#E6A23C' },
  { label: '版本', value: () => 'v1.0.0', icon: 'Cpu', bg: '#909399' }
].map((s) => ({ ...s, value: typeof s.value === 'function' ? s.value() : s.value }))
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 16px;
}
.stat-card {
  border-radius: 8px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: #909399;
  font-size: 13px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
</style>
