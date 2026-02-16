export interface UserInfo {
  id: number
  username: string
  name: string
  role: 'admin' | 'hr' | 'manager' | 'user'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: number
}

// 员工相关类型
export interface Employee {
  id: number
  employeeNo: string
  name: string
  gender: 'male' | 'female' | 'other'
  age?: number
  phone?: string
  email?: string
  department?: string
  position?: string
  level?: string
  hireDate?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface EmployeeListParams {
  page?: number
  pageSize?: number
  name?: string
  employeeNo?: string
  department?: string
  status?: string
}

export interface EmployeeListResponse {
  list: Employee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

