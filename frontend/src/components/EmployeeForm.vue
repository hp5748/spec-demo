<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑员工' : '新增员工'"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="工号" name="employeeNo">
        <a-input v-model:value="formState.employeeNo" placeholder="请输入工号" />
      </a-form-item>
      <a-form-item label="姓名" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item label="性别" name="gender">
        <a-select v-model:value="formState.gender" placeholder="请选择性别">
          <a-select-option value="male">男</a-select-option>
          <a-select-option value="female">女</a-select-option>
          <a-select-option value="other">其他</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="年龄" name="age">
        <a-input-number v-model:value="formState.age" :min="18" :max="65" style="width: 100%" />
      </a-form-item>
      <a-form-item label="联系电话" name="phone">
        <a-input v-model:value="formState.phone" placeholder="请输入联系电话" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item label="部门" name="department">
        <a-select v-model:value="formState.department" placeholder="请选择部门" allowClear>
          <a-select-option value="技术部">技术部</a-select-option>
          <a-select-option value="产品部">产品部</a-select-option>
          <a-select-option value="设计部">设计部</a-select-option>
          <a-select-option value="市场部">市场部</a-select-option>
          <a-select-option value="人力资源部">人力资源部</a-select-option>
          <a-select-option value="财务部">财务部</a-select-option>
          <a-select-option value="行政部">行政部</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="岗位" name="position">
        <a-input v-model:value="formState.position" placeholder="请输入岗位" />
      </a-form-item>
      <a-form-item label="职级" name="level">
        <a-select v-model:value="formState.level" placeholder="请选择职级" allowClear>
          <a-select-opt-group label="1级">
            <a-select-option value="1A">1A</a-select-option>
            <a-select-option value="1B">1B</a-select-option>
            <a-select-option value="1C">1C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="2级">
            <a-select-option value="2A">2A</a-select-option>
            <a-select-option value="2B">2B</a-select-option>
            <a-select-option value="2C">2C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="3级">
            <a-select-option value="3A">3A</a-select-option>
            <a-select-option value="3B">3B</a-select-option>
            <a-select-option value="3C">3C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="4级">
            <a-select-option value="4A">4A</a-select-option>
            <a-select-option value="4B">4B</a-select-option>
            <a-select-option value="4C">4C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="5级">
            <a-select-option value="5A">5A</a-select-option>
            <a-select-option value="5B">5B</a-select-option>
            <a-select-option value="5C">5C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="6级">
            <a-select-option value="6A">6A</a-select-option>
            <a-select-option value="6B">6B</a-select-option>
            <a-select-option value="6C">6C</a-select-option>
          </a-select-opt-group>
          <a-select-opt-group label="7级">
            <a-select-option value="7A">7A</a-select-option>
            <a-select-option value="7B">7B</a-select-option>
            <a-select-option value="7C">7C</a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <a-form-item label="入职日期" name="hireDate">
        <a-date-picker
          v-model:value="formState.hireDate"
          style="width: 100%"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-select v-model:value="formState.status" placeholder="请选择状态">
          <a-select-option value="active">在职</a-select-option>
          <a-select-option value="inactive">离职</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { createEmployee, updateEmployee } from '@/api/employees'
import type { Employee } from '@/types'

interface Props {
  open: boolean
  employee?: Employee
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const confirmLoading = ref(false)

const visible = computed(() => props.open)
const isEdit = computed(() => !!props.employee)

// 表单数据
const formState = reactive({
  employeeNo: '',
  name: '',
  gender: 'male' as 'male' | 'female' | 'other',
  age: undefined as number | undefined,
  phone: '',
  email: '',
  department: undefined as string | undefined,
  position: '',
  level: undefined as string | undefined,
  hireDate: undefined as string | undefined,
  status: 'active' as 'active' | 'inactive'
})

// 表单验证规则
const rules = {
  employeeNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  email: [
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ]
}

// 重置表单
const resetForm = () => {
  formState.employeeNo = ''
  formState.name = ''
  formState.gender = 'male'
  formState.age = undefined
  formState.phone = ''
  formState.email = ''
  formState.department = undefined
  formState.position = ''
  formState.level = undefined
  formState.hireDate = undefined
  formState.status = 'active'
  formRef.value?.clearValidate()
}

// 监听员工数据变化，填充表单
watch(
  () => props.employee,
  (employee) => {
    if (employee) {
      formState.employeeNo = employee.employeeNo
      formState.name = employee.name
      formState.gender = employee.gender
      formState.age = employee.age
      formState.phone = employee.phone || ''
      formState.email = employee.email || ''
      formState.department = employee.department
      formState.position = employee.position || ''
      formState.level = employee.level
      formState.hireDate = employee.hireDate ? employee.hireDate.split('T')[0] : undefined
      formState.status = employee.status
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    confirmLoading.value = true

    const data = {
      ...formState,
      age: formState.age || undefined
    }

    let response
    if (isEdit.value && props.employee) {
      response = await updateEmployee(props.employee.id, data)
    } else {
      response = await createEmployee(data)
    }

    if (response.success) {
      message.success(isEdit.value ? '更新成功' : '创建成功')
      emit('success')
    }
  } catch (error: any) {
    console.error('表单验证失败:', error)
  } finally {
    confirmLoading.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('update:open', false)
}
</script>
