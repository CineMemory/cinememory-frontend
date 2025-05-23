<!-- 🔐 인증 페이지 (로그인/회원가입) -->
<template>
  <div class="auth-view">
    <div class="auth-view__container">
      <!-- 로고 및 헤더 -->
      <div class="auth-view__header">
        <div
          class="auth-view__logo"
          @click="goHome">
          <BaseIcon
            name="home"
            class="auth-view__logo-icon" />
          <h1 class="auth-view__title">씨네메모리</h1>
        </div>
        <p class="auth-view__subtitle">당신의 인생을 영화로</p>
      </div>

      <!-- 인증 폼 -->
      <div class="auth-view__form-container">
        <!-- 탭 헤더 -->
        <div class="auth-view__tabs">
          <button
            @click="switchToLogin"
            :class="[
              'auth-view__tab',
              { 'auth-view__tab--active': isLoginMode }
            ]">
            로그인
          </button>
          <button
            @click="switchToSignup"
            :class="[
              'auth-view__tab',
              { 'auth-view__tab--active': !isLoginMode }
            ]">
            회원가입
          </button>
        </div>

        <!-- 폼 내용 -->
        <div class="auth-view__form-content">
          <!-- 로그인 폼 -->
          <AuthFormLogin
            v-if="isLoginMode"
            @success="handleSuccess"
            @switch-to-signup="switchToSignup" />

          <!-- 회원가입 폼 -->
          <AuthFormSignup
            v-else
            @success="handleSuccess"
            @switch-to-login="switchToLogin" />
        </div>
      </div>

      <!-- 홈으로 돌아가기 링크 -->
      <div class="auth-view__footer">
        <button
          @click="goHome"
          class="auth-view__home-link">
          <BaseIcon
            name="arrow-left"
            class="home-link-icon" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const router = useRouter()
  const route = useRoute()
  const { isAuthenticated } = useAuth()

  // 상태
  const isLoginMode = ref(true)

  // 마운트 시 실행
  onMounted(() => {
    // 이미 로그인된 사용자는 홈으로 리다이렉트
    if (isAuthenticated.value) {
      router.push({ name: 'Home' })
      return
    }

    // URL 쿼리로 모드 설정
    if (route.query.mode === 'signup') {
      isLoginMode.value = false
    }
  })

  // 모드 전환
  const switchToLogin = () => {
    isLoginMode.value = true
    router.replace({ name: 'Auth', query: { mode: 'login' } })
  }

  const switchToSignup = () => {
    isLoginMode.value = false
    router.replace({ name: 'Auth', query: { mode: 'signup' } })
  }

  // 인증 성공
  const handleSuccess = () => {
    console.log('✅ 인증 성공!')
    router.push({ name: 'Home' })
  }

  // 홈으로 이동
  const goHome = () => {
    router.push({ name: 'Home' })
  }
</script>

<style scoped>
  .auth-view {
    min-height: 100vh;
    background-color: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .auth-view__container {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* 헤더 */
  .auth-view__header {
    text-align: center;
  }

  .auth-view__logo {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    margin-bottom: 12px;
    transition: opacity 0.2s;
  }

  .auth-view__logo:hover {
    opacity: 0.8;
  }

  .auth-view__logo-icon {
    width: 32px;
    height: 32px;
    color: var(--color-main);
  }

  .auth-view__title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .auth-view__subtitle {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 폼 컨테이너 */
  .auth-view__form-container {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 32px;
    border: 1px solid var(--color-inactive-icon);
  }

  /* 탭 */
  .auth-view__tabs {
    display: flex;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .auth-view__tab {
    flex: 1;
    background: none;
    border: none;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-highlight-text);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition:
      color 0.2s,
      border-color 0.2s;
  }

  .auth-view__tab:hover {
    color: var(--color-text);
  }

  .auth-view__tab--active {
    color: var(--color-main);
    border-bottom-color: var(--color-main);
  }

  .auth-view__form-content {
    /* 폼 내용 스타일링은 개별 컴포넌트에서 처리 */
  }

  /* 푸터 */
  .auth-view__footer {
    text-align: center;
  }

  .auth-view__home-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--color-highlight-text);
    font-size: 14px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: var(--border-radius-medium);
    transition:
      color 0.2s,
      background-color 0.2s;
  }

  .auth-view__home-link:hover {
    color: var(--color-text);
    background-color: var(--color-highlight-background);
  }

  .home-link-icon {
    width: 16px;
    height: 16px;
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .auth-view {
      padding: 16px;
    }

    .auth-view__container {
      max-width: 100%;
      gap: 24px;
    }

    .auth-view__form-container {
      padding: 24px;
    }

    .auth-view__title {
      font-size: 24px;
    }

    .auth-view__subtitle {
      font-size: 14px;
    }

    .auth-view__tab {
      font-size: 14px;
      padding: 10px 12px;
    }
  }
</style>
