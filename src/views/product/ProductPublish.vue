<template>
  <div class="app-container product-publish">
    <el-card>
      <div class="publish-toolbar">
        <div class="title-block">
          <h2>商品发布</h2>
          <span>product/publish</span>
        </div>
        <el-button @click="resetAll">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>

      <el-steps :active="activeStep" finish-status="success" class="publish-steps">
        <el-step title="分类品牌" />
        <el-step title="SPU 信息" />
        <el-step title="商品属性" />
        <el-step title="SKU 信息" />
        <el-step title="确认发布" />
      </el-steps>

      <div class="step-body">
        <el-form
          v-if="activeStep === 0"
          ref="basicFormRef"
          :model="form"
          :rules="basicRules"
          label-width="100px"
          class="publish-form"
        >
          <el-form-item label="商品分类" prop="catalogId">
            <el-cascader
              v-model="form.catalogId"
              :options="categoryOptions"
              :props="categoryProps"
              clearable
              filterable
              class="full-control"
              placeholder="请选择商品分类"
              @change="onCategoryChange"
            />
          </el-form-item>
          <el-form-item label="品牌名称" prop="brandId">
            <el-select
              v-model="form.brandId"
              :loading="brandsLoading"
              :disabled="!form.catalogId"
              clearable
              filterable
              class="full-control"
              placeholder="请选择品牌"
            >
              <el-option
                v-for="brand in brandOptions"
                :key="brand.brandId"
                :label="brand.name"
                :value="brand.brandId"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <el-form
          v-else-if="activeStep === 1"
          ref="spuFormRef"
          :model="form"
          :rules="spuRules"
          label-width="100px"
          class="publish-form"
        >
          <el-form-item label="商品名称" prop="spuName">
            <el-input v-model="form.spuName" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品重量" prop="weight">
            <el-input-number
              v-model="form.weight"
              :min="0"
              :precision="2"
              controls-position="right"
              class="full-control"
            />
          </el-form-item>
          <el-form-item label="上架状态" prop="publishStatus">
            <el-select v-model="form.publishStatus" class="full-control">
              <el-option label="下架" :value="0" />
              <el-option label="上架" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品描述" prop="spuDescription">
            <el-input v-model="form.spuDescription" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>

        <div v-else-if="activeStep === 2" v-loading="attrsLoading">
          <div class="section-head">
            <h3>基础属性</h3>
            <span>{{ baseAttrs.length }} 项</span>
          </div>
          <el-empty v-if="!baseAttrs.length" description="暂无基础属性" />
          <div v-else class="attr-grid">
            <div v-for="attr in baseAttrs" :key="attr.attrId" class="attr-row">
              <label>{{ attr.attrName }}</label>
              <el-select
                v-if="attrOptionList(attr).length"
                v-model="baseAttrValues[attr.attrId].value"
                :multiple="attr.valueType === 1"
                clearable
                filterable
                allow-create
                default-first-option
                class="attr-control"
              >
                <el-option
                  v-for="option in attrOptionList(attr)"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
              <el-input
                v-else
                v-model="baseAttrValues[attr.attrId].value"
                class="attr-control"
                placeholder="请输入属性值"
              />
              <el-switch
                v-model="baseAttrValues[attr.attrId].quickShow"
                :active-value="1"
                :inactive-value="0"
                active-text="快速展示"
              />
            </div>
          </div>

          <div class="section-head sale-head">
            <h3>销售属性</h3>
            <span>{{ saleAttrs.length }} 项</span>
          </div>
          <div v-if="saleAttrs.length" class="sale-tags">
            <el-tag v-for="attr in saleAttrs" :key="attr.attrId" effect="plain">
              {{ attr.attrName }}
            </el-tag>
          </div>
          <el-empty v-else description="暂无销售属性" />
        </div>

        <el-form v-else-if="activeStep === 3" label-width="100px">
          <div class="section-head">
            <h3>SKU 信息</h3>
            <el-button type="primary" :disabled="!canAddSku" @click="addSku">
              <el-icon><Plus /></el-icon>新增 SKU
            </el-button>
          </div>

          <el-empty v-if="!skus.length" description="暂无 SKU" />
          <div v-for="(sku, index) in skus" :key="sku.localId" class="sku-panel">
            <div class="sku-panel-head">
              <h4>SKU {{ index + 1 }}</h4>
              <el-button
                link
                type="danger"
                :disabled="skus.length === 1"
                @click="removeSku(index)"
              >
                删除
              </el-button>
            </div>
            <div class="sku-grid">
              <el-form-item label="SKU 名称" required>
                <el-input v-model="sku.skuName" placeholder="请输入 SKU 名称" />
              </el-form-item>
              <el-form-item label="价格" required>
                <el-input-number
                  v-model="sku.price"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  class="full-control"
                />
              </el-form-item>
              <el-form-item label="销量">
                <el-input-number
                  v-model="sku.saleCount"
                  :min="0"
                  controls-position="right"
                  class="full-control"
                />
              </el-form-item>
              <el-form-item label="默认图片" class="span-2">
                <el-input v-model="sku.skuDefaultImg" placeholder="上传或输入图片地址">
                  <template #prepend>
                    <el-upload
                      :show-file-list="false"
                      :before-upload="beforeImageUpload"
                      :http-request="(options) => uploadSkuImage(index, options)"
                    >
                      <el-button :loading="uploadingSkuIndex === index">上传图片</el-button>
                    </el-upload>
                  </template>
                  <template #append>
                    <el-button :disabled="!sku.skuDefaultImg" @click="sku.skuDefaultImg = ''">
                      清空
                    </el-button>
                  </template>
                </el-input>
                <div v-if="sku.skuDefaultImg" class="image-field-preview">
                  <el-image
                    :src="sku.skuDefaultImg"
                    fit="cover"
                    class="preview-image"
                    :preview-src-list="[sku.skuDefaultImg]"
                    hide-on-click-modal
                  />
                </div>
              </el-form-item>
              <el-form-item label="标题" class="span-2">
                <el-input v-model="sku.skuTitle" />
              </el-form-item>
              <el-form-item label="副标题" class="span-2">
                <el-input v-model="sku.skuSubtitle" />
              </el-form-item>
              <el-form-item label="介绍描述" class="span-2">
                <el-input v-model="sku.skuDesc" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item
                v-for="attr in saleAttrs"
                :key="attr.attrId"
                :label="attr.attrName"
                required
              >
                <el-select
                  v-if="attrOptionList(attr).length"
                  v-model="sku.saleAttrs[attr.attrId]"
                  clearable
                  filterable
                  allow-create
                  default-first-option
                  class="full-control"
                >
                  <el-option
                    v-for="option in attrOptionList(attr)"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
                <el-input
                  v-else
                  v-model="sku.saleAttrs[attr.attrId]"
                  placeholder="请输入属性值"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>

        <div v-else class="confirm-panel">
          <el-alert
            v-if="published"
            title="商品发布成功"
            type="success"
            show-icon
            :closable="false"
            class="success-alert"
          />
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品分类">{{ selectedCategoryLabel }}</el-descriptions-item>
            <el-descriptions-item label="品牌名称">{{ selectedBrandName }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ form.spuName }}</el-descriptions-item>
            <el-descriptions-item label="上架状态">
              {{ form.publishStatus === 1 ? '上架' : '下架' }}
            </el-descriptions-item>
            <el-descriptions-item label="商品重量">{{ form.weight }}</el-descriptions-item>
            <el-descriptions-item label="SKU 数量">{{ skus.length }}</el-descriptions-item>
          </el-descriptions>

          <div class="section-head">
            <h3>基础属性</h3>
          </div>
          <el-table :data="summaryBaseAttrs" border>
            <el-table-column prop="attrName" label="属性名" min-width="160" />
            <el-table-column prop="attrValue" label="属性值" min-width="180" />
            <el-table-column label="快速展示" width="110">
              <template #default="{ row }">
                <el-tag :type="row.quickShow === 1 ? 'success' : 'info'" size="small">
                  {{ row.quickShow === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="section-head">
            <h3>SKU 信息</h3>
          </div>
          <el-table :data="summarySkus" border>
            <el-table-column label="默认图" width="90">
              <template #default="{ row }">
                <el-image
                  v-if="row.skuDefaultImg"
                  :src="row.skuDefaultImg"
                  fit="cover"
                  class="table-image"
                  :preview-src-list="[row.skuDefaultImg]"
                  hide-on-click-modal
                />
                <span v-else class="text-muted">无</span>
              </template>
            </el-table-column>
            <el-table-column prop="skuName" label="SKU 名称" min-width="160" />
            <el-table-column prop="price" label="价格" width="110" />
            <el-table-column prop="saleCount" label="销量" width="90" />
            <el-table-column prop="saleAttrText" label="销售属性" min-width="220" />
          </el-table>
        </div>
      </div>

      <div class="step-actions">
        <template v-if="published">
          <el-button type="primary" @click="router.push('/product/spu')">查看 SPU</el-button>
          <el-button @click="resetAll">继续发布</el-button>
        </template>
        <template v-else>
          <el-button :disabled="activeStep === 0" @click="prevStep">上一步</el-button>
          <el-button v-if="activeStep < 4" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-else type="primary" :loading="submitting" @click="submitPublish">
            提交发布
          </el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { uploadOss } from '@/api/oss'
import { listCategoryTree } from '@/api/product'
import { listPublishAttrs, listPublishBrands, saveProductPublish } from '@/api/productPublish'

const router = useRouter()
const activeStep = ref(0)
const submitting = ref(false)
const published = ref(false)
const brandsLoading = ref(false)
const attrsLoading = ref(false)
const uploadingSkuIndex = ref(null)
const basicFormRef = ref()
const spuFormRef = ref()
const categoryOptions = ref([])
const brandOptions = ref([])
const baseAttrs = ref([])
const saleAttrs = ref([])
const baseAttrValues = reactive({})
const skus = ref([])
let skuSeed = 1

const form = reactive({
  catalogId: null,
  brandId: null,
  spuName: '',
  spuDescription: '',
  weight: 0,
  publishStatus: 0
})

const categoryProps = {
  value: 'catId',
  label: 'name',
  children: 'children',
  emitPath: false,
  checkStrictly: false
}

const basicRules = {
  catalogId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }]
}

const spuRules = {
  spuName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }]
}

const selectedBrandName = computed(() => {
  const brand = brandOptions.value.find((item) => item.brandId === form.brandId)
  return brand?.name || '-'
})

const selectedCategory = computed(() => findCategory(categoryOptions.value, form.catalogId))
const selectedCategoryLabel = computed(() => categoryLabel(form.catalogId) || '-')
const canAddSku = computed(() => saleAttrs.value.length > 0)
const summaryBaseAttrs = computed(() => buildBaseAttrsPayload())
const summarySkus = computed(() =>
  skus.value.map((sku) => ({
    ...sku,
    saleAttrText: buildSkuSaleAttrs(sku)
      .map((attr) => `${attr.attrName}: ${attr.attrValue}`)
      .join('，')
  }))
)

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  const { categories } = await listCategoryTree()
  categoryOptions.value = normalizeCategoryOptions(categories || [])
}

async function onCategoryChange(value) {
  form.brandId = null
  brandOptions.value = []
  baseAttrs.value = []
  saleAttrs.value = []
  resetBaseAttrValues()
  skus.value = []
  published.value = false

  if (!value) {
    return
  }
  if (!isLevelThreeCategory(value)) {
    form.catalogId = null
    ElMessage.warning('请选择三级分类')
    return
  }

  await Promise.all([loadBrands(value), loadAttrs(value)])
}

async function loadBrands(catalogId) {
  brandsLoading.value = true
  try {
    const { brands } = await listPublishBrands(catalogId)
    brandOptions.value = brands || []
  } finally {
    brandsLoading.value = false
  }
}

async function loadAttrs(catalogId) {
  attrsLoading.value = true
  try {
    const res = await listPublishAttrs(catalogId)
    baseAttrs.value = res.baseAttrs || []
    saleAttrs.value = res.saleAttrs || []
    resetBaseAttrValues()
    addSku()
  } finally {
    attrsLoading.value = false
  }
}

function normalizeCategoryOptions(categories) {
  return categories.map((category) => {
    const children = normalizeCategoryOptions(category.children || [])
    const option = { ...category }
    option.disabled = !children.length && option.catLevel !== 3
    if (children.length) {
      option.children = children
    } else {
      delete option.children
    }
    return option
  })
}

function resetBaseAttrValues() {
  Object.keys(baseAttrValues).forEach((key) => delete baseAttrValues[key])
  baseAttrs.value.forEach((attr) => {
    baseAttrValues[attr.attrId] = {
      value: attr.valueType === 1 ? [] : '',
      quickShow: attr.showDesc ?? 0
    }
  })
}

function addSku() {
  if (!canAddSku.value && skus.value.length >= 1) {
    ElMessage.warning('当前分类没有销售属性，只能保留 1 个 SKU')
    return
  }
  const saleAttrMap = {}
  saleAttrs.value.forEach((attr) => {
    saleAttrMap[attr.attrId] = ''
  })
  skus.value.push({
    localId: skuSeed++,
    skuName: '',
    skuTitle: '',
    skuSubtitle: '',
    skuDesc: '',
    price: 0,
    saleCount: 0,
    skuDefaultImg: '',
    saleAttrs: saleAttrMap
  })
}

function removeSku(index) {
  if (skus.value.length === 1) {
    return
  }
  skus.value.splice(index, 1)
}

async function nextStep() {
  if (activeStep.value === 0) {
    await basicFormRef.value?.validate()
    if (!isLevelThreeCategory(form.catalogId)) {
      ElMessage.warning('请选择三级分类')
      return
    }
    if (!brandOptions.value.length) {
      ElMessage.warning('当前分类暂无可用品牌')
      return
    }
  }
  if (activeStep.value === 1) {
    await spuFormRef.value?.validate()
  }
  if (activeStep.value === 3 && !validateSkus()) {
    return
  }
  activeStep.value += 1
}

function prevStep() {
  if (activeStep.value > 0) {
    activeStep.value -= 1
  }
}

function validateSkus() {
  if (!skus.value.length) {
    ElMessage.warning('请至少添加一个 SKU')
    return false
  }
  if (!saleAttrs.value.length && skus.value.length > 1) {
    ElMessage.warning('当前分类没有销售属性，只能发布 1 个 SKU')
    return false
  }

  const saleAttrSignatures = new Set()
  for (let index = 0; index < skus.value.length; index += 1) {
    const sku = skus.value[index]
    if (!hasText(sku.skuName)) {
      ElMessage.warning(`请输入 SKU ${index + 1} 名称`)
      return false
    }
    if (sku.price === null || typeof sku.price === 'undefined' || Number(sku.price) < 0) {
      ElMessage.warning(`请填写 SKU ${index + 1} 价格`)
      return false
    }
    if (sku.saleCount !== null && typeof sku.saleCount !== 'undefined' && Number(sku.saleCount) < 0) {
      ElMessage.warning(`SKU ${index + 1} 销量不能小于 0`)
      return false
    }
    for (const attr of saleAttrs.value) {
      if (!hasText(sku.saleAttrs[attr.attrId])) {
        ElMessage.warning(`请填写 SKU ${index + 1} 的${attr.attrName}`)
        return false
      }
    }
    if (saleAttrs.value.length) {
      const signature = saleAttrs.value
        .map((attr) => `${attr.attrId}=${normalizeAttrValue(sku.saleAttrs[attr.attrId])}`)
        .join('|')
      if (saleAttrSignatures.has(signature)) {
        ElMessage.warning(`SKU ${index + 1} 的销售属性组合重复`)
        return false
      }
      saleAttrSignatures.add(signature)
    }
  }
  return true
}

async function submitPublish() {
  if (!validatePublishBasics()) {
    return
  }
  if (!validateSkus()) {
    return
  }

  submitting.value = true
  try {
    await saveProductPublish(buildPayload())
    published.value = true
    ElMessage.success('商品发布成功')
  } finally {
    submitting.value = false
  }
}

function validatePublishBasics() {
  if (!form.catalogId) {
    ElMessage.warning('请选择商品分类')
    return false
  }
  if (!isLevelThreeCategory(form.catalogId)) {
    ElMessage.warning('请选择三级分类')
    return false
  }
  if (!form.brandId) {
    ElMessage.warning('请选择品牌')
    return false
  }
  if (!hasText(form.spuName)) {
    ElMessage.warning('请输入商品名称')
    return false
  }
  if (form.weight !== null && typeof form.weight !== 'undefined' && Number(form.weight) < 0) {
    ElMessage.warning('商品重量不能小于 0')
    return false
  }
  if (![0, 1].includes(Number(form.publishStatus))) {
    ElMessage.warning('请选择正确的上架状态')
    return false
  }
  return true
}

function buildPayload() {
  return {
    catalogId: form.catalogId,
    brandId: form.brandId,
    spuName: form.spuName,
    spuDescription: form.spuDescription,
    weight: form.weight,
    publishStatus: form.publishStatus,
    baseAttrs: buildBaseAttrsPayload(),
    skus: skus.value.map((sku) => ({
      skuName: sku.skuName,
      skuTitle: sku.skuTitle,
      skuSubtitle: sku.skuSubtitle,
      skuDesc: sku.skuDesc,
      price: sku.price,
      saleCount: sku.saleCount,
      skuDefaultImg: sku.skuDefaultImg,
      saleAttrs: buildSkuSaleAttrs(sku)
    }))
  }
}

function buildBaseAttrsPayload() {
  return baseAttrs.value
    .map((attr) => {
      const entry = baseAttrValues[attr.attrId] || {}
      const value = normalizeAttrValue(entry.value)
      return {
        attrId: attr.attrId,
        attrName: attr.attrName,
        attrValue: value,
        attrSort: 0,
        quickShow: entry.quickShow ?? 0
      }
    })
    .filter((attr) => hasText(attr.attrValue))
}

function buildSkuSaleAttrs(sku) {
  return saleAttrs.value
    .map((attr) => ({
      attrId: attr.attrId,
      attrName: attr.attrName,
      attrValue: normalizeAttrValue(sku.saleAttrs[attr.attrId]),
      attrSort: 0
    }))
    .filter((attr) => hasText(attr.attrValue))
}

function normalizeAttrValue(value) {
  if (Array.isArray(value)) {
    return value.filter(hasText).join(',')
  }
  return value ?? ''
}

function attrOptionList(attr) {
  return String(attr.valueSelect || '')
    .split(/[,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
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

function findCategory(options, value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null
  }
  for (const option of options) {
    if (option.catId === value) {
      return option
    }
    const matched = findCategory(option.children || [], value)
    if (matched) {
      return matched
    }
  }
  return null
}

function isLevelThreeCategory(value) {
  return selectedCategory.value?.catId === value && selectedCategory.value?.catLevel === 3
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

async function uploadSkuImage(index, { file }) {
  uploadingSkuIndex.value = index
  try {
    const res = await uploadOss(file)
    skus.value[index].skuDefaultImg = res.url || ''
    ElMessage.success('图片上传成功')
  } finally {
    uploadingSkuIndex.value = null
  }
}

function resetAll() {
  activeStep.value = 0
  published.value = false
  form.catalogId = null
  form.brandId = null
  form.spuName = ''
  form.spuDescription = ''
  form.weight = 0
  form.publishStatus = 0
  brandOptions.value = []
  baseAttrs.value = []
  saleAttrs.value = []
  resetBaseAttrValues()
  skus.value = []
  basicFormRef.value?.clearValidate()
  spuFormRef.value?.clearValidate()
}

function hasText(value) {
  return String(value ?? '').trim().length > 0
}
</script>

<style lang="scss" scoped>
.product-publish {
  .publish-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

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

  .publish-steps {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid #eaf0f8;
    border-radius: 8px;
    background:
      linear-gradient(135deg, rgba(47, 125, 246, 0.07), rgba(22, 160, 133, 0.05)),
      #f9fbff;
  }

  .step-body {
    min-height: 420px;
  }

  .publish-form {
    max-width: 760px;
  }

  .full-control {
    width: 100%;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 8px 0 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    span {
      color: #909399;
      font-size: 13px;
    }
  }

  .sale-head {
    margin-top: 28px;
  }

  .attr-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 18px;
  }

  .attr-row {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;

    label {
      color: #606266;
      font-size: 14px;
      text-align: right;
    }
  }

  .attr-control {
    width: 100%;
  }

  .sale-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sku-panel {
    border: 1px solid #e6edf7;
    border-radius: 8px;
    padding: 16px 16px 4px;
    margin-bottom: 16px;
    background: #fff;
    box-shadow: 0 10px 24px rgba(36, 62, 99, 0.05);
  }

  .sku-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .sku-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 18px;

    .span-2 {
      grid-column: span 2;
    }
  }

  .image-field-preview {
    width: 100%;
    margin-top: 10px;
  }

  .preview-image,
  .table-image {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background: #f5f7fb;
    border: 1px solid #e6edf7;
  }

  .confirm-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .success-alert {
    margin-bottom: 2px;
  }

  .step-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 18px;
    border-top: 1px solid #e6edf7;
  }
}

@media (max-width: 900px) {
  .product-publish {
    .attr-grid,
    .sku-grid {
      grid-template-columns: 1fr;

      .span-2 {
        grid-column: span 1;
      }
    }

    .attr-row {
      grid-template-columns: 1fr;

      label {
        text-align: left;
      }
    }
  }
}
</style>
