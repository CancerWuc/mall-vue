<template>
  <div class="app-container">
    <el-card>
      <div class="toolbar">
        <div class="title-block">
          <h2>商品分类</h2>
          <span>三级分类树</span>
        </div>
        <div>
          <el-button type="primary" @click="openForm()">
            <el-icon><Plus /></el-icon>新增一级分类
          </el-button>
          <el-button type="danger" :disabled="!selection.length" @click="onBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button @click="reloadCategories">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-form class="search-form" :inline="true" :model="query" @submit.prevent>
        <el-form-item label="分类名称">
          <el-input
            v-model="query.name"
            clearable
            class="search-control"
            placeholder="请输入分类名称"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="query.showStatus" clearable class="search-control" placeholder="请选择显示状态">
            <el-option label="隐藏" :value="0" />
            <el-option label="显示" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="层级">
          <el-select v-model="query.catLevel" clearable class="search-control" placeholder="请选择层级">
            <el-option label="一级" :value="1" />
            <el-option label="二级" :value="2" />
            <el-option label="三级" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="onResetSearch">
            <el-icon><RefreshLeft /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tree"
        row-key="catId"
        border
        stripe
        :lazy="!searchActive"
        :load="loadChildren"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="(rows) => (selection = rows)"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="分类名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="catId" label="ID" width="90" />
        <el-table-column prop="parentName" label="父分类名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="catLevel" label="层级" width="80" align="center" />
        <el-table-column label="显示" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.showStatus === 1 ? 'success' : 'info'" size="small">
              {{ row.showStatus === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="productUnit" label="计量单位" width="110" show-overflow-tooltip />
        <el-table-column prop="productCount" label="商品数量" width="110" align="right" />
        <el-table-column prop="icon" label="图标地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.catLevel >= 3"
              @click="openForm(null, row)"
            >
              新增子级
            </el-button>
            <el-button link type="primary" @click="openForm(row.catId)">编辑</el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="formVisible"
      :title="editingId ? '编辑商品分类' : '新增商品分类'"
      width="680px"
      @open="onOpen"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="formLoading">
        <div class="form-grid">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="上级分类" prop="parentCid">
            <el-popover
              v-model:visible="parentPickerVisible"
              trigger="click"
              placement="bottom-start"
              width="720"
              popper-class="category-picker-popper"
              @show="openParentPicker"
            >
              <template #reference>
                <el-input
                  :model-value="categoryLabel(form.parentCid)"
                  readonly
                  clearable
                  placeholder="请选择上级分类"
                  class="full-control"
                  @clear="clearParentCategory"
                />
              </template>
              <el-cascader-panel
                v-model="pendingParentCid"
                :options="categoryOptions"
                :props="categoryProps"
                class="category-panel"
              />
              <div class="category-picker-actions">
                <el-button @click="cancelParentCategory">取消</el-button>
                <el-button type="primary" @click="confirmParentCategory">确定</el-button>
              </div>
            </el-popover>
          </el-form-item>
          <el-form-item label="层级" prop="catLevel">
            <el-input-number
              v-model="form.catLevel"
              :min="1"
              :max="3"
              controls-position="right"
              class="full-control"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" controls-position="right" class="full-control" />
          </el-form-item>
          <el-form-item label="是否显示" prop="showStatus">
            <el-switch v-model="form.showStatus" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="计量单位" prop="productUnit">
            <el-input v-model="form.productUnit" />
          </el-form-item>
          <el-form-item label="商品数量" prop="productCount">
            <el-input-number
              v-model="form.productCount"
              :min="0"
              controls-position="right"
              class="full-control"
            />
          </el-form-item>
          <el-form-item label="图标地址" prop="icon">
            <el-input v-model="form.icon" />
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
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteProductResource,
  getProductResource,
  listProductResource,
  listCategoryChildren,
  listCategoryTree,
  saveProductResource,
  updateProductResource
} from '@/api/product'

const loading = ref(false)
const tree = shallowRef([])
const selection = ref([])
const searchActive = ref(false)
const query = reactive({ name: '', showStatus: '', catLevel: '' })
const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const currentParent = ref(null)
const categoryOptions = ref([])
const parentPickerVisible = ref(false)
const pendingParentCid = ref(0)
const categoryProps = {
  value: 'catId',
  label: 'name',
  children: 'children',
  emitPath: false,
  checkStrictly: true
}
const form = reactive({
  catId: null,
  name: '',
  parentCid: 0,
  catLevel: 1,
  showStatus: 1,
  sort: 0,
  icon: '',
  productUnit: '',
  productCount: 0
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentCid: [{ required: true, message: '请选择上级分类', trigger: 'change' }],
  catLevel: [{ required: true, message: '请输入层级', trigger: 'change' }]
}

async function loadRootCategories() {
  searchActive.value = false
  loading.value = true
  try {
    const { categories } = await listCategoryChildren(0)
    tree.value = sortById(categories || [])
  } finally {
    loading.value = false
  }
}

async function reloadCategories() {
  if (searchActive.value) {
    await onSearch()
    return
  }
  await loadRootCategories()
}

async function onSearch() {
  searchActive.value = true
  loading.value = true
  try {
    const { page } = await listProductResource('category', {
      page: 1,
      limit: 1000,
      name: query.name,
      showStatus: query.showStatus,
      catLevel: query.catLevel
    })
    tree.value = sortById(page?.list || [])
  } finally {
    loading.value = false
  }
}

async function onResetSearch() {
  query.name = ''
  query.showStatus = ''
  query.catLevel = ''
  await loadRootCategories()
}

async function loadChildren(row, treeNode, resolve) {
  try {
    const { categories } = await listCategoryChildren(row.catId)
    resolve(sortById(categories || []))
  } catch (e) {
    resolve([])
  }
}

function sortById(rows) {
  return [...rows].sort((a, b) => Number(a.catId || 0) - Number(b.catId || 0))
}

function openForm(id = null, parent = null) {
  editingId.value = id
  currentParent.value = parent
  formVisible.value = true
}

async function onOpen() {
  resetForm()
  await ensureCategoryOptions()
  formRef.value?.clearValidate()

  if (currentParent.value) {
    form.parentCid = currentParent.value.catId
    form.catLevel = Math.min((currentParent.value.catLevel || 0) + 1, 3)
  }

  if (editingId.value) {
    formLoading.value = true
    try {
      const { category } = await getProductResource('category', editingId.value)
      Object.assign(form, category)
    } finally {
      formLoading.value = false
    }
  }
}

async function ensureCategoryOptions() {
  if (categoryOptions.value.length) {
    return
  }

  const { categories } = await listCategoryTree()
  categoryOptions.value = [
    {
      catId: 0,
      name: '一级分类',
      catLevel: 0,
      children: normalizeCategoryOptions(categories || [])
    }
  ]
}

function normalizeCategoryOptions(categories) {
  return categories.map((category) => {
    const children = normalizeCategoryOptions(category.children || [])
    const option = { ...category }
    if (children.length) {
      option.children = children
    } else {
      delete option.children
    }
    return option
  })
}

function onParentChange(parentCid) {
  const parent = findCategoryOption(categoryOptions.value, parentCid)
  form.catLevel = Math.min((parent?.catLevel || 0) + 1, 3)
}

function openParentPicker() {
  pendingParentCid.value = form.parentCid ?? 0
}

function confirmParentCategory() {
  form.parentCid = pendingParentCid.value ?? 0
  onParentChange(form.parentCid)
  parentPickerVisible.value = false
  formRef.value?.validateField('parentCid')
}

function cancelParentCategory() {
  pendingParentCid.value = form.parentCid ?? 0
  parentPickerVisible.value = false
}

function clearParentCategory() {
  form.parentCid = 0
  pendingParentCid.value = 0
  onParentChange(0)
  formRef.value?.validateField('parentCid')
}

function categoryLabel(value) {
  const path = findCategoryPath(categoryOptions.value, value ?? 0)
  return path.length ? path.map((category) => category.name).join(' / ') : ''
}

function findCategoryPath(options, value, path = []) {
  for (const option of options) {
    const nextPath = [...path, option]
    if (option.catId === value) {
      return nextPath
    }
    const matched = findCategoryPath(option.children || [], value, nextPath)
    if (matched.length) {
      return matched
    }
  }
  return []
}

function findCategoryOption(options, catId) {
  for (const option of options) {
    if (option.catId === catId) {
      return option
    }
    const matched = findCategoryOption(option.children || [], catId)
    if (matched) {
      return matched
    }
  }
  return null
}

function resetForm() {
  Object.assign(form, {
    catId: null,
    name: '',
    parentCid: 0,
    catLevel: 1,
    showStatus: 1,
    sort: 0,
    icon: '',
    productUnit: '',
    productCount: 0
  })
  parentPickerVisible.value = false
  pendingParentCid.value = 0
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateProductResource('category', form)
      ElMessage.success('更新成功')
    } else {
      await saveProductResource('category', form)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    reloadCategories()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除分类 [${row.name}] 吗？`, '提示', { type: 'warning' })
  await deleteProductResource('category', [row.catId])
  ElMessage.success('删除成功')
  reloadCategories()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 个分类吗？`, '提示', {
    type: 'warning'
  })
  await deleteProductResource(
    'category',
    selection.value.map((row) => row.catId)
  )
  ElMessage.success('删除成功')
  reloadCategories()
}

onMounted(loadRootCategories)
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}

.full-control {
  width: 100%;
}

.search-form {
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid #eaf0f8;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(47, 125, 246, 0.07), rgba(22, 160, 133, 0.05)),
    #f9fbff;
}

.search-control {
  width: 210px;
}

.category-panel {
  width: 100%;
  max-width: calc(90vw - 48px);
  overflow-x: auto;
}

.category-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e6edf7;
  margin-top: 12px;
}

:deep(.category-panel .el-cascader-menu) {
  min-width: 210px;
}

:deep(.category-panel .el-cascader-node__label) {
  max-width: 168px;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
