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
        <!-- 탭 네비게이션 -->
        <div class="profile-tabs">
          <button
            @click="handleTabChange('profile')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'profile' }
            ]">
            <BaseIcon
              name="user"
              class="tab-icon" />
            프로필 수정
          </button>
          <button
            @click="handleTabChange('liked')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked' }
            ]">
            <BaseIcon
              name="heart"
              class="tab-icon" />
            좋아요 ({{ likedMovies.length }})
          </button>
          <button
            @click="handleTabChange('reviews')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'reviews' }
            ]">
            <BaseIcon
              name="message-square"
              class="tab-icon" />
            내 리뷰 ({{ userReviews.length }})
          </button>
        </div>

        <!-- 프로필 정보 섹션 (모든 탭에서 공통 표시) -->
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
              v-if="activeTab === 'profile'"
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

        <!-- 프로필 수정 탭 -->
        <div
          v-if="activeTab === 'profile'"
          class="tab-content">
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

        <!-- 좋아요한 영화 탭 -->
        <div
          v-else-if="activeTab === 'liked'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingMovies"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 영화를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="moviesError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ moviesError }}</p>
            <BaseButton
              @click="loadLikedMovies"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 영화 목록 -->
          <div
            v-else-if="likedMovies.length > 0"
            class="liked-movies-section">
            <h3 class="section-title">
              좋아요한 영화 ({{ likedMovies.length }}편)
            </h3>
            <div class="movies-grid">
              <div
                v-for="movie in likedMovies"
                :key="movie.movie_id"
                @click="goToMovieDetail(movie.movie_id)"
                class="movie-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w342${movie.poster_path}`"
                  :alt="movie.title"
                  class="movie-poster"
                  @error="handleImageError" />
                <div class="movie-info">
                  <h4 class="movie-title">{{ movie.title }}</h4>
                  <p class="movie-year">
                    {{ new Date(movie.release_date).getFullYear() }}
                  </p>
                  <div class="movie-rating">
                    <BaseIcon
                      name="star"
                      class="star-icon" />
                    <span>{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 영화 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="heart"
              class="empty-icon" />
            <h3>아직 좋아요한 영화가 없습니다</h3>
            <p>마음에 드는 영화에 좋아요를 눌러보세요!</p>
          </div>
        </div>

        <!-- 내 리뷰 탭 -->
        <div
          v-else-if="activeTab === 'reviews'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingReviews"
            class="tab-loading">
            <BaseSpinner />
            <p>리뷰를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="reviewsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ reviewsError }}</p>
            <BaseButton
              @click="loadUserReviews"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 내 리뷰 목록 -->
          <div
            v-else-if="userReviews.length > 0"
            class="user-reviews-section">
            <h3 class="section-title">내 리뷰 ({{ userReviews.length }}개)</h3>
            <div class="reviews-list">
              <div
                v-for="review in userReviews"
                :key="review.id"
                class="review-card">
                <div class="review-header">
                  <div class="movie-info-compact">
                    <img
                      v-if="review.movie?.poster_path"
                      :src="`https://image.tmdb.org/t/p/w92${review.movie.poster_path}`"
                      :alt="review.movie.title"
                      class="review-movie-poster"
                      @click="goToMovieDetail(review.movie.movie_id)" />
                    <div class="movie-details">
                      <h4
                        class="review-movie-title"
                        @click="goToMovieDetail(review.movie?.movie_id)">
                        {{ review.movie?.title || '영화 제목' }}
                      </h4>
                      <div class="review-rating">
                        <div class="stars-display">
                          <span
                            v-for="(star, index) in getStarDisplay(
                              review.rating
                            )"
                            :key="index"
                            class="star-item"
                            :class="star">
                            ⭐
                          </span>
                        </div>
                        <span class="rating-text">{{ review.rating }}점</span>
                      </div>
                    </div>
                  </div>
                  <span class="review-date">{{
                    formatRelativeDate(review.created_at)
                  }}</span>
                </div>
                <div class="review-content">
                  <p>{{ review.content }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 작성한 리뷰 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="message-square"
              class="empty-icon" />
            <h3>아직 작성한 리뷰가 없습니다</h3>
            <p>영화를 보고 첫 리뷰를 작성해보세요!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원 탈퇴 확인 모달 (기존과 동일) -->
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
  import { getUserLikeMovies, getUserReviews } from '@/services/api'
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

  const likedMovies = ref([])
  const userReviews = ref([])
  const isLoadingMovies = ref(false)
  const isLoadingReviews = ref(false)
  const moviesError = ref('')
  const reviewsError = ref('')

  // 탭 상태
  const activeTab = ref('profile')

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

  // 좋아요한 영화 목록 로드
  const loadLikedMovies = async () => {
    try {
      isLoadingMovies.value = true
      moviesError.value = ''

      const response = await getUserLikedMovies()
      likedMovies.value = response.liked_movies || []

      console.log('✅ 좋아요한 영화 로드 성공:', likedMovies.value.length)
    } catch (err) {
      console.error('❌ 좋아요한 영화 로드 실패:', err)
      moviesError.value =
        err.response?.data?.error || '좋아요한 영화를 불러오는데 실패했습니다.'
    } finally {
      isLoadingMovies.value = false
    }
  }

  // 사용자 리뷰 목록 로드
  const loadUserReviews = async () => {
    try {
      isLoadingReviews.value = true
      reviewsError.value = ''

      const response = await getUserReviews()
      userReviews.value = response.reviews || []

      console.log('✅ 사용자 리뷰 로드 성공:', userReviews.value.length)
    } catch (err) {
      console.error('❌ 사용자 리뷰 로드 실패:', err)
      reviewsError.value =
        err.response?.data?.error || '리뷰를 불러오는데 실패했습니다.'
    } finally {
      isLoadingReviews.value = false
    }
  }

  // 탭 변경 시 데이터 로드
  const handleTabChange = (tab) => {
    activeTab.value = tab

    if (tab === 'liked' && likedMovies.value.length === 0) {
      loadLikedMovies()
    } else if (tab === 'reviews' && userReviews.value.length === 0) {
      loadUserReviews()
    }
  }

  // 영화 상세로 이동
  const goToMovieDetail = (movieId) => {
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }

  // 별점 표시 함수
  const getStarDisplay = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      if (rating >= starValue) return 'full'
      if (rating >= starValue - 0.5) return 'half'
      return 'empty'
    })
  }

  // 날짜 포맷팅 (상대적 시간)
  const formatRelativeDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1일 전'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}개월 전`
    return `${Math.ceil(diffDays / 365)}년 전`
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
    transition: all 0.3s ease;
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
  .delete-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%;
    max-width: 400px;
    margin: 0 auto;
  }

  .delete-modal-content {
    width: 100%;
    max-width: 350px;
    padding: 32px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
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

  /* 프로필 탭 네비게이션 */
  .profile-tabs {
    display: flex;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
    padding: 4px;
    gap: 4px;
  }

  .profile-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-highlight-text);
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .profile-tab:hover {
    color: var(--color-text);
    background-color: var(--color-highlight-background);
  }

  .profile-tab--active {
    color: var(--color-text);
    background-color: var(--color-main);
  }

  .profile-tab--active .tab-icon {
    color: var(--color-background);
  }

  .tab-icon {
    width: 16px;
    height: 16px;
    color: var(--color-highlight-text);
    transition: color 0.2s;
  }

  .profile-tab--active .tab-icon {
    color: var(--color-background);
  }

  /* 탭 컨텐츠 */
  .tab-content {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 탭 로딩/에러 상태 */
  .tab-loading,
  .tab-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: var(--color-text);
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
  }

  .tab-loading p,
  .tab-error p {
    margin: 16px 0;
    color: var(--color-highlight-text);
  }

  /* 좋아요한 영화 섹션 */
  .liked-movies-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .movie-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .movie-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-main-opacity-50);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .movie-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background-color: var(--color-inactive-icon);
  }

  .movie-info {
    padding: 12px;
  }

  .movie-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .movie-year {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0 0 8px 0;
  }

  .movie-rating {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .star-icon {
    width: 12px;
    height: 12px;
    color: var(--color-main);
  }

  .movie-rating span {
    font-size: 12px;
    color: var(--color-text);
    font-weight: 500;
  }

  /* 내 리뷰 섹션 */
  .user-reviews-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .review-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    padding: 20px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.2s ease;
  }

  .review-card:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .movie-info-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .review-movie-poster {
    width: 50px;
    height: 75px;
    object-fit: cover;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .review-movie-poster:hover {
    transform: scale(1.05);
  }

  .movie-details {
    flex: 1;
    min-width: 0;
  }

  .review-movie-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1.3;
  }

  .review-movie-title:hover {
    color: var(--color-main);
  }

  .review-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stars-display {
    display: flex;
    gap: 2px;
  }

  .star-item {
    font-size: 14px;
    filter: grayscale(100%);
    opacity: 0.3;
  }

  .star-item.half {
    background: linear-gradient(90deg, var(--color-main) 50%, transparent 50%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: none;
    opacity: 1;
  }

  .star-item.full {
    color: var(--color-main);
    filter: none;
    opacity: 1;
  }

  .rating-text {
    font-size: 12px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .review-date {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .review-content {
    margin-top: 12px;
  }

  .review-content p {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  /* 빈 상태 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--color-inactive-icon);
    margin-bottom: 20px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .empty-state p {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.5;
  }

  /* 이미지 에러 처리 */
  .movie-poster[src=''],
  .movie-poster:not([src]),
  .review-movie-poster[src=''],
  .review-movie-poster:not([src]) {
    background-color: var(--color-inactive-icon);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    font-size: 24px;
  }

  .movie-poster[src='']:after,
  .movie-poster:not([src]):after {
    content: '🎬';
  }

  .review-movie-poster[src='']:after,
  .review-movie-poster:not([src]):after {
    content: '🎬';
    font-size: 16px;
  }

  /* 프로필 정보 섹션 수정 (아바타 수정 버튼 조건부 표시) */
  .profile-info-section {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    .profile-tabs {
      flex-direction: column;
      gap: 2px;
    }

    .profile-tab {
      justify-content: flex-start;
      padding: 14px 16px;
    }

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }

    .movie-info {
      padding: 10px;
    }

    .movie-title {
      font-size: 13px;
    }

    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .movie-info-compact {
      width: 100%;
    }

    .review-date {
      align-self: flex-end;
    }

    .empty-state {
      padding: 60px 20px;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
    }
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

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .movie-info {
      padding: 8px;
    }

    .movie-title {
      font-size: 12px;
    }

    .movie-year,
    .movie-rating span {
      font-size: 11px;
    }

    .review-card {
      padding: 16px;
    }

    .review-movie-poster {
      width: 40px;
      height: 60px;
    }

    .review-movie-title {
      font-size: 14px;
    }

    .review-content p {
      font-size: 13px;
    }

    .profile-tab {
      font-size: 13px;
      padding: 12px 14px;
    }

    .tab-icon {
      width: 14px;
      height: 14px;
    }

    .section-title {
      font-size: 18px;
    }

    .empty-state {
      padding: 40px 16px;
    }

    .empty-state h3 {
      font-size: 16px;
    }

    .empty-state p {
      font-size: 13px;
    }
  }

  .reviews-list::-webkit-scrollbar {
    width: 6px;
  }

  .reviews-list::-webkit-scrollbar-track {
    background: var(--color-highlight-background);
    border-radius: 3px;
  }

  .reviews-list::-webkit-scrollbar-thumb {
    background: var(--color-inactive-icon);
    border-radius: 3px;
  }

  .reviews-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-main);
  }
</style>
