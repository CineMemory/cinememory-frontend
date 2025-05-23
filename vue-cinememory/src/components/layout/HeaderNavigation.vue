<!-- 헤더 네비게이션 -->
<template>
  <nav class="header-navigation">
    <ul class="header-navigation__list">
      <li
        v-for="item in navigationItems"
        :key="item.name"
        class="header-navigation__item">
        <router-link
          :to="item.to"
          :class="[
            'header-navigation__link',
            {
              'header-navigation__link--active': isActiveRoute(item.to)
            }
          ]">
          <BaseIcon
            :name="item.icon"
            class="header-navigation__icon"
            size="small" />
          <span class="header-navigation__text">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const route = useRoute()

  const navigationItems = [
    {
      name: 'home',
      label: '홈',
      icon: 'home',
      to: { name: 'Home' }
    },
    {
      name: 'timeline',
      label: '타임캡슐',
      icon: 'calendar',
      to: { name: 'Timeline' }
    },
    {
      name: 'explore',
      label: '탐색',
      icon: 'search',
      to: { name: 'Explore' }
    },
    {
      name: 'community',
      label: '커뮤니티',
      icon: 'message-circle',
      to: { name: 'Community' }
    }
  ]

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
</script>

<style scoped>
  .header-navigation {
    display: flex;
    align-items: center;
  }

  .header-navigation__list {
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .header-navigation__item {
    display: flex;
  }

  .header-navigation__link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    text-decoration: none;
    color: #9c9490;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .header-navigation__link:hover {
    background-color: rgba(156, 148, 144, 0.1);
    color: #f7f5f3;
  }

  .header-navigation__link--active {
    background-color: rgba(255, 183, 0, 0.1);
    color: #ffb700;
  }

  .header-navigation__link--active:hover {
    background-color: rgba(255, 183, 0, 0.2);
    color: #ffb700;
  }

  .header-navigation__icon {
    flex-shrink: 0;
  }

  .header-navigation__text {
    flex-shrink: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .header-navigation__text {
      display: none;
    }

    .header-navigation__link {
      padding: 8px;
    }
  }
</style>
