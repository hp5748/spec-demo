import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'
import type { AuthenticatedRequest } from '../types/index.js'

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: '未提供认证令牌',
      code: 401
    })
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyToken(token)
    req.user = {
      id: payload.userId,
      username: payload.username,
      name: payload.username,
      role: payload.role as 'admin' | 'hr' | 'manager' | 'user'
    }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '认证令牌无效或已过期',
      code: 401
    })
  }
}
