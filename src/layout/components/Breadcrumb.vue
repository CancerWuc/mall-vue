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
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
</style>
