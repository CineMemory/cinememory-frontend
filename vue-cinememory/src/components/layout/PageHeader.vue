<!-- 📄 페이지 헤더 (뒤로가기 + 제목 + 햄버거 메뉴) -->
<template>
  <header class="page-header">
    <div class="page-header__container">
      <!-- 뒤로가기 버튼 -->
      <button
        @click="goBack"
        class="page-header__back-btn">
        <BaseIcon
          name="arrow-left"
          class="back-icon" />
      </button>

      <!-- 페이지 제목 -->
      <h1
        v-if="title"
        class="page-header__title">
        {{ title }}
      </h1>

      <!-- 햄버거 메뉴 -->
      <HeaderMenu class="page-header__menu" />
    </div>
  </header>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import HeaderMenu from './HeaderMenu.vue'

  const router = useRouter()

  // Props
  defineProps({
    title: {
      type: String,
      default: null
    },
    showBackButton: {
      type: Boolean,
      default: true
    }
  })

  // 뒤로가기
  const goBack = () => {
    // 히스토리가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push({ name: 'Home' })
    }
  }
</script>

<style scoped>
  .page-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .page-header__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* 뒤로가기 버튼 */
  .page-header__back-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .page-header__back-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .back-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }

  /* 페이지 제목 */
  .page-header__title {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    text-align: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 햄버거 메뉴 */
  .page-header__menu {
    flex-shrink: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .page-header__container {
      padding: 12px 16px;
    }

    .page-header__title {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .page-header__container {
      gap: 12px;
    }

    .page-header__title {
      font-size: 15px;
    }
  }
</style>
