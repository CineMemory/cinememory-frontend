<!-- 🍔 헤더 햄버거 메뉴 -->
<template>
  <div class="header-menu">
    <!-- 햄버거 버튼 -->
    <button
      @click="toggleMenu"
      class="header-menu__trigger">
      <BaseIcon
        name="menu"
        class="header-menu__icon" />
    </button>

    <!-- 메뉴 드롭다운 -->
    <Transition name="menu-dropdown">
      <div
        v-if="isMenuOpen"
        class="header-menu__dropdown"
        @click.stop>
        <!-- 로그인된 상태 -->
        <div
          v-if="isAuthenticated"
          class="header-menu__user-section">
          <!-- 사용자 정보 -->
          <div class="header-menu__user-info">
            <BaseIcon
              name="user"
              class="user-avatar" />
            <div class="user-details">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-greeting">안녕하세요!</span>
            </div>
          </div>

          <!-- 구분선 -->
          <div class="header-menu__divider"></div>

          <!-- 메뉴 아이템들 -->
          <button
            @click="goToHome"
            class="header-menu__item">
            <BaseIcon
              name="home"
              class="item-icon" />
            <span>홈</span>
          </button>

          <button
            @click="goToProfile"
            class="header-menu__item">
            <BaseIcon
              name="user"
              class="item-icon" />
            <span>마이페이지</span>
          </button>

          <button
            @click="goToTimeline"
            class="header-menu__item">
            <BaseIcon
              name="calendar"
              class="item-icon" />
            <span>나의 시네마틱 여정</span>
          </button>

          <button
            @click="goToCommunity"
            class="header-menu__item">
            <BaseIcon
              name="message-circle"
              class="item-icon" />
            <span>커뮤니티</span>
          </button>

          <!-- 구분선 -->
          <div class="header-menu__divider"></div>

          <button
            @click="handleLogout"
            class="header-menu__item header-menu__item--danger">
            <BaseIcon
              name="log-out"
              class="item-icon" />
            <span>로그아웃</span>
          </button>
        </div>

        <!-- 로그인되지 않은 상태 -->
        <div
          v-else
          class="header-menu__guest-section">
          <div class="header-menu__guest-info">
            <BaseIcon
              name="user"
              class="guest-avatar" />
            <div class="guest-details">
              <span class="guest-title">로그인이 필요합니다</span>
              <span class="guest-subtitle"
                >씨네메모리와 함께 영화 여행을 시작하세요</span
              >
            </div>
          </div>

          <!-- 구분선 -->
          <div class="header-menu__divider"></div>

          <!-- 인증 버튼들 -->
          <BaseButton
            @click="openLoginModal"
            variant="primary"
            size="medium"
            class="header-menu__auth-btn">
            로그인
          </BaseButton>

          <BaseButton
            @click="openSignupModal"
            variant="secondary"
            size="medium"
            class="header-menu__auth-btn">
            회원가입
          </BaseButton>

          <!-- 구분선 -->
          <div class="header-menu__divider"></div>

          <!-- 게스트용 메뉴 -->
          <button
            @click="goToHome"
            class="header-menu__item">
            <BaseIcon
              name="home"
              class="item-icon" />
            <span>홈으로 돌아가기</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 백드롭 (메뉴 외부 클릭 시 닫기) -->
    <div
      v-if="isMenuOpen"
      class="header-menu__backdrop"
      @click="closeMenu"></div>

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
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  // 메뉴 상태
  const isMenuOpen = ref(false)

  // 인증 모달 상태
  const isAuthModalOpen = ref(false)
  const isLoginMode = ref(true)

  // 메뉴 토글
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  // 메뉴 닫기
  const closeMenu = () => {
    isMenuOpen.value = false
  }

  // 네비게이션 함수들
  const goToHome = () => {
    router.push({ name: 'Home' })
    closeMenu()
  }

  const goToProfile = () => {
    router.push({ name: 'MyProfile' })
    closeMenu()
  }

  const goToTimeline = () => {
    router.push({ name: 'Timeline' })
    closeMenu()
  }

  const goToCommunity = () => {
    router.push({ name: 'Community' })
    closeMenu()
  }

  // 로그인 모달 열기
  const openLoginModal = () => {
    isLoginMode.value = true
    isAuthModalOpen.value = true
    closeMenu()
  }

  // 회원가입 모달 열기
  const openSignupModal = () => {
    isLoginMode.value = false
    isAuthModalOpen.value = true
    closeMenu()
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
    closeMenu()
  }

  // 로그아웃
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout()
      closeMenu()
    }
  }
</script>

<style scoped>
  .header-menu {
    position: relative;
  }

  /* 햄버거 버튼 */
  .header-menu__trigger {
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

  .header-menu__trigger:hover {
    background-color: var(--color-highlight-background);
  }

  .header-menu__icon {
    width: 24px;
    height: 24px;
    color: var(--color-text);
  }

  /* 드롭다운 메뉴 */
  .header-menu__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    width: 280px;
    background-color: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-modal);
    padding: 16px;
    z-index: 1000;
  }

  /* 사용자 섹션 */
  .header-menu__user-info,
  .header-menu__guest-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .user-avatar,
  .guest-avatar {
    width: 40px;
    height: 40px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .user-details,
  .guest-details {
    flex: 1;
    min-width: 0;
  }

  .user-name,
  .guest-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .user-greeting,
  .guest-subtitle {
    display: block;
    font-size: 13px;
    color: var(--color-highlight-text);
  }

  /* 구분선 */
  .header-menu__divider {
    height: 1px;
    background-color: var(--color-inactive-icon);
    margin: 12px 0;
  }

  /* 메뉴 아이템 */
  .header-menu__item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    border-radius: var(--border-radius-medium);
    transition: background-color 0.2s;
    font-size: 14px;
    text-align: left;
  }

  .header-menu__item:hover {
    background-color: var(--color-highlight-background);
  }

  .header-menu__item--danger {
    color: var(--color-alert);
  }

  .header-menu__item--danger:hover {
    background-color: rgba(255, 56, 56, 0.1);
  }

  .item-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  /* 인증 버튼들 */
  .header-menu__auth-btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .header-menu__auth-btn:last-of-type {
    margin-bottom: 0;
  }

  /* 백드롭 */
  .header-menu__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background-color: transparent;
  }

  /* 인증 모달 */
  .auth-modal-content {
    padding: 0;
  }

  /* 트랜지션 */
  .menu-dropdown-enter-active,
  .menu-dropdown-leave-active {
    transition: all 0.2s ease;
  }

  .menu-dropdown-enter-from,
  .menu-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .header-menu__dropdown {
      width: 260px;
      right: -16px;
    }

    .guest-subtitle {
      font-size: 12px;
    }
  }
</style>
