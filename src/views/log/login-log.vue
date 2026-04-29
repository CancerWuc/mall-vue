<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="用户名">
            <el-input v-model="query.username" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="160" />
        <el-table-column prop="userAgent" label="User-Agent" min-width="320" show-overflow-tooltip />
        <el-table-column prop="createTime" label="登录时间" width="180" />
      </el-table>

      <Pagination
        v-model:page="query.page"
        v-model:limit="query.limit"
        :total="total"
        @pagination="loadList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import Pagination from '@/components/Pagination/index.vue'
import { listLoginLog } from '@/api/log'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, limit: 10, username: '' })

async function loadList() {
  loading.value = true
  try {
    const { page } = await listLoginLog(query)
    list.value = page.list || []
    total.value = page.totalCount || 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.page = 1
  loadList()
}
function onReset() {
  query.username = ''
  query.page = 1
  loadList()
}

onMounted(loadList)
</script>
