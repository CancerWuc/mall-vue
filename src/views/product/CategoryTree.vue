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
          <el-button @click="loadRootCategories">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tree"
        row-key="catId"
        border
        stripe
        lazy
        :load="loadChildren"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="(rows) => (selection = rows)"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="分类名称" min-width="220" />
        <el-table-column prop="catId" label="ID" width="90" />
        <el-table-column prop="parentCid" label="父分类ID" width="110" />
        <el-table-column prop="catLevel" label="层级" width="80" align="center" />
        <el-table-column label="显示" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.showStatus === 1 ? 'success' : 'info'" size="small">
              {{ row.showStatus === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="productUnit" label="计量单位" width="110" />
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
            <el-input-number
              v-model="form.parentCid"
              :min="0"
              controls-position="right"
              class="full-control"
            />
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
  listCategoryChildren,
  saveProductResource,
  updateProductResource
} from '@/api/product'

const loading = ref(false)
const tree = shallowRef([])
const selection = ref([])
const formVisible = ref(false)
const formLoading = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const currentParent = ref(null)
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
  loading.value = true
  try {
    const { categories } = await listCategoryChildren(0)
    tree.value = sortById(categories || [])
  } finally {
    loading.value = false
  }
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
    loadRootCategories()
  } finally {
    submitting.value = false
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm(`确认删除分类 [${row.name}] 吗？`, '提示', { type: 'warning' })
  await deleteProductResource('category', [row.catId])
  ElMessage.success('删除成功')
  loadRootCategories()
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
  loadRootCategories()
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

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
