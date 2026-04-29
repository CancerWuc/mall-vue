<template>
  <div class="pagination-container">
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

function onCurrent(p) {
  emit('update:page', p)
  emit('pagination', { page: p, limit: props.limit })
}
function onSize(s) {
  emit('update:limit', s)
  emit('pagination', { page: props.page, limit: s })
}
</script>
