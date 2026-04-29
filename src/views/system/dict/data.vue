<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="字典类型">
            <el-input v-model="query.dictType" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="query.dictLabel" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset">重置</el-button>
            <el-button @click="$router.back()">返回</el-button>
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
        <el-table-column prop="dictType" label="字典类型" min-width="140" />
        <el-table-column prop="dictLabel" label="标签" min-width="120" />
        <el-table-column prop="dictValue" label="键值" min-width="120" />
        <el-table-column prop="dictSort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
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
      :title="editingId ? '编辑字典数据' : '新增字典数据'"
      width="500px"
      @open="onOpen"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="formLoading">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" />
        </el-form-item>
        <el-form-item label="标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" />
        </el-form-item>
        <el-form-item label="键值" prop="dictValue">
          <el-input v-model="form.dictValue" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" :min="0" />
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
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import {
  listDictData,
  getDictData,
  saveDictData,
  updateDictData,
  deleteDictData
} from '@/api/dict'

const route = useRoute()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const query = reactive({
  page: 1,
  limit: 10,
  dictType: route.params.dictType || '',
  dictLabel: ''
})

const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({
  id: null,
  dictType: query.dictType || '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: 1,
  remark: ''
})
const rules = {
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  dictLabel: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入键值', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const { page } = await listDictData(query)
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
  query.dictLabel = ''
  query.page = 1
  loadList()
}

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onOpen() {
  Object.assign(form, {
    id: null,
    dictType: query.dictType || '',
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
  if (editingId.value) {
    formLoading.value = true
    try {
      const { dictData } = await getDictData(editingId.value)
      Object.assign(form, dictData)
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
      await updateDictData(form)
      ElMessage.success('更新成功')
    } else {
      await saveDictData(form)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除字典数据 [${row.dictLabel}] 吗？`, '提示', { type: 'warning' })
  await deleteDictData([row.id])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  })
  await deleteDictData(selection.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
