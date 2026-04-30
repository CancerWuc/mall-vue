<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span>{{ pageSummary }}</span>
    </div>
    <el-pagination
      :background="true"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      @current-change="onCurrent"
      @size-change="onSize"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  limit: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  layout: { type: String, default: 'total, sizes, prev, pager, next, jumper' }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

const currentPage = computed(() => props.page)
const pageSize = computed(() => props.limit)
const totalPage = computed(() => {
  if (!props.total || !props.limit) {
    return 0
  }
  return Math.ceil(props.total / props.limit)
})
const safePage = computed(() => {
  if (!totalPage.value) {
    return 0
  }
  return Math.min(Math.max(props.page, 1), totalPage.value)
})
const startRecord = computed(() => {
  if (!props.total) {
    return 0
  }
  return (safePage.value - 1) * props.limit + 1
})
const endRecord = computed(() => {
  if (!props.total) {
    return 0
  }
  return Math.min(safePage.value * props.limit, props.total)
})
const pageSummary = computed(() => {
  if (!props.total) {
    return '暂无数据'
  }
  return `第 ${safePage.value} / ${totalPage.value} 页，当前 ${startRecord.value}-${endRecord.value} 条`
})

function onCurrent(p) {
  emit('update:page', p)
  emit('pagination', { page: p, limit: props.limit })
}
function onSize(s) {
  emit('update:page', 1)
  emit('update:limit', s)
  emit('pagination', { page: 1, limit: s })
}
</script>
