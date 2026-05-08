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
          :show-overflow-tooltip="isOverflowTooltipColumn(column)"
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
              :disabled="isFieldDisabled(item)"
              controls-position="right"
              class="full-control"
            />
            <el-switch
              v-else-if="item.type === 'switch'"
              v-model="form[item.prop]"
              :active-value="1"
              :inactive-value="0"
              :disabled="isFieldDisabled(item)"
            />
            <el-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              clearable
              class="full-control"
              :disabled="isFieldDisabled(item)"
            >
              <el-option
                v-for="option in item.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'brand'"
              v-model="form[item.prop]"
              clearable
              filterable
              class="full-control"
              :disabled="isFieldDisabled(item)"
              :placeholder="item.placeholder || '请选择品牌'"
              @change="(value) => onBrandChange(item, value)"
            >
              <el-option
                v-for="brand in brandOptions"
                :key="brand.brandId"
                :label="brand.name"
                :value="brand.brandId"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'spu'"
              v-model="form[item.prop]"
              clearable
              filterable
              class="full-control"
              :disabled="isFieldDisabled(item)"
              :placeholder="item.placeholder || '请选择 SPU'"
              @change="(value) => onSpuChange(item, value)"
            >
              <el-option
                v-for="spu in spuOptions"
                :key="spu.id"
                :label="spu.spuName"
                :value="spu.id"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'attr'"
              v-model="form[item.prop]"
              clearable
              filterable
              class="full-control"
              :disabled="isFieldDisabled(item)"
              :placeholder="item.placeholder || '���选择属性'"
              @change="(value) => onAttrChange(item, value)"
            >
              <el-option
                v-for="attr in attrOptions"
                :key="attr.attrId"
                :label="attr.attrName"
                :value="attr.attrId"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'attrgroup'"
              v-model="form[item.prop]"
              clearable
              filterable
              class="full-control"
              :disabled="isFieldDisabled(item)"
              :placeholder="item.placeholder || '���选择分组'"
              @change="(value) => onAttrGroupChange(item, value)"
            >
              <el-option
                v-for="group in attrGroupOptions"
                :key="group.attrGroupId"
                :label="group.attrGroupName"
                :value="group.attrGroupId"
              />
            </el-select>
            <el-popover
              v-else-if="item.type === 'category'"
              v-model:visible="categoryPickerVisible[item.prop]"
              trigger="click"
              placement="bottom-start"
              width="720"
              popper-class="category-picker-popper"
              :disabled="isFieldDisabled(item)"
              @show="openCategoryPicker(item.prop)"
            >
              <template #reference>
                <el-input
                  :model-value="categoryLabel(form[item.prop])"
                  readonly
                  :clearable="!isFieldDisabled(item)"
                  :disabled="isFieldDisabled(item)"
                  class="full-control"
                  :placeholder="item.placeholder || '请选择分类'"
                  @clear="clearCategory(item)"
                />
              </template>
              <el-cascader-panel
                v-model="pendingCategoryValues[item.prop]"
                :options="categoryOptions"
                :props="categoryProps"
                class="category-panel"
              />
              <div class="category-picker-actions">
                <el-button @click="cancelCategory(item.prop)">取消</el-button>
                <el-button type="primary" @click="confirmCategory(item.prop)">确定</el-button>
              </div>
            </el-popover>
            <template v-else-if="item.type === 'oss-image'">
              <el-input
                v-model="form[item.prop]"
                placeholder="可直接上传图片，或手动输入图片地址"
              >
                <template #prepend>
                  <el-upload
                    :show-file-list="false"
                    :before-upload="beforeImageUpload"
                    :http-request="(options) => handleOssImageUpload(item, options)"
                  >
                    <el-button :loading="uploadingField === item.prop">上传图片</el-button>
                  </el-upload>
                </template>
                <template #append>
                  <el-button :disabled="!form[item.prop]" @click="clearImage(item.prop)">清空</el-button>
                </template>
              </el-input>
              <div v-if="form[item.prop]" class="image-field-preview">
                <el-image
                  :src="form[item.prop]"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="[form[item.prop]]"
                  hide-on-click-modal
                />
              </div>
            </template>
            <el-input
              v-else-if="item.type === 'textarea'"
              v-model="form[item.prop]"
              type="textarea"
              :rows="3"
              :disabled="isFieldDisabled(item)"
            />
            <el-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="form[item.prop]"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="full-control"
              :disabled="isFieldDisabled(item)"
            />
            <el-input v-else v-model="form[item.prop]" :disabled="isFieldDisabled(item)" />
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
import { wareConfigs } from '@/views/inventory/configs'
import { uploadOss } from '@/api/oss'
import { listCategoryTree } from '@/api/product'
import { deleteResource, getResource, listResource, saveResource, updateResource } from '@/api/resource'

const route = useRoute()
const configGroups = {
  product: productConfigs,
  ware: wareConfigs
}
const moduleKey = computed(() => route.meta.moduleKey || 'product')
const resourceKey = computed(() => route.meta.resourceKey || route.meta.productKey || 'category')
const config = computed(() => configGroups[moduleKey.value]?.[resourceKey.value] || productConfigs.category)
const apiBase = computed(() => route.meta.apiBase || config.value.apiBase || moduleKey.value)
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
const uploadingField = ref('')
const categoryOptions = ref([])
const brandOptions = ref([])
const spuOptions = ref([])
const attrOptions = ref([])
const attrGroupOptions = ref([])
const categoryPickerVisible = reactive({})
const pendingCategoryValues = reactive({})
const categoryProps = {
  value: 'catId',
  label: 'name',
  children: 'children',
  emitPath: false,
  checkStrictly: true
}

const rules = computed(() =>
  config.value.formFields.reduce((map, item) => {
    if (item.required) {
      map[item.prop] = [
        {
          required: true,
          message: `${['brand', 'category', 'select', 'spu', 'attr', 'attrgroup'].includes(item.type) ? '请选择' : '请输入'}${item.label}`,
          trigger: ['brand', 'category', 'select', 'spu', 'attr', 'attrgroup'].includes(item.type) ? 'change' : 'blur'
        }
      ]
    }
    return map
  }, {})
)

watch(
  () => [route.meta.moduleKey, route.meta.resourceKey, route.meta.productKey],
  () => {
    query.page = 1
    selection.value = []
    loadList()
  }
)

async function loadList() {
  loading.value = true
  try {
    const { page } = await listResource(apiBase.value, config.value.resource, query)
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
  await ensureCategoryOptions()
  await ensureBrandOptions()
  await ensureSpuOptions()
  await ensureAttrOptions()
  await ensureAttrGroupOptions()
  formRef.value?.clearValidate()
  if (editingId.value !== null && typeof editingId.value !== 'undefined') {
    formLoading.value = true
    try {
      const res = await getResource(apiBase.value, config.value.resource, editingId.value)
      Object.assign(form, res[config.value.infoKey] || {})
    } finally {
      formLoading.value = false
    }
  }
}

async function ensureCategoryOptions() {
  if (!config.value.formFields.some((item) => item.type === 'category')) {
    return
  }
  if (categoryOptions.value.length) {
    return
  }

  const { categories } = await listCategoryTree()
  categoryOptions.value = normalizeCategoryOptions(categories || [])
}

async function ensureBrandOptions() {
  if (!config.value.formFields.some((item) => item.type === 'brand')) {
    return
  }
  if (brandOptions.value.length) {
    return
  }

  const { page } = await listResource('product', 'brand', { page: 1, limit: 1000 })
  brandOptions.value = [...(page?.list || [])].sort(
    (a, b) => Number(a.brandId || 0) - Number(b.brandId || 0)
  )
}

async function ensureSpuOptions() {
  if (!config.value.formFields.some((item) => item.type === 'spu')) {
    return
  }
  if (spuOptions.value.length) {
    return
  }

  const { page } = await listResource('product', 'spuinfo', { page: 1, limit: 1000 })
  spuOptions.value = [...(page?.list || [])].sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
}

async function ensureAttrOptions() {
  if (!config.value.formFields.some((item) => item.type === 'attr')) {
    return
  }
  if (attrOptions.value.length) {
    return
  }

  const { page } = await listResource('product', 'attr', { page: 1, limit: 1000 })
  attrOptions.value = [...(page?.list || [])].sort(
    (a, b) => Number(a.attrId || 0) - Number(b.attrId || 0)
  )
}

async function ensureAttrGroupOptions() {
  if (!config.value.formFields.some((item) => item.type === 'attrgroup')) {
    return
  }
  if (attrGroupOptions.value.length) {
    return
  }

  const { page } = await listResource('product', 'attrgroup', { page: 1, limit: 1000 })
  attrGroupOptions.value = [...(page?.list || [])].sort(
    (a, b) => Number(a.attrGroupId || 0) - Number(b.attrGroupId || 0)
  )
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

function openCategoryPicker(prop) {
  pendingCategoryValues[prop] = form[prop] ?? null
}

function confirmCategory(prop) {
  form[prop] = pendingCategoryValues[prop] ?? null
  categoryPickerVisible[prop] = false
  formRef.value?.validateField(prop)
}

function cancelCategory(prop) {
  pendingCategoryValues[prop] = form[prop] ?? null
  categoryPickerVisible[prop] = false
}

function clearCategory(item) {
  if (isFieldDisabled(item)) {
    return
  }
  form[item.prop] = null
  pendingCategoryValues[item.prop] = null
  formRef.value?.validateField(item.prop)
}

function onBrandChange(item, value) {
  if (!item.nameProp) {
    return
  }
  const brand = brandOptions.value.find((option) => option.brandId === value)
  form[item.nameProp] = brand?.name || ''
}

function onSpuChange(item, value) {
  if (!item.nameProp) {
    applyLinkedFields(item, null)
    return
  }
  const spu = spuOptions.value.find((option) => option.id === value)
  form[item.nameProp] = spu?.spuName || ''
  applyLinkedFields(item, spu)
}

function onAttrChange(item, value) {
  if (!item.nameProp) {
    return
  }
  const attr = attrOptions.value.find((option) => option.attrId === value)
  form[item.nameProp] = attr?.attrName || ''
}

function onAttrGroupChange(item, value) {
  if (!item.nameProp) {
    return
  }
  const group = attrGroupOptions.value.find((option) => option.attrGroupId === value)
  form[item.nameProp] = group?.attrGroupName || ''
}

function fillDerivedFormValues() {
  config.value.formFields.forEach((item) => {
    if (item.type === 'brand') {
      onBrandChange(item, form[item.prop])
    }
    if (item.type === 'spu') {
      onSpuChange(item, form[item.prop])
    }
    if (item.type === 'attr') {
      onAttrChange(item, form[item.prop])
    }
    if (item.type === 'attrgroup') {
      onAttrGroupChange(item, form[item.prop])
    }
  })
}

function applyLinkedFields(item, source) {
  Object.entries(item.linkedFields || {}).forEach(([targetProp, sourceProp]) => {
    form[targetProp] = source?.[sourceProp] ?? null
  })
}

function isFieldDisabled(item) {
  if (typeof item.disabled === 'function') {
    return item.disabled(form)
  }
  return !!item.disabled
}

function categoryLabel(value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return ''
  }
  const path = findCategoryPath(categoryOptions.value, value)
  return path.length ? path.map((category) => category.name).join(' / ') : String(value)
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

function resetForm() {
  Object.keys(form).forEach((key) => delete form[key])
  config.value.formFields.forEach((item) => {
    form[item.prop] = item.defaultValue ?? null
  })
  uploadingField.value = ''
  Object.keys(categoryPickerVisible).forEach((key) => {
    categoryPickerVisible[key] = false
  })
  Object.keys(pendingCategoryValues).forEach((key) => {
    delete pendingCategoryValues[key]
  })
  if (editingId.value) {
    form[config.value.idField] = editingId.value
  }
}

async function onSubmit() {
  await formRef.value?.validate()
  fillDerivedFormValues()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateResource(apiBase.value, config.value.resource, form)
      ElMessage.success('更新成功')
    } else {
      await saveResource(apiBase.value, config.value.resource, form)
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
  await deleteResource(apiBase.value, config.value.resource, [row[config.value.idField]])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  })
  await deleteResource(
    apiBase.value,
    config.value.resource,
    selection.value.map((row) => row[config.value.idField])
  )
  ElMessage.success('删除成功')
  loadList()
}

function optionLabel(column, value) {
  return column.options?.find((item) => item.value === value)?.label ?? formatValue(value)
}

function isOverflowTooltipColumn(column) {
  if (typeof column.showOverflowTooltip !== 'undefined') {
    return column.showOverflowTooltip
  }
  return column.type !== 'image' && column.type !== 'tag'
}

function beforeImageUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

async function handleOssImageUpload(item, { file }) {
  uploadingField.value = item.prop
  try {
    const res = await uploadOss(file)
    form[item.prop] = res.url || ''
    ElMessage.success('图片上传成功')
  } finally {
    uploadingField.value = ''
  }
}

function clearImage(prop) {
  form[prop] = ''
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

.image-field-preview {
  width: 100%;
  margin-top: 10px;
}

.preview-image {
  width: 96px;
  height: 96px;
  border-radius: 6px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
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
  border-top: 1px solid #ebeef5;
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

    .span-2 {
      grid-column: span 1;
    }
  }
}
</style>
