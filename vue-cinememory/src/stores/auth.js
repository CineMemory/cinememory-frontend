// 🔐 인증 관련 Pinia 스토어
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authAPI from '@/services/authApi'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref(null)
  const showLoginModal = ref(false)
  const loginModalMode = ref('login')

  // 계산된 속성
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isGuest = computed(() => !isAuthenticated.value)
  const openLoginModal = (mode = 'login') => {
    loginModalMode.value = mode
    showLoginModal.value = true
  }
  const closeLoginModal = () => {
    showLoginModal.value = false
  }

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

  // 🔐 회원가입
  const signup = async (userData) => {
    try {
      isLoading.value = true
      clearError()

      console.log('🔄 회원가입 요청:', { ...userData, password: '***' })

      const response = await authAPI.signup(userData)

      console.log('✅ 회원가입 성공:', response)

      // 백엔드 응답 형식에 맞춰 파싱
      const user = response.user || response

      return {
        success: true,
        message: response.message || '회원가입이 완료되었습니다.',
        user_id: user.id,
        username: user.username
      }
    } catch (err) {
      console.error('❌ 회원가입 실패:', err)

      // 다양한 에러 형태에 대응
      let errorMessage = '회원가입에 실패했습니다.'

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data) {
        // Serializer 에러 처리 (Django DRF 형식)
        const errors = err.response.data
        if (typeof errors === 'object') {
          // 필드별 에러를 하나의 문자열로 합치기
          const errorMessages = []

          Object.keys(errors).forEach((field) => {
            const fieldErrors = Array.isArray(errors[field])
              ? errors[field]
              : [errors[field]]
            fieldErrors.forEach((error) => {
              if (field === 'non_field_errors') {
                errorMessages.push(error)
              } else {
                errorMessages.push(`${field}: ${error}`)
              }
            })
          })

          errorMessage = errorMessages.join(', ')
        }
      } else if (err.message) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      console.log('📝 파싱된 에러 메시지:', errorMessage)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  // 🔍 닉네임 중복 확인
  const checkUsernameAvailability = async (username) => {
    try {
      clearError()

      console.log('🔄 닉네임 중복 확인:', username)

      const response = await authAPI.checkUsernameAvailability(username)

      console.log('✅ 닉네임 사용 가능:', response)

      return {
        success: true,
        message: response.message
      }
    } catch (err) {
      console.error('❌ 닉네임 중복 확인 실패:', err)

      // 다양한 에러 형태에 대응
      let errorMessage = '닉네임 확인에 실패했습니다.'

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      console.log('📝 파싱된 에러 메시지:', errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // 🔑 로그인
  const login = async (credentials) => {
    try {
      isLoading.value = true
      clearError()

      console.log('🔄 로그인 요청:', { ...credentials, password: '***' })

      const response = await authAPI.login(credentials)

      console.log('✅ 로그인 성공:', response)

      // 백엔드 응답 형식에 맞춰 파싱
      const token = response.token
      const user = response.user

      // 토큰과 사용자 정보 설정
      setToken(token)
      setUserExtended({
        id: user.id,
        username: user.username,
        birth: user.birth,
        onboarding_completed: user.onboarding_completed || false
      })

      return {
        success: true,
        message: response.message || '로그인에 성공했습니다.'
      }
    } catch (err) {
      console.error('❌ 로그인 실패:', err)

      // 다양한 에러 형태에 대응
      let errorMessage = '로그인에 실패했습니다.'

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors.join(' ')
      } else if (err.message) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      console.log('📝 파싱된 에러 메시지:', errorMessage)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  // 🚪 로그아웃
  const logout = async () => {
    try {
      console.log('🔄 로그아웃 요청')

      // 서버에 로그아웃 요청
      if (token.value) {
        await authAPI.logout()
        console.log('✅ 서버 로그아웃 성공')
      }
    } catch (err) {
      console.error('❌ 서버 로그아웃 실패:', err)
      // 서버 로그아웃이 실패해도 로컬 상태는 초기화
    } finally {
      // 로컬 상태 초기화
      setToken(null)
      setUser(null)
      clearError()
      console.log('✅ 로컬 로그아웃 완료')
    }
  }

  // 🔄 사용자 정보 새로고침 (현재는 API가 없어서 토큰만 검증)
  const fetchUser = async () => {
    if (!token.value) return

    try {
      isLoading.value = true

      // 현재는 사용자 정보 조회 API가 없으므로 토큰 유효성만 확인
      // 추후 API가 추가되면 여기서 사용자 정보를 가져옴

      console.log('ℹ️ 사용자 정보 조회 API가 아직 없습니다.')
    } catch (err) {
      console.error('❌ 사용자 정보 조회 실패:', err)

      // 토큰이 유효하지 않을 경우 로그아웃
      if (err.response?.status === 401) {
        console.log('🔄 토큰이 만료되어 로그아웃합니다.')
        await logout()
      }
    } finally {
      isLoading.value = false
    }
  }

  // 🚀 초기화 (앱 시작 시 호출)
  const initialize = async () => {
    if (token.value) {
      console.log('🔄 토큰이 존재합니다. 사용자 정보를 확인합니다.')

      // 현재는 사용자 정보 조회 API가 없으므로 localStorage에서 사용자 정보 복원
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          console.log('✅ 저장된 사용자 정보 복원 완료')
        } catch (err) {
          console.error('❌ 저장된 사용자 정보 복원 실패:', err)
          await logout() // 잘못된 데이터면 로그아웃
        }
      }

      // 추후 사용자 정보 조회 API가 생기면 fetchUser() 호출
      // await fetchUser()
    } else {
      console.log('ℹ️ 저장된 토큰이 없습니다.')
    }
  }

  // 사용자 정보가 변경될 때 localStorage에도 저장
  const saveUserToStorage = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // setUser 함수를 확장해서 localStorage에도 저장
  const setUserExtended = (userData) => {
    setUser(userData)
    saveUserToStorage(userData)
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
    signup,
    checkUsernameAvailability,
    login,
    logout,
    fetchUser,
    initialize,
    clearError,

    showLoginModal,
    loginModalMode,
    openLoginModal,
    closeLoginModal,

    // 내부 유틸리티 (필요시 사용)
    setUser: setUserExtended,
    setToken,

    // 프로필 관련 (추가)
    getUserProfile: async () => await authAPI.getUserProfile(),
    updateUserProfile: async (formData) =>
      await authAPI.updateUserProfile(formData),
    deleteUserAccount: async (password) =>
      await authAPI.deleteUserAccount(password)
  }
})
