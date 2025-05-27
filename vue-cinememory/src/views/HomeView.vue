<!-- 홈 페이지 (새로운 매력적인 레이아웃) -->
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
      <!-- 🌟 히어로 섹션 -->
      <section class="hero-section">
        <div class="hero-section__container">
          <div class="hero-section__content">
            <h1 class="hero-section__title">
              당신의 인생을
              <span class="hero-section__highlight">영화로</span>
            </h1>
            <p class="hero-section__subtitle">
              영화와 함께한 순간들을 기록하고, 새로운 작품을 발견해보세요
            </p>

            <!-- 검색 박스 -->
            <div class="hero-section__search">
              <HomeSearchSection />
            </div>

            <!-- 퀵 액션 버튼들 -->
            <div class="hero-section__actions">
              <BaseButton
                @click="goToTimeline"
                variant="primary"
                size="large"
                class="hero-action-btn">
                <BaseIcon
                  name="calendar"
                  class="btn-icon" />
                나의 여정 보기
              </BaseButton>
              <BaseButton
                @click="goToCommunity"
                variant="secondary"
                size="large"
                class="hero-action-btn">
                <BaseIcon
                  name="message-circle"
                  class="btn-icon" />
                커뮤니티 둘러보기
              </BaseButton>
            </div>
          </div>

          <!-- 히어로 이미지/일러스트 -->
          <div class="hero-section__visual">
            <div class="hero-visual">
              <div class="hero-visual__film-strip">
                <div
                  class="film-frame"
                  v-for="i in 5"
                  :key="i">
                  <div class="film-hole"></div>
                  <div class="film-hole"></div>
                </div>
              </div>
              <div class="hero-visual__spotlight"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 🔥 트렌딩 섹션 -->
      <section class="trending-section">
        <div class="trending-section__container">
          <div class="section-header">
            <h2 class="section-title">지금 뜨는 영화</h2>
            <BaseButton
              variant="ghost"
              size="small"
              class="section-more-btn">
              더보기
              <BaseIcon
                name="arrow-right"
                class="btn-icon" />
            </BaseButton>
          </div>

          <div class="trending-movies">
            <div
              v-for="(movie, index) in trendingMovies"
              :key="movie.id"
              class="trending-movie"
              :class="{ 'trending-movie--featured': index === 0 }"
              @click="openCGVLink(movie.cgvUrl)">
              <div class="trending-movie__poster">
                <img
                  :src="movie.poster"
                  :alt="movie.title"
                  class="poster-image" />
                <div class="trending-movie__rank">{{ index + 1 }}</div>
              </div>
              <div class="trending-movie__info">
                <h3 class="trending-movie__title">{{ movie.title }}</h3>
                <div class="trending-movie__meta">
                  <span class="rating">⭐ {{ movie.rating }}</span>
                  <span class="year">{{ movie.year }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 🎯 개인화 추천 섹션 -->
      <section
        v-if="isAuthenticated"
        class="recommendations-section">
        <div class="recommendations-section__container">
          <div class="section-header">
            <h2 class="section-title">{{ user.username }}님을 위한 추천</h2>
            <BaseButton
              variant="ghost"
              size="small"
              class="section-more-btn">
              더보기
              <BaseIcon
                name="arrow-right"
                class="btn-icon" />
            </BaseButton>
          </div>

          <div class="recommendation-cards">
            <div
              v-for="rec in recommendations"
              :key="rec.id"
              class="recommendation-card">
              <div class="recommendation-card__content">
                <div class="recommendation-card__icon">
                  <BaseIcon :name="rec.icon" />
                </div>
                <div class="recommendation-card__text">
                  <h3 class="recommendation-card__title">{{ rec.title }}</h3>
                  <p class="recommendation-card__description">
                    {{ rec.description }}
                  </p>
                </div>
              </div>
              <BaseButton
                @click="rec.action"
                variant="primary"
                size="small"
                class="recommendation-card__btn">
                {{ rec.buttonText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </section>
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
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import HomeSearchSection from '@/components/home/HomeSearchSection.vue'
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const router = useRouter()

  // 인증 컴포저블
  const { isAuthenticated, user, logout } = useAuth()

  // 인증 모달 상태
  const isAuthModalOpen = ref(false)
  const isLoginMode = ref(true)
  const isUserMenuOpen = ref(false)

  // 트렌딩 영화 데이터 (현재 CGV 상영작)
  const trendingMovies = ref([
    {
      id: 1,
      title: '미션 임파서블: 파이널 레코닝',
      poster:
        'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000089/89629/89629_320.jpg',
      rating: 9.7,
      year: 2025,
      cgvUrl: 'http://www.cgv.co.kr/movies/detail-view/?midx=89629'
    },
    {
      id: 2,
      title: '분리수거',
      poster:
        'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000089/89631/89631_320.jpg',
      rating: 9.6,
      year: 2025,
      cgvUrl: 'http://www.cgv.co.kr/movies/detail-view/?midx=89631'
    },
    {
      id: 3,
      title: '2025 MLB 월드투어 도쿄시리즈 SCREENX LIVE',
      poster:
        'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000089/89547/89547_320.jpg',
      rating: 9.0,
      year: 2025,
      cgvUrl: 'http://www.cgv.co.kr/movies/detail-view/?midx=89547'
    },
    {
      id: 4,
      title: '아카디안',
      poster:
        'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000089/89421/89421_320.jpg',
      rating: 9.7,
      year: 2025,
      cgvUrl: 'http://www.cgv.co.kr/movies/detail-view/?midx=89421'
    },
    {
      id: 5,
      title: '초혼, 다시 부르는 노래',
      poster:
        'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000089/89430/89430_320.jpg',
      rating: 9.1,
      year: 2025,
      cgvUrl: 'http://www.cgv.co.kr/movies/detail-view/?midx=89430'
    }
  ])

  // 개인화 추천 데이터
  const recommendations = computed(() => {
    if (!isAuthenticated.value) return []

    return [
      {
        id: 1,
        icon: 'star',
        title: '취향 분석 완료하기',
        description: '더 정확한 추천을 위해 취향 분석을 완료해보세요',
        buttonText: '분석하기',
        action: () => router.push({ name: 'Onboarding' })
      },
      {
        id: 2,
        icon: 'calendar',
        title: '첫 번째 기록 남기기',
        description: '인상 깊었던 영화를 타임라인에 기록해보세요',
        buttonText: '기록하기',
        action: () => router.push({ name: 'Timeline' })
      },
      {
        id: 3,
        icon: 'users',
        title: '커뮤니티 참여하기',
        description: '다른 사용자들과 영화 이야기를 나눠보세요',
        buttonText: '참여하기',
        action: () => router.push({ name: 'Community' })
      }
    ]
  })

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

  // 영화 클릭 시 CGV 사이트로 이동
  const openCGVLink = (url) => {
    window.open(url, '_blank')
  }
</script>

<style scoped>
  /* 🎨 로고 색상 변수 - 프로젝트 컬러셋에 맞게 조정 */
  :root {
    --logo-color: var(--color-gold-main);
    --logo-color-hover: #fff700;
    --logo-gradient: linear-gradient(
      135deg,
      #ffd700 0%,
      #ffed4e 50%,
      #ffd700 100%
    );
    --logo-gradient-hover: linear-gradient(
      135deg,
      #fff700 0%,
      #ffff80 50%,
      #fff700 100%
    );
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
    padding: 8px 24px;
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
    width: 56px;
    height: 56px;
    object-fit: contain;
    filter: brightness(0) saturate(100%);
    background: var(--logo-gradient);
    mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    mask-size: contain;
    -webkit-mask: url('@/assets/images/cinememory-logo.png') no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4));
  }

  .home-header__logo:hover .home-header__logo-icon {
    background: var(--logo-gradient-hover);
    transform: translateY(-2px);
    filter: drop-shadow(0 4px 10px rgba(255, 247, 0, 0.5));
  }

  .home-header__logo-text {
    font-size: 24px;
    font-weight: 800;
    color: var(--color-text);
    font-family: 'Anton', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
  }

  .home-header__logo:hover .home-header__logo-text {
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
    padding-top: 64px;
  }

  /* 🌟 히어로 섹션 */
  .hero-section {
    background: linear-gradient(
      135deg,
      var(--color-background) 0%,
      rgba(255, 183, 0, 0.05) 50%,
      var(--color-background) 100%
    );
    padding: 80px 0 120px;
    position: relative;
    overflow: hidden;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  .hero-section__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }

  .hero-section__content {
    z-index: 2;
    position: relative;
  }

  .hero-section__title {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 24px;
    color: var(--color-text);
    font-family: 'Anton', 'Pretendard-ExtraBold', sans-serif;
  }

  .hero-section__highlight {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-section__subtitle {
    font-size: 1.25rem;
    color: var(--color-highlight-text);
    margin-bottom: 40px;
    line-height: 1.6;
  }

  .hero-section__search {
    margin-bottom: 40px;
  }

  .hero-section__actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .hero-action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }

  /* 히어로 비주얼 */
  .hero-section__visual {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .hero-visual {
    position: relative;
    width: 300px;
    height: 400px;
  }

  .hero-visual__film-strip {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      #2a2a2a 0%,
      #1a1a1a 50%,
      #2a2a2a 100%
    );
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 20px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  .film-frame {
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
  }

  .film-hole {
    width: 8px;
    height: 8px;
    background: var(--color-background);
    border-radius: 50%;
  }

  .hero-visual__spotlight {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      rgba(255, 215, 0, 0.3) 0%,
      rgba(255, 215, 0, 0.1) 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: spotlight 3s ease-in-out infinite alternate;
  }

  @keyframes spotlight {
    0% {
      transform: translateX(-50%) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translateX(-50%) scale(1.1);
      opacity: 0.8;
    }
  }

  /* 📊 공통 섹션 스타일 */
  .trending-section,
  .recommendations-section {
    padding: 80px 0;
  }

  .trending-section__container,
  .recommendations-section__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .section-more-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 🔥 트렌딩 섹션 */
  .trending-section {
    background: linear-gradient(
      to bottom,
      var(--color-background) 0%,
      rgba(255, 183, 0, 0.02) 50%,
      var(--color-background) 100%
    );
  }

  .trending-movies {
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 24px;
  }

  .trending-movie {
    background: var(--color-card-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .trending-movie:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-modal);
  }

  .trending-movie--featured {
    grid-row: span 2;
  }

  .trending-movie__poster {
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
  }

  .trending-movie--featured .trending-movie__poster {
    aspect-ratio: 2/3;
  }

  .poster-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: linear-gradient(
      135deg,
      var(--color-highlight-background) 0%,
      var(--color-card-background) 100%
    );
  }

  .trending-movie__rank {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(255, 215, 0, 0.9);
    color: var(--color-background);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }

  .trending-movie__info {
    padding: 16px;
  }

  .trending-movie__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .trending-movie--featured .trending-movie__title {
    font-size: 18px;
  }

  .trending-movie__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--color-highlight-text);
  }

  .rating {
    color: var(--color-gold-main);
    font-weight: 600;
  }

  /* 🎯 추천 섹션 */
  .recommendations-section {
    background: linear-gradient(
      135deg,
      var(--color-background) 0%,
      rgba(255, 183, 0, 0.03) 100%
    );
  }

  .recommendation-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .recommendation-card {
    background: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-large);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.3s ease;
  }

  .recommendation-card:hover {
    border-color: var(--color-main);
    transform: translateY(-4px);
    box-shadow: var(--shadow-button);
  }

  .recommendation-card__content {
    display: flex;
    gap: 16px;
    flex: 1;
  }

  .recommendation-card__icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(
      135deg,
      var(--color-main),
      var(--color-gold-main)
    );
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .recommendation-card__text {
    flex: 1;
  }

  .recommendation-card__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .recommendation-card__description {
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 1.5;
    margin: 0;
  }

  .recommendation-card__btn {
    align-self: flex-start;
  }

  /* 🔐 인증 모달 내용 */
  .auth-modal-content {
    padding: 0;
  }

  /* 반응형 */
  @media (max-width: 1024px) {
    .hero-section__container {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }

    .hero-section__title {
      font-size: 3rem;
    }

    .trending-movies {
      grid-template-columns: repeat(3, 1fr);
    }

    .trending-movie--featured {
      grid-row: span 1;
      grid-column: span 3;
    }
  }

  @media (max-width: 768px) {
    .home-header {
      padding: 6px 16px;
    }

    .home-header__logo-icon {
      width: 48px;
      height: 48px;
    }

    .home-header__logo-text {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      font-family:
        'Orbitron', 'Pretendard-ExtraBold', 'Noto Sans KR', sans-serif;
      letter-spacing: -0.3px;
    }

    .user-name {
      display: none;
    }

    .home-main {
      padding-top: 56px;
    }

    .user-dropdown__menu {
      width: 260px;
      right: -16px;
    }

    .hero-section {
      padding: 60px 0 80px;
    }

    .hero-section__title {
      font-size: 2.5rem;
    }

    .hero-section__actions {
      justify-content: center;
    }

    .trending-movies {
      grid-template-columns: repeat(2, 1fr);
    }

    .trending-movie--featured {
      grid-column: span 2;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .trending-section,
    .recommendations-section {
      padding: 60px 0;
    }
  }

  @media (max-width: 480px) {
    .home-header__logo-icon {
      width: 42px;
      height: 42px;
    }

    .home-header__logo-text {
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text);
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

    .dropdown-icon {
      display: none;
    }

    .user-dropdown__menu {
      width: 240px;
      right: -20px;
    }

    .hero-section {
      padding: 40px 0 60px;
    }

    .hero-section__title {
      font-size: 2rem;
    }

    .hero-section__subtitle {
      font-size: 1rem;
    }

    .hero-section__actions {
      flex-direction: column;
      align-items: center;
    }

    .hero-action-btn {
      width: 100%;
      justify-content: center;
    }

    .trending-movies {
      grid-template-columns: 1fr;
    }

    .trending-movie--featured {
      grid-column: span 1;
    }

    .recommendation-cards {
      grid-template-columns: 1fr;
    }

    .trending-section,
    .recommendations-section {
      padding: 40px 0;
    }

    .trending-section__container,
    .recommendations-section__container {
      padding: 0 16px;
    }
  }
</style>
