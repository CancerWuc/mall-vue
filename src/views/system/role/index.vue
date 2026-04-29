<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="角色名">
            <el-input v-model="query.roleName" clearable placeholder="请输入角色名" @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div>
          <el-button type="primary" v-permission="'sys:role:save'" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button
            type="danger"
            :disabled="!selection.length"
            v-permission="'sys:role:delete'"
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
        <el-table-column prop="roleId" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'sys:role:update'" @click="openForm(row.roleId)">
              编辑
            </el-button>
            <el-button link type="danger" v-permission="'sys:role:delete'" @click="onDelete(row)">
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

    <RoleForm v-model:visible="formVisible" :role-id="editingId" :menu-tree="menuTree" @ok="loadList" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import RoleForm from './form.vue'
import { listRole, deleteRole } from '@/api/role'
import { selectMenu } from '@/api/menu'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const menuTree = ref([])

const query = reactive({ page: 1, limit: 10, roleName: '' })

const formVisible = ref(false)
const editingId = ref(null)

async function loadList() {
  loading.value = true
  try {
    const { page } = await listRole(query)
    list.value = page.list || []
    total.value = page.totalCount || 0
  } finally {
    loading.value = false
  }
}

async function loadMenuTree() {
  const { menuTree: tree } = await selectMenu()
  menuTree.value = tree || []
}

function onSearch() {
  query.page = 1
  loadList()
}

function onReset() {
  query.roleName = ''
  query.page = 1
  loadList()
}

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除角色 [${row.roleName}] 吗？`, '提示', { type: 'warning' })
  await deleteRole([row.roleId])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 个角色吗？`, '提示', {
    type: 'warning'
  })
  await deleteRole(selection.value.map((r) => r.roleId))
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => {
  loadMenuTree()
  loadList()
})
</script>
