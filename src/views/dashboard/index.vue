<template>
  <div class="app-container dashboard">
    <section class="dashboard-hero">
      <div>
        <span class="eyebrow">Mall Admin</span>
        <h1>欢迎，{{ userStore.name || '管理员' }}</h1>
        <p>商品、库存、权限和系统配置都在这里汇总，常用入口可以直接进入。</p>
      </div>
      <el-button type="primary" @click="$router.push('/product/publish')">
        <el-icon><Promotion /></el-icon>
        发布商品
      </el-button>
    </section>

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
            <span>系统概览</span>
          </template>
          <p>后台已接入商品、仓储、权限、日志等模块，适合日常维护和商品发布流程演示。</p>
          <p class="text-muted">Vue 3 + Vite + Element Plus + Pinia</p>
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
  { label: '权限点', value: () => userStore.permissions.length, icon: 'Key', bg: '#2f7df6' },
  { label: '菜单数', value: () => menuCount.value, icon: 'Menu', bg: '#16a085' },
  { label: '当前用户', value: () => userStore.name || '-', icon: 'UserFilled', bg: '#f5a524' },
  { label: '版本', value: () => 'v1.0.0', icon: 'Cpu', bg: '#7c6be8' }
].map((s) => ({ ...s, value: typeof s.value === 'function' ? s.value() : s.value }))
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 18px;
}
.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(230, 237, 247, 0.9);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(47, 125, 246, 0.1), rgba(22, 160, 133, 0.08)),
    #fff;
  box-shadow: 0 12px 32px rgba(36, 62, 99, 0.08);

  .eyebrow {
    color: #2f7df6;
    font-size: 12px;
    font-weight: 700;
  }

  h1 {
    margin: 6px 0 8px;
    color: #1f2937;
    font-size: 26px;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: #526071;
  }
}
.stat-card {
  border-radius: 8px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(36, 62, 99, 0.12);
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: #8a96a8;
  font-size: 13px;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 720px) {
  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }
}
</style>
