<template>
  <el-dialog
    :model-value="visible"
    :title="roleId ? '编辑角色' : '新增角色'"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @open="onOpen"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="loading">
      <el-form-item label="角色名" prop="roleName">
        <el-input v-model="form.roleName" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="菜单授权">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          node-key="menuId"
          show-checkbox
          :props="{ label: 'name', children: 'children' }"
          :default-checked-keys="form.menuIdList"
          style="width: 100%; max-height: 360px; overflow: auto"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getRole, saveRole, updateRole } from '@/api/role'

const props = defineProps({
  visible: { type: Boolean, default: false },
  roleId: { type: [Number, String, null], default: null },
  menuTree: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:visible', 'ok'])

const formRef = ref()
const treeRef = ref()
const loading = ref(false)
const submitting = ref(false)

const form = reactive({ roleId: null, roleName: '', remark: '', menuIdList: [] })
const rules = { roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }] }

function reset() {
  Object.assign(form, { roleId: null, roleName: '', remark: '', menuIdList: [] })
  formRef.value?.clearValidate()
  treeRef.value?.setCheckedKeys([])
}

async function onOpen() {
  reset()
  if (props.roleId) {
    loading.value = true
    try {
      const { role, menuIdList } = await getRole(props.roleId)
      Object.assign(form, role)
      form.menuIdList = menuIdList || []
      // 等待 tree 完成渲染再设置选中
      setTimeout(() => treeRef.value?.setCheckedKeys(menuIdList || []), 0)
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
    const checked = treeRef.value?.getCheckedKeys() || []
    const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
    const payload = { ...form, menuIdList: [...checked, ...halfChecked] }
    if (props.roleId) {
      await updateRole(payload)
      ElMessage.success('更新成功')
    } else {
      await saveRole(payload)
      ElMessage.success('新增成功')
    }
    emit('update:visible', false)
    emit('ok')
  } finally {
    submitting.value = false
  }
}
</script>
