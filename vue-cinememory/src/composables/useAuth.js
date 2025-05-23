// 🎣 인증 관련 컴포저블
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  // 인증 상태
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isGuest = computed(() => authStore.isGuest)
  const user = computed(() => authStore.user)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  // 로그인
  const login = async (credentials) => {
    const result = await authStore.login(credentials)

    if (result.success) {
      console.log('✅ 로그인 성공:', authStore.user.username)
      // 로그인 성공 시 홈으로 리다이렉트 (또는 이전 페이지)
      router.push({ name: 'Home' })
    }

    return result
  }

  // 회원가입
  const signup = async (userData) => {
    const result = await authStore.signup(userData)

    if (result.success) {
      console.log('✅ 회원가입 성공:', authStore.user.username)
      // 회원가입 성공 시 홈으로 리다이렉트
      router.push({ name: 'Home' })
    }

    return result
  }

  // 로그아웃
  const logout = async () => {
    await authStore.logout()
    console.log('👋 로그아웃 완료')

    // 로그아웃 후 홈으로 리다이렉트
    router.push({ name: 'Home' })
  }

  // 에러 초기화
  const clearError = () => {
    authStore.clearError()
  }

  // 로그인 필요 여부 체크
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      console.log('🔒 인증이 필요한 페이지입니다.')
      router.push({ name: 'Home' })
      return false
    }
    return true
  }

  // 게스트만 접근 가능 (이미 로그인한 사용자는 접근 불가)
  const requireGuest = () => {
    if (isAuthenticated.value) {
      console.log('👤 이미 로그인된 사용자입니다.')
      router.push({ name: 'Home' })
      return false
    }
    return true
  }

  // 사용자 정보 포맷팅
  const formatUserInfo = computed(() => {
    if (!user.value) return null

    return {
      username: user.value.username,
      birth: user.value.birth,
      birthYear: user.value.birth
        ? new Date(user.value.birth).getFullYear()
        : null,
      age: user.value.birth
        ? new Date().getFullYear() - new Date(user.value.birth).getFullYear()
        : null
    }
  })

  // 생년월일 유효성 검사
  const validateBirthDate = (birthDate) => {
    if (!birthDate) return false

    const birth = new Date(birthDate)
    const now = new Date()
    const minDate = new Date('1900-01-01')

    return birth >= minDate && birth <= now
  }

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    return password && password.length >= 6
  }

  // 사용자명 유효성 검사
  const validateUsername = (username) => {
    return username && username.length >= 3 && username.length <= 20
  }

  return {
    // 상태
    isAuthenticated,
    isGuest,
    user,
    isLoading,
    error,
    formatUserInfo,

    // 액션
    login,
    signup,
    logout,
    clearError,

    // 가드
    requireAuth,
    requireGuest,

    // 유틸리티
    validateBirthDate,
    validatePassword,
    validateUsername
  }
}
