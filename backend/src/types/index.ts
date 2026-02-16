import type { Request } from 'express'

export interface User {
  id: number
  username: string
  name: string
  role: 'admin' | 'hr' | 'manager' | 'user'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JwtPayload {
  userId: number
  username: string
  role: string
}

export interface AuthenticatedRequest extends Omit<Request, 'headers' | 'user'> {
  headers: {
    authorization?: string
    [key: string]: any
  }
  user?: User
  query: any
  params: any
}
