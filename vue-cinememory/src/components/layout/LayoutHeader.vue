<!-- 상단 레이아웃 -->
<template>
  <header class="layout-header">
    <div class="layout-header__container">
      <!-- 로고 영역 -->
      <div class="layout-header__logo">
        <router-link to="/" class="layout-header__logo-link">
          <img
            src="/logo.svg"
            alt="씨네메모리"
            class="layout-header__logo-image"
          />
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
  transition: opacity 0.2s ease;
}

.layout-header__logo-link:hover {
  opacity: 0.8;
}

.layout-header__logo-image {
  width: 32px;
  height: 32px;
}

.layout-header__logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #ffb700;
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
}

@media (max-width: 640px) {
  .layout-header__search {
    display: none;
  }
}
</style>