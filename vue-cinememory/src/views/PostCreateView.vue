<!-- 게시글 작성 페이지 -->
<template>
  <div class="post-create-view">
    <!-- 🎬 헤더 (HomeView/CommunityView 스타일 통일) -->
    <header class="post-create-header">
      <!-- 로고 (좌상단) -->
      <div
        class="post-create-header__logo"
        @click="goHome">
        <img
          src="@/assets/images/cinememory-logo.png"
          alt="씨네메모리"
          class="post-create-header__logo-icon" />
        <span class="post-create-header__logo-text">씨네메모리</span>
      </div>

      <!-- 페이지 제목 (중앙) -->
      <div class="post-create-header__page-info">
        <h1 class="post-create-header__title">게시글 작성</h1>
        <span class="post-create-header__subtitle"
          >영화에 대한 이야기를 나누어보세요</span
        >
      </div>

      <!-- 인증 & 액션 영역 (우상단) -->
      <div class="post-create-header__auth">
        <!-- 로그인된 상태 -->
        <div
          v-if="isAuthenticated"
          class="post-create-header__user">
          <BaseButton
            variant="secondary"
            icon-left="arrow-left"
            size="small"
            @click="goBack"
            class="post-create-header__back-btn">
            뒤로가기
          </BaseButton>
          <button
            @click="goToProfile"
            class="post-create-header__user-btn">
            <BaseIcon
              name="user"
              class="user-icon" />
            <span class="user-name">{{ user.username }}</span>
          </button>
          <BaseButton
            @click="handleLogout"
            variant="secondary"
            size="small"
            class="post-create-header__logout-btn">
            로그아웃
          </BaseButton>
        </div>

        <!-- 로그인되지 않은 상태 (이 페이지에서는 없을 것) -->
        <div
          v-else
          class="post-create-header__guest">
          <BaseButton
            @click="openLoginModal"
            variant="primary"
            size="small">
            로그인 필요
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="post-create-view__content">
      <PostCreator
        @post-created="handlePostCreated"
        @cancel="handleCancel" />
    </main>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import PostCreator from '@/components/post/PostCreator.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  onMounted(() => {
    // 인증 확인
    if (!isAuthenticated.value) {
      alert('로그인이 필요합니다.')
      router.push({
        name: 'Community',
        query: { needLogin: true }
      })
      return
    }

    // 페이지 타이틀 설정
    document.title = '게시글 작성 | 씨네메모리'
  })

  // 네비게이션 함수들
  const goHome = () => {
    router.push({ name: 'Home' })
  }

  const goBack = () => {
    router.back()
  }

  const goToProfile = () => {
    router.push({ name: 'MyProfile' })
  }

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout()
      router.push({ name: 'Home' })
    }
  }

  const openLoginModal = () => {
    // 로그인 모달 열기 (실제로는 이 상황이 발생하지 않을 것)
    router.push({ name: 'Community' })
  }

  // 게시글 작성 완료 처리
  const handlePostCreated = (post) => {
    console.log('✅ 새 게시글 작성 완료:', post)
    // PostCreator에서 자동으로 페이지 이동하므로 별도 처리 불필요
  }

  // 취소 처리
  const handleCancel = () => {
    console.log('❌ 게시글 작성 취소')
    // PostCreator에서 자동으로 커뮤니티 페이지로 이동하므로 별도 처리 불필요
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-create-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  /* 🎬 헤더 (HomeView/CommunityView와 동일한 스타일) */
  .post-create-header {
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
  }

  /* 로고 */
  .post-create-header__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .post-create-header__logo:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  .post-create-header__logo-icon {
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

  .post-create-header__logo-text {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-text);
    font-family: 'Anton', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
  }

  /* 페이지 제목 (중앙) */
  .post-create-header__page-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    text-align: center;
  }

  .post-create-header__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
  }

  .post-create-header__subtitle {
    font-size: 12px;
    color: var(--color-highlight-text);
    line-height: 1;
  }

  /* 인증 영역 */
  .post-create-header__auth {
    display: flex;
    align-items: center;
  }

  /* 로그인된 사용자 */
  .post-create-header__user {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .post-create-header__back-btn {
    margin-right: 8px;
  }

  .post-create-header__user-btn {
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

  .post-create-header__user-btn:hover {
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

  .post-create-header__logout-btn {
    margin-left: 8px;
  }

  /* 게스트 사용자 */
  .post-create-header__guest {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 메인 콘텐츠 */
  .post-create-view__content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 64px; /* 헤더 높이만큼 */
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .post-create-header {
      padding: 6px 16px;
    }

    .post-create-header__logo-icon {
      width: 42px;
      height: 42px;
    }

    .post-create-header__logo-text {
      font-size: 18px;
    }

    .post-create-header__page-info {
      gap: 1px;
    }

    .post-create-header__title {
      font-size: 16px;
    }

    .post-create-header__subtitle {
      font-size: 11px;
    }

    .user-name {
      display: none; /* 모바일에서는 아이콘만 표시 */
    }

    .post-create-view__content {
      padding-top: 56px;
    }
  }

  @media (max-width: 480px) {
    .post-create-header__logo-icon {
      width: 36px;
      height: 36px;
    }

    .post-create-header__logo-text {
      font-size: 16px;
    }

    .post-create-header__title {
      font-size: 15px;
    }

    .post-create-header__subtitle {
      display: none; /* 공간 절약 */
    }

    .post-create-header__user {
      gap: 4px;
    }
  }
</style>
