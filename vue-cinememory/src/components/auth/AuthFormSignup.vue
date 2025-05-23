<!-- 📝 회원가입 폼 -->
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
        placeholder="3-20글자의 사용자명"
        :disabled="isLoading"
        required
        class="auth-form__input" />
      <div
        v-if="formData.username && !validateUsername(formData.username)"
        class="auth-form__field-error">
        사용자명은 3-20글자여야 합니다.
      </div>
    </div>

    <!-- 비밀번호 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 비밀번호 </label>
      <BaseInput
        v-model="formData.password"
        type="password"
        placeholder="6글자 이상의 비밀번호"
        :disabled="isLoading"
        required
        class="auth-form__input" />
      <div
        v-if="formData.password && !validatePassword(formData.password)"
        class="auth-form__field-error">
        비밀번호는 6글자 이상이어야 합니다.
      </div>
    </div>

    <!-- 비밀번호 확인 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 비밀번호 확인 </label>
      <BaseInput
        v-model="formData.passwordConfirm"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        :disabled="isLoading"
        required
        class="auth-form__input" />
      <div
        v-if="
          formData.passwordConfirm &&
          formData.password !== formData.passwordConfirm
        "
        class="auth-form__field-error">
        비밀번호가 일치하지 않습니다.
      </div>
    </div>

    <!-- 생년월일 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 생년월일 </label>
      <BaseInput
        v-model="formData.birth"
        type="date"
        :disabled="isLoading"
        required
        class="auth-form__input" />
      <div
        v-if="formData.birth && !validateBirthDate(formData.birth)"
        class="auth-form__field-error">
        올바른 생년월일을 입력해주세요.
      </div>
    </div>

    <!-- 제출 버튼 -->
    <BaseButton
      type="submit"
      :disabled="isLoading || !isFormValid"
      :loading="isLoading"
      variant="primary"
      size="large"
      class="auth-form__submit">
      {{ isLoading ? '회원가입 중...' : '회원가입' }}
    </BaseButton>

    <!-- 로그인 링크 -->
    <div class="auth-form__switch">
      <span class="auth-form__switch-text"> 이미 계정이 있으신가요? </span>
      <button
        type="button"
        @click="handleSwitchToLogin"
        :disabled="isLoading"
        class="auth-form__switch-btn">
        로그인
      </button>
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
  const emit = defineEmits(['success', 'switch-to-login'])

  // 컴포저블
  const {
    signup,
    isLoading,
    error,
    clearError,
    validateUsername,
    validatePassword,
    validateBirthDate
  } = useAuth()

  // 상태
  const formData = ref({
    username: '',
    password: '',
    passwordConfirm: '',
    birth: ''
  })

  // 폼 유효성
  const isFormValid = computed(() => {
    return (
      validateUsername(formData.value.username) &&
      validatePassword(formData.value.password) &&
      formData.value.password === formData.value.passwordConfirm &&
      validateBirthDate(formData.value.birth)
    )
  })

  // 폼 제출
  const handleSubmit = async () => {
    if (!isFormValid.value) return

    clearError()

    const result = await signup({
      username: formData.value.username.trim(),
      password: formData.value.password,
      birth: formData.value.birth
    })

    if (result.success) {
      emit('success')
      // 폼 초기화
      formData.value = {
        username: '',
        password: '',
        passwordConfirm: '',
        birth: ''
      }
    }
  }

  // 로그인으로 전환
  const handleSwitchToLogin = () => {
    clearError()
    emit('switch-to-login')
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

  .auth-form__field-error {
    font-size: 12px;
    color: var(--color-alert);
    margin-top: -4px;
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
</style>
