<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="用户名">
            <el-input
              v-model="query.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="onSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div>
          <el-button type="primary" v-permission="'sys:user:save'" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button
            type="danger"
            :disabled="!selection.length"
            v-permission="'sys:user:delete'"
            @click="onBatchDelete"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        border
        stripe
        @selection-change="(rows) => (selection = rows)"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="mobile" label="手机号" width="140" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'sys:user:update'" @click="openForm(row.userId)">
              编辑
            </el-button>
            <el-button link type="danger" v-permission="'sys:user:delete'" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:page="query.page"
        v-model:limit="query.limit"
        :total="total"
        @pagination="loadList"
      />
    </el-card>

    <UserForm v-model:visible="formVisible" :user-id="editingId" :role-list="roleList" @ok="loadList" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import UserForm from './form.vue'
import { listUser, deleteUser } from '@/api/user'
import { selectRole } from '@/api/role'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const roleList = ref([])

const query = reactive({ page: 1, limit: 10, username: '' })

const formVisible = ref(false)
const editingId = ref(null)

async function loadList() {
  loading.value = true
  try {
    const { page } = await listUser(query)
    list.value = page.list || []
    total.value = page.totalCount || 0
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  const { list: rs } = await selectRole()
  roleList.value = rs || []
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

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除用户 [${row.username}] 吗？`, '提示', { type: 'warning' })
  await deleteUser([row.userId])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 个用户吗？`, '提示', {
    type: 'warning'
  })
  const ids = selection.value.map((r) => r.userId)
  await deleteUser(ids)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => {
  loadRoles()
  loadList()
})
</script>
