import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import type { AuthenticatedRequest } from '../types/index.js'

import {
  getRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward
} from '../services/rewards.js'

const router = Router()

// 所有路由都需要认证
router.use(authMiddleware)

// ==================== 奖惩记录管理 ====================

// 获取奖惩记录列表
router.get('/rewards', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', pageSize = '10', employeeId, type, startDate, endDate } = req.query

    const filters: any = {}
    if (employeeId) filters.employeeId = parseInt(employeeId as string)
    if (type) filters.type = type
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)

    const result = await getRewards(filters, { page: parseInt(page), pageSize: parseInt(pageSize) })
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 获取单条奖惩记录
router.get('/rewards/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const reward = await getRewardById(id)

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: '奖惩记录不存在',
        code: 404
      })
    }

    res.json({
      success: true,
      data: reward
    })
  } catch (error) {
    next(error)
  }
})

// 创建奖惩记录（仅管理员）
router.post('/rewards', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可创建奖惩记录',
        code: 403
      })
    }

    const { employeeId, type, reason, amount, date, description } = req.body

    // 验证必填字段
    if (!employeeId || !type || !reason) {
      return res.status(400).json({
        success: false,
        error: '员工ID、类型和原因为必填项',
        code: 400
      })
    }

    // 验证类型
    if (!['reward', 'punishment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '类型必须是 reward 或 punishment',
        code: 400
      })
    }

    // 验证金额
    if (amount !== undefined && typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: '金额必须是数字',
        code: 400
      })
    }

    const reward = await createReward({
      employeeId: parseInt(employeeId),
      type,
      reason,
      amount: amount || 0,
      date: date ? new Date(date) : undefined,
      description
    })

    res.status(201).json({
      success: true,
      data: reward
    })
  } catch (error: any) {
    next(error)
  }
})

// 更新奖惩记录（仅管理员）
router.put('/rewards/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可修改奖惩记录',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    const { type, reason, amount, date, description } = req.body

    // 验证类型
    if (type && !['reward', 'punishment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '类型必须是 reward 或 punishment',
        code: 400
      })
    }

    // 验证金额
    if (amount !== undefined && typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: '金额必须是数字',
        code: 400
      })
    }

    const reward = await updateReward(id, {
      type,
      reason,
      amount: amount || 0,
      date: date ? new Date(date) : undefined,
      description
    })

    res.json({
      success: true,
      data: reward
    })
  } catch (error: any) {
    next(error)
  }
})

// 删除奖惩记录（仅管理员）
router.delete('/rewards/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可删除奖惩记录',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    await deleteReward(id)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    next(error)
  }
})

export default router
