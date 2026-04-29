<template>
  <div class="app-container">
    <el-card>
      <template #header><span>个人中心</span></template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ user?.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user?.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user?.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="user?.status === 1 ? 'success' : 'danger'">
            {{ user?.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ user?.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <h3>我的权限</h3>
      <el-tag
        v-for="p in userStore.permissions"
        :key="p"
        size="small"
        style="margin: 4px"
        type="info"
      >
        {{ p }}
      </el-tag>
      <el-empty v-if="!userStore.permissions.length" description="暂无权限" />
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
</script>
