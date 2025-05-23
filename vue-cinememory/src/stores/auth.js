// 🔐 인증 관련 Pinia 스토어
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authAPI from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref(null)

  // 계산된 속성
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isGuest = computed(() => !isAuthenticated.value)

  // 토큰 설정
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 사용자 정보 설정
  const setUser = (userData) => {
    user.value = userData
  }

  // 에러 설정
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // 에러 초기화
  const clearError = () => {
    error.value = null
  }

  // 로그인
  const login = async (credentials) => {
    try {
      isLoading.value = true
      clearError()

      const response = await authAPI.login(credentials)

      setToken(response.token)
      setUser(response.user)

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '로그인에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 회원가입
  const signup = async (userData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await authAPI.signup(userData)

      setToken(response.token)
      setUser(response.user)

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '회원가입에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      if (token.value) {
        await authAPI.logout()
      }
    } catch (err) {
      console.error('로그아웃 요청 실패:', err)
    } finally {
      // 로컬 상태 초기화
      setToken(null)
      setUser(null)
      clearError()
    }
  }

  // 사용자 정보 새로고침
  const fetchUser = async () => {
    if (!token.value) return

    try {
      isLoading.value = true
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('사용자 정보 조회 실패:', err)
      // 토큰이 유효하지 않을 경우 로그아웃
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      isLoading.value = false
    }
  }

  // 초기화 시 토큰이 있으면 사용자 정보 조회
  const initialize = async () => {
    if (token.value) {
      await fetchUser()
    }
  }

  return {
    // 상태
    user,
    token,
    isLoading,
    error,

    // 계산된 속성
    isAuthenticated,
    isGuest,

    // 액션
    login,
    signup,
    logout,
    fetchUser,
    initialize,
    clearError
  }
})
