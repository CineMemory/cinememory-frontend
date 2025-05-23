<!-- 홈 검색 섹션 -->
<template>
  <section class="home-search-section">
    <div class="home-search-section__container">
      <div
        class="home-search-section__logo"
        @click="goHome">
        <BaseIcon
          name="home"
          class="home-search-section__logo-icon" />
      </div>
      <div
        class="home-search-section__search-box"
        @click="handleSearchClick">
        <BaseIcon
          name="search"
          class="home-search-section__icon" />
        <span class="home-search-section__placeholder">
          작품, 인물을 검색해보세요.
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const router = useRouter()

  const handleSearchClick = () => {
    router.push({ name: 'Search' })
  }

  const goHome = () => {
    router.push({ name: 'Home' })
  }
</script>

<style scoped>
  .home-search-section {
    width: 100%;
    padding: 64px 0;
    display: flex;
    justify-content: center;
    background-color: var(--color-background);
  }

  .home-search-section__container {
    width: 100%;
    max-width: 700px;
    padding: 0 24px;
    display: flex;
    align-items: center;
  }

  .home-search-section__logo {
    margin-bottom: 0;
    margin-right: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .home-search-section__logo-icon {
    width: 40px;
    height: 40px;
    color: var(--color-primary, #3b82f6);
    transition: opacity 0.2s;
  }

  .home-search-section__logo-icon:hover {
    opacity: 0.7;
  }

  .home-search-section__search-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
    background-color: var(--color-search-box);
    border: 1px solid var(--border-color-default);
    border-radius: var(--border-radius-medium);
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .home-search-section__search-box:hover {
    border-color: var(--border-color-focus);
    background-color: var(--color-highlight-background);
  }

  .home-search-section__icon {
    width: 24px;
    height: 24px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .home-search-section__placeholder {
    flex: 1;
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 2.857;
    user-select: none;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .home-search-section {
      padding: 48px 0;
    }

    .home-search-section__container {
      padding: 0 16px;
    }

    .home-search-section__placeholder {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .home-search-section__placeholder {
      font-size: 12px;
    }
  }
</style>
