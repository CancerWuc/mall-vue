<template>
  <div class="breadcrumb-bar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, idx) in items" :key="idx" :to="item.path">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const items = computed(() => {
  const matched = route.matched.filter((m) => m.meta && m.meta.title)
  if (matched.length === 0 || matched[0].path !== '/') {
    matched.unshift({ path: '/dashboard', meta: { title: '首页' } })
  }
  return matched.map((m) => ({ path: m.path || '/', title: m.meta.title }))
})
</script>

<style scoped>
.breadcrumb-bar {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.76);
  border-bottom: 1px solid rgba(230, 237, 247, 0.9);
  backdrop-filter: blur(14px);
}

:deep(.el-breadcrumb__inner),
:deep(.el-breadcrumb__separator) {
  color: #8a96a8;
  font-weight: 500;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #526071;
}
</style>
