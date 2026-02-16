import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface EmployeeFilters {
  name?: string
  employeeNo?: string
  department?: string
  status?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface CreateEmployeeData {
  employeeNo: string
  name: string
  gender: string
  age?: number
  phone?: string
  email?: string
  department?: string
  position?: string
  level?: string
  hireDate?: Date
  status?: string
}

export interface UpdateEmployeeData {
  name?: string
  gender?: string
  age?: number
  phone?: string
  email?: string
  department?: string
  position?: string
  level?: string
  hireDate?: Date
  status?: string
}

export async function getEmployees(
  filters: EmployeeFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
) {
  const { page, pageSize } = pagination
  const { name, employeeNo, department, status } = filters

  const where: any = {}

  if (name) {
    where.name = { contains: name }
  }
  if (employeeNo) {
    where.employeeNo = { contains: employeeNo }
  }
  if (department) {
    where.department = department
  }
  if (status) {
    where.status = status
  }

  const [list, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.employee.count({ where })
  ])

  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function getEmployeeById(id: number) {
  return prisma.employee.findUnique({
    where: { id }
  })
}

export async function createEmployee(data: CreateEmployeeData) {
  return prisma.employee.create({
    data
  })
}

export async function updateEmployee(id: number, data: UpdateEmployeeData) {
  return prisma.employee.update({
    where: { id },
    data
  })
}

export async function deleteEmployee(id: number) {
  return prisma.employee.delete({
    where: { id }
  })
}

export async function updateEmployeeStatus(id: number, status: string) {
  return prisma.employee.update({
    where: { id },
    data: { status }
  })
}

// ==================== Excel 导入导出功能 ====================

export interface EmployeeImportData {
  employeeNo: string
  name: string
  gender: string
  age?: number
  phone?: string
  email?: string
  department?: string
  position?: string
  level?: string
  hireDate?: Date
  status?: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string; data: any }>
}

/**
 * 获取所有员工（用于导出，不分页）
 */
export async function getAllEmployees(filters: EmployeeFilters = {}) {
  const { name, employeeNo, department, status } = filters

  const where: any = {}

  if (name) {
    where.name = { contains: name }
  }
  if (employeeNo) {
    where.employeeNo = { contains: employeeNo }
  }
  if (department) {
    where.department = department
  }
  if (status) {
    where.status = status
  }

  return prisma.employee.findMany({
    where,
    orderBy: { employeeNo: 'asc' }
  })
}

/**
 * 批量导入员工数据
 */
export async function importEmployees(employees: EmployeeImportData[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: []
  }

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const rowNumber = i + 2 // Excel 行号从2开始（第1行是表头）

    try {
      // 验证必填字段
      if (!emp.employeeNo || !emp.name || !emp.gender) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          error: '工号、姓名和性别为必填项',
          data: emp
        })
        continue
      }

      // 验证性别值
      const genderMap: Record<string, string> = {
        '男': 'male',
        '男male': 'male',
        'male': 'male',
        '女': 'female',
        'female': 'female',
        '女female': 'female',
        '其他': 'other',
        'other': 'other'
      }
      const normalizedGender = genderMap[emp.gender.toLowerCase()] || emp.gender
      if (!['male', 'female', 'other'].includes(normalizedGender)) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          error: '性别值无效，必须是男、女或其他',
          data: emp
        })
        continue
      }

      // 检查工号是否已存在
      const existing = await prisma.employee.findUnique({
        where: { employeeNo: emp.employeeNo }
      })

      if (existing) {
        // 更新现有员工
        await prisma.employee.update({
          where: { employeeNo: emp.employeeNo },
          data: {
            ...emp,
            gender: normalizedGender
          }
        })
      } else {
        // 创建新员工
        await prisma.employee.create({
          data: {
            ...emp,
            gender: normalizedGender
          }
        })
      }

      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        row: rowNumber,
        error: error.message || '未知错误',
        data: emp
      })
    }
  }

  return result
}
