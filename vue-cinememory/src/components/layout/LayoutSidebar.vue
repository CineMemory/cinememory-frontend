<!-- 사이드바 레이아웃 -->
<template>
  <aside
    :class="[
      'layout-sidebar',
      {
        'layout-sidebar--open': isOpen,
        'layout-sidebar--overlay': showOverlay
      }
    ]">
    <!-- 오버레이 (모바일용) -->
    <div
      v-if="showOverlay && isOpen"
      class="layout-sidebar__overlay"
      @click="closeSidebar" />

    <!-- 사이드바 콘텐츠 -->
    <div class="layout-sidebar__content">
      <!-- 헤더 -->
      <div class="layout-sidebar__header">
        <div class="layout-sidebar__logo">
          <img
            src="/logo.svg"
            alt="씨네메모리"
            class="layout-sidebar__logo-image" />
          <span class="layout-sidebar__logo-text">씨네메모리</span>
        </div>
        <button
          v-if="showOverlay"
          class="layout-sidebar__close"
          @click="closeSidebar">
          <BaseIcon name="x" />
        </button>
      </div>

      <!-- 메인 네비게이션 -->
      <nav class="layout-sidebar__nav">
        <h3 class="layout-sidebar__nav-title">메뉴</h3>
        <ul class="layout-sidebar__nav-list">
          <li
            v-for="item in mainNavItems"
            :key="item.name"
            class="layout-sidebar__nav-item">
            <router-link
              :to="item.to"
              :class="[
                'layout-sidebar__nav-link',
                {
                  'layout-sidebar__nav-link--active': isActiveRoute(item.to)
                }
              ]"
              @click="handleNavClick">
              <BaseIcon
                :name="item.icon"
                class="layout-sidebar__nav-icon" />
              <span class="layout-sidebar__nav-text">{{ item.label }}</span>
              <BaseBadge
                v-if="item.badge"
                :variant="item.badgeVariant || 'primary'"
                size="small"
                class="layout-sidebar__nav-badge">
                {{ item.badge }}
              </BaseBadge>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 장르별 탐색 -->
      <nav class="layout-sidebar__nav">
        <h3 class="layout-sidebar__nav-title">장르</h3>
        <ul class="layout-sidebar__nav-list">
          <li
            v-for="genre in genres"
            :key="genre.id"
            class="layout-sidebar__nav-item">
            <router-link
              :to="{ name: 'ExploreByGenre', params: { genre: genre.id } }"
              class="layout-sidebar__nav-link layout-sidebar__nav-link--small"
              @click="handleNavClick">
              <span class="layout-sidebar__nav-text">{{ genre.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 연도별 탐색 -->
      <nav class="layout-sidebar__nav">
        <h3 class="layout-sidebar__nav-title">연도</h3>
        <ul class="layout-sidebar__nav-list">
          <li
            v-for="year in popularYears"
            :key="year"
            class="layout-sidebar__nav-item">
            <router-link
              :to="{ name: 'ExploreByYear', params: { year } }"
              class="layout-sidebar__nav-link layout-sidebar__nav-link--small"
              @click="handleNavClick">
              <span class="layout-sidebar__nav-text">{{ year }}년</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 하단 정보 -->
      <div class="layout-sidebar__footer">
        <p class="layout-sidebar__copyright">© 2025 씨네메모리</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseBadge from '@/components/base/BaseBadge.vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    showOverlay: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['close'])

  const route = useRoute()

  const mainNavItems = [
    {
      name: 'home',
      label: '홈',
      icon: 'home',
      to: { name: 'Home' }
    },
    {
      name: 'timeline',
      label: '내 타임캡슐',
      icon: 'calendar',
      to: { name: 'Timeline' }
    },
    {
      name: 'explore',
      label: '영화 탐색',
      icon: 'search',
      to: { name: 'Explore' }
    },
    {
      name: 'community',
      label: '커뮤니티',
      icon: 'message-circle',
      to: { name: 'Community' },
      badge: '12',
      badgeVariant: 'success'
    },
    {
      name: 'profile',
      label: '내 프로필',
      icon: 'user',
      to: { name: 'MyProfile' }
    },
    {
      name: 'settings',
      label: '설정',
      icon: 'settings',
      to: { name: 'Settings' }
    }
  ]

  const genres = [
    { id: 28, name: '액션' },
    { id: 35, name: '코미디' },
    { id: 18, name: '드라마' },
    { id: 27, name: '공포' },
    { id: 10749, name: '로맨스' },
    { id: 878, name: 'SF' },
    { id: 53, name: '스릴러' },
    { id: 16, name: '애니메이션' }
  ]

  const popularYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]

  const isActiveRoute = (to) => {
    if (typeof to === 'string') {
      return route.path === to
    }
    if (to.name) {
      return (
        route.name === to.name || route.matched.some((m) => m.name === to.name)
      )
    }
    return false
  }

  const closeSidebar = () => {
    emit('close')
  }

  const handleNavClick = () => {
    if (props.showOverlay) {
      closeSidebar()
    }
  }
</script>

<style scoped>
  .layout-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background-color: #242018;
    border-right: 1px solid #6b645f;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 200;
    overflow-y: auto;
    font-family: 'Pretendard', sans-serif;
  }

  .layout-sidebar--open {
    transform: translateX(0);
  }

  .layout-sidebar__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .layout-sidebar__content {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .layout-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .layout-sidebar__logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .layout-sidebar__logo-image {
    width: 32px;
    height: 32px;
  }

  .layout-sidebar__logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #ffb700;
  }

  .layout-sidebar__close {
    background: none;
    border: none;
    color: #9c9490;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .layout-sidebar__close:hover {
    background-color: #2a2520;
    color: #f7f5f3;
  }

  .layout-sidebar__nav {
    margin-bottom: 32px;
  }

  .layout-sidebar__nav-title {
    font-size: 12px;
    font-weight: 600;
    color: #9c9490;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 16px 0;
  }

  .layout-sidebar__nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .layout-sidebar__nav-item {
    display: flex;
  }

  .layout-sidebar__nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    text-decoration: none;
    color: #9c9490;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .layout-sidebar__nav-link--small {
    padding: 8px 16px;
    font-size: 13px;
  }

  .layout-sidebar__nav-link:hover {
    background-color: #2a2520;
    color: #f7f5f3;
  }

  .layout-sidebar__nav-link--active {
    background-color: rgba(255, 183, 0, 0.1);
    color: #ffb700;
  }

  .layout-sidebar__nav-link--active:hover {
    background-color: rgba(255, 183, 0, 0.2);
    color: #ffb700;
  }

  .layout-sidebar__nav-icon {
    flex-shrink: 0;
  }

  .layout-sidebar__nav-text {
    flex: 1;
    min-width: 0;
  }

  .layout-sidebar__nav-badge {
    flex-shrink: 0;
    margin-left: auto;
  }

  .layout-sidebar__footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid #6b645f;
  }

  .layout-sidebar__copyright {
    font-size: 12px;
    color: #9c9490;
    text-align: center;
    margin: 0;
  }

  /* 데스크톱에서는 기본으로 표시 */
  @media (min-width: 1024px) {
    .layout-sidebar:not(.layout-sidebar--overlay) {
      position: relative;
      transform: translateX(0);
    }
  }
</style>
