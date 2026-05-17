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
          <el-form-item label="成长积分" prop="growBounds">
            <el-input-number
              v-model="form.growBounds"
              :min="0"
              :precision="2"
              controls-position="right"
              class="full-control"
            />
          </el-form-item>
          <el-form-item label="购物积分" prop="buyBounds">
            <el-input-number
              v-model="form.buyBounds"
              :min="0"
              :precision="2"
              controls-position="right"
              class="full-control"
            />
          </el-form-item>
          <el-form-item label="赠送规则">
            <div class="bounds-rule-grid">
              <el-switch
                v-model="workRules.noDiscountGrow"
                active-text="无优惠送成长积分"
              />
              <el-switch
                v-model="workRules.noDiscountBuy"
                active-text="无优惠送购物积分"
              />
              <el-switch
                v-model="workRules.discountGrow"
                active-text="有优惠送成长积分"
              />
              <el-switch
                v-model="workRules.discountBuy"
                active-text="有优惠送购物积分"
              />
            </div>
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
              <div class="sku-promotion span-2">
                <div class="promotion-title">阶梯优惠</div>
                <div class="promotion-grid">
                  <el-form-item label="满件数">
                    <el-input-number
                      v-model="sku.ladder.fullCount"
                      :min="1"
                      controls-position="right"
                      class="full-control"
                    />
                  </el-form-item>
                  <el-form-item label="折扣">
                    <el-input-number
                      v-model="sku.ladder.discount"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      class="full-control"
                    />
                  </el-form-item>
                  <el-form-item label="折后价">
                    <el-input-number
                      v-model="sku.ladder.price"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      class="full-control"
                    />
                  </el-form-item>
                  <el-form-item label="可叠加">
                    <el-switch
                      v-model="sku.ladder.addOther"
                      :active-value="1"
                      :inactive-value="0"
                    />
                  </el-form-item>
                </div>

                <div class="promotion-title">满减优惠</div>
                <div class="promotion-grid">
                  <el-form-item label="满金额">
                    <el-input-number
                      v-model="sku.fullReduction.fullPrice"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      class="full-control"
                    />
                  </el-form-item>
                  <el-form-item label="减金额">
                    <el-input-number
                      v-model="sku.fullReduction.reducePrice"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      class="full-control"
                    />
                  </el-form-item>
                  <el-form-item label="可叠加">
                    <el-switch
                      v-model="sku.fullReduction.addOther"
                      :active-value="1"
                      :inactive-value="0"
                    />
                  </el-form-item>
                </div>

                <div class="promotion-title">
                  <span>会员价</span>
                  <el-button link type="primary" @click="addMemberPrice(index)">新增会员价</el-button>
                </div>
                <el-empty v-if="!sku.memberPrices.length" description="暂无会员价" />
                <div
                  v-for="(memberPrice, memberIndex) in sku.memberPrices"
                  :key="memberPrice.localId"
                  class="member-price-row"
                >
                  <el-input-number
                    v-model="memberPrice.memberLevelId"
                    :min="1"
                    controls-position="right"
                    placeholder="等级ID"
                  />
                  <el-input v-model="memberPrice.memberLevelName" placeholder="等级名称" />
                  <el-input-number
                    v-model="memberPrice.memberPrice"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    placeholder="会员价"
                  />
                  <el-switch
                    v-model="memberPrice.addOther"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="叠加"
                  />
                  <el-button link type="danger" @click="removeMemberPrice(sku, memberIndex)">
                    删除
                  </el-button>
                </div>
              </div>
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
            <el-descriptions-item label="成长积分">{{ form.growBounds }}</el-descriptions-item>
            <el-descriptions-item label="购物积分">{{ form.buyBounds }}</el-descriptions-item>
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
let memberPriceSeed = 1

// 发布页的 SPU 主表单数据。基础属性和 SKU 是动态结构，单独维护，提交时再聚合进 payload。
const form = reactive({
  catalogId: null,
  brandId: null,
  spuName: '',
  spuDescription: '',
  weight: 0,
  publishStatus: 0,
  growBounds: 0,
  buyBounds: 0
})

// sms_spu_bounds.work 使用四位 0/1 状态位保存赠送规则，前端用四个开关维护可读状态。
const workRules = reactive({
  noDiscountGrow: true,
  noDiscountBuy: true,
  discountGrow: true,
  discountBuy: true
})

// 后端分类树字段是 catId/name/children，发布页只允许选择叶子三级分类。
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

// 确认页展示用的派生数据，避免在模板里写复杂查找逻辑。
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

// 初始化分类树。禁用规则在 normalizeCategoryOptions 中处理，保证级联选择器只选三级分类。
async function loadCategories() {
  const { categories } = await listCategoryTree()
  categoryOptions.value = normalizeCategoryOptions(categories || [])
}

// 分类变化后，品牌、属性、SKU 都必须重置；不同分类的品牌关系和属性定义不能复用。
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

  // 品牌和属性互不依赖，并行加载可以减少用户切换分类后的等待时间。
  await Promise.all([loadBrands(value), loadAttrs(value)])
}

// 加载当前分类可选品牌。后端已经过滤了禁用品牌和未关联品牌。
async function loadBrands(catalogId) {
  brandsLoading.value = true
  try {
    const { brands } = await listPublishBrands(catalogId)
    brandOptions.value = brands || []
  } finally {
    brandsLoading.value = false
  }
}

// 加载当前分类的基础属性和销售属性，并创建一个默认 SKU，方便没有销售属性的分类直接发布。
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

// 规范化分类树：非三级叶子节点禁用，空 children 删除，避免级联组件显示不可选择空层级。
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

// 每次分类变化都根据新的基础属性定义重建输入缓存，防止旧分类属性值串到新分类。
function resetBaseAttrValues() {
  Object.keys(baseAttrValues).forEach((key) => delete baseAttrValues[key])
  baseAttrs.value.forEach((attr) => {
    baseAttrValues[attr.attrId] = {
      value: attr.valueType === 1 ? [] : '',
      quickShow: attr.showDesc ?? 0
    }
  })
}

// 新增 SKU 时按当前销售属性定义预置 saleAttrs 映射，后续 v-model 可直接按 attrId 写值。
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
    ladder: createEmptyLadder(),
    fullReduction: createEmptyFullReduction(),
    memberPrices: [],
    saleAttrs: saleAttrMap
  })
}

function createEmptyLadder() {
  return {
    fullCount: null,
    discount: null,
    price: null,
    addOther: 0
  }
}

function createEmptyFullReduction() {
  return {
    fullPrice: null,
    reducePrice: null,
    addOther: 0
  }
}

function addMemberPrice(skuIndex) {
  skus.value[skuIndex].memberPrices.push({
    localId: memberPriceSeed++,
    memberLevelId: null,
    memberLevelName: '',
    memberPrice: null,
    addOther: 0
  })
}

function removeMemberPrice(sku, memberIndex) {
  sku.memberPrices.splice(memberIndex, 1)
}

function removeSku(index) {
  if (skus.value.length === 1) {
    return
  }
  skus.value.splice(index, 1)
}

// 分步表单的前进守卫：每一步只校验当前步骤必须满足的条件，最后提交时再做完整校验。
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

// 校验 SKU：名称、价格、销售属性必填，并阻止相同销售属性组合重复出现。
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
    if (!validateSkuPromotions(sku, index)) {
      return false
    }
  }
  return true
}

// 促销配置是可选的；一旦填写了关键字段，就要求它能组成一条可保存的 sms 促销记录。
function validateSkuPromotions(sku, index) {
  if (!isEmptyLadder(sku.ladder)) {
    if (!positiveNumber(sku.ladder.fullCount) || !positiveNumber(sku.ladder.discount)) {
      ElMessage.warning(`SKU ${index + 1} 阶梯优惠需要填写满件数和折扣`)
      return false
    }
    if (sku.ladder.price !== null && typeof sku.ladder.price !== 'undefined' && Number(sku.ladder.price) < 0) {
      ElMessage.warning(`SKU ${index + 1} 阶梯优惠折后价不能小于 0`)
      return false
    }
  }

  if (!isEmptyFullReduction(sku.fullReduction)) {
    if (!positiveNumber(sku.fullReduction.fullPrice) || !positiveNumber(sku.fullReduction.reducePrice)) {
      ElMessage.warning(`SKU ${index + 1} 满减优惠需要填写满金额和减金额`)
      return false
    }
  }

  for (const memberPrice of sku.memberPrices) {
    if (isEmptyMemberPrice(memberPrice)) {
      continue
    }
    if (!positiveNumber(memberPrice.memberLevelId) || !hasText(memberPrice.memberLevelName) || !positiveNumber(memberPrice.memberPrice)) {
      ElMessage.warning(`SKU ${index + 1} 会员价需要填写等级ID、等级名称和会员价`)
      return false
    }
  }
  return true
}

// 最终提交前做完整前端校验，再把分散在表单、基础属性、SKU、积分规则中的数据聚合成后端 VO。
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

// 校验 SPU 和积分设置的基础字段。后端也会再校验一次，这里主要用于更早给用户反馈。
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
  if (form.growBounds !== null && typeof form.growBounds !== 'undefined' && Number(form.growBounds) < 0) {
    ElMessage.warning('成长积分不能小于 0')
    return false
  }
  if (form.buyBounds !== null && typeof form.buyBounds !== 'undefined' && Number(form.buyBounds) < 0) {
    ElMessage.warning('购物积分不能小于 0')
    return false
  }
  if (![0, 1].includes(Number(form.publishStatus))) {
    ElMessage.warning('请选择正确的上架状态')
    return false
  }
  return true
}

// 构造 ProductPublishVo。字段名需要和后端 VO 保持一致，否则 Jackson 无法正确绑定。
function buildPayload() {
  return {
    catalogId: form.catalogId,
    brandId: form.brandId,
    spuName: form.spuName,
    spuDescription: form.spuDescription,
    weight: form.weight,
    publishStatus: form.publishStatus,
    bounds: {
      growBounds: form.growBounds,
      buyBounds: form.buyBounds,
      work: buildBoundsWork()
    },
    baseAttrs: buildBaseAttrsPayload(),
    skus: skus.value.map((sku) => ({
      skuName: sku.skuName,
      skuTitle: sku.skuTitle,
      skuSubtitle: sku.skuSubtitle,
      skuDesc: sku.skuDesc,
      price: sku.price,
      saleCount: sku.saleCount,
      skuDefaultImg: sku.skuDefaultImg,
      ladder: buildSkuLadder(sku),
      fullReduction: buildSkuFullReduction(sku),
      memberPrices: buildMemberPrices(sku),
      saleAttrs: buildSkuSaleAttrs(sku)
    }))
  }
}

// 基础属性只提交用户填写了值的项目；多选属性会在 normalizeAttrValue 中合并成逗号分隔字符串。
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

// 将某个 SKU 的销售属性映射转成后端列表结构，attrName 用于确认页展示和兼容后端接收结构。
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

function buildSkuLadder(sku) {
  return {
    fullCount: sku.ladder.fullCount,
    discount: sku.ladder.discount,
    price: sku.ladder.price,
    addOther: sku.ladder.addOther
  }
}

function buildSkuFullReduction(sku) {
  return {
    fullPrice: sku.fullReduction.fullPrice,
    reducePrice: sku.fullReduction.reducePrice,
    addOther: sku.fullReduction.addOther
  }
}

function buildMemberPrices(sku) {
  return sku.memberPrices
    .filter((memberPrice) => !isEmptyMemberPrice(memberPrice))
    .map((memberPrice) => ({
      memberLevelId: memberPrice.memberLevelId,
      memberLevelName: memberPrice.memberLevelName,
      memberPrice: memberPrice.memberPrice,
      addOther: memberPrice.addOther
    }))
}

// 将四个开关转换成 sms_spu_bounds.work 的四位状态位：从左到右为有优惠购物、有优惠成长、无优惠购物、无优惠成长。
function buildBoundsWork() {
  return Number([
    workRules.discountBuy,
    workRules.discountGrow,
    workRules.noDiscountBuy,
    workRules.noDiscountGrow
  ].map((enabled) => (enabled ? '1' : '0')).join(''))
}

// 统一属性值格式。多选属性保存成逗号分隔字符串，和后端属性值字段的字符串存储方式保持一致。
function normalizeAttrValue(value) {
  if (Array.isArray(value)) {
    return value.filter(hasText).join(',')
  }
  return value ?? ''
}

// 后端 valueSelect 可能使用中英文逗号、分号或换行分隔，这里统一拆成下拉选项。
function attrOptionList(attr) {
  return String(attr.valueSelect || '')
    .split(/[,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

// 确认页展示分类路径，例如“手机 / 手机通讯 / 智能手机”。
function categoryLabel(value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return ''
  }
  const path = findCategoryPath(categoryOptions.value, value)
  return path.length ? path.map((category) => category.name).join(' / ') : String(value)
}

// 根据分类 id 查找从根节点到目标节点的路径。
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

// 根据分类 id 在树中查找节点，供三级分类校验和展示逻辑复用。
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

// 发布入口只允许三级分类，和后端 ensureCategoryCanPublish 保持一致。
function isLevelThreeCategory(value) {
  return selectedCategory.value?.catId === value && selectedCategory.value?.catLevel === 3
}

// 上传前先在前端限制文件类型和大小，避免无效文件进入 OSS 上传流程。
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

// SKU 默认图上传成功后直接回填当前 SKU，提交时作为 skuDefaultImg 保存。
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

// 重置整条发布流程，包括动态属性、SKU、积分规则和表单校验状态。
function resetAll() {
  activeStep.value = 0
  published.value = false
  form.catalogId = null
  form.brandId = null
  form.spuName = ''
  form.spuDescription = ''
  form.weight = 0
  form.publishStatus = 0
  form.growBounds = 0
  form.buyBounds = 0
  workRules.noDiscountGrow = true
  workRules.noDiscountBuy = true
  workRules.discountGrow = true
  workRules.discountBuy = true
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

function positiveNumber(value) {
  return value !== null && typeof value !== 'undefined' && Number(value) > 0
}

function isEmptyLadder(ladder) {
  return !ladder || (
    ladder.fullCount === null &&
    ladder.discount === null &&
    ladder.price === null
  )
}

function isEmptyFullReduction(fullReduction) {
  return !fullReduction || (
    fullReduction.fullPrice === null &&
    fullReduction.reducePrice === null
  )
}

function isEmptyMemberPrice(memberPrice) {
  return !memberPrice || (
    memberPrice.memberLevelId === null &&
    !hasText(memberPrice.memberLevelName) &&
    memberPrice.memberPrice === null
  )
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

  .bounds-rule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 18px;
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

  .sku-promotion {
    padding-top: 4px;
    border-top: 1px dashed #e6edf7;
  }

  .promotion-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 8px 0 12px;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  .promotion-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 18px;
  }

  .member-price-row {
    display: grid;
    grid-template-columns: 140px minmax(120px, 1fr) 150px 100px auto;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
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
    .sku-grid,
    .bounds-rule-grid,
    .promotion-grid,
    .member-price-row {
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
