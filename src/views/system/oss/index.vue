<template>
  <div class="app-container">
    <el-card>
      <div class="toolbar">
        <div>
          <el-upload
            v-permission="'sys:oss:upload'"
            :show-file-list="false"
            :http-request="customUpload"
            :before-upload="beforeUpload"
          >
            <el-button type="primary"><el-icon><Upload /></el-icon>上传文件</el-button>
          </el-upload>
        </div>
        <div>
          <el-button
            type="danger"
            :disabled="!selection.length"
            v-permission="'sys:oss:delete'"
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
        <el-table-column label="预览" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="isImage(row.url)"
              :src="row.url"
              fit="cover"
              style="width: 60px; height: 60px"
              :preview-src-list="[row.url]"
              hide-on-click-modal
            />
            <el-icon v-else size="36"><Document /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <a :href="row.url" target="_blank">{{ row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="copy(row.url)">复制链接</el-button>
            <el-button link type="danger" v-permission="'sys:oss:delete'" @click="onDelete(row)">
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
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { listOss, uploadOss, deleteOss } from '@/api/oss'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const selection = ref([])
const query = reactive({ page: 1, limit: 10 })

async function loadList() {
  loading.value = true
  try {
    const { page } = await listOss(query)
    list.value = page.list || []
    total.value = page.totalCount || 0
  } finally {
    loading.value = false
  }
}

function isImage(url = '') {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url)
}

function beforeUpload(file) {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

async function customUpload({ file }) {
  try {
    const res = await uploadOss(file)
    ElMessage.success('上传成功')
    if (res.url) {
      copy(res.url, false)
    }
    loadList()
  } catch (e) {
    // 拦截器已提示
  }
}

async function onDelete(row) {
  await ElMessageBox.confirm('确认删除该文件吗？', '提示', { type: 'warning' })
  await deleteOss([row.id])
  ElMessage.success('删除成功')
  loadList()
}

async function onBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selection.value.length} 个文件吗？`, '提示', {
    type: 'warning'
  })
  await deleteOss(selection.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadList()
}

async function copy(text, withMessage = true) {
  try {
    await navigator.clipboard.writeText(text)
    if (withMessage) ElMessage.success('已复制到剪贴板')
  } catch (e) {
    if (withMessage) ElMessage.warning('复制失败，请手动复制')
  }
}

onMounted(loadList)
</script>
