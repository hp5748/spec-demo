import axios from 'axios'
import type { ApiResponse } from '@/types'
import { getToken, removeToken } from '@/utils/token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 注入 token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      // 401 未授权，清除 token 并跳转登录
      if (status === 401) {
        removeToken()
        window.location.href = '/login'
      }

      return Promise.reject({
        success: false,
        error: data?.error || '请求失败',
        code: status
      } as ApiResponse)
    }

    return Promise.reject({
      success: false,
      error: error.message || '网络错误',
      code: 0
    } as ApiResponse)
  }
)

export default api
