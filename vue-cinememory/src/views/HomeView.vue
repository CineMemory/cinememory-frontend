<!-- 홈 페이지 (새로운 레이아웃) -->
<template>
  <div class="home-view">
    <!-- 🎬 헤더 (로고 + 인증) -->
    <header class="home-header">
      <!-- 로고 (좌상단) -->
      <div
        class="home-header__logo"
        @click="goHome">
        <BaseIcon
          name="home"
          class="home-header__logo-icon" />
        <span class="home-header__logo-text">씨네메모리</span>
      </div>

      <!-- 인증 영역 (우상단) -->
      <div class="home-header__auth">
        <!-- 로그인된 상태 -->
        <div
          v-if="isAuthenticated"
          class="home-header__user">
          <button
            @click="goToProfile"
            class="home-header__user-btn">
            <BaseIcon
              name="user"
              class="user-icon" />
            <span class="user-name">{{ user.username }}</span>
          </button>
          <button
            @click="handleLogout"
            class="home-header__logout-btn">
            <BaseIcon
              name="log-out"
              class="logout-icon" />
          </button>
        </div>

        <!-- 로그인되지 않은 상태 -->
        <div
          v-else
          class="home-header__guest">
          <BaseButton
            @click="openLoginModal"
            variant="secondary"
            size="small"
            class="home-header__login-btn">
            로그인
          </BaseButton>
          <BaseButton
            @click="openSignupModal"
            variant="primary"
            size="small"
            class="home-header__signup-btn">
            회원가입
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="home-main">
      <!-- 검색 섹션 -->
      <HomeSearchSection />

      <!-- 박스오피스 섹션 -->
      <HomeBoxofficeSection />

      <!-- 네비게이션 섹션 -->
      <HomeNavigationSection />
    </main>

    <!-- 🔐 인증 모달 -->
    <BaseModal
      v-model="isAuthModalOpen"
      size="small"
      :title="isLoginMode ? '로그인' : '회원가입'"
      :closable="true"
      :close-on-backdrop="true">
      <div class="auth-modal-content">
        <!-- 로그인 폼 -->
        <AuthFormLogin
          v-if="isLoginMode"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup" />

        <!-- 회원가입 폼 -->
        <AuthFormSignup
          v-else
          @success="handleAuthSuccess"
          @switch-to-login="switchToLogin" />
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import HomeSearchSection from '@/components/home/HomeSearchSection.vue'
  import HomeBoxofficeSection from '@/components/home/HomeBoxofficeSection.vue'
  import HomeNavigationSection from '@/components/home/HomeNavigationSection.vue'
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const router = useRouter()

  // 인증 컴포저블
  const { isAuthenticated, user, logout } = useAuth()

  // 인증 모달 상태
  const isAuthModalOpen = ref(false)
  const isLoginMode = ref(true)

  // 홈으로 이동
  const goHome = () => {
    router.push({ name: 'Home' })
  }

  // 프로필로 이동
  const goToProfile = () => {
    router.push({ name: 'MyProfile' })
  }

  // 로그인 모달 열기
  const openLoginModal = () => {
    isLoginMode.value = true
    isAuthModalOpen.value = true
  }

  // 회원가입 모달 열기
  const openSignupModal = () => {
    isLoginMode.value = false
    isAuthModalOpen.value = true
  }

  // 로그인/회원가입 모드 전환
  const switchToLogin = () => {
    isLoginMode.value = true
  }

  const switchToSignup = () => {
    isLoginMode.value = false
  }

  // 인증 성공 처리
  const handleAuthSuccess = () => {
    console.log('✅ 인증 성공!')
    isAuthModalOpen.value = false
  }

  // 로그아웃
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout()
    }
  }
</script>

<style scoped>
  .home-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', sans-serif;
  }

  /* 🎬 헤더 */
  .home-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 로고 */
  .home-header__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .home-header__logo:hover {
    opacity: 0.8;
  }

  .home-header__logo-icon {
    width: 28px;
    height: 28px;
    color: var(--color-main);
  }

  .home-header__logo-text {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text);
  }

  /* 인증 영역 */
  .home-header__auth {
    display: flex;
    align-items: center;
  }

  /* 로그인된 사용자 */
  .home-header__user {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .home-header__user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: var(--border-radius-medium);
    transition: background-color 0.2s;
  }

  .home-header__user-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .user-icon {
    width: 20px;
    height: 20px;
    color: var(--color-main);
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
  }

  .home-header__logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .home-header__logout-btn:hover {
    background-color: var(--color-background-opacity-50);
  }

  .logout-icon {
    width: 18px;
    height: 18px;
    color: var(--color-inactive-text);
  }

  /* 게스트 사용자 */
  .home-header__guest {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 메인 콘텐츠 */
  .home-main {
    padding-top: 80px; /* 헤더 높이만큼 패딩 */
  }

  /* 🔐 인증 모달 내용 */
  .auth-modal-content {
    padding: 0; /* BaseModal이 이미 패딩을 제공 */
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .home-header {
      padding: 12px 16px;
    }

    .home-header__logo-text {
      font-size: 18px;
    }

    .user-name {
      display: none; /* 모바일에서는 아이콘만 표시 */
    }

    .home-main {
      padding-top: 70px;
    }
  }

  @media (max-width: 480px) {
    .home-header__guest {
      flex-direction: column;
      gap: 4px;
    }

    .home-header__login-btn,
    .home-header__signup-btn {
      font-size: 12px;
      padding: 6px 12px;
    }

    .auth-modal-content {
      padding: 0;
    }
  }
</style>
