<template>
  <div class="employees-container">
    <a-card title="员工管理" :bordered="false">
      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <a-space wrap>
          <a-input
            v-model:value="searchForm.name"
            placeholder="姓名"
            style="width: 120px"
            allowClear
          />
          <a-input
            v-model:value="searchForm.employeeNo"
            placeholder="工号"
            style="width: 120px"
            allowClear
          />
          <a-select
            v-model:value="searchForm.department"
            placeholder="部门"
            style="width: 150px"
            allowClear
          >
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="产品部">产品部</a-select-option>
            <a-select-option value="设计部">设计部</a-select-option>
            <a-select-option value="市场部">市场部</a-select-option>
            <a-select-option value="人力资源部">人力资源部</a-select-option>
            <a-select-option value="财务部">财务部</a-select-option>
            <a-select-option value="行政部">行政部</a-select-option>
          </a-select>
          <a-select
            v-model:value="searchForm.status"
            placeholder="状态"
            style="width: 100px"
            allowClear
          >
            <a-select-option value="active">在职</a-select-option>
            <a-select-option value="inactive">离职</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-space>
        <a-space>
          <a-button @click="handleExport">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
          <a-button @click="showImportModal = true">
            <template #icon><UploadOutlined /></template>
            导入
          </a-button>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            新增员工
          </a-button>
        </a-space>
      </div>

      <!-- 员工列表表格 -->
      <a-table
        :columns="columns"
        :data-source="employeeList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'gender'">
            <a-tag :color="record.gender === 'male' ? 'blue' : record.gender === 'female' ? 'pink' : 'default'">
              {{ genderMap[record.gender as keyof typeof genderMap] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '在职' : '离职' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除该员工吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <EmployeeForm
      v-model:open="formVisible"
      :employee="currentEmployee"
      @success="handleFormSuccess"
    />

    <!-- 导入弹窗 -->
    <a-modal
      v-model:open="showImportModal"
      title="导入员工数据"
      :confirm-loading="importing"
      @ok="handleImport"
      @cancel="handleImportCancel"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-alert
          message="导入说明"
          description="请先下载导入模板，填写完整后再上传。导入时会自动更新已存在的工号数据。"
          type="info"
          show-icon
        />
        <a-button @click="handleDownloadTemplate">
          <template #icon><DownloadOutlined /></template>
          下载导入模板
        </a-button>
        <a-upload
          :file-list="importFileList"
          :before-upload="beforeUpload"
          :remove="handleRemoveFile"
          accept=".xlsx,.xls"
        >
          <a-button :disabled="importFileList.length > 0">
            <template #icon><UploadOutlined /></template>
            选择文件
          </a-button>
        </a-upload>
        <div v-if="importResult" class="import-result">
          <a-alert
            :message="`导入完成：成功 ${importResult.success} 条，失败 ${importResult.failed} 条`"
            :type="importResult.failed > 0 ? 'warning' : 'success'"
            show-icon
          />
          <div v-if="importResult.errors.length > 0" class="import-errors">
            <a-collapse ghost>
              <a-collapse-panel header="查看错误详情">
                <ul>
                  <li v-for="(error, index) in importResult.errors" :key="index">{{ error }}</li>
                </ul>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </a-space>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { getEmployees, deleteEmployee as deleteEmployeeApi, exportEmployees, downloadImportTemplate, importEmployees, type ImportResult } from '@/api/employees'
import type { Employee, EmployeeListParams } from '@/types'
import EmployeeForm from '@/components/EmployeeForm.vue'

// 性别映射
const genderMap = {
  male: '男',
  female: '女',
  other: '其他'
}

// 搜索表单
const searchForm = reactive<EmployeeListParams>({
  name: undefined,
  employeeNo: undefined,
  department: undefined,
  status: undefined
})

// 员工列表
const employeeList = ref<Employee[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 表格列定义
const columns = [
  { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo', width: 100 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 70 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
  { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
  { title: '职级', dataIndex: 'level', key: 'level', width: 80 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

// 表单相关
const formVisible = ref(false)
const currentEmployee = ref<Employee | undefined>(undefined)

// 导入导出相关
const showImportModal = ref(false)
const importing = ref(false)
const importFileList = ref<any[]>([])
const importFile = ref<File | null>(null)
const importResult = ref<ImportResult | null>(null)

// 加载员工列表
const loadEmployees = async () => {
  loading.value = true
  try {
    const params: EmployeeListParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await getEmployees(params)
    if (response.success && response.data) {
      employeeList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error: any) {
    message.error(error.error || '加载员工列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadEmployees()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = undefined
  searchForm.employeeNo = undefined
  searchForm.department = undefined
  searchForm.status = undefined
  pagination.current = 1
  loadEmployees()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadEmployees()
}

// 新增员工
const handleAdd = () => {
  currentEmployee.value = undefined
  formVisible.value = true
}

// 编辑员工
const handleEdit = (employee: Employee) => {
  currentEmployee.value = { ...employee }
  formVisible.value = true
}

// 删除员工
const handleDelete = async (id: number) => {
  try {
    const response = await deleteEmployeeApi(id)
    if (response.success) {
      message.success('删除成功')
      loadEmployees()
    }
  } catch (error: any) {
    message.error(error.error || '删除失败')
  }
}

// 表单提交成功
const handleFormSuccess = () => {
  formVisible.value = false
  loadEmployees()
}

// 导出员工数据
const handleExport = async () => {
  try {
    const blob = await exportEmployees(searchForm)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `员工数据_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    message.success('导出成功')
  } catch (error: any) {
    message.error(error.error || '导出失败')
  }
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const blob = await downloadImportTemplate()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '员工导入模板.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    message.success('模板下载成功')
  } catch (error: any) {
    message.error(error.error || '模板下载失败')
  }
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('只能上传 Excel 文件（.xlsx 或 .xls）')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('文件大小不能超过 5MB')
    return false
  }
  importFile.value = file
  importFileList.value = [{
    uid: '1',
    name: file.name,
    status: 'done',
    url: ''
  }]
  importResult.value = null
  return false
}

// 移除文件
const handleRemoveFile = () => {
  importFile.value = null
  importFileList.value = []
  importResult.value = null
}

// 执行导入
const handleImport = async () => {
  if (!importFile.value) {
    message.warning('请先选择要导入的文件')
    return
  }
  importing.value = true
  try {
    const response = await importEmployees(importFile.value)
    if (response.success && response.data) {
      importResult.value = response.data
      if (response.data.failed === 0) {
        message.success(`导入成功，共 ${response.data.success} 条数据`)
        setTimeout(() => {
          showImportModal.value = false
          loadEmployees()
        }, 1500)
      }
    }
  } catch (error: any) {
    message.error(error.error || '导入失败')
  } finally {
    importing.value = false
  }
}

// 取消导入
const handleImportCancel = () => {
  showImportModal.value = false
  importFileList.value = []
  importFile.value = null
  importResult.value = null
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.employees-container {
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar .ant-space {
  flex: 1;
}

.import-result {
  margin-top: 16px;
}

.import-errors ul {
  padding-left: 20px;
  margin: 8px 0 0 0;
}

.import-errors li {
  color: #ff4d4f;
  margin-bottom: 4px;
}
</style>
