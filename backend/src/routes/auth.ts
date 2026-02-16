import { Router } from 'express'
import { login, getUserById } from '../services/auth.js'
import { authMiddleware } from '../middlewares/auth.js'
import type { AuthenticatedRequest } from '../types/index.js'

const router = Router()

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名和密码不能为空',
        code: 400
      })
    }

    const result = await login({ username, password })

    if (!result) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误',
        code: 401
      })
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 登出
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  })
})

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await getUserById(req.user!.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
        code: 404
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

export default router
