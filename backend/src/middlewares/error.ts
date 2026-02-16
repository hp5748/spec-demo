import type { Request, Response, NextFunction } from 'express'

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err)

  return res.status(500).json({
    success: false,
    error: '服务器内部错误',
    code: 500
  })
}
