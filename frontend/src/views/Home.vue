<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header style="background: #001529; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
      <div style="color: white; font-size: 20px; font-weight: bold;">
        用户管理系统
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="color: rgba(255,255,255,0.85);">
          {{ authStore.user?.name || '用户' }}
          <a-tag :color="getRoleColor(authStore.user?.role)" style="margin-left: 8px;">
            {{ getRoleName(authStore.user?.role) }}
          </a-tag>
        </span>
        <a-button type="link" style="color: white;" @click="handleLogout">退出</a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="padding: 24px;">
      <!-- 功能菜单 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="8">
          <a-card hoverable @click="router.push({ name: 'Employees' })" style="cursor: pointer;">
            <template #title>
              <TeamOutlined />
              <span style="margin-left: 8px;">员工管理</span>
            </template>
            <p>管理员工基本信息、入职离职等</p>
            <a-button type="primary">进入</a-button>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable @click="router.push({ name: 'Organization' })" style="cursor: pointer;">
            <template #title>
              <ApartmentOutlined />
              <span style="margin-left: 8px;">组织架构</span>
            </template>
            <p>管理部门层级结构</p>
            <a-button type="primary">进入</a-button>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable @click="router.push({ name: 'Rewards' })" style="cursor: pointer;">
            <template #title>
              <TrophyOutlined />
              <span style="margin-left: 8px;">奖惩记录</span>
            </template>
            <p>管理员工奖惩记录</p>
            <a-button type="primary">进入</a-button>
          </a-card>
        </a-col>
      </a-row>

      <!-- 用户信息卡片 -->
      <a-card title="欢迎使用用户管理系统">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="用户ID">{{ authStore.user?.id }}</a-descriptions-item>
          <a-descriptions-item label="用户名">{{ authStore.user?.username }}</a-descriptions-item>
          <a-descriptions-item label="真实姓名">{{ authStore.user?.name }}</a-descriptions-item>
          <a-descriptions-item label="角色">
            <a-tag :color="getRoleColor(authStore.user?.role)">
              {{ getRoleName(authStore.user?.role) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { TeamOutlined, ApartmentOutlined, TrophyOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

function getRoleName(role?: string): string {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    hr: 'HR管理员',
    manager: '部门主管',
    user: '普通用户'
  }
  return roleMap[role || ''] || '未知'
}

function getRoleColor(role?: string): string {
  const colorMap: Record<string, string> = {
    admin: 'red',
    hr: 'blue',
    manager: 'green',
    user: 'default'
  }
  return colorMap[role || ''] || 'default'
}

async function handleLogout() {
  await authStore.logout()
  message.success('已退出登录')
  router.push({ name: 'Login' })
}
</script>
