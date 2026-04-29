<template>
  <div class="app-container">
    <el-card>
      <div class="toolbar">
        <div>
          <el-button type="primary" v-permission="'sys:menu:save'" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button @click="loadList">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        row-key="menuId"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.icon" style="margin-right: 4px"><component :is="row.icon" /></el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type).type" size="small">{{ typeTag(row.type).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="路由" min-width="160" />
        <el-table-column prop="perms" label="权限标识" min-width="180" />
        <el-table-column prop="orderNum" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'sys:menu:save'" @click="openForm(null, row.menuId)">
              新增
            </el-button>
            <el-button link type="primary" v-permission="'sys:menu:update'" @click="openForm(row.menuId)">
              编辑
            </el-button>
            <el-button link type="danger" v-permission="'sys:menu:delete'" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuForm
      v-model:visible="formVisible"
      :menu-id="editingId"
      :parent-id="parentId"
      :menu-tree="list"
      @ok="loadList"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MenuForm from './form.vue'
import { listMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const list = ref([])

const formVisible = ref(false)
const editingId = ref(null)
const parentId = ref(0)

function typeTag(type) {
  return (
    {
      0: { text: '目录', type: 'info' },
      1: { text: '菜单', type: 'success' },
      2: { text: '按钮', type: 'warning' }
    }[type] || { text: '未知', type: '' }
  )
}

async function loadList() {
  loading.value = true
  try {
    const { menuTree } = await listMenu()
    list.value = menuTree || []
  } finally {
    loading.value = false
  }
}

function openForm(id = null, pid = 0) {
  editingId.value = id
  parentId.value = pid
  formVisible.value = true
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除菜单 [${row.name}] 吗？`, '提示', { type: 'warning' })
  await deleteMenu(row.menuId)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
