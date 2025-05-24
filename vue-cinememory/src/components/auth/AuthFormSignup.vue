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

    <!-- 성공 메시지 -->
    <div
      v-if="successMessage"
      class="auth-form__success">
      <BaseIcon
        name="check-circle"
        class="success-icon" />
      {{ successMessage }}
    </div>

    <!-- 사용자명 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 사용자명 </label>
      <div class="username-input-container">
        <BaseInput
          v-model="formData.username"
          type="text"
          placeholder="3-20글자의 사용자명"
          :disabled="isLoading"
          required
          class="auth-form__input"
          @input="handleUsernameInput" />

        <!-- 닉네임 확인 상태 표시 -->
        <div class="username-status">
          <div
            v-if="usernameCheckState.isChecking"
            class="username-status__checking">
            <BaseIcon
              name="loader"
              class="spinner" />
          </div>
          <div
            v-else-if="usernameCheckState.isAvailable === true"
            class="username-status__available">
            <BaseIcon
              name="check"
              class="check-icon" />
          </div>
          <div
            v-else-if="usernameCheckState.isAvailable === false"
            class="username-status__unavailable">
            <BaseIcon
              name="x"
              class="x-icon" />
          </div>
        </div>
      </div>

      <!-- 사용자명 관련 메시지 -->
      <div
        v-if="formData.username && !validateUsername(formData.username)"
        class="auth-form__field-error">
        사용자명은 3-20글자여야 합니다.
      </div>
      <div
        v-else-if="usernameCheckState.message"
        :class="[
          'auth-form__field-message',
          usernameCheckState.isAvailable ? 'success' : 'error'
        ]">
        {{ usernameCheckState.message }}
      </div>
    </div>

    <!-- 비밀번호 입력 -->
    <div class="auth-form__field">
      <label class="auth-form__label"> 비밀번호 </label>
      <BaseInput
        v-model="formData.password"
        type="password"
        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
        :disabled="isLoading"
        required
        class="auth-form__input" />
      <div
        v-if="formData.password && !validatePassword(formData.password)"
        class="auth-form__field-error">
        비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.
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
  import { ref, computed, watch } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  // Emits
  const emit = defineEmits(['success', 'switch-to-login'])

  // 컴포저블
  const {
    signup,
    checkUsernameAvailability,
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

  const successMessage = ref('')

  // 닉네임 중복 확인 상태
  const usernameCheckState = ref({
    isChecking: false,
    isAvailable: null, // null: 미확인, true: 사용가능, false: 사용불가
    message: ''
  })

  // 닉네임 중복 확인 디바운스 타이머
  let usernameCheckTimer = null

  // 폼 유효성
  const isFormValid = computed(() => {
    return (
      validateUsername(formData.value.username) &&
      usernameCheckState.value.isAvailable === true &&
      validatePassword(formData.value.password) &&
      formData.value.password === formData.value.passwordConfirm &&
      validateBirthDate(formData.value.birth)
    )
  })

  // 닉네임 입력 핸들러 (디바운스 적용)
  const handleUsernameInput = () => {
    const username = formData.value.username.trim()

    // 이전 타이머 취소
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer)
    }

    // 상태 초기화
    usernameCheckState.value = {
      isChecking: false,
      isAvailable: null,
      message: ''
    }

    // 유효하지 않은 사용자명이면 확인하지 않음
    if (!validateUsername(username)) {
      return
    }

    // 500ms 후에 중복 확인 실행
    usernameCheckTimer = setTimeout(async () => {
      await checkUsername(username)
    }, 500)
  }

  // 닉네임 중복 확인 실행
  const checkUsername = async (username) => {
    if (!username || !validateUsername(username)) return

    usernameCheckState.value.isChecking = true
    usernameCheckState.value.message = ''

    try {
      const result = await checkUsernameAvailability(username)

      if (result.success) {
        usernameCheckState.value.isAvailable = true
        usernameCheckState.value.message = result.message
      } else {
        usernameCheckState.value.isAvailable = false
        usernameCheckState.value.message = result.error
      }
    } catch (err) {
      console.error('닉네임 확인 오류:', err)
      usernameCheckState.value.isAvailable = false
      usernameCheckState.value.message = '닉네임 확인에 실패했습니다.'
    } finally {
      usernameCheckState.value.isChecking = false
    }
  }

  // 폼 제출
  const handleSubmit = async () => {
    if (!isFormValid.value) return

    clearError()
    successMessage.value = ''

    const result = await signup({
      username: formData.value.username.trim(),
      password: formData.value.password,
      passwordConfirm: formData.value.passwordConfirm,
      birth: formData.value.birth
    })

    if (result.success) {
      successMessage.value = `${result.message} 로그인해주세요.`

      // 3초 후 자동으로 로그인 화면으로 전환
      setTimeout(() => {
        emit('switch-to-login')
      }, 2000)

      // 폼 초기화
      formData.value = {
        username: '',
        password: '',
        passwordConfirm: '',
        birth: ''
      }
      usernameCheckState.value = {
        isChecking: false,
        isAvailable: null,
        message: ''
      }
    }
  }

  // 로그인으로 전환
  const handleSwitchToLogin = () => {
    clearError()
    successMessage.value = ''
    emit('switch-to-login')
  }

  // 컴포넌트 언마운트 시 타이머 정리
  const cleanup = () => {
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer)
    }
  }

  // Vue 3의 onUnmounted 훅 사용
  import { onUnmounted } from 'vue'
  onUnmounted(cleanup)
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

  .auth-form__success {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--color-success);
    color: white;
    border-radius: var(--border-radius-medium);
    font-size: 14px;
  }

  .error-icon,
  .success-icon {
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

  .username-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .auth-form__input {
    width: 100%;
    padding-right: 40px; /* 아이콘 공간 확보 */
  }

  .username-status {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .username-status__checking .spinner {
    width: 16px;
    height: 16px;
    color: var(--color-highlight-text);
    animation: spin 1s linear infinite;
  }

  .username-status__available .check-icon {
    width: 16px;
    height: 16px;
    color: var(--color-success);
  }

  .username-status__unavailable .x-icon {
    width: 16px;
    height: 16px;
    color: var(--color-alert);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .auth-form__field-error {
    font-size: 12px;
    color: var(--color-alert);
    margin-top: -4px;
  }

  .auth-form__field-message {
    font-size: 12px;
    margin-top: -4px;
  }

  .auth-form__field-message.success {
    color: var(--color-success);
  }

  .auth-form__field-message.error {
    color: var(--color-alert);
  }

  .auth-form__submit {
    width: 100%;
    margin-top: 8px;
  }

  .auth-form__switch {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-inactive-icon);
    padding-bottom: 24px;
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
