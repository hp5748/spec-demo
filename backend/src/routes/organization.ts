import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import type { AuthenticatedRequest } from '../types/index.js'

import {
  // 部门管理
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  // 岗位管理
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
  // 职级管理
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel
} from '../services/organization.js'

const router = Router()

// 所有路由都需要认证
router.use(authMiddleware)

// ==================== 部门管理 ====================

// 获取部门列表
router.get('/departments', async (req: AuthenticatedRequest, res, next) => {
  try {
    const departments = await getDepartments()
    res.json({
      success: true,
      data: departments
    })
  } catch (error) {
    next(error)
  }
})

// 创建部门（仅管理员）
router.post('/departments', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可创建部门',
        code: 403
      })
    }

    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({
        success: false,
        error: '部门名称不能为空',
        code: 400
      })
    }

    const department = await createDepartment({ name, description })
    res.status(201).json({
      success: true,
      data: department
    })
  } catch (error: any) {
    // 处理唯一约束冲突
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '部门名称已存在',
        code: 409
      })
    }
    next(error)
  }
})

// 更新部门（仅管理员）
router.put('/departments/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可修改部门',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    const { name, description } = req.body
    const department = await updateDepartment(id, { name, description })
    res.json({
      success: true,
      data: department
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '部门不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 删除部门（仅管理员）
router.delete('/departments/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可删除部门',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    await deleteDepartment(id)
    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '部门不存在',
        code: 404
      })
    }
    next(error)
  }
})

// ==================== 岗位管理 ====================

// 获取岗位列表
router.get('/positions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const positions = await getPositions()
    res.json({
      success: true,
      data: positions
    })
  } catch (error) {
    next(error)
  }
})

// 创建岗位（仅管理员）
router.post('/positions', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可创建岗位',
        code: 403
      })
    }

    const { name, level, description } = req.body
    if (!name) {
      return res.status(400).json({
        success: false,
        error: '岗位名称不能为空',
        code: 400
      })
    }

    const position = await createPosition({ name, level, description })
    res.status(201).json({
      success: true,
      data: position
    })
  } catch (error: any) {
    // 处理唯一约束冲突
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '岗位名称已存在',
        code: 409
      })
    }
    next(error)
  }
})

// 更新岗位（仅管理员）
router.put('/positions/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可修改岗位',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    const { name, level, description } = req.body
    const position = await updatePosition(id, { name, level, description })
    res.json({
      success: true,
      data: position
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '岗位不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 删除岗位（仅管理员）
router.delete('/positions/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可删除岗位',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    await deletePosition(id)
    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '岗位不存在',
        code: 404
      })
    }
    next(error)
  }
})

// ==================== 职级管理 ====================

// 获取职级列表
router.get('/levels', async (req: AuthenticatedRequest, res, next) => {
  try {
    const levels = await getLevels()
    res.json({
      success: true,
      data: levels
    })
  } catch (error) {
    next(error)
  }
})

// 创建职级（仅管理员）
router.post('/levels', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可创建职级',
        code: 403
      })
    }

    const { code, name, sort } = req.body
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: '职级代码和名称不能为空',
        code: 400
      })
    }

    const level = await createLevel({ code, name, sort })
    res.status(201).json({
      success: true,
      data: level
    })
  } catch (error: any) {
    // 处理唯一约束冲突
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '职级代码已存在',
        code: 409
      })
    }
    next(error)
  }
})

// 更新职级（仅管理员）
router.put('/levels/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可修改职级',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    const { code, name, sort } = req.body
    const level = await updateLevel(id, { code, name, sort })
    res.json({
      success: true,
      data: level
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '职级不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 删除职级（仅管理员）
router.delete('/levels/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查是否为管理员
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可删除职级',
        code: 403
      })
    }

    const id = parseInt(req.params.id)
    await deleteLevel(id)
    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '职级不存在',
        code: 404
      })
    }
    next(error)
  }
})

export default router
