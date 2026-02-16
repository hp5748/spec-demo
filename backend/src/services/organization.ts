import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==================== 部门管理 ====================

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { createdAt: 'asc' }
  })
}

export async function getDepartmentById(id: number) {
  return prisma.department.findUnique({
    where: { id }
  })
}

export async function createDepartment(data: { name: string; description?: string }) {
  return prisma.department.create({
    data
  })
}

export async function updateDepartment(id: number, data: { name?: string; description?: string }) {
  return prisma.department.update({
    where: { id },
    data
  })
}

export async function deleteDepartment(id: number) {
  return prisma.department.delete({
    where: { id }
  })
}

// ==================== 岗位管理 ====================

export async function getPositions() {
  return prisma.position.findMany({
    orderBy: { createdAt: 'asc' }
  })
}

export async function getPositionById(id: number) {
  return prisma.position.findUnique({
    where: { id }
  })
}

export async function createPosition(data: { name: string; level?: string; description?: string }) {
  return prisma.position.create({
    data
  })
}

export async function updatePosition(id: number, data: { name?: string; level?: string; description?: string }) {
  return prisma.position.update({
    where: { id },
    data
  })
}

export async function deletePosition(id: number) {
  return prisma.position.delete({
    where: { id }
  })
}

// ==================== 职级管理 ====================

export async function getLevels() {
  return prisma.level.findMany({
    orderBy: { sort: 'asc' }
  })
}

export async function getLevelById(id: number) {
  return prisma.level.findUnique({
    where: { id }
  })
}

export async function createLevel(data: { code: string; name: string; sort?: number }) {
  return prisma.level.create({
    data
  })
}

export async function updateLevel(id: number, data: { code?: string; name?: string; sort?: number }) {
  return prisma.level.update({
    where: { id },
    data
  })
}

export async function deleteLevel(id: number) {
  return prisma.level.delete({
    where: { id }
  })
}

// ==================== 奖惩记录管理 ====================

export interface RewardFilters {
  employeeId?: number
  type?: string
  startDate?: Date
  endDate?: Date
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export async function getRewards(
  filters: RewardFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
) {
  const { page, pageSize } = pagination
  const { employeeId, type, startDate, endDate } = filters

  const where: any = {}

  if (employeeId) {
    where.employeeId = employeeId
  }
  if (type) {
    where.type = type
  }
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const [list, total] = await Promise.all([
    prisma.reward.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: 'desc' }
    }),
    prisma.reward.count({ where })
  ])

  // 获取员工信息并补充到结果中
  const listWithEmployee = await Promise.all(
    list.map(async (reward) => {
      const employee = await prisma.employee.findUnique({
        where: { id: reward.employeeId },
        select: { employeeNo: true, name: true }
      })
      return {
        ...reward,
        employeeNo: employee?.employeeNo,
        employeeName: employee?.name
      }
    })
  )

  return {
    list: listWithEmployee,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function getRewardById(id: number) {
  return prisma.reward.findUnique({
    where: { id }
  })
}

export async function createReward(data: {
  employeeId: number
  type: string
  reason: string
  amount?: number
  date?: Date
  description?: string
}) {
  return prisma.reward.create({
    data
  })
}

export async function updateReward(id: number, data: {
  employeeId?: number
  type?: string
  reason?: string
  amount?: number
  date?: Date
  description?: string
}) {
  return prisma.reward.update({
    where: { id },
    data
  })
}

export async function deleteReward(id: number) {
  return prisma.reward.delete({
    where: { id }
  })
}
