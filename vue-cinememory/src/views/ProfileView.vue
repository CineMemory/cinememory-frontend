<!-- 👤 마이페이지 -->
<template>
  <div class="profile-view">
    <!-- 헤더 -->
    <PageHeader
      title="마이페이지"
      :show-back="true"
      :show-menu="true" />

    <div class="profile-container">
      <!-- 로딩 상태 -->
      <div
        v-if="isLoading"
        class="loading-container">
        <BaseSpinner />
        <p>프로필 정보를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="error-container">
        <BaseIcon
          name="alert-circle"
          class="error-icon" />
        <p>{{ error }}</p>
        <BaseButton
          @click="loadProfile"
          variant="primary">
          다시 시도
        </BaseButton>
      </div>

      <!-- 프로필 내용 -->
      <div
        v-else
        class="profile-content">
        <!-- 프로필 정보 섹션 -->
        <div class="profile-info-section">
          <div class="profile-avatar-container">
            <div class="profile-avatar">
              <img
                v-if="profile.profile_image_url"
                :src="profile.profile_image_url"
                :alt="profile.username + '의 프로필'"
                class="avatar-image" />
              <BaseIcon
                v-else
                name="user"
                class="avatar-placeholder" />
            </div>
            <button
              @click="openImageUpload"
              class="avatar-edit-btn">
              <BaseIcon
                name="camera"
                class="camera-icon" />
            </button>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
              class="hidden-input" />
          </div>

          <div class="profile-details">
            <h2 class="username">{{ profile.username }}</h2>
            <p class="birth-date">{{ formatBirthDate(profile.birth) }}</p>
            <p class="join-date">
              가입일: {{ formatJoinDate(profile.joined_at) }}
            </p>
          </div>
        </div>

        <!-- 프로필 수정 폼 -->
        <div class="profile-edit-section">
          <h3 class="section-title">프로필 수정</h3>

          <form
            @submit.prevent="handleUpdateProfile"
            class="edit-form">
            <!-- 닉네임 수정 -->
            <div class="form-field">
              <label class="form-label">닉네임</label>
              <div class="username-input-container">
                <BaseInput
                  v-model="editForm.username"
                  type="text"
                  placeholder="새로운 닉네임"
                  :disabled="isUpdating"
                  class="form-input"
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

              <!-- 닉네임 관련 메시지 -->
              <div
                v-if="
                  editForm.username &&
                  (editForm.username.length < 3 ||
                    editForm.username.length > 20)
                "
                class="field-error">
                닉네임은 3-20글자여야 합니다.
              </div>
              <div
                v-else-if="usernameCheckState.message"
                :class="[
                  'field-message',
                  usernameCheckState.isAvailable ? 'success' : 'error'
                ]">
                {{ usernameCheckState.message }}
              </div>
            </div>

            <!-- 비밀번호 변경 -->
            <div class="form-field">
              <label class="form-label">새 비밀번호</label>
              <BaseInput
                v-model="editForm.password"
                type="password"
                placeholder="새 비밀번호 (변경 시에만 입력)"
                :disabled="isUpdating"
                class="form-input" />
              <p class="field-description">
                영문, 숫자, 특수문자를 포함해 8자 이상
              </p>
            </div>

            <!-- 수정 버튼 -->
            <BaseButton
              type="submit"
              :disabled="isUpdating || !isFormValid"
              :loading="isUpdating"
              variant="primary"
              size="large"
              class="update-btn">
              {{ isUpdating ? '수정 중...' : '프로필 수정' }}
            </BaseButton>
          </form>
        </div>

        <!-- 회원 탈퇴 섹션 -->
        <div class="delete-section">
          <h3 class="section-title danger">회원 탈퇴</h3>
          <p class="delete-warning">
            회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <BaseButton
            @click="openDeleteModal"
            variant="danger"
            class="delete-btn">
            회원 탈퇴
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 회원 탈퇴 확인 모달 -->
    <BaseModal
      :modelValue="showDeleteModal"
      @update:modelValue="showDeleteModal = $event"
      @close="closeDeleteModal"
      class="delete-modal">
      <div class="delete-modal-content">
        <div class="delete-modal-header">
          <BaseIcon
            name="alert-triangle"
            class="warning-icon" />
          <h3>회원 탈퇴</h3>
        </div>

        <div class="delete-modal-body">
          <p class="delete-confirmation-text">
            정말로 회원 탈퇴를 하시겠습니까?<br />
            탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>

          <div class="password-verification">
            <label class="form-label">비밀번호 확인</label>
            <BaseInput
              v-model="deleteForm.password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              :disabled="isDeleting"
              class="password-input" />
          </div>

          <div
            v-if="deleteError"
            class="delete-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            {{ deleteError }}
          </div>
        </div>

        <div class="delete-modal-footer">
          <BaseButton
            @click="closeDeleteModal"
            :disabled="isDeleting"
            variant="secondary">
            취소
          </BaseButton>
          <BaseButton
            @click="handleDeleteAccount"
            :disabled="isDeleting || !deleteForm.password"
            :loading="isDeleting"
            variant="danger">
            {{ isDeleting ? '탈퇴 중...' : '탈퇴하기' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import * as authAPI from '@/services/authApi'

  import PageHeader from '@/components/layout/PageHeader.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  const router = useRouter()
  const { logout } = useAuth()

  // 상태
  const isLoading = ref(true)
  const isUpdating = ref(false)
  const isDeleting = ref(false)
  const error = ref('')
  const deleteError = ref('')

  const profile = ref({
    user_id: null,
    username: '',
    birth: '',
    profile_image_url: '',
    joined_at: ''
  })

  const editForm = ref({
    username: '',
    password: '',
    profileImage: null
  })

  const deleteForm = ref({
    password: ''
  })

  // 닉네임 중복 확인 상태 추가
  const usernameCheckState = ref({
    isChecking: false,
    isAvailable: null, // null: 미확인, true: 사용가능, false: 사용불가
    message: ''
  })

  const showDeleteModal = ref(false)
  const imageInput = ref(null)

  // 닉네임 중복 확인 디바운스 타이머
  let usernameCheckTimer = null

  // 계산된 속성
  const hasChanges = computed(() => {
    return (
      editForm.value.username !== profile.value.username ||
      editForm.value.password.length > 0 ||
      editForm.value.profileImage !== null
    )
  })

  // 닉네임 변경 여부 확인
  const isUsernameChanged = computed(() => {
    return (
      editForm.value.username !== profile.value.username &&
      editForm.value.username.length >= 3
    )
  })

  // 폼 유효성 (닉네임 중복 확인 포함)
  const isFormValid = computed(() => {
    // 닉네임이 변경된 경우 중복 확인이 완료되어야 함
    if (isUsernameChanged.value) {
      return usernameCheckState.value.isAvailable === true
    }
    // 닉네임이 변경되지 않은 경우는 다른 변경사항만 확인
    return hasChanges.value
  })

  // 프로필 정보 로드
  const loadProfile = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const data = await authAPI.getUserProfile()

      profile.value = {
        user_id: data.user_id,
        username: data.username,
        birth: data.birth,
        profile_image_url: data.profile_image_url,
        joined_at: data.joined_at
      }

      // 수정 폼 초기값 설정
      editForm.value.username = data.username

      // 닉네임 중복 확인 상태 초기화
      usernameCheckState.value = {
        isChecking: false,
        isAvailable: null,
        message: ''
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err)
      error.value =
        err.response?.data?.error || '프로필 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 닉네임 입력 핸들러 (디바운스 적용)
  const handleUsernameInput = () => {
    const username = editForm.value.username.trim()

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

    // 원래 닉네임과 같으면 확인하지 않음
    if (username === profile.value.username) {
      return
    }

    // 유효하지 않은 사용자명이면 확인하지 않음
    if (username.length < 3 || username.length > 20) {
      return
    }

    // 500ms 후에 중복 확인 실행
    usernameCheckTimer = setTimeout(async () => {
      await checkUsername(username)
    }, 500)
  }

  // 닉네임 중복 확인 실행
  const checkUsername = async (username) => {
    if (!username || username.length < 3 || username.length > 20) return

    usernameCheckState.value.isChecking = true
    usernameCheckState.value.message = ''

    try {
      const result = await authAPI.checkUsernameAvailability(username)

      if (result.message) {
        usernameCheckState.value.isAvailable = true
        usernameCheckState.value.message = result.message
      }
    } catch (err) {
      usernameCheckState.value.isAvailable = false
      usernameCheckState.value.message =
        err.response?.data?.error || '닉네임 확인에 실패했습니다.'
    } finally {
      usernameCheckState.value.isChecking = false
    }
  }
  const openImageUpload = () => {
    imageInput.value?.click()
  }

  // 이미지 선택 처리
  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }

      editForm.value.profileImage = file

      // 미리보기 업데이트
      const reader = new FileReader()
      reader.onload = (e) => {
        profile.value.profile_image_url = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // 프로필 수정
  const handleUpdateProfile = async () => {
    try {
      isUpdating.value = true

      // 이미지가 있으면 FormData, 없으면 일반 객체 사용
      if (editForm.value.profileImage) {
        console.log('🖼️ 이미지 업로드 시도:', editForm.value.profileImage)

        const formData = new FormData()

        // 변경된 필드만 추가 (백엔드 필드명에 맞춤)
        if (editForm.value.username !== profile.value.username) {
          formData.append('username', editForm.value.username)
        }

        if (editForm.value.password) {
          formData.append('password1', editForm.value.password)
          formData.append('password2', editForm.value.password)
        }

        formData.append('profile_image', editForm.value.profileImage)

        // FormData 내용 확인
        console.log('📤 전송할 FormData:')
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value)
        }

        const response = await authAPI.updateUserProfile(formData)
        console.log('✅ 업데이트 응답:', response)
      } else {
        // 이미지가 없으면 JSON으로 전송
        const updateData = {}

        if (editForm.value.username !== profile.value.username) {
          updateData.username = editForm.value.username
        }

        if (editForm.value.password) {
          updateData.password1 = editForm.value.password
          updateData.password2 = editForm.value.password
        }

        console.log('📤 전송할 JSON 데이터:', updateData)
        const response = await authAPI.updateUserProfile(updateData)
        console.log('✅ 업데이트 응답:', response)
      }

      // 성공 시 프로필 다시 로드
      console.log('🔄 프로필 정보 다시 로드...')
      await loadProfile()

      // 폼 초기화
      editForm.value.password = ''
      editForm.value.profileImage = null

      alert('프로필이 성공적으로 수정되었습니다.')
    } catch (err) {
      console.error('프로필 수정 실패:', err)
      alert(err.response?.data?.error || '프로필 수정에 실패했습니다.')
    } finally {
      isUpdating.value = false
    }
  }

  // 회원 탈퇴 모달 열기
  const openDeleteModal = () => {
    showDeleteModal.value = true
    deleteForm.value.password = ''
    deleteError.value = ''
  }

  // 회원 탈퇴 모달 닫기
  const closeDeleteModal = () => {
    showDeleteModal.value = false
    deleteForm.value.password = ''
    deleteError.value = ''
  }

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    try {
      isDeleting.value = true
      deleteError.value = ''

      await authAPI.deleteUserAccount(deleteForm.value.password)

      alert('회원 탈퇴가 완료되었습니다.')

      // 로그아웃 후 홈으로 이동
      await logout()
      router.push({ name: 'Home' })
    } catch (err) {
      console.error('회원 탈퇴 실패:', err)
      deleteError.value =
        err.response?.data?.error || '회원 탈퇴에 실패했습니다.'
    } finally {
      isDeleting.value = false
    }
  }

  // 날짜 포맷팅
  const formatBirthDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  const formatJoinDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  // 컴포넌트 마운트 시 프로필 로드
  onMounted(() => {
    loadProfile()
  })

  // 컴포넌트 언마운트 시 타이머 정리
  import { onUnmounted } from 'vue'

  onUnmounted(() => {
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer)
    }
  })
</script>

<style scoped>
  .profile-view {
    min-height: 100vh;
    background-color: var(--color-background);
  }

  .profile-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  /* 로딩 & 에러 상태 */
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--color-text);
  }

  .error-icon {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
    margin-bottom: 16px;
  }

  /* 프로필 정보 섹션 */
  .profile-info-section {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
  }

  .profile-avatar-container {
    position: relative;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--border-radius-full);
    overflow: hidden;
    background-color: var(--color-highlight-background);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 40px;
    height: 40px;
    color: var(--color-inactive-icon);
  }

  .avatar-edit-btn {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius-full);
    background-color: var(--color-main);
    border: 2px solid var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .avatar-edit-btn:hover {
    transform: scale(1.1);
  }

  .camera-icon {
    width: 16px;
    height: 16px;
    color: var(--color-background);
  }

  .hidden-input {
    display: none;
  }

  .profile-details {
    flex: 1;
  }

  .username {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .birth-date,
  .join-date {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 4px 0;
  }

  /* 프로필 수정 섹션 */
  .profile-edit-section,
  .delete-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 20px 0;
  }

  .section-title.danger {
    color: var(--color-alert);
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .form-input {
    width: 100%;
  }

  .username-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .username-input-container .form-input {
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

  .field-error {
    font-size: 12px;
    color: var(--color-alert);
    margin-top: -4px;
  }

  .field-message {
    font-size: 12px;
    margin-top: -4px;
  }

  .field-message.success {
    color: var(--color-success);
  }

  .field-message.error {
    color: var(--color-alert);
  }

  .field-description {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .update-btn {
    width: 100%;
    margin-top: 8px;
  }

  /* 회원 탈퇴 섹션 */
  .delete-warning {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .delete-btn {
    width: 100%;
  }

  /* 회원 탈퇴 모달 */
  .delete-modal-content {
    width: 100%;
    max-width: 400px;
  }

  .delete-modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .warning-icon {
    width: 24px;
    height: 24px;
    color: var(--color-alert);
  }

  .delete-modal-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .delete-modal-body {
    margin-bottom: 24px;
  }

  .delete-confirmation-text {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .password-verification {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .password-input {
    width: 100%;
  }

  .delete-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: var(--color-alert);
    color: white;
    border-radius: var(--border-radius-medium);
    font-size: 14px;
    margin-top: 12px;
  }

  .delete-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .delete-modal-footer button {
    min-width: 80px;
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .profile-container {
      padding: 16px;
    }

    .profile-info-section {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .delete-modal-footer {
      flex-direction: column;
    }

    .delete-modal-footer button {
      width: 100%;
    }
  }
</style>
