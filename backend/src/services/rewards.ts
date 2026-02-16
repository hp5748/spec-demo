import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
  const reward = await prisma.reward.findUnique({
    where: { id }
  })
  if (!reward) return null

  const employee = await prisma.employee.findUnique({
    where: { id: reward.employeeId },
    select: { employeeNo: true, name: true }
  })

  return {
    ...reward,
    employeeNo: employee?.employeeNo,
    employeeName: employee?.name
  }
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
