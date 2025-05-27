<!-- 다른 사용자 프로필 페이지 (읽기 전용) -->
<template>
  <div class="user-profile-view">
    <!-- 헤더 -->
    <PageHeader
      :title="isLoading ? '프로필' : `${userProfile.username}님의 프로필`"
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
          @click="loadUserProfile"
          variant="primary">
          다시 시도
        </BaseButton>
      </div>

      <!-- 프로필 내용 -->
      <div
        v-else
        class="profile-content">
        <!-- 탭 네비게이션 (편집 관련 탭 제거) -->
        <div class="profile-tabs">
          <button
            @click="handleTabChange('liked-movies')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-movies' }
            ]">
            <BaseIcon
              name="heart"
              class="tab-icon" />
            영화 ({{ likedMovies.length }})
          </button>
          <button
            @click="handleTabChange('reviews')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'reviews' }
            ]">
            <BaseIcon
              name="star"
              class="tab-icon" />
            리뷰 ({{ userReviews.length }})
          </button>
          <button
            @click="handleTabChange('liked-actors')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-actors' }
            ]">
            <BaseIcon
              name="users"
              class="tab-icon" />
            배우 ({{ likedActors.length }})
          </button>
          <button
            @click="handleTabChange('liked-directors')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-directors' }
            ]">
            <BaseIcon
              name="video"
              class="tab-icon" />
            감독 ({{ likedDirectors.length }})
          </button>
          <button
            @click="handleTabChange('user-posts')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'user-posts' }
            ]">
            <BaseIcon
              name="edit"
              class="tab-icon" />
            게시글 ({{ userPosts.length }})
          </button>
        </div>

        <!-- 프로필 정보 섹션 (모든 탭에서 공통 표시) -->
        <div class="profile-info-section">
          <div class="profile-avatar-container">
            <div class="profile-avatar">
              <img
                v-if="userProfile.profile_image_url"
                :src="getFullImageUrl(userProfile.profile_image_url)"
                :alt="userProfile.username + '의 프로필'"
                class="avatar-image" />
              <BaseIcon
                v-else
                name="user"
                class="avatar-placeholder" />
            </div>
          </div>

          <div class="profile-details">
            <h2 class="username">{{ userProfile.username }}</h2>
            <p class="birth-date">{{ formatBirthDate(userProfile.birth) }}</p>
            <p class="join-date">
              가입일: {{ formatJoinDate(userProfile.joined_at) }}
            </p>

            <!-- 팔로우 버튼 (나중에 구현) -->
            <div class="follow-section">
              <BaseButton
                @click="toggleFollow"
                :variant="isFollowing ? 'secondary' : 'primary'"
                :disabled="isFollowLoading"
                class="follow-btn">
                {{ isFollowing ? '팔로우 취소' : '팔로우' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- 좋아요한 영화 탭 -->
        <div
          v-if="activeTab === 'liked-movies'"
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
                :key="movie.id"
                @click="goToMovieDetail(movie.id)"
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
            <p>{{ userProfile.username }}님이 좋아요한 영화가 없어요.</p>
          </div>
        </div>

        <!-- 리뷰 탭 -->
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

          <!-- 리뷰 목록 -->
          <div
            v-else-if="userReviews.length > 0"
            class="user-reviews-section">
            <h3 class="section-title">
              {{ userProfile.username }}님의 리뷰 ({{ userReviews.length }}개)
            </h3>
            <div class="reviews-list">
              <div
                v-for="review in userReviews"
                :key="review.id"
                class="review-card">
                <div class="review-header">
                  <div class="movie-info-compact">
                    <img
                      v-if="review.movie_info?.poster_path"
                      :src="`https://image.tmdb.org/t/p/w92${review.movie_info.poster_path}`"
                      :alt="review.movie_info.title"
                      class="review-movie-poster"
                      @click="goToMovieDetail(review.movie_info.id)" />
                    <div class="movie-details">
                      <h4
                        class="review-movie-title"
                        @click="goToMovieDetail(review.movie_info?.id)">
                        {{ review.movie_info?.title || '영화 제목' }}
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
            <p>{{ userProfile.username }}님이 작성한 리뷰가 없어요.</p>
          </div>
        </div>

        <!-- 좋아요한 배우 탭 -->
        <div
          v-else-if="activeTab === 'liked-actors'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingActors"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 배우를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="actorsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ actorsError }}</p>
            <BaseButton
              @click="loadLikedActors"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 배우 목록 -->
          <div
            v-else-if="likedActors.length > 0"
            class="liked-people-section">
            <h3 class="section-title">
              좋아요한 배우 ({{ likedActors.length }}명)
            </h3>
            <div class="people-grid">
              <div
                v-for="actor in likedActors"
                :key="actor.id"
                @click="goToPersonDetail(actor.id)"
                class="person-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                  :alt="actor.name"
                  class="person-photo"
                  @error="handleImageError" />
                <div class="person-info">
                  <h4 class="person-name">{{ actor.name }}</h4>
                  <p class="person-role">{{ actor.role || '배우' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 배우 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="users"
              class="empty-icon" />
            <h3>아직 좋아요한 배우가 없습니다</h3>
            <p>{{ userProfile.username }}님이 좋아요한 배우가 없어요.</p>
          </div>
        </div>

        <!-- 좋아요한 감독 탭 -->
        <div
          v-else-if="activeTab === 'liked-directors'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingDirectors"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 감독을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="directorsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ directorsError }}</p>
            <BaseButton
              @click="loadLikedDirectors"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 감독 목록 -->
          <div
            v-else-if="likedDirectors.length > 0"
            class="liked-people-section">
            <h3 class="section-title">
              좋아요한 감독 ({{ likedDirectors.length }}명)
            </h3>
            <div class="people-grid">
              <div
                v-for="director in likedDirectors"
                :key="director.id"
                @click="goToPersonDetail(director.id)"
                class="person-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${director.profile_path}`"
                  :alt="director.name"
                  class="person-photo"
                  @error="handleImageError" />
                <div class="person-info">
                  <h4 class="person-name">{{ director.name }}</h4>
                  <p class="person-role">{{ director.role || '감독' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 감독 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="video"
              class="empty-icon" />
            <h3>아직 좋아요한 감독이 없습니다</h3>
            <p>{{ userProfile.username }}님이 좋아요한 감독이 없어요.</p>
          </div>
        </div>

        <!-- 사용자 게시글 탭 -->
        <div
          v-else-if="activeTab === 'user-posts'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingPosts"
            class="tab-loading">
            <BaseSpinner />
            <p>게시글을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="postsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ postsError }}</p>
            <BaseButton
              @click="loadUserPosts"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 게시글 목록 -->
          <div
            v-else-if="userPosts.length > 0"
            class="user-posts-section">
            <h3 class="section-title">
              {{ userProfile.username }}님의 게시글 ({{ userPosts.length }}개)
            </h3>
            <div class="posts-list">
              <div
                v-for="post in userPosts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="post-card">
                <div class="post-header">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <span class="post-date">{{
                    formatRelativeDate(post.created_at)
                  }}</span>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-stats">
                  <span class="stat-item">
                    <BaseIcon
                      name="heart"
                      class="stat-icon" />
                    {{ post.like_count }}
                  </span>
                  <span class="stat-item">
                    <BaseIcon
                      name="message-circle"
                      class="stat-icon" />
                    {{ post.comment_count }}
                  </span>
                  <div class="post-tags">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="tag-chip">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 작성한 게시글 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="edit"
              class="empty-icon" />
            <h3>아직 작성한 게시글이 없습니다</h3>
            <p>{{ userProfile.username }}님이 작성한 게시글이 없어요.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  import PageHeader from '@/components/layout/PageHeader.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const router = useRouter()
  const route = useRoute()

  // 상태
  const isLoading = ref(true)
  const error = ref('')

  // 다른 사용자 프로필 정보
  const userProfile = ref({
    user_id: null,
    username: '',
    birth: '',
    profile_image_url: '',
    joined_at: ''
  })

  // 탭별 데이터
  const likedMovies = ref([])
  const userReviews = ref([])
  const likedActors = ref([])
  const likedDirectors = ref([])
  const userPosts = ref([])

  // 로딩 상태
  const isLoadingMovies = ref(false)
  const isLoadingReviews = ref(false)
  const isLoadingActors = ref(false)
  const isLoadingDirectors = ref(false)
  const isLoadingPosts = ref(false)

  // 에러 상태
  const moviesError = ref('')
  const reviewsError = ref('')
  const actorsError = ref('')
  const directorsError = ref('')
  const postsError = ref('')

  // 팔로우 관련 (나중에 구현)
  const isFollowing = ref(false)
  const isFollowLoading = ref(false)

  // 탭 상태
  const activeTab = ref('liked-movies')

  // 사용자 프로필 로드
  const loadUserProfile = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const userId = route.params.userId
      if (!userId) {
        error.value = '사용자 ID가 필요합니다.'
        return
      }

      // TODO: API 호출 구현
      // const data = await getUserProfile(userId)

      // 임시 데이터 (나중에 실제 API로 교체)
      userProfile.value = {
        user_id: userId,
        username: `사용자${userId}`,
        birth: '1990-01-01',
        profile_image_url: '',
        joined_at: '2024-01-01'
      }

      console.log('✅ 사용자 프로필 로드 성공:', userProfile.value)
    } catch (err) {
      console.error('프로필 로드 실패:', err)
      error.value =
        err.response?.data?.error || '프로필 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 탭 변경 처리
  const handleTabChange = (tab) => {
    activeTab.value = tab

    // URL에 현재 탭 정보 저장
    router.replace({
      name: 'UserProfile',
      params: { userId: route.params.userId },
      query: { tab: tab }
    })

    // 해당 탭 데이터 로드 (임시)
    console.log(`${tab} 탭 데이터 로드 (미구현)`)
  }

  // 임시 함수들 (나중에 실제 구현)
  const loadLikedMovies = () => console.log('좋아요한 영화 로드 (미구현)')
  const loadUserReviews = () => console.log('사용자 리뷰 로드 (미구현)')
  const loadLikedActors = () => console.log('좋아요한 배우 로드 (미구현)')
  const loadLikedDirectors = () => console.log('좋아요한 감독 로드 (미구현)')
  const loadUserPosts = () => console.log('사용자 게시글 로드 (미구현)')

  const toggleFollow = () => console.log('팔로우/언팔로우 (미구현)')

  // 네비게이션 함수들
  const goToMovieDetail = (movieId) => {
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }

  const goToPersonDetail = (personId) => {
    router.push({ name: 'PersonDetail', params: { id: personId } })
  }

  const goToPostDetail = (postId) => {
    router.push({ name: 'PostDetail', params: { id: postId } })
  }

  // 유틸리티 함수들
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    return `http://localhost:8000${imageUrl}`
  }

  const formatBirthDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  const formatJoinDate = (dateString) => {
    if (!dateString) return '정보 없음'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    } catch (error) {
      return '정보 없음'
    }
  }

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

  const getStarDisplay = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      if (rating >= starValue) return 'full'
      if (rating >= starValue - 0.5) return 'half'
      return 'empty'
    })
  }

  const handleImageError = (event) => {
    event.target.style.display = 'none'
  }

  // 컴포넌트 마운트 시 실행
  onMounted(async () => {
    await loadUserProfile()

    // URL 쿼리에서 탭 정보 복원
    const savedTab = route.query.tab
    if (
      savedTab &&
      [
        'liked-movies',
        'reviews',
        'liked-actors',
        'liked-directors',
        'user-posts'
      ].includes(savedTab)
    ) {
      activeTab.value = savedTab
    }
  })
</script>

<style scoped>
  /* 기존 ProfileView.vue와 동일한 스타일 사용 */
  .user-profile-view {
    min-height: 100vh;
    background-color: var(--color-background);
  }

  .profile-container {
    padding: 20px;
    max-width: 800px;
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

  .follow-section {
    margin-top: 16px;
  }

  .follow-btn {
    min-width: 120px;
  }

  /* 탭 네비게이션 */
  .profile-tabs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
    padding: 4px;
    gap: 4px;
  }

  .profile-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    background: none;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-highlight-text);
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
    text-align: center;
    white-space: nowrap;
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

  /* 각종 섹션들 */
  .liked-movies-section,
  .user-reviews-section,
  .liked-people-section,
  .user-posts-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 20px 0;
  }

  /* 영화 그리드 */
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

  /* 인물 그리드 */
  .people-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .person-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .person-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-main-opacity-50);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .person-photo {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background-color: var(--color-inactive-icon);
  }

  .person-info {
    padding: 12px;
  }

  .person-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .person-role {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 리뷰 목록 */
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

  /* 게시글 목록 */
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .post-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    padding: 20px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .post-card:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .post-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
    flex: 1;
  }

  .post-date {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .post-content {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0 0 16px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .post-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  .stat-icon {
    width: 14px;
    height: 14px;
    color: var(--color-highlight-text);
  }

  .post-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-left: auto;
  }

  .tag-chip {
    background-color: var(--color-main-opacity-20);
    color: var(--color-main);
    padding: 2px 8px;
    border-radius: var(--border-radius-small);
    font-size: 11px;
    font-weight: 500;
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

  /* 반응형 */
  @media (max-width: 768px) {
    .profile-container {
      padding: 16px;
      max-width: 100%;
    }

    .profile-tabs {
      grid-template-columns: repeat(2, 1fr);
      gap: 3px;
    }

    .profile-tab {
      font-size: 12px;
      padding: 8px 6px;
      flex-direction: column;
      gap: 4px;
    }

    .tab-icon {
      width: 14px;
      height: 14px;
    }

    .people-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 16px;
    }

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }

    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .post-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .profile-container {
      padding: 12px;
    }

    .profile-info-section {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .profile-tabs {
      grid-template-columns: repeat(2, 1fr);
    }

    .profile-tab {
      font-size: 11px;
      padding: 6px 4px;
    }

    .tab-icon {
      width: 12px;
      height: 12px;
    }

    .people-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
    }

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .empty-state {
      padding: 40px 16px;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
    }
  }

  /* 이미지 에러 처리 */
  .movie-poster[src=''],
  .movie-poster:not([src]),
  .person-photo[src=''],
  .person-photo:not([src]),
  .review-movie-poster[src=''],
  .review-movie-poster:not([src]) {
    background-color: var(--color-inactive-icon);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
  }

  .movie-poster[src='']:after,
  .movie-poster:not([src]):after,
  .review-movie-poster[src='']:after,
  .review-movie-poster:not([src]):after {
    content: '🎬';
    font-size: 24px;
  }

  .person-photo[src='']:after,
  .person-photo:not([src]):after {
    content: '👤';
    font-size: 24px;
  }
</style>
