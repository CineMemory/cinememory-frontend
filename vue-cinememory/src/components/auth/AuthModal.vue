<!-- 🔐 인증 모달 (로그인/회원가입) -->
<template>
  <BaseModal
    :is-open="isOpen"
    @close="handleClose"
    :close-on-backdrop="true"
    class="auth-modal">
    <div class="auth-modal__container">
      <!-- 모달 헤더 -->
      <div class="auth-modal__header">
        <h2 class="auth-modal__title">
          {{ isLoginMode ? '로그인' : '회원가입' }}
        </h2>
        <button
          @click="handleClose"
          class="auth-modal__close-btn">
          <BaseIcon
            name="x"
            class="close-icon" />
        </button>
      </div>

      <!-- 모달 내용 -->
      <div class="auth-modal__content">
        <!-- 로그인 폼 -->
        <AuthFormLogin
          v-if="isLoginMode"
          @success="handleSuccess"
          @switch-to-signup="switchToSignup" />

        <!-- 회원가입 폼 -->
        <AuthFormSignup
          v-else
          @success="handleSuccess"
          @switch-to-login="switchToLogin" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import AuthFormLogin from './AuthFormLogin.vue'
  import AuthFormSignup from './AuthFormSignup.vue'

  // Props
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    defaultMode: {
      type: String,
      default: 'login', // 'login' | 'signup'
      validator: (value) => ['login', 'signup'].includes(value)
    }
  })

  // Emits
  const emit = defineEmits(['close', 'success'])

  // 상태
  const isLoginMode = ref(props.defaultMode === 'login')

  // 모달이 열릴 때마다 기본 모드로 초기화
  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        isLoginMode.value = props.defaultMode === 'login'
      }
    }
  )

  // 로그인/회원가입 모드 전환
  const switchToLogin = () => {
    isLoginMode.value = true
  }

  const switchToSignup = () => {
    isLoginMode.value = false
  }

  // 모달 닫기
  const handleClose = () => {
    emit('close')
  }

  // 인증 성공
  const handleSuccess = () => {
    emit('success')
    handleClose()
  }
</script>

<style scoped>
  .auth-modal__container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding-bottom: 32px;
  }

  .auth-modal__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .auth-modal__title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .auth-modal__close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .auth-modal__close-btn:hover {
    background-color: var(--color-background-opacity-50);
  }

  .close-icon {
    width: 20px;
    height: 20px;
    color: var(--color-inactive-text);
  }

  .auth-modal__content {
    width: 100%;
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .auth-modal__container {
      max-width: 100%;
      margin: 0;
    }

    .auth-modal__title {
      font-size: 20px;
    }
  }
</style>
