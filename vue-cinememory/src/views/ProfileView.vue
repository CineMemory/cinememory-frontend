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
              <BaseInput
                v-model="editForm.username"
                type="text"
                placeholder="새로운 닉네임"
                :disabled="isUpdating"
                class="form-input" />
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
              :disabled="isUpdating || !hasChanges"
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
      v-model="showDeleteModal"
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

  const showDeleteModal = ref(false)
  const imageInput = ref(null)

  // 계산된 속성
  const hasChanges = computed(() => {
    return (
      editForm.value.username !== profile.value.username ||
      editForm.value.password.length > 0 ||
      editForm.value.profileImage !== null
    )
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
    } catch (err) {
      console.error('프로필 로드 실패:', err)
      error.value =
        err.response?.data?.error || '프로필 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 이미지 업로드 열기
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
        const formData = new FormData()

        // 변경된 필드만 추가 (백엔드 필드명에 맞춤)
        if (editForm.value.username !== profile.value.username) {
          formData.append('username', editForm.value.username) // nickname → username
        }

        if (editForm.value.password) {
          formData.append('password1', editForm.value.password) // password → password1
          formData.append('password2', editForm.value.password) // password2 추가
        }

        formData.append('profile_image', editForm.value.profileImage)

        const response = await authAPI.updateUserProfile(formData)
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

        const response = await authAPI.updateUserProfile(updateData)
      }

      // 성공 시 프로필 다시 로드
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

      console.log('🔍 회원탈퇴 처리 시작')
      console.log('🔑 입력된 비밀번호 길이:', deleteForm.value.password?.length)

      // 🔐 먼저 현재 비밀번호가 맞는지 검증
      console.log('🔒 비밀번호 검증 시작')
      try {
        await authAPI.login({
          username: profile.value.username,
          password: deleteForm.value.password
        })
        console.log('✅ 비밀번호 검증 성공')
      } catch (verifyError) {
        console.error('❌ 비밀번호 검증 실패:', verifyError)

        // 비밀번호가 틀린 경우 탈퇴 중단
        if (
          verifyError.response?.status === 400 ||
          verifyError.response?.status === 401
        ) {
          deleteError.value = '비밀번호가 올바르지 않습니다.'
          return
        } else {
          deleteError.value = '비밀번호 검증 중 오류가 발생했습니다.'
          return
        }
      }

      // 🗑️ 비밀번호가 확인되면 회원탈퇴 진행
      console.log('🗑️ 회원탈퇴 API 호출')
      const result = await authAPI.deleteUserAccount(deleteForm.value.password)

      console.log('✅ 회원탈퇴 성공:', result)
      alert('회원 탈퇴가 완료되었습니다.')

      // 로그아웃 후 홈으로 이동
      await logout()
      router.push({ name: 'Home' })
    } catch (err) {
      console.error('❌ 회원 탈퇴 실패:', err)
      console.log('📝 에러 상세 정보:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })

      // 에러 메시지 처리
      let errorMessage = '회원 탈퇴에 실패했습니다.'

      if (err.response?.status === 400) {
        // 비밀번호 오류 등
        errorMessage =
          err.response?.data?.error || '비밀번호가 올바르지 않습니다.'
      } else if (err.response?.status === 401) {
        // 인증 오류
        errorMessage = '인증에 실패했습니다. 다시 로그인해주세요.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      deleteError.value = errorMessage
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
    padding: 32px 24px;
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
    padding: 4px 12px;
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
