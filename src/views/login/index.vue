<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-banner">
        <div class="banner-title">Mall</div>
        <div class="banner-sub">商城后台管理系统</div>
        <ul class="features">
          <li><el-icon><Goods /></el-icon> 商品 / 优惠 / 订单</li>
          <li><el-icon><User /></el-icon> 用户 / 角色 / 菜单</li>
          <li><el-icon><Tickets /></el-icon> 日志 / 字典 / 文件</li>
        </ul>
      </div>
      <div class="login-form-wrap">
        <h2 class="login-title">账号登录</h2>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          autocomplete="off"
          @keyup.enter="onSubmit"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="User"
              clearable
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              style="width: 100%"
              @click="onSubmit"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="tip text-muted">默认账号：admin / admin</div>
      </div>
    </div>
    <div class="copyright">© {{ year }} Mall Admin · Built with Vue 3 + Element Plus</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const formRef = ref()
const year = new Date().getFullYear()

const form = reactive({ username: 'admin', password: 'admin' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不能少于 4 位', trigger: 'blur' }
  ]
}

async function onSubmit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(47, 125, 246, 0.18), rgba(22, 160, 133, 0.16)),
    #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px;
}

.login-card {
  width: 880px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border: 1px solid rgba(230, 237, 247, 0.9);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(36, 62, 99, 0.14);
  overflow: hidden;
}

.login-banner {
  background:
    linear-gradient(160deg, rgba(47, 125, 246, 0.94), rgba(22, 160, 133, 0.94)),
    #102033;
  color: #fff;
  padding: 56px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .banner-title {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: 0;
  }
  .banner-sub {
    margin-top: 8px;
    font-size: 14px;
    opacity: 0.85;
  }
  .features {
    margin-top: 32px;
    padding: 0;
    list-style: none;
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 14px;
      opacity: 0.92;
    }
  }
}

.login-form-wrap {
  padding: 56px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  margin: 0 0 24px 0;
  font-size: 22px;
  color: #1f2937;
}

.tip {
  text-align: center;
  margin-top: 12px;
}

.copyright {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  color: #8a96a8;
  font-size: 12px;
}

@media (max-width: 720px) {
  .login-card {
    grid-template-columns: 1fr;
  }
  .login-banner {
    display: none;
  }
}
</style>
