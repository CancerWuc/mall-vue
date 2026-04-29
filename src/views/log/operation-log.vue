<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="用户名">
            <el-input v-model="query.username" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item label="操作">
            <el-input v-model="query.operation" clearable @keyup.enter="onSearch" />
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
        <el-table-column prop="operation" label="操作" min-width="160" />
        <el-table-column prop="method" label="方法" min-width="200" show-overflow-tooltip />
        <el-table-column prop="params" label="参数" min-width="240" show-overflow-tooltip />
        <el-table-column prop="time" label="耗时(ms)" width="100" align="center" />
        <el-table-column prop="ip" label="IP" width="160" />
        <el-table-column prop="createTime" label="时间" width="180" />
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
import { listOperationLog } from '@/api/log'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, limit: 10, username: '', operation: '' })

async function loadList() {
  loading.value = true
  try {
    const { page } = await listOperationLog(query)
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
  query.operation = ''
  query.page = 1
  loadList()
}

onMounted(loadList)
</script>
