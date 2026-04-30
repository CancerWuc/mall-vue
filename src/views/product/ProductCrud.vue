<template>
  <div class="app-container">
    <el-card>
      <div class="toolbar">
        <div class="title-block">
          <h2>{{ config.title }}</h2>
          <span>{{ config.resource }}</span>
        </div>
        <div>
          <el-button type="primary" @click="openForm()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button type="danger" :disabled="!selection.length" @click="onBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button @click="loadList">
            <el-icon><Refresh /></el-icon>刷新
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
        <el-table-column
          v-for="column in config.tableFields"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :show-overflow-tooltip="column.showOverflowTooltip"
        >
          <template #default="{ row }">
            <template v-if="column.type === 'image'">
              <el-image
                v-if="row[column.prop]"
                :src="row[column.prop]"
                fit="cover"
                class="table-image"
                :preview-src-list="[row[column.prop]]"
                hide-on-click-modal
              />
              <span v-else class="text-muted">无</span>
            </template>
            <template v-else-if="column.type === 'tag'">
              <el-tag :type="tagType(row[column.prop])" size="small">
                {{ optionLabel(column, row[column.prop]) }}
              </el-tag>
            </template>
            <template v-else>
              {{ formatValue(row[column.prop]) }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openForm(row[config.idField])">编辑</el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
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
      :title="editingId ? `编辑${config.title}` : `新增${config.title}`"
      width="720px"
      @open="onOpen"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="formLoading">
        <div class="form-grid">
          <el-form-item
            v-for="item in config.formFields"
            :key="item.prop"
            :class="{ 'span-2': item.span === 2 }"
            :label="item.label"
            :prop="item.prop"
          >
            <el-input-number
              v-if="item.type === 'number'"
              v-model="form[item.prop]"
              :min="item.min"
              :precision="item.precision"
              controls-position="right"
              class="full-control"
            />
            <el-switch
              v-else-if="item.type === 'switch'"
              v-model="form[item.prop]"
              :active-value="1"
              :inactive-value="0"
            />
            <el-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              clearable
              class="full-control"
            >
              <el-option
                v-for="option in item.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-input
              v-else-if="item.type === 'textarea'"
              v-model="form[item.prop]"
              type="textarea"
              :rows="3"
            />
            <el-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="form[item.prop]"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="full-control"
            />
            <el-input v-else v-model="form[item.prop]" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { productConfigs } from './configs'
import {
  deleteProductResource,
  getProductResource,
  listProductResource,
  saveProductResource,
  updateProductResource
} from '@/api/product'

const route = useRoute()
const config = computed(() => productConfigs[route.meta.productKey] || productConfigs.category)
const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const query = reactive({ page: 1, limit: 10 })

const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({})

const rules = computed(() =>
  config.value.formFields.reduce((map, item) => {
    if (item.required) {
      map[item.prop] = [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }]
    }
    return map
  }, {})
)

watch(
  () => route.meta.productKey,
  () => {
    query.page = 1
    selection.value = []
    loadList()
  }
)

async function loadList() {
  loading.value = true
  try {
    const { page } = await listProductResource(config.value.resource, query)
    list.value = sortById(page?.list || [])
    total.value = page?.totalCount || 0
  } finally {
    loading.value = false
  }
}

function sortById(rows) {
  const idField = config.value.idField
  return [...rows].sort((a, b) => Number(a[idField] || 0) - Number(b[idField] || 0))
}

function openForm(id = null) {
  editingId.value = id
  formVisible.value = true
}

async function onOpen() {
  resetForm()
  formRef.value?.clearValidate()
  if (editingId.value !== null && typeof editingId.value !== 'undefined') {
    formLoading.value = true
    try {
      const res = await getProductResource(config.value.resource, editingId.value)
      Object.assign(form, res[config.value.infoKey] || {})
    } finally {
      formLoading.value = false
    }
  }
}

function resetForm() {
  Object.keys(form).forEach((key) => delete form[key])
  config.value.formFields.forEach((item) => {
    form[item.prop] = item.defaultValue ?? null
  })
  if (editingId.value) {
    form[config.value.idField] = editingId.value
  }
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateProductResource(config.value.resource, form)
      ElMessage.success('更新成功')
    } else {
      await saveProductResource(config.value.resource, form)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  const name = row[config.value.nameField] || row[config.value.idField]
  await ElMessageBox.confirm(`确认删除 [${name}] 吗？`, '提示', { type: 'warning' })
  await deleteProductResource(config.value.resource, [row[config.value.idField]])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  })
  await deleteProductResource(
    config.value.resource,
    selection.value.map((row) => row[config.value.idField])
  )
  ElMessage.success('删除成功')
  loadList()
}

function optionLabel(column, value) {
  return column.options?.find((item) => item.value === value)?.label ?? formatValue(value)
}

function tagType(value) {
  return Number(value) === 1 ? 'success' : 'info'
}

function formatValue(value) {
  if (value === null || typeof value === 'undefined' || value === '') return '-'
  return value
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.title-block {
  display: flex;
  align-items: baseline;
  gap: 10px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  span {
    color: #909399;
    font-size: 12px;
  }
}

.table-image {
  width: 54px;
  height: 54px;
  border-radius: 4px;
  background: #f5f7fa;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;

  .span-2 {
    grid-column: span 2;
  }
}

.full-control {
  width: 100%;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;

    .span-2 {
      grid-column: span 1;
    }
  }
}
</style>
