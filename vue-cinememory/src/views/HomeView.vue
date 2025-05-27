<!-- 홈 페이지 (새로운 레이아웃) -->
<template>
  <div class="home-view">
    <!-- 🎬 헤더 (로고 + 인증) -->
    <header class="home-header">
      <!-- 로고 (좌상단) -->
      <div
        class="home-header__logo"
        @click="goHome">
        <img
          src="@/assets/images/cinememory-logo.png"
          alt="씨네메모리"
          class="home-header__logo-icon" />
        <span class="home-header__logo-text">씨네메모리</span>
      </div>

      <!-- 인증 영역 (우상단) -->
      <div class="home-header__auth">
        <!-- 로그인된 사용자 -->
        <div
          v-if="isAuthenticated"
          class="home-header__user">
          <!-- 사용자 버튼 (드롭다운 토글) -->
          <div class="user-dropdown">
            <button
              @click="toggleUserMenu"
              class="home-header__user-btn">
              <BaseIcon
                name="user"
                class="user-icon" />
              <span class="user-name">{{ user.username }}</span>
              <BaseIcon
                name="chevron-down"
                class="dropdown-icon"
                :class="{ 'dropdown-icon--open': isUserMenuOpen }" />
            </button>

            <!-- 사용자 드롭다운 메뉴 -->
            <Transition name="user-dropdown">
              <div
                v-if="isUserMenuOpen"
                class="user-dropdown__menu"
                @click.stop>
                <!-- 사용자 정보 -->
                <div class="user-dropdown__info">
                  <BaseIcon
                    name="user"
                    class="user-avatar" />
                  <div class="user-details">
                    <span class="user-name-large">{{ user.username }}</span>
                    <span class="user-greeting">안녕하세요!</span>
                  </div>
                </div>

                <!-- 구분선 -->
                <div class="user-dropdown__divider"></div>

                <!-- 메뉴 아이템들 -->
                <button
                  @click="goToProfile"
                  class="user-dropdown__item">
                  <BaseIcon
                    name="user"
                    class="item-icon" />
                  <span>마이페이지</span>
                </button>

                <button
                  @click="goToTimeline"
                  class="user-dropdown__item">
                  <BaseIcon
                    name="calendar"
                    class="item-icon" />
                  <span>나의 시네마틱 여정</span>
                </button>

                <button
                  @click="goToCommunity"
                  class="user-dropdown__item">
                  <BaseIcon
                    name="message-circle"
                    class="item-icon" />
                  <span>커뮤니티</span>
                </button>

                <!-- 구분선 -->
                <div class="user-dropdown__divider"></div>

                <button
                  @click="handleLogout"
                  class="user-dropdown__item user-dropdown__item--danger">
                  <BaseIcon
                    name="log-out"
                    class="item-icon" />
                  <span>로그아웃</span>
                </button>
              </div>
            </Transition>

            <!-- 백드롭 (메뉴 외부 클릭 시 닫기) -->
            <div
              v-if="isUserMenuOpen"
              class="user-dropdown__backdrop"
              @click="closeUserMenu"></div>
          </div>
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
  const isUserMenuOpen = ref(false)

  // 홈으로 이동
  const goHome = () => {
    router.push({ name: 'Home' })
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

  // 사용자 메뉴 토글
  const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value
  }

  // 사용자 메뉴 닫기
  const closeUserMenu = () => {
    isUserMenuOpen.value = false
  }

  // 프로필로 이동
  const goToProfile = () => {
    router.push({ name: 'MyProfile' })
    closeUserMenu()
  }

  // 타임라인으로 이동
  const goToTimeline = () => {
    router.push({ name: 'Timeline' })
    closeUserMenu()
  }

  // 커뮤니티로 이동
  const goToCommunity = () => {
    router.push({ name: 'Community' })
    closeUserMenu()
  }

  // 로그아웃
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout()
      closeUserMenu()
    }
  }
</script>

<style scoped>
  /* 🎨 로고 색상 변수 - 프로젝트 컬러셋에 맞게 조정 */
  :root {
    --logo-color: var(--color-gold-main); /* 더 밝은 골드 컬러 사용 */
    --logo-color-hover: #fff700; /* 호버 시 더욱 밝은 노란색 */
    --logo-gradient: linear-gradient(
      135deg,
      #ffd700 0%,
      #ffed4e 50%,
      #ffd700 100%
    ); /* 더 밝은 그라데이션 */
    --logo-gradient-hover: linear-gradient(
      135deg,
      #fff700 0%,
      #ffff80 50%,
      #fff700 100%
    ); /* 호버 시 더욱 밝게 */
  }

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
    padding: 8px 24px; /* 16px → 8px로 줄임 */
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 로고 */
  .home-header__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .home-header__logo:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  .home-header__logo-icon {
    width: 56px; /* 48px → 56px로 더 크게 */
    height: 56px;
    object-fit: contain;
    /* 🎨 그라데이션 효과로 더 고급스러운 로고 색상 */
    filter: brightness(0) saturate(100%);
    background: var(--logo-gradient);
    mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    mask-size: contain;
    -webkit-mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.3s ease;
    /* 미세한 그림자 효과 추가 */
    filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4));
  }

  .home-header__logo:hover .home-header__logo-icon {
    /* 호버 시 더 밝은 그라데이션과 살짝 위로 이동 */
    background: var(--logo-gradient-hover);
    transform: translateY(-2px);
    filter: drop-shadow(0 4px 10px rgba(255, 247, 0, 0.5));
  }

  .home-header__logo-text {
    font-size: 24px; /* 22px → 24px로 더 크게 */
    font-weight: 800;
    color: var(--color-text); /* 기본 흰색 */
    /* 🎬 구글 폰트 사용 - 현재: Orbitron (미래적이고 영화스러운 느낌) */
    /* 다른 폰트로 변경하려면 index.html에서 해당 폰트 링크를 주석 해제하고 아래 폰트명을 변경하세요:
       - 'Bebas Neue' (클래식한 영화 포스터)
       - 'Montserrat' (모던하고 세련된)
       - 'Oswald' (영화관 간판)
       - 'Playfair Display' (고급스럽고 우아한)
       - 'Exo 2' (테크놀로지/SF)
       - 'Anton' (볼드하고 임팩트) */
    font-family: 'Anton', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* 더 진한 그림자로 가독성 향상 */
    transition: all 0.3s ease;
  }

  .home-header__logo:hover .home-header__logo-text {
    /* 호버 시에도 흰색 유지하되 살짝 밝게 */
    color: #ffffff;
    text-shadow:
      0 2px 6px rgba(255, 255, 255, 0.3),
      0 0 10px rgba(255, 247, 0, 0.2);
    transform: translateY(-1px);
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

  /* 사용자 드롭다운 */
  .user-dropdown {
    position: relative;
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

  .dropdown-icon {
    width: 16px;
    height: 16px;
    color: var(--color-highlight-text);
    transition: transform 0.2s;
  }

  .dropdown-icon--open {
    transform: rotate(180deg);
  }

  /* 드롭다운 메뉴 */
  .user-dropdown__menu {
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

  /* 사용자 정보 */
  .user-dropdown__info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name-large {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .user-greeting {
    display: block;
    font-size: 13px;
    color: var(--color-highlight-text);
  }

  /* 구분선 */
  .user-dropdown__divider {
    height: 1px;
    background-color: var(--color-inactive-icon);
    margin: 12px 0;
  }

  /* 메뉴 아이템 */
  .user-dropdown__item {
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
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .user-dropdown__item:hover {
    background-color: var(--color-highlight-background);
  }

  .user-dropdown__item--danger {
    color: var(--color-alert);
  }

  .user-dropdown__item--danger:hover {
    background-color: rgba(255, 56, 56, 0.1);
  }

  .item-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  /* 백드롭 */
  .user-dropdown__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background-color: transparent;
  }

  /* 트랜지션 */
  .user-dropdown-enter-active,
  .user-dropdown-leave-active {
    transition: all 0.2s ease;
  }

  .user-dropdown-enter-from,
  .user-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  /* 게스트 사용자 */
  .home-header__guest {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 메인 콘텐츠 */
  .home-main {
    padding-top: 64px; /* 80px → 64px로 줄임 (헤더 높이 감소에 맞춤) */
  }

  /* 🔐 인증 모달 내용 */
  .auth-modal-content {
    padding: 0; /* BaseModal이 이미 패딩을 제공 */
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .home-header {
      padding: 6px 16px; /* 12px → 6px로 줄임 */
    }

    .home-header__logo-icon {
      width: 48px; /* 40px → 48px로 조정 */
      height: 48px;
    }

    .home-header__logo-text {
      font-size: 20px; /* 18px → 20px로 크게, 흰색 유지 */
      font-weight: 800;
      color: var(--color-text); /* 흰색 */
      font-family:
        'Orbitron', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
      letter-spacing: -0.3px;
    }

    .user-name {
      display: none; /* 모바일에서는 아이콘만 표시 */
    }

    .home-main {
      padding-top: 56px; /* 70px → 56px로 줄임 */
    }

    .user-dropdown__menu {
      width: 260px;
      right: -16px;
    }
  }

  @media (max-width: 480px) {
    .home-header__logo-icon {
      width: 42px; /* 36px → 42px로 조정 */
      height: 42px;
    }

    .home-header__logo-text {
      font-size: 18px; /* 16px → 18px로 크게, 흰색 유지 */
      font-weight: 800;
      color: var(--color-text); /* 흰색 */
      font-family:
        'Orbitron', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
      letter-spacing: -0.2px;
    }

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

    .dropdown-icon {
      display: none; /* 모바일에서는 드롭다운 아이콘 숨김 */
    }

    .user-dropdown__menu {
      width: 240px;
      right: -20px;
    }
  }
</style>
