import api from './index'
import type { ApiResponse, LoginRequest, LoginResponse, UserInfo } from '@/types'

export function postLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return api.post('/auth/login', data)
}

export function postLogout(): Promise<ApiResponse> {
  return api.post('/auth/logout')
}

export function getMe(): Promise<ApiResponse<UserInfo>> {
  return api.get('/auth/me')
}
