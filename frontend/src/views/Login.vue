<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <a-card style="width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <template #title>
        <div style="text-align: center; font-size: 20px; font-weight: bold;">
          用户管理系统
        </div>
      </template>
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
            :prefix="h(UserOutlined)"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
            :prefix="h(LockOutlined)"
            @pressEnter="handleLogin"
          />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="authStore.loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
      <a-divider style="margin: 12px 0;">测试账号</a-divider>
      <a-descriptions size="small" :column="1" bordered>
        <a-descriptions-item label="管理员">admin / admin123</a-descriptions-item>
        <a-descriptions-item label="HR管理员">hr / hr123</a-descriptions-item>
        <a-descriptions-item label="部门主管">manager / manager123</a-descriptions-item>
        <a-descriptions-item label="普通用户">user / user123</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { h } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const formState = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  try {
    await authStore.login(formState.username, formState.password)
    message.success('登录成功')
    router.push({ name: 'Home' })
  } catch (error: any) {
    message.error(error.error || '登录失败')
  }
}
</script>
