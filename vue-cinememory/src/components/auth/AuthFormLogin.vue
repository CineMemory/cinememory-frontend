<!-- 🔑 로그인 폼 -->
<template>
  <form
    @submit.prevent="handleSubmit"
    class="auth-form">
    <!-- 에러 메시지 -->
    <div
      v-if="error"
      class="auth-form__error">
      <BaseIcon
        name="alert-circle"
        class="error-icon" />
      {{ error }}
    </div>

    <!-- 사용자명 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 사용자명 </label>
      <BaseInput
        v-model="formData.username"
        type="text"
        placeholder="사용자명을 입력하세요"
        :disabled="isLoading"
        required
        class="auth-form__input" />
    </div>

    <!-- 비밀번호 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 비밀번호 </label>
      <BaseInput
        v-model="formData.password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        :disabled="isLoading"
        required
        class="auth-form__input" />
    </div>

    <!-- 제출 버튼 -->
    <BaseButton
      type="submit"
      :disabled="isLoading || !isFormValid"
      :loading="isLoading"
      variant="primary"
      size="large"
      class="auth-form__submit">
      {{ isLoading ? '로그인 중...' : '로그인' }}
    </BaseButton>

    <!-- 회원가입 링크 -->
    <div class="auth-form__switch">
      <span class="auth-form__switch-text"> 아직 계정이 없으신가요? </span>
      <button
        type="button"
        @click="handleSwitchToSignup"
        :disabled="isLoading"
        class="auth-form__switch-btn">
        회원가입
      </button>
    </div>

    <!-- 개발용 힌트 -->
    <div
      v-if="isDevelopment"
      class="auth-form__dev-hint">
      <small> 개발 모드: admin / password </small>
    </div>
  </form>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  // Emits
  const emit = defineEmits(['success', 'switch-to-signup'])

  // 컴포저블
  const { login, isLoading, error, clearError } = useAuth()

  // 상태
  const formData = ref({
    username: '',
    password: ''
  })

  // 개발 모드 체크
  const isDevelopment = computed(() => import.meta.env.MODE === 'development')

  // 폼 유효성
  const isFormValid = computed(() => {
    return (
      formData.value.username.trim().length > 0 &&
      formData.value.password.length > 0
    )
  })

  // 폼 제출
  const handleSubmit = async () => {
    if (!isFormValid.value) return

    clearError()

    const result = await login({
      username: formData.value.username.trim(),
      password: formData.value.password
    })

    if (result.success) {
      emit('success')
      // 폼 초기화
      formData.value = {
        username: '',
        password: ''
      }
    }
  }

  // 회원가입으로 전환
  const handleSwitchToSignup = () => {
    clearError()
    emit('switch-to-signup')
  }
</script>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .auth-form__error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--color-alert);
    color: white;
    border-radius: var(--border-radius-medium);
    font-size: 14px;
  }

  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .auth-form__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .auth-form__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .auth-form__input {
    width: 100%;
  }

  .auth-form__submit {
    width: 100%;
    margin-top: 8px;
  }

  .auth-form__switch {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  .auth-form__switch-text {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin-right: 8px;
  }

  .auth-form__switch-btn {
    background: none;
    border: none;
    color: var(--color-main);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    transition: opacity 0.2s;
  }

  .auth-form__switch-btn:hover:not(:disabled) {
    opacity: 0.8;
  }

  .auth-form__switch-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .auth-form__dev-hint {
    text-align: center;
    padding: 8px 12px;
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-small);
    color: var(--color-highlight-text);
  }
</style>
