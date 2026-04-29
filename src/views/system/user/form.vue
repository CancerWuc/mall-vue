<template>
  <el-dialog
    :model-value="visible"
    :title="userId ? '编辑用户' : '新增用户'"
    width="560px"
    @update:model-value="$emit('update:visible', $event)"
    @open="onOpen"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="loading">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :disabled="!!userId" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          :placeholder="userId ? '不修改请留空' : '请输入密码'"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">正常</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.roleIdList" multiple placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="r in roleList"
            :key="r.roleId"
            :label="r.roleName"
            :value="r.roleId"
          />
        </el-select>
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
import { getUser, saveUser, updateUser } from '@/api/user'

const props = defineProps({
  visible: { type: Boolean, default: false },
  userId: { type: [Number, String, null], default: null },
  roleList: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:visible', 'ok'])

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  userId: null,
  username: '',
  password: '',
  email: '',
  mobile: '',
  status: 1,
  roleIdList: []
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '长度 3-30 位', trigger: 'blur' }
  ],
  password: [
    {
      validator: (rule, value, cb) => {
        if (!props.userId && !value) return cb(new Error('请输入密码'))
        if (value && (value.length < 6 || value.length > 32))
          return cb(new Error('密码长度 6-32 位'))
        cb()
      },
      trigger: 'blur'
    }
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
}

function reset() {
  Object.assign(form, {
    userId: null,
    username: '',
    password: '',
    email: '',
    mobile: '',
    status: 1,
    roleIdList: []
  })
  formRef.value?.clearValidate()
}

async function onOpen() {
  reset()
  if (props.userId) {
    loading.value = true
    try {
      const { user, roleIdList } = await getUser(props.userId)
      Object.assign(form, user)
      form.password = ''
      form.roleIdList = roleIdList || []
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
    const payload = { ...form }
    if (!payload.password) delete payload.password
    if (props.userId) {
      await updateUser(payload)
      ElMessage.success('更新成功')
    } else {
      await saveUser(payload)
      ElMessage.success('新增成功')
    }
    emit('update:visible', false)
    emit('ok')
  } finally {
    submitting.value = false
  }
}
</script>
