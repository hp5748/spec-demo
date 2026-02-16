import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types'
import { postLogin, postLogout, getMe } from '@/api/auth'
import { setToken, removeToken, getToken } from '@/utils/token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const response = await postLogin({ username, password })
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        setToken(response.data.token)
        return true
      }
      return false
    } catch (error: any) {
      console.error('Login failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await postLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      token.value = null
      user.value = null
      removeToken()
    }
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await getMe()
      if (response.success && response.data) {
        user.value = response.data
      }
    } catch (error) {
      console.error('Fetch user failed:', error)
      // 如果获取用户失败，清除 token
      logout()
    } finally {
      loading.value = false
    }
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUser()
  }

  return {
    token,
    user,
    loading,
    login,
    logout,
    fetchUser
  }
})
