<!-- 메인 앱 -->
<template>
  <div id="app">
    <RouterView />
    <!-- 글로벌 인증 모달 -->
    <AuthModal
      :is-open="!!authStore.showLoginModal"
      :default-mode="authStore.loginModalMode"
      @close="authStore.closeLoginModal"
      @success="handleAuthSuccess" />
  </div>
</template>

<script setup>
  // 메인 홈페이지만 구현하므로 간단하게 구성
  import { RouterView } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import AuthModal from './components/auth/AuthModal.vue'

  const authStore = useAuthStore()

  const handleAuthSuccess = () => {
    console.log('로그인 성공 - 현재 페이지 유지')
  }
</script>

<style>
  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: 'Pretendard-Regular', sans-serif;
    background-color: var(--color-background);
    color: var(--color-text);
  }

  #app {
    width: 100%;
    min-height: 100vh;
  }
</style>
