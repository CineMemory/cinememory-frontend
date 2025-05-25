<!-- 상단 레이아웃 -->
<template>
  <header class="layout-header">
    <div class="layout-header__container">
      <!-- 로고 영역 -->
      <div class="layout-header__logo">
        <router-link
          to="/"
          class="layout-header__logo-link">
          <img
            src="/src/assets/images/cinememory-logo.png"
            alt="씨네메모리"
            class="layout-header__logo-image" />
          <span class="layout-header__logo-text">씨네메모리</span>
        </router-link>
      </div>

      <!-- 검색 영역 -->
      <div class="layout-header__search">
        <HeaderSearch />
      </div>

      <!-- 네비게이션 및 사용자 메뉴 -->
      <div class="layout-header__actions">
        <HeaderNavigation />
        <HeaderUserMenu />
      </div>
    </div>
  </header>
</template>

<script setup>
  import HeaderSearch from './HeaderSearch.vue'
  import HeaderNavigation from './HeaderNavigation.vue'
  import HeaderUserMenu from './HeaderUserMenu.vue'
</script>

<style scoped>
  .layout-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: #0c0b0a;
    border-bottom: 1px solid #6b645f;
    font-family: 'Pretendard', sans-serif;
  }

  .layout-header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
  }

  .layout-header__logo {
    flex-shrink: 0;
  }

  .layout-header__logo-link {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: #f7f5f3;
    transition: all 0.3s ease;
  }

  .layout-header__logo-link:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  .layout-header__logo-image {
    width: 36px;
    height: 36px;
    object-fit: contain;
    /* 오렌지 → 골드(#ffb700) 변환 */
    filter: brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(1000%) hue-rotate(25deg) brightness(100%) contrast(100%);
    transition: all 0.3s ease;
  }

  .layout-header__logo-link:hover .layout-header__logo-image {
    /* 호버 시 더 밝은 골드 */
    filter: brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(1200%) hue-rotate(25deg) brightness(110%) contrast(110%);
    transform: translateY(-1px);
  }

  .layout-header__logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #ffb700;
    white-space: nowrap;
    transition: color 0.3s ease;
  }

  .layout-header__logo-link:hover .layout-header__logo-text {
    color: #ffd700; /* 호버 시 더 밝은 골드 */
  }

  .layout-header__search {
    flex: 1;
    max-width: 600px;
    margin: 0 32px;
  }

  .layout-header__actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .layout-header__container {
      padding: 0 16px;
    }

    .layout-header__search {
      margin: 0 16px;
    }

    .layout-header__logo-text {
      display: none;
    }

    .layout-header__logo-image {
      width: 32px;
      height: 32px;
    }
  }

  @media (max-width: 640px) {
    .layout-header__search {
      display: none;
    }

    .layout-header__logo-image {
      width: 30px;
      height: 30px;
    }
  }

  /* 추가 애니메이션 효과 */
  @keyframes logoFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  .layout-header__logo-link:active .layout-header__logo-image {
    animation: logoFloat 0.6s ease-in-out;
  }
</style>