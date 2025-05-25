<!-- 커뮤니티 메인 페이지 -->
<template>
  <div class="community-view">
    <!-- 🎬 헤더 (HomeView 스타일) -->
    <header class="community-header">
      <!-- 로고 (좌상단) -->
      <div
        class="community-header__logo"
        @click="goHome">
        <img
          src="@/assets/images/cinememory-logo.png"
          alt="씨네메모리"
          class="community-header__logo-icon" />
        <span class="community-header__logo-text">씨네메모리</span>
      </div>

      <!-- 페이지 제목 (중앙) -->
      <div class="community-header__page-info">
        <h1 class="community-header__title">커뮤니티</h1>
        <span class="community-header__subtitle"
          >영화에 대한 이야기를 나누어보세요</span
        >
      </div>

      <!-- 인증 & 액션 영역 (우상단) -->
      <div class="community-header__auth">
        <!-- 로그인된 상태 -->
        <div
          v-if="isAuthenticated"
          class="community-header__user">
          <BaseButton
            variant="primary"
            icon-left="plus"
            size="small"
            @click="createPost"
            class="community-header__create-btn">
            글쓰기
          </BaseButton>
          <button
            @click="goToProfile"
            class="community-header__user-btn">
            <BaseIcon
              name="user"
              class="user-icon" />
            <span class="user-name">{{ user.username }}</span>
          </button>
          <BaseButton
            @click="handleLogout"
            variant="secondary"
            size="small"
            class="community-header__logout-btn">
            로그아웃
          </BaseButton>
        </div>

        <!-- 로그인되지 않은 상태 -->
        <div
          v-else
          class="community-header__guest">
          <BaseButton
            @click="openLoginModal"
            variant="secondary"
            size="small"
            class="community-header__login-btn">
            로그인
          </BaseButton>
          <BaseButton
            @click="openSignupModal"
            variant="primary"
            size="small"
            class="community-header__signup-btn">
            회원가입
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="community-main">
      <!-- 주요 콘텐츠 -->
      <div class="community-view__content">
        <!-- 메인 콘텐츠 (사이드바 제거) -->
        <section class="community-view__main">
          <!-- 공지사항 (관리자용) -->
          <div
            v-if="announcements.length > 0"
            class="community-view__announcements">
            <CommunityAnnouncements
              :announcements="announcements"
              @dismiss="handleDismissAnnouncement" />
          </div>

          <!-- 게시글 목록 -->
          <div class="community-view__posts">
            <PostList />
          </div>
        </section>
      </div>
    </main>

    <!-- 플로팅 액션 버튼 (모바일) -->
    <BaseButton
      v-if="isAuthenticated"
      class="community-view__fab"
      variant="primary"
      icon-only
      icon-left="plus"
      size="large"
      @click="createPost" />

    <!-- 🔐 인증 모달 -->
    <BaseModal
      v-model="isAuthModalOpen"
      size="small"
      :title="isLoginMode ? '로그인' : '회원가입'"
      :closable="true"
      :close-on-backdrop="true">
      <div class="auth-modal-content">
        <AuthFormLogin
          v-if="isLoginMode"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup" />
        <AuthFormSignup
          v-else
          @success="handleAuthSuccess"
          @switch-to-login="switchToLogin" />
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import PostList from '@/components/post/PostList.vue'
  import CommunityAnnouncements from '@/components/community/CommunityAnnouncements.vue'
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const announcements = ref([
    {
      id: 1,
      title: '🎬 씨네메모리 커뮤니티 오픈!',
      content:
        '영화 애호가들을 위한 새로운 공간이 문을 열었습니다. 자유롭게 영화에 대한 이야기를 나누어보세요!',
      isImportant: true,
      createdAt: '2024-12-20T10:00:00Z'
    }
  ])

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

  // 게시글 작성 페이지로 이동
  const createPost = () => {
    router.push({ name: 'PostCreate' })
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

  // 모드 전환
  const switchToLogin = () => {
    isLoginMode.value = true
  }

  const switchToSignup = () => {
    isLoginMode.value = false
  }

  // 인증 성공 처리
  const handleAuthSuccess = () => {
    isAuthModalOpen.value = false
  }

  // 로그아웃
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout()
    }
  }

  // 공지사항 닫기
  const handleDismissAnnouncement = (announcementId) => {
    const index = announcements.value.findIndex((a) => a.id === announcementId)
    if (index !== -1) {
      announcements.value.splice(index, 1)
    }
  }

  // 라이프사이클
  onMounted(async () => {
    // 페이지 타이틀 설정
    document.title = '커뮤니티 | 씨네메모리'

    console.log('🚀 CommunityView 마운트됨')

    // 커뮤니티 홈 데이터 로드
    try {
      console.log('📡 커뮤니티 홈 데이터 로드 시작...')
      const result = await communityStore.fetchCommunityHome()

      if (result.success) {
        console.log('✅ 커뮤니티 홈 데이터 로드 완료')
      } else {
        console.error('❌ 커뮤니티 홈 데이터 로드 실패:', result.error)
      }
    } catch (error) {
      console.error('❌ 커뮤니티 초기화 중 오류 발생:', error)
    }
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .community-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    padding-bottom: 80px; /* FAB 공간 확보 */
  }

  /* 🎬 헤더 (HomeView 스타일 기반) */
  .community-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    padding: 8px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  /* 로고 */
  .community-header__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .community-header__logo:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  .community-header__logo-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    filter: brightness(0) saturate(100%);
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
    mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    mask-size: contain;
    -webkit-mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4));
  }

  .community-header__logo-text {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-text);
    font-family: 'Anton', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
  }

  /* 페이지 제목 (중앙) */
  .community-header__page-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    text-align: center;
  }

  .community-header__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
  }

  .community-header__subtitle {
    font-size: 12px;
    color: var(--color-highlight-text);
    line-height: 1;
  }

  /* 인증 영역 */
  .community-header__auth {
    display: flex;
    align-items: center;
  }

  /* 로그인된 사용자 */
  .community-header__user {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .community-header__create-btn {
    margin-right: 8px;
  }

  .community-header__user-btn {
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

  .community-header__user-btn:hover {
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

  .community-header__logout-btn {
    margin-left: 8px;
  }

  /* 게스트 사용자 */
  .community-header__guest {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 메인 콘텐츠 */
  .community-main {
    padding-top: 80px;
  }

  .community-view__content {
    max-width: 800px; /* 사이드바가 없으므로 좀 더 넓게 */
    margin: 0 auto;
    padding: 0 16px;
  }

  .community-view__main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  .community-view__announcements {
    margin-bottom: 16px;
  }

  .community-view__posts {
    flex: 1;
  }

  /* 플로팅 액션 버튼 (모바일용) */
  .community-view__fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    box-shadow: var(--shadow-modal);
    display: none;
  }

  /* 🔐 인증 모달 내용 */
  .auth-modal-content {
    padding: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .community-header {
      padding: 6px 16px;
    }

    .community-header__logo-icon {
      width: 42px;
      height: 42px;
    }

    .community-header__logo-text {
      font-size: 18px;
    }

    .community-header__page-info {
      gap: 1px;
    }

    .community-header__title {
      font-size: 16px;
    }

    .community-header__subtitle {
      font-size: 11px;
    }

    .user-name {
      display: none; /* 모바일에서는 아이콘만 표시 */
    }

    .community-main {
      padding-top: 56px;
    }

    .community-view__content {
      padding: 0 12px;
    }

    .community-view__fab {
      display: flex;
    }

    .community-view {
      padding-bottom: 100px; /* 모바일에서 FAB 공간 더 확보 */
    }
  }

  @media (max-width: 480px) {
    .community-header__logo-icon {
      width: 36px;
      height: 36px;
    }

    .community-header__logo-text {
      font-size: 16px;
    }

    .community-header__title {
      font-size: 15px;
    }

    .community-header__subtitle {
      display: none; /* 공간 절약 */
    }

    .community-header__guest {
      flex-direction: column;
      gap: 4px;
    }

    .community-header__login-btn,
    .community-header__signup-btn {
      font-size: 12px;
      padding: 6px 12px;
    }

    .community-view__content {
      padding: 0 8px;
    }

    .community-view__fab {
      bottom: 16px;
      right: 16px;
    }
  }
</style>
