<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
      <a-button type="text" style="color: white;" @click="router.push({ name: 'Home' })">
        <LeftOutlined />
        返回首页
      </a-button>
      <div style="color: white; font-size: 18px; font-weight: bold; margin-left: 24px;">
        组织架构管理
      </div>
    </a-layout-header>

    <a-layout-content style="padding: 24px;">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 部门管理 -->
        <a-tab-pane key="department">
          <template #tab><ApartmentOutlined /> 部门管理</template>
          <a-card>
            <template #title>
              <span>部门列表</span>
              <a-button type="primary" style="float: right;" @click="showDepartmentModal()" :disabled="!isAdmin">
                新增部门
              </a-button>
            </template>
            <a-table :dataSource="departments" :columns="departmentColumns" :pagination="false" rowKey="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button type="link" @click="showDepartmentModal(record)" :disabled="!isAdmin">编辑</a-button>
                  <a-popconfirm title="确定删除该部门吗？" @confirm="deleteDepartment(record.id)">
                    <a-button type="link" danger :disabled="!isAdmin">删除</a-button>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <!-- 岗位管理 -->
        <a-tab-pane key="position">
          <template #tab><UserOutlined /> 岗位管理</template>
          <a-card>
            <template #title>
              <span>岗位列表</span>
              <a-button type="primary" style="float: right;" @click="showPositionModal()" :disabled="!isAdmin">
                新增岗位
              </a-button>
            </template>
            <a-table :dataSource="positions" :columns="positionColumns" :pagination="false" rowKey="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button type="link" @click="showPositionModal(record)" :disabled="!isAdmin">编辑</a-button>
                  <a-popconfirm title="确定删除该岗位吗？" @confirm="deletePosition(record.id)">
                    <a-button type="link" danger :disabled="!isAdmin">删除</a-button>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <!-- 职级管理 -->
        <a-tab-pane key="level">
          <template #tab><RiseOutlined /> 职级管理</template>
          <a-card>
            <template #title>
              <span>职级列表</span>
              <a-button type="primary" style="float: right;" @click="showLevelModal()" :disabled="!isAdmin">
                新增职级
              </a-button>
            </template>
            <a-table :dataSource="levels" :columns="levelColumns" :pagination="false" rowKey="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button type="link" @click="showLevelModal(record)" :disabled="!isAdmin">编辑</a-button>
                  <a-popconfirm title="确定删除该职级吗？" @confirm="deleteLevel(record.id)">
                    <a-button type="link" danger :disabled="!isAdmin">删除</a-button>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-layout-content>

    <!-- 部门弹窗 -->
    <a-modal v-model:open="departmentModalVisible" :title="departmentForm.id ? '编辑部门' : '新增部门'" @ok="saveDepartment">
      <a-form :model="departmentForm" layout="vertical">
        <a-form-item label="部门名称" required>
          <a-input v-model:value="departmentForm.name" placeholder="请输入部门名称" />
        </a-form-item>
        <a-form-item label="部门描述">
          <a-textarea v-model:value="departmentForm.description" placeholder="请输入部门描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 岗位弹窗 -->
    <a-modal v-model:open="positionModalVisible" :title="positionForm.id ? '编辑岗位' : '新增岗位'" @ok="savePosition">
      <a-form :model="positionForm" layout="vertical">
        <a-form-item label="岗位名称" required>
          <a-input v-model:value="positionForm.name" placeholder="请输入岗位名称" />
        </a-form-item>
        <a-form-item label="职级">
          <a-input v-model:value="positionForm.level" placeholder="请输入职级，如 3B、4A" />
        </a-form-item>
        <a-form-item label="岗位描述">
          <a-textarea v-model:value="positionForm.description" placeholder="请输入岗位描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 职级弹窗 -->
    <a-modal v-model:open="levelModalVisible" :title="levelForm.id ? '编辑职级' : '新增职级'" @ok="saveLevel">
      <a-form :model="levelForm" layout="vertical">
        <a-form-item label="职级代码" required>
          <a-input v-model:value="levelForm.code" placeholder="请输入职级代码，如 1A、2B" />
        </a-form-item>
        <a-form-item label="职级名称" required>
          <a-input v-model:value="levelForm.name" placeholder="请输入职级名称，如 一级A" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="levelForm.sort" :min="0" style="width: 100%;" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { LeftOutlined, ApartmentOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons-vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('department')
const isAdmin = computed(() => authStore.user?.role === 'admin')

// 部门相关
const departments = ref<any[]>([])
const departmentModalVisible = ref(false)
const departmentForm = ref<any>({})

const departmentColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '部门名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 150 }
]

// 岗位相关
const positions = ref<any[]>([])
const positionModalVisible = ref(false)
const positionForm = ref<any>({})

const positionColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '岗位名称', dataIndex: 'name', key: 'name' },
  { title: '职级', dataIndex: 'level', key: 'level' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 150 }
]

// 职级相关
const levels = ref<any[]>([])
const levelModalVisible = ref(false)
const levelForm = ref<any>({})

const levelColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '职级代码', dataIndex: 'code', key: 'code' },
  { title: '职级名称', dataIndex: 'name', key: 'name' },
  { title: '排序', dataIndex: 'sort', key: 'sort' },
  { title: '操作', key: 'action', width: 150 }
]

// 获取 API 配置
const apiBase = 'http://localhost:3001/api'
const getHeaders = () => ({
  Authorization: `Bearer ${authStore.token}`
})

// 部门操作
async function fetchDepartments() {
  try {
    const res = await axios.get(`${apiBase}/departments`, { headers: getHeaders() })
    departments.value = res.data.data || []
  } catch (err: any) {
    message.error(err.response?.data?.error || '获取部门列表失败')
  }
}

function showDepartmentModal(record?: any) {
  if (record) {
    departmentForm.value = { ...record }
  } else {
    departmentForm.value = {}
  }
  departmentModalVisible.value = true
}

async function saveDepartment() {
  if (!departmentForm.value.name) {
    message.warning('请输入部门名称')
    return
  }

  try {
    const data = {
      name: departmentForm.value.name,
      description: departmentForm.value.description || ''
    }

    if (departmentForm.value.id) {
      await axios.put(`${apiBase}/departments/${departmentForm.value.id}`, data, { headers: getHeaders() })
      message.success('更新成功')
    } else {
      await axios.post(`${apiBase}/departments`, data, { headers: getHeaders() })
      message.success('创建成功')
    }

    departmentModalVisible.value = false
    fetchDepartments()
  } catch (err: any) {
    message.error(err.response?.data?.error || '操作失败')
  }
}

async function deleteDepartment(id: number) {
  try {
    await axios.delete(`${apiBase}/departments/${id}`, { headers: getHeaders() })
    message.success('删除成功')
    fetchDepartments()
  } catch (err: any) {
    message.error(err.response?.data?.error || '删除失败')
  }
}

// 岗位操作
async function fetchPositions() {
  try {
    const res = await axios.get(`${apiBase}/positions`, { headers: getHeaders() })
    positions.value = res.data.data || []
  } catch (err: any) {
    message.error(err.response?.data?.error || '获取岗位列表失败')
  }
}

function showPositionModal(record?: any) {
  if (record) {
    positionForm.value = { ...record }
  } else {
    positionForm.value = {}
  }
  positionModalVisible.value = true
}

async function savePosition() {
  if (!positionForm.value.name) {
    message.warning('请输入岗位名称')
    return
  }

  try {
    const data = {
      name: positionForm.value.name,
      level: positionForm.value.level || '',
      description: positionForm.value.description || ''
    }

    if (positionForm.value.id) {
      await axios.put(`${apiBase}/positions/${positionForm.value.id}`, data, { headers: getHeaders() })
      message.success('更新成功')
    } else {
      await axios.post(`${apiBase}/positions`, data, { headers: getHeaders() })
      message.success('创建成功')
    }

    positionModalVisible.value = false
    fetchPositions()
  } catch (err: any) {
    message.error(err.response?.data?.error || '操作失败')
  }
}

async function deletePosition(id: number) {
  try {
    await axios.delete(`${apiBase}/positions/${id}`, { headers: getHeaders() })
    message.success('删除成功')
    fetchPositions()
  } catch (err: any) {
    message.error(err.response?.data?.error || '删除失败')
  }
}

// 职级操作
async function fetchLevels() {
  try {
    const res = await axios.get(`${apiBase}/levels`, { headers: getHeaders() })
    levels.value = res.data.data || []
  } catch (err: any) {
    message.error(err.response?.data?.error || '获取职级列表失败')
  }
}

function showLevelModal(record?: any) {
  if (record) {
    levelForm.value = { ...record }
  } else {
    levelForm.value = { sort: 0 }
  }
  levelModalVisible.value = true
}

async function saveLevel() {
  if (!levelForm.value.code || !levelForm.value.name) {
    message.warning('请输入职级代码和名称')
    return
  }

  try {
    const data = {
      code: levelForm.value.code,
      name: levelForm.value.name,
      sort: levelForm.value.sort || 0
    }

    if (levelForm.value.id) {
      await axios.put(`${apiBase}/levels/${levelForm.value.id}`, data, { headers: getHeaders() })
      message.success('更新成功')
    } else {
      await axios.post(`${apiBase}/levels`, data, { headers: getHeaders() })
      message.success('创建成功')
    }

    levelModalVisible.value = false
    fetchLevels()
  } catch (err: any) {
    message.error(err.response?.data?.error || '操作失败')
  }
}

async function deleteLevel(id: number) {
  try {
    await axios.delete(`${apiBase}/levels/${id}`, { headers: getHeaders() })
    message.success('删除成功')
    fetchLevels()
  } catch (err: any) {
    message.error(err.response?.data?.error || '删除失败')
  }
}

onMounted(() => {
  fetchDepartments()
  fetchPositions()
  fetchLevels()
})
</script>
