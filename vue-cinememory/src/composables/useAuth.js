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

  // 🔑 로그인
  const login = async (credentials) => {
    const result = await authStore.login(credentials)

    if (result.success) {
      console.log('✅ 로그인 성공:', authStore.user.username)
      // 로그인 성공 시 홈으로 리다이렉트 (또는 이전 페이지)
      router.push({ name: 'Home' })
    }

    return result
  }

  // 📝 회원가입
  const signup = async (userData) => {
    const result = await authStore.signup(userData)

    // 회원가입 성공해도 자동 로그인하지 않음 (API 명세서에 토큰이 없음)
    // 성공 메시지만 반환하고 로그인 화면으로 전환
    if (result.success) {
      console.log('✅ 회원가입 성공:', result.username)
    }

    return result
  }

  // 🔍 닉네임 중복 확인
  const checkUsernameAvailability = async (username) => {
    return await authStore.checkUsernameAvailability(username)
  }

  // 🚪 로그아웃
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

  // 🔍 유효성 검사 함수들

  // 생년월일 유효성 검사
  const validateBirthDate = (birthDate) => {
    if (!birthDate) return false

    const birth = new Date(birthDate)
    const now = new Date()
    const minDate = new Date('1900-01-01')

    return birth >= minDate && birth <= now
  }

  // 비밀번호 유효성 검사 (API 명세서에 맞춤: 영문, 숫자, 특수문자 포함 8자 이상)
  const validatePassword = (password) => {
    if (!password) return false

    // 영문, 숫자, 특수문자를 포함해 8자 이상
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    return passwordRegex.test(password)
  }

  // 사용자명 유효성 검사
  const validateUsername = (username) => {
    return username && username.length >= 3 && username.length <= 20
  }

  // 🔧 앱 초기화 (main.js나 App.vue에서 호출)
  const initializeAuth = async () => {
    await authStore.initialize()
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
    checkUsernameAvailability,
    logout,
    clearError,
    initializeAuth,

    // 가드
    requireAuth,
    requireGuest,

    // 유틸리티
    validateBirthDate,
    validatePassword,
    validateUsername
  }
}
