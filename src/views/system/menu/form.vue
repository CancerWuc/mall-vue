<template>
  <el-dialog
    :model-value="visible"
    :title="menuId ? '编辑菜单' : '新增菜单'"
    width="640px"
    @update:model-value="$emit('update:visible', $event)"
    @open="onOpen"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="loading">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :value="0">目录</el-radio>
          <el-radio :value="1">菜单</el-radio>
          <el-radio :value="2">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentOptions"
          :props="{ label: 'name', value: 'menuId', children: 'children' }"
          check-strictly
          default-expand-all
          placeholder="顶级菜单（root）"
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item v-if="form.type !== 2" label="路由" prop="url">
        <el-input v-model="form.url" placeholder="如 system/user" />
      </el-form-item>
      <el-form-item label="权限标识" prop="perms">
        <el-input v-model="form.perms" placeholder="如 sys:user:list，多个用 , 分隔" />
      </el-form-item>
      <el-form-item v-if="form.type !== 2" label="图标">
        <el-input v-model="form.icon" placeholder="Element Plus 图标名，如 User" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.orderNum" :min="0" :max="999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getMenu, saveMenu, updateMenu } from '@/api/menu'

const props = defineProps({
  visible: { type: Boolean, default: false },
  menuId: { type: [Number, String, null], default: null },
  parentId: { type: [Number, String, null], default: 0 },
  menuTree: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:visible', 'ok'])

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  menuId: null,
  parentId: 0,
  name: '',
  url: '',
  perms: '',
  type: 1,
  icon: '',
  orderNum: 0
})

const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

const parentOptions = computed(() => {
  // 仅展示目录与菜单作为父节点
  function filter(list) {
    return list
      .filter((m) => m.type !== 2)
      .map((m) => ({ ...m, children: m.children ? filter(m.children) : [] }))
  }
  return [{ menuId: 0, name: '顶级菜单', children: filter(props.menuTree || []) }]
})

function reset() {
  Object.assign(form, {
    menuId: null,
    parentId: props.parentId || 0,
    name: '',
    url: '',
    perms: '',
    type: 1,
    icon: '',
    orderNum: 0
  })
  formRef.value?.clearValidate()
}

async function onOpen() {
  reset()
  if (props.menuId) {
    loading.value = true
    try {
      const { menu } = await getMenu(props.menuId)
      Object.assign(form, menu)
    } finally {
      loading.value = false
    }
  }
}

watch(
  () => props.visible,
  (v) => {
    if (!v) reset()
  }
)

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (props.menuId) {
      await updateMenu(form)
      ElMessage.success('更新成功')
    } else {
      await saveMenu(form)
      ElMessage.success('新增成功')
    }
    emit('update:visible', false)
    emit('ok')
  } finally {
    submitting.value = false
  }
}
</script>
