import api from './index'
import type { ApiResponse, Employee, EmployeeListParams, EmployeeListResponse } from '@/types'

export function getEmployees(params: EmployeeListParams): Promise<ApiResponse<EmployeeListResponse>> {
  return api.get('/employees', { params })
}

export function getEmployeeById(id: number): Promise<ApiResponse<Employee>> {
  return api.get(`/employees/${id}`)
}

export function createEmployee(data: Partial<Employee>): Promise<ApiResponse<Employee>> {
  return api.post('/employees', data)
}

export function updateEmployee(id: number, data: Partial<Employee>): Promise<ApiResponse<Employee>> {
  return api.put(`/employees/${id}`, data)
}

export function deleteEmployee(id: number): Promise<ApiResponse> {
  return api.delete(`/employees/${id}`)
}

export function updateEmployeeStatus(id: number, status: string): Promise<ApiResponse<Employee>> {
  return api.patch(`/employees/${id}/status`, { status })
}

// 导出员工数据
export function exportEmployees(params?: EmployeeListParams): Promise<Blob> {
  return api.get('/employees/export', {
    params,
    responseType: 'blob'
  })
}

// 下载导入模板
export function downloadImportTemplate(): Promise<Blob> {
  return api.get('/employees/import/template', {
    responseType: 'blob'
  })
}

// 导入员工数据
export interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export function importEmployees(file: File): Promise<ApiResponse<ImportResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/employees/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
