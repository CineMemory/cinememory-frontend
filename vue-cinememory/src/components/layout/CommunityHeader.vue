<!-- 커뮤니티 페이지 헤더 -->
<template>
  <header class="community-header">
    <div class="community-header__container">
      <!-- 왼쪽: 제목과 설명 -->
      <div class="community-header__content">
        <div class="community-header__title-section">
          <!-- 뒤로가기 버튼 (선택적) -->
          <BaseButton
            v-if="showBackButton"
            variant="ghost"
            icon-only
            icon-left="arrow-left"
            @click="goBack"
            class="community-header__back-button" />

          <!-- 제목 -->
          <h1 class="community-header__title">{{ title }}</h1>
        </div>

        <!-- 부제목 -->
        <p
          v-if="subtitle"
          class="community-header__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <!-- 오른쪽: 액션 버튼들 -->
      <div
        v-if="$slots.actions"
        class="community-header__actions">
        <slot name="actions" />
      </div>

      <!-- 햄버거 메뉴 (모바일) -->
      <BaseButton
        v-if="showMenuButton"
        variant="ghost"
        icon-only
        icon-left="menu"
        class="community-header__menu-button"
        @click="toggleMenu" />
    </div>

    <!-- 추가 콘텐츠 (탭, 검색바 등) -->
    <div
      v-if="$slots.extra"
      class="community-header__extra">
      <slot name="extra" />
    </div>
  </header>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: null
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    showMenuButton: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['menu-toggle'])

  const router = useRouter()

  const goBack = () => {
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push('/')
    }
  }

  const toggleMenu = () => {
    emit('menu-toggle')
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .community-header {
    background-color: var(--color-card-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    position: sticky;
    top: 0;
    z-index: 50;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .community-header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
    min-height: 64px;
  }

  .community-header__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .community-header__title-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .community-header__back-button {
    flex-shrink: 0;
  }

  .community-header__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .community-header__subtitle {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .community-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .community-header__menu-button {
    display: none;
    flex-shrink: 0;
  }

  .community-header__extra {
    border-top: 1px solid var(--color-inactive-icon);
    padding: 12px 16px 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* 태블릿 */
  @media (max-width: 1024px) {
    .community-header__container {
      padding: 12px 16px;
    }

    .community-header__title {
      font-size: 22px;
    }
  }

  /* 모바일 */
  @media (max-width: 768px) {
    .community-header__container {
      padding: 12px;
    }

    .community-header__title {
      font-size: 20px;
    }

    .community-header__subtitle {
      font-size: 13px;
    }

    .community-header__actions {
      gap: 4px;
    }

    .community-header__menu-button {
      display: flex;
    }

    .community-header__extra {
      padding: 12px;
    }
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    .community-header__container {
      gap: 8px;
      min-height: 56px;
    }

    .community-header__title {
      font-size: 18px;
    }

    .community-header__subtitle {
      display: none; /* 공간 절약 */
    }

    .community-header__actions {
      gap: 4px;
    }
  }
</style>
