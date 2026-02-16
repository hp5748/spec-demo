<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
      <a-button type="text" style="color: white;" @click="router.push({ name: 'Home' })">
        <LeftOutlined />
        返回首页
      </a-button>
      <div style="color: white; font-size: 18px; font-weight: bold; margin-left: 24px;">
        奖惩记录管理
      </div>
    </a-layout-header>

    <a-layout-content style="padding: 24px;">
      <a-card>
        <template #title>
          <span>奖惩记录</span>
          <a-button type="primary" style="float: right;" @click="showModal()" :disabled="!isAdmin">
            新增记录
          </a-button>
        </template>

        <!-- 筛选条件 -->
        <template #extra>
          <a-space style="margin-bottom: 16px; width: 100%;">
            <a-select v-model:value="filters.type" placeholder="类型" style="width: 120px;" allowClear @change="fetchRewards">
              <a-select-option value="reward">奖励</a-select-option>
              <a-select-option value="punishment">处罚</a-select-option>
            </a-select>
            <a-select v-model:value="filters.employeeId" placeholder="选择员工" style="width: 150px;" allowClear @change="fetchRewards" :filter-option="filterEmployee" show-search>
              <a-select-option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </a-select-option>
            </a-select>
          </a-space>
        </template>

        <a-table
          :dataSource="rewards"
          :columns="columns"
          :pagination="pagination"
          :loading="loading"
          rowKey="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="record.type === 'reward' ? 'green' : 'red'">
                {{ record.type === 'reward' ? '奖励' : '处罚' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'amount'">
              <span :style="{ color: record.amount > 0 ? 'green' : record.amount < 0 ? 'red' : '' }">
                {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
              </span>
            </template>
            <template v-if="column.key === 'date'">
              {{ formatDate(record.date) }}
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="showModal(record)" :disabled="!isAdmin">编辑</a-button>
              <a-popconfirm title="确定删除该记录吗？" @confirm="deleteReward(record.id)">
                <a-button type="link" danger :disabled="!isAdmin">删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-layout-content>

    <!-- 弹窗 -->
    <a-modal v-model:open="modalVisible" :title="form.id ? '编辑记录' : '新增记录'" @ok="save" width="600px">
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="员工" required>
              <a-select v-model:value="form.employeeId" placeholder="选择员工" show-search :filter-option="filterEmployee">
                <a-select-option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }} ({{ emp.employeeNo }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" required>
              <a-select v-model:value="form.type" placeholder="选择类型">
                <a-select-option value="reward">奖励</a-select-option>
                <a-select-option value="punishment">处罚</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="原因" required>
          <a-input v-model:value="form.reason" placeholder="请输入奖惩原因" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="金额">
              <a-input-number v-model:value="form.amount" :min="form.type === 'punishment' ? -100000 : 0" style="width: 100%;" placeholder="正数为奖金，负数为罚款" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="发生日期">
              <a-date-picker v-model:value="form.dateValue" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="详细描述">
          <a-textarea v-model:value="form.description" placeholder="请输入详细描述" :rows="3" />
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
import { LeftOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === 'admin')

const rewards = ref<any[]>([])
const employees = ref<any[]>([])
const loading = ref(false)
const modalVisible = ref(false)
const form = ref<any>({})

const filters = ref<any>({
  type: undefined,
  employeeId: undefined
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo', width: 100 },
  { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '发生日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

const apiBase = 'http://localhost:3001/api'
const getHeaders = () => ({
  Authorization: `Bearer ${authStore.token}`
})

async function fetchRewards() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    }
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.employeeId) params.employeeId = filters.value.employeeId

    const res = await axios.get(`${apiBase}/rewards`, { headers: getHeaders(), params })
    rewards.value = res.data.data.list || []
    pagination.value.total = res.data.data.total || 0
  } catch (err: any) {
    message.error(err.response?.data?.error || '获取奖惩记录失败')
  } finally {
    loading.value = false
  }
}

async function fetchEmployees() {
  try {
    const res = await axios.get(`${apiBase}/employees`, { headers: getHeaders() })
    employees.value = res.data.data.list || []
  } catch (err: any) {
    message.error('获取员工列表失败')
  }
}

function showModal(record?: any) {
  if (record) {
    form.value = {
      ...record,
      dateValue: record.date ? dayjs(record.date) : null
    }
  } else {
    form.value = {
      type: 'reward',
      amount: 0,
      dateValue: dayjs()
    }
  }
  modalVisible.value = true
}

async function save() {
  if (!form.value.employeeId || !form.value.type || !form.value.reason) {
    message.warning('请填写必填项')
    return
  }

  try {
    const data = {
      employeeId: form.value.employeeId,
      type: form.value.type,
      reason: form.value.reason,
      amount: form.value.amount || 0,
      date: form.value.dateValue ? form.value.dateValue.toISOString() : undefined,
      description: form.value.description || ''
    }

    if (form.value.id) {
      await axios.put(`${apiBase}/rewards/${form.value.id}`, data, { headers: getHeaders() })
      message.success('更新成功')
    } else {
      await axios.post(`${apiBase}/rewards`, data, { headers: getHeaders() })
      message.success('创建成功')
    }

    modalVisible.value = false
    fetchRewards()
  } catch (err: any) {
    message.error(err.response?.data?.error || '操作失败')
  }
}

async function deleteReward(id: number) {
  try {
    await axios.delete(`${apiBase}/rewards/${id}`, { headers: getHeaders() })
    message.success('删除成功')
    fetchRewards()
  } catch (err: any) {
    message.error(err.response?.data?.error || '删除失败')
  }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  fetchRewards()
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function filterEmployee(input: string, option: any) {
  return option.children.children[0].children.toLowerCase().includes(input.toLowerCase())
}

onMounted(() => {
  fetchRewards()
  fetchEmployees()
})
</script>
