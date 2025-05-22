<!-- 임시 더미 페이지 -->
<template>
  <div class="dummy-view">
    <div class="dummy-view__content">
      <h1 class="dummy-view__title">{{ pageTitle }}</h1>
      <p class="dummy-view__description">이 페이지는 아직 구현되지 않았습니다.</p>
      <router-link to="/" class="dummy-view__back">
        홈으로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    Community: '커뮤니티',
    Timeline: '타임캡슐',
    MyProfile: '마이페이지',
    Search: '검색'
  }
  return titles[route.name] || '페이지'
})
</script>

<style scoped>
.dummy-view {
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dummy-view__content {
  text-align: center;
  max-width: 400px;
}

.dummy-view__title {
  font-family: 'Pretendard-Regular', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px 0;
}

.dummy-view__description {
  font-family: 'Pretendard-Regular', sans-serif;
  font-size: 16px;
  color: var(--color-highlight-text);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.dummy-view__back {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--color-main);
  color: var(--color-background);
  text-decoration: none;
  border-radius: var(--border-radius-medium);
  font-family: 'Pretendard-Regular', sans-serif;
  font-weight: 600;
  transition: all 0.2s ease;
}

.dummy-view__back:hover {
  background-color: var(--color-gold-dark);
  transform: translateY(-2px);
}
</style>