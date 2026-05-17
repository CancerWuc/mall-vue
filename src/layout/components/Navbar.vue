<template>
  <div class="navbar-inner">
    <div class="left">
      <el-button text @click="toggle">
        <el-icon :size="20">
          <component :is="collapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </el-button>
    </div>
    <div class="right">
      <el-tooltip content="刷新页面" placement="bottom">
        <el-button text @click="refresh"><el-icon :size="18"><Refresh /></el-icon></el-button>
      </el-tooltip>
      <el-tooltip content="全屏" placement="bottom">
        <el-button text @click="toggleFullscreen"><el-icon :size="18"><FullScreen /></el-icon></el-button>
      </el-tooltip>
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-area">
          <el-avatar :size="30" icon="UserFilled" />
          <span class="username">{{ userStore.name || '管理员' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><UserFilled /></el-icon> 个人中心
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon> 修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-dialog v-model="passwordVisible" title="修改密码" width="420px">
    <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="90px">
      <el-form-item label="原密码" prop="password">
        <el-input v-model="pwdForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm">
        <el-input v-model="pwdForm.confirm" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="passwordVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitPassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updatePassword } from '@/api/auth'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const collapsed = computed(() => appStore.sidebarCollapsed)
const toggle = () => appStore.toggleSidebar()
const refresh = () => window.location.reload()

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const passwordVisible = ref(false)
const submitting = ref(false)
const pwdFormRef = ref()
const pwdForm = reactive({ password: '', newPassword: '', confirm: '' })
const pwdRules = {
  password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度 6-32 位', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        if (value !== pwdForm.newPassword) cb(new Error('两次密码不一致'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

async function submitPassword() {
  await pwdFormRef.value?.validate()
  submitting.value = true
  try {
    await updatePassword({ password: pwdForm.password, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    passwordVisible.value = false
    await userStore.logout()
    router.push('/login')
  } finally {
    submitting.value = false
  }
}

async function handleCommand(cmd) {
  if (cmd === 'profile') {
    router.push('/profile')
  } else if (cmd === 'password') {
    pwdForm.password = ''
    pwdForm.newPassword = ''
    pwdForm.confirm = ''
    passwordVisible.value = true
  } else if (cmd === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    await userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 18px;
}
.left :deep(.el-button),
.right :deep(.el-button) {
  width: 34px;
  height: 34px;
  color: #526071;
}

.left :deep(.el-button:hover),
.right :deep(.el-button:hover) {
  color: #2f7df6;
  background: #eef5ff;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-area {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  height: 36px;
  padding: 0 10px 0 6px;
  border: 1px solid #e6edf7;
  border-radius: 8px;
  background: #fff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.user-area:hover {
  border-color: rgba(47, 125, 246, 0.38);
  box-shadow: 0 8px 18px rgba(36, 62, 99, 0.08);
}
.username {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}
</style>
