<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="参数键">
            <el-input v-model="query.paramKey" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div>
          <el-button type="primary" v-permission="'sys:config:save'" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button
            type="danger"
            :disabled="!selection.length"
            v-permission="'sys:config:delete'"
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="paramKey" label="参数键" min-width="180" />
        <el-table-column prop="paramValue" label="参数值" min-width="240" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-permission="'sys:config:update'" @click="openForm(row.id)">
              编辑
            </el-button>
            <el-button link type="danger" v-permission="'sys:config:delete'" @click="onDelete(row)">
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

    <el-dialog
      v-model="formVisible"
      :title="editingId ? '编辑参数' : '新增参数'"
      width="500px"
      @open="onOpen"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="formLoading">
        <el-form-item label="参数键" prop="paramKey">
          <el-input v-model="form.paramKey" />
        </el-form-item>
        <el-form-item label="参数值" prop="paramValue">
          <el-input v-model="form.paramValue" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import {
  listConfig,
  getConfig,
  saveConfig,
  updateConfig,
  deleteConfig
} from '@/api/config'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const query = reactive({ page: 1, limit: 10, paramKey: '' })

const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({ id: null, paramKey: '', paramValue: '', status: 1, remark: '' })
const rules = {
  paramKey: [{ required: true, message: '请输入参数键', trigger: 'blur' }],
  paramValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const { page } = await listConfig(query)
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
  query.paramKey = ''
  query.page = 1
  loadList()
}

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onOpen() {
  Object.assign(form, { id: null, paramKey: '', paramValue: '', status: 1, remark: '' })
  formRef.value?.clearValidate()
  if (editingId.value) {
    formLoading.value = true
    try {
      const { config } = await getConfig(editingId.value)
      Object.assign(form, config)
    } finally {
      formLoading.value = false
    }
  }
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateConfig(form)
      ElMessage.success('更新成功')
    } else {
      await saveConfig(form)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除参数 [${row.paramKey}] 吗？`, '提示', { type: 'warning' })
  await deleteConfig([row.id])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条参数吗？`, '提示', {
    type: 'warning'
  })
  await deleteConfig(selection.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
