<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="字典名">
            <el-input v-model="query.dictName" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item label="字典类型">
            <el-input v-model="query.dictType" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div>
          <el-button type="primary" v-permission="'sys:dict:save'" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button
            type="danger"
            :disabled="!selection.length"
            v-permission="'sys:dict:delete'"
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
        <el-table-column prop="dictName" label="字典名" min-width="160" />
        <el-table-column prop="dictType" label="字典类型" min-width="160" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goData(row)">字典数据</el-button>
            <el-button link type="primary" v-permission="'sys:dict:update'" @click="openForm(row.id)">
              编辑
            </el-button>
            <el-button link type="danger" v-permission="'sys:dict:delete'" @click="onDelete(row)">
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
      :title="editingId ? '编辑字典类型' : '新增字典类型'"
      width="500px"
      @open="onOpen"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="formLoading">
        <el-form-item label="字典名" prop="dictName">
          <el-input v-model="form.dictName" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination/index.vue'
import {
  listDictType,
  getDictType,
  saveDictType,
  updateDictType,
  deleteDictType
} from '@/api/dict'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const query = reactive({ page: 1, limit: 10, dictName: '', dictType: '' })

const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({ id: null, dictName: '', dictType: '', status: 1, remark: '' })
const rules = {
  dictName: [{ required: true, message: '请输入字典名', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const { page } = await listDictType(query)
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
  query.dictName = ''
  query.dictType = ''
  query.page = 1
  loadList()
}

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onOpen() {
  Object.assign(form, { id: null, dictName: '', dictType: '', status: 1, remark: '' })
  formRef.value?.clearValidate()
  if (editingId.value) {
    formLoading.value = true
    try {
      const { dictType } = await getDictType(editingId.value)
      Object.assign(form, dictType)
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
      await updateDictType(form)
      ElMessage.success('更新成功')
    } else {
      await saveDictType(form)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除字典 [${row.dictName}] 吗？`, '提示', { type: 'warning' })
  await deleteDictType([row.id])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  })
  await deleteDictType(selection.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadList()
}

function goData(row) {
  router.push({ path: `/system/dict-data/${row.dictType}` })
}

onMounted(loadList)
</script>
