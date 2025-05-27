<template>
  <div class="movie-detail-view">
    <!-- 커스텀 헤더 -->
    <header class="movie-detail-header">
      <div class="movie-detail-header__container">
        <button
          @click="goBack"
          class="movie-detail-header__back-btn">
          <BaseIcon
            name="arrow-left"
            class="back-icon" />
        </button>

        <h1 class="movie-detail-header__title">
          {{ movie?.title || '영화 상세' }}
        </h1>

        <div class="movie-detail-header__actions">
          <button
            @click="toggleSearchMode"
            class="movie-detail-header__search-btn">
            <BaseIcon
              name="search"
              class="search-icon" />
          </button>
          <HeaderMenu class="movie-detail-header__menu" />
        </div>
      </div>

      <!-- 검색 모드 (기존과 동일) -->
      <Transition name="search-bar">
        <div
          v-if="isSearchMode"
          class="movie-detail-search-bar">
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <BaseIcon
                name="search"
                class="search-input-icon" />
              <input
                ref="searchInput"
                v-model="newSearchQuery"
                type="text"
                placeholder="작품, 인물을 검색해보세요"
                class="search-input"
                @keyup.enter="performNewSearch"
                @blur="handleSearchBlur" />
            </div>
            <button
              v-if="newSearchQuery.trim()"
              @click="performNewSearch"
              class="search-execute-btn">
              <BaseIcon
                name="search"
                class="execute-icon" />
            </button>
            <button
              @click="exitSearchMode"
              class="search-cancel-btn">
              <BaseIcon
                name="x"
                class="cancel-icon" />
            </button>
          </div>
        </div>
      </Transition>
    </header>

    <!-- 로딩 상태 -->
    <div
      v-if="isLoading"
      class="movie-detail-loading">
      <div class="loading-content">
        <BaseIcon
          name="search"
          class="loading-icon spinning" />
        <h2 class="loading-title">영화 정보를 불러오는 중...</h2>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="movie-detail-loading">
      <div class="loading-content">
        <BaseIcon
          name="alert-circle"
          class="loading-icon error" />
        <h2 class="loading-title">오류가 발생했습니다</h2>
        <p class="loading-subtitle">{{ error }}</p>
        <div class="loading-actions">
          <BaseButton
            @click="loadMovie"
            variant="primary"
            class="loading-btn">
            다시 시도
          </BaseButton>
          <BaseButton
            @click="goBack"
            variant="secondary"
            class="loading-btn">
            이전으로
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <main
      v-else-if="movie"
      class="movie-detail-main">
      <!-- 백드롭 배경 -->
      <div
        v-if="movie.backdrop_path"
        class="movie-backdrop"
        :style="{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
        }">
        <div class="backdrop-overlay"></div>
      </div>

      <div class="movie-detail-container">
        <!-- 영화 히어로 섹션 -->
        <div class="movie-hero">
          <img
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            class="movie-poster" />

          <div class="movie-info">
            <h1 class="movie-title">{{ movie.title }}</h1>

            <!-- 태그라인 -->
            <p
              v-if="movie.tagline"
              class="movie-tagline">
              "{{ movie.tagline }}"
            </p>

            <!-- 기본 정보 -->
            <div class="movie-meta">
              <span class="movie-date">{{
                formatDate(movie.release_date)
              }}</span>
              <span
                v-if="movie.runtime"
                class="movie-runtime">
                {{ formatRuntime(movie.runtime) }}
              </span>
              <span
                v-if="movie.status"
                class="movie-status"
                :style="getStatusStyle(translateStatus(movie.status))">
                {{ translateStatus(movie.status) }}
              </span>
            </div>

            <!-- 장르 -->
            <div
              v-if="movie.genres && movie.genres.length > 0"
              class="movie-genres">
              <span
                v-for="genre in movie.genres"
                :key="genre.id"
                class="genre-tag">
                {{ genre.name }}
              </span>
            </div>

            <!-- 평점 및 좋아요 -->
            <div class="movie-ratings">
              <div
                v-if="movie.vote_average"
                class="rating-item">
                <BaseIcon
                  name="star"
                  class="rating-icon" />
                <span class="rating-value">{{
                  movie.vote_average.toFixed(1)
                }}</span>
                <span class="rating-label">TMDB</span>
              </div>

              <!-- 평균 사용자 평점 -->
              <div
                v-if="averageRating > 0"
                class="rating-item user-rating">
                <BaseIcon
                  name="users"
                  class="rating-icon" />
                <span class="rating-value"
                  >{{ averageRating.toFixed(1) }}점</span
                >
                <span class="rating-label">평균 · {{ reviewCount }}명</span>
              </div>

              <!-- 좋아요 버튼 -->
              <button
                @click="toggleLike"
                :disabled="isTogglingLike"
                class="like-btn"
                :class="{ liked: isLiked, loading: isTogglingLike }">
                <BaseIcon
                  :name="isLiked ? 'heart' : 'heart'"
                  class="like-icon" />
                <span class="like-count">{{ likeCount }}</span>
              </button>
            </div>

            <!-- 줄거리 -->
            <div
              v-if="movie.overview"
              class="movie-overview">
              <h3 class="section-title">줄거리</h3>
              <p class="overview-text">{{ movie.overview }}</p>
            </div>

            <!-- OTT 시청 정보 -->
            <!-- OTT 시청 정보 -->
            <div
              v-if="groupedProviders && groupedProviders.length > 0"
              class="movie-watch-providers">
              <h3 class="section-title">시청 가능한 플랫폼</h3>
              <div class="watch-providers-list">
                <div
                  v-for="providerGroup in groupedProviders"
                  :key="providerGroup.provider.id"
                  class="watch-provider-item">
                  <img
                    :src="`https://image.tmdb.org/t/p/w92${providerGroup.provider.logo_path}`"
                    :alt="providerGroup.provider.name"
                    class="provider-logo" />
                  <div class="provider-info">
                    <span class="provider-name">{{
                      providerGroup.provider.name
                    }}</span>
                    <div class="provider-types">
                      <span
                        v-for="type in providerGroup.types"
                        :key="type.provider_type"
                        class="provider-type-tag">
                        {{ translateProviderType(type.provider_type) }}
                        <span
                          v-if="type.price"
                          class="provider-price"
                          >{{ type.price }}</span
                        >
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 출연진 섹션 -->
        <div
          v-if="movie.actors && movie.actors.length > 0"
          class="movie-cast-section">
          <h2 class="section-title">출연진</h2>
          <div class="cast-grid">
            <div
              v-for="actor in displayedActors"
              :key="actor.actor_id"
              @click="goToPersonDetail(actor.actor_id)"
              class="cast-card">
              <div class="cast-photo-container">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                  :alt="actor.name"
                  class="cast-photo"
                  @error="handleCastImageError" />
              </div>
              <div class="cast-info">
                <h4 class="cast-name">{{ actor.actor?.name || actor.name }}</h4>
                <p
                  v-if="actor.character_name"
                  class="cast-character">
                  {{ actor.character_name }}
                </p>
                <p
                  v-else
                  class="cast-character no-character">
                  출연
                </p>
              </div>
            </div>
          </div>
          <button
            v-if="movie.actors.length > 6"
            @click="showAllActors = !showAllActors"
            class="show-more-btn">
            {{
              showAllActors ? '접기' : `${movie.actors.length - 6}명 더 보기`
            }}
          </button>
        </div>

        <!-- 감독 섹션 -->
        <div
          v-if="movie.directors && movie.directors.length > 0"
          class="movie-cast-section">
          <h2 class="section-title">감독</h2>
          <div class="cast-grid">
            <div
              v-for="director in movie.directors"
              :key="director.director_id"
              @click="goToPersonDetail(director.director_id || director.id)"
              class="cast-card">
              <div class="cast-photo-container">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${director.profile_path}`"
                  :alt="director.name"
                  class="cast-photo"
                  @error="handleCastImageError" />
              </div>
              <div class="cast-info">
                <h4 class="cast-name">{{ director.name }}</h4>
                <p class="cast-character director-role">감독</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 리뷰 섹션 -->
        <div class="movie-reviews-section">
          <div class="reviews-header">
            <h2 class="section-title">리뷰 ({{ reviewCount }})</h2>
            <BaseButton
              v-if="authStore.isAuthenticated && !isWritingReview"
              @click="startWritingReview"
              variant="primary"
              class="write-review-btn">
              {{ userReview ? '내 리뷰 수정' : '리뷰 작성' }}
            </BaseButton>
          </div>

          <!-- 리뷰 작성 폼 -->
          <div
            v-if="isWritingReview"
            class="review-form">
            <div class="review-form-header">
              <h3>{{ userReview ? '리뷰 수정' : '리뷰 작성' }}</h3>
              <button
                @click="cancelWritingReview"
                class="form-close-btn">
                <BaseIcon name="x" />
              </button>
            </div>

            <!-- 별점 입력 (새로운 스타일로 대체) -->
            <div class="rating-input">
              <label class="rating-input-label">별점</label>
              <div class="stars-rating">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="setRating(star)"
                  @mouseenter="setHoveredRating(star)"
                  @mouseleave="clearHoveredRating"
                  class="star-button"
                  :class="{
                    filled: star <= (hoveredRating || reviewRating),
                    hovered: star <= hoveredRating
                  }">
                  ⭐
                </button>
              </div>
              <div class="rating-feedback">
                <span class="rating-display">{{ reviewRating }}점</span>
                <span
                  v-if="reviewRating > 0"
                  class="rating-text">
                  {{ getRatingText(reviewRating) }}
                </span>
              </div>
            </div>

            <!-- 리뷰 내용 -->
            <div class="content-input">
              <label class="content-input-label">리뷰</label>
              <textarea
                v-model="reviewContent"
                placeholder="이 영화에 대한 솔직한 리뷰를 작성해주세요..."
                class="content-textarea"
                rows="4"></textarea>
            </div>

            <!-- 폼 액션 -->
            <div class="form-actions">
              <BaseButton
                @click="submitReview"
                :disabled="
                  isSubmittingReview ||
                  !reviewContent.trim() ||
                  reviewRating === 0
                "
                variant="primary"
                class="submit-btn">
                {{
                  isSubmittingReview
                    ? '저장 중...'
                    : userReview
                      ? '수정 완료'
                      : '리뷰 작성'
                }}
              </BaseButton>
              <BaseButton
                v-if="userReview"
                @click="deleteReview"
                variant="danger"
                class="delete-btn">
                삭제
              </BaseButton>
              <BaseButton
                @click="cancelWritingReview"
                variant="secondary"
                class="cancel-btn">
                취소
              </BaseButton>
            </div>
          </div>

          <!-- 내 리뷰 표시 -->
          <div
            v-if="userReview && !isWritingReview"
            class="user-review">
            <div class="review-header">
              <h4>내 리뷰</h4>
            </div>
            <div class="review-rating">
              <div class="stars-display">
                <span
                  v-for="(star, index) in getStarDisplay(userReview.rating)"
                  :key="index"
                  class="star-item"
                  :class="star">
                  ⭐
                </span>
              </div>
              <span class="rating-text">{{ userReview.rating }}점</span>
            </div>
            <p class="review-content">{{ userReview.content }}</p>
            <span class="review-date">{{
              new Date(userReview.created_at).toLocaleDateString()
            }}</span>
          </div>

          <!-- 다른 사용자 리뷰들 -->
          <div
            v-if="otherReviews.length > 0"
            class="other-reviews">
            <h3 class="other-reviews-title">다른 사용자 리뷰</h3>
            <div
              v-for="review in otherReviews"
              :key="review.id"
              class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <img
                    v-if="review.user_profile?.profile_image_url"
                    :src="review.user_profile.profile_image_url"
                    :alt="review.user_profile.username"
                    class="reviewer-avatar" />
                  <div class="reviewer-details">
                    <span
                      class="reviewer-name clickable-author"
                      @click="goToReviewerProfile(review)"
                      >{{ review.user_profile?.username || review.user }}</span
                    >
                    <div class="review-rating">
                      <div class="stars-display small">
                        <span
                          v-for="(star, index) in getStarDisplay(review.rating)"
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
                  new Date(review.created_at).toLocaleDateString()
                }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>

          <!-- 리뷰 없음 -->
          <div
            v-if="reviewCount === 0 && !isWritingReview"
            class="no-reviews">
            <BaseIcon
              name="message-square"
              class="no-reviews-icon" />
            <h3>아직 리뷰가 없습니다</h3>
            <p>첫 번째 리뷰를 작성해보세요!</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 예고편 모달 (기존과 동일) -->
    <Transition name="modal">
      <div
        v-if="showTrailerModal && trailerVideoId"
        class="trailer-modal-overlay"
        @click="closeTrailerModal">
        <div
          class="trailer-modal"
          @click.stop>
          <div class="trailer-modal-header">
            <h3 class="trailer-modal-title">{{ movie.title }} - 예고편</h3>
            <button
              @click="closeTrailerModal"
              class="trailer-modal-close">
              <BaseIcon
                name="x"
                class="close-icon" />
            </button>
          </div>
          <div class="trailer-video-container">
            <iframe
              :src="`https://www.youtube.com/embed/${trailerVideoId}?autoplay=1`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="trailer-video">
            </iframe>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // API 함수 import
  import {
    getMovieDetail,
    toggleMovieLike,
    createMovieReview,
    updateMovieReview,
    deleteMovieReview
  } from '@/services/api'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // 상태
  const movie = ref(null)
  const showAllActors = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 예고편 관련 상태
  const showTrailerModal = ref(false)
  const trailerVideoId = ref('')
  const isLoadingTrailer = ref(false)

  // 리뷰 관련 상태
  const userReview = ref(null)
  const isWritingReview = ref(false)
  const reviewContent = ref('')
  const reviewRating = ref(0)
  const hoveredRating = ref(0)
  const isSubmittingReview = ref(false)

  // 좋아요 관련 상태
  const isLiked = ref(false)
  const likeCount = ref(0)
  const isTogglingLike = ref(false)

  // YouTube API 키 (환경변수에서 가져오기)
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

  // 계산된 속성
  const displayedActors = computed(() => {
    if (!movie.value?.actors) return []

    // 중복 제거 + character_name 필터링
    const uniqueActors = movie.value.actors.reduce((acc, actor) => {
      const actorId = actor.actor?.id || actor.id
      const existing = acc.find((item) => item.actor_id === actorId)

      // character_name이 있는 경우만 처리
      if (actor.character_name && actor.character_name.trim() !== '') {
        if (!existing) {
          // 새로운 배우면 추가
          acc.push({
            actor_id: actorId,
            name: actor.actor?.name || actor.name,
            profile_path: actor.actor?.profile_path || actor.profile_path,
            character_name: actor.character_name
          })
        } else if (!existing.character_name) {
          // 기존 항목에 character_name이 없다면 교체
          const index = acc.findIndex((item) => item.actor_id === actorId)
          acc[index] = {
            actor_id: actorId,
            name: actor.actor?.name || actor.name,
            profile_path: actor.actor?.profile_path || actor.profile_path,
            character_name: actor.character_name
          }
        }
      }

      return acc
    }, [])

    return showAllActors.value ? uniqueActors : uniqueActors.slice(0, 6)
  })

  const averageRating = computed(() => {
    return movie.value?.average_rating || 0
  })

  const reviewCount = computed(() => {
    return movie.value?.review_count || 0
  })

  const otherReviews = computed(() => {
    if (!movie.value?.reviews) return []
    return movie.value.reviews.filter(
      (review) => !userReview.value || review.id !== userReview.value.id
    )
  })

  // 컬렉션 정보 파싱
  const collectionInfo = computed(() => {
    if (!movie.value?.fields?.belongsToCollection) return null

    try {
      // JSON 문자열인 경우 파싱
      if (typeof movie.value.fields.belongsToCollection === 'string') {
        return JSON.parse(movie.value.fields.belongsToCollection)
      }
      // 이미 객체인 경우 그대로 사용
      return movie.value.fields.belongsToCollection
    } catch (error) {
      console.error('컬렉션 정보 파싱 에러:', error)
      return null
    }
  })

  const groupedProviders = computed(() => {
    if (!movie.value?.providers) return []

    // 플랫폼명으로 그룹화
    const providerGroups = new Map()

    movie.value.providers.forEach((provider) => {
      const providerName = provider.provider.name

      if (!providerGroups.has(providerName)) {
        providerGroups.set(providerName, {
          provider: provider.provider,
          types: []
        })
      }

      // 중복 타입 제거하면서 추가 (provider_type이 있는 것만)
      const existingTypes = providerGroups.get(providerName).types
      if (
        provider.provider_type &&
        !existingTypes.some((t) => t.provider_type === provider.provider_type)
      ) {
        existingTypes.push({
          provider_type: provider.provider_type,
          price: provider.price,
          display_priority: provider.display_priority || 999
        })
      }
    })

    // 타입이 있는 플랫폼만 반환
    return Array.from(providerGroups.values()).filter(
      (group) => group.types.length > 0
    )
  })

  // 별점 표시 함수
  const getStarDisplay = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      if (rating >= starValue) return 'full'
      if (rating >= starValue - 0.5) return 'half'
      return 'empty'
    })
  }

  // 별점에 따른 텍스트 변환
  const getRatingText = (rating) => {
    const ratingTexts = {
      1: '별로예요',
      2: '그저 그래요',
      3: '보통이에요',
      4: '좋아요',
      5: '최고에요!'
    }
    return ratingTexts[rating] || ''
  }

  // 출연진 이미지 에러 처리
  const handleCastImageError = (event) => {
    event.target.style.backgroundColor = 'var(--color-inactive-icon)'
    event.target.style.display = 'flex'
    event.target.style.alignItems = 'center'
    event.target.style.justifyContent = 'center'
    event.target.innerHTML = '👤'
    event.target.style.fontSize = '24px'
    event.target.style.border = '3px solid var(--color-inactive-icon)'
  }

  // 유틸리티 함수들
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const formatRuntime = (minutes) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const translateStatus = (status) => {
    const statusMap = {
      Released: '개봉',
      'Post Production': '후반 작업',
      'In Production': '제작 중',
      Planned: '기획 중',
      Rumored: '소문 단계',
      Canceled: '취소됨'
    }
    return statusMap[status] || status
  }

  const getStatusStyle = (status) => {
    const statusColors = {
      Released: '#5d7c47', // 초록색 (개봉)
      개봉: '#5d7c47',
      'Post Production': 'var(--color-main)', // 노란색 (후반 작업)
      '후반 작업': 'var(--color-main)',
      'In Production': '#a0442c', // 주황색 (제작 중)
      '제작 중': '#a0442c',
      Planned: 'var(--color-inactive-text)', // 회색 (기획 중)
      '기획 중': 'var(--color-inactive-text)',
      Canceled: 'var(--color-alert)', // 빨간색 (취소)
      취소됨: 'var(--color-alert)'
    }

    return {
      color: statusColors[status] || 'var(--color-highlight-text)',
      backgroundColor: 'var(--color-card-background)', // 다른 메타데이터와 동일한 배경
      padding: '4px 12px',
      borderRadius: 'var(--border-radius-small)'
    }
  }

  // 네비게이션
  const goToPersonDetail = (personId) => {
    if (!personId) {
      console.error('❌ 인물 ID가 없습니다:', personId)
      alert('해당 인물의 정보를 찾을 수 없습니다.')
      return
    }

    console.log('👤 인물 상세로 이동:', personId)
    router.push({ name: 'PersonDetail', params: { id: personId } })
  }
  const goBack = () => {
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push({ name: 'Home' })
    }
  }

  const goHome = () => {
    router.push({ name: 'Home' })
  }

  // 검색 모드 관련 함수들
  const toggleSearchMode = async () => {
    isSearchMode.value = !isSearchMode.value
    if (isSearchMode.value) {
      await nextTick()
      searchInput.value?.focus()
    } else {
      newSearchQuery.value = ''
    }
  }

  const exitSearchMode = () => {
    isSearchMode.value = false
    newSearchQuery.value = ''
  }

  const performNewSearch = () => {
    const query = newSearchQuery.value.trim()
    if (!query) {
      searchInput.value?.focus()
      return
    }

    router.push({
      name: 'SearchResult',
      query: { q: query }
    })
    exitSearchMode()
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!newSearchQuery.value.trim()) {
        exitSearchMode()
      }
    }, 150)
  }

  // 영화 데이터 로드
  const loadMovie = async () => {
    const movieId = parseInt(route.params.id)
    isLoading.value = true
    error.value = null

    try {
      const movieData = await getMovieDetail(movieId)
      movie.value = movieData

      // 디버깅
      console.log('백드롭 패스: ', movieData.backdrop_path)
      console.log(
        '완전한 URL: ',
        `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`
      )

      // 좋아요 상태 설정
      isLiked.value = movieData.is_liked || false
      likeCount.value = movieData.like_count || 0

      // 사용자 리뷰 찾기
      if (authStore.isAuthenticated && movieData.reviews) {
        const currentUserId = authStore.user?.id
        userReview.value = movieData.reviews.find(
          (review) =>
            review.user_profile?.id === currentUserId ||
            review.user === authStore.user?.username
        )
      }
    } catch (err) {
      console.error('❌ 영화 로드 실패:', err)
      error.value = err.response?.data?.error || '영화를 불러올 수 없습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 좋아요 토글
  const toggleLike = async () => {
    if (!authStore.isAuthenticated) {
      authStore.openLoginModal()
      return
    }

    if (isTogglingLike.value) return

    isTogglingLike.value = true
    try {
      const result = await toggleMovieLike(movie.value.movie_id)
      if (result.success) {
        isLiked.value = result.is_liked
        likeCount.value = result.like_count
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('좋아요 토글 실패:', err)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      isTogglingLike.value = false
    }
  }

  // 리뷰 관련 함수들
  const startWritingReview = () => {
    if (!authStore.isAuthenticated) {
      alert('로그인이 필요합니다.')
      return
    }

    if (userReview.value) {
      // 기존 리뷰 수정
      reviewContent.value = userReview.value.content
      reviewRating.value = userReview.value.rating
    } else {
      // 새 리뷰 작성
      reviewContent.value = ''
      reviewRating.value = 0
    }

    isWritingReview.value = true
  }

  const cancelWritingReview = () => {
    isWritingReview.value = false
    reviewContent.value = ''
    reviewRating.value = 0
    hoveredRating.value = 0
  }

  const submitReview = async () => {
    if (!reviewContent.value.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    if (reviewRating.value === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    isSubmittingReview.value = true

    try {
      const reviewData = {
        content: reviewContent.value.trim(),
        rating: reviewRating.value
      }

      // 수정 여부를 미리 저장
      const isEditing = !!userReview.value

      let response
      if (isEditing) {
        // 리뷰 수정
        response = await updateMovieReview(
          movie.value.movie_id,
          userReview.value.id,
          reviewData
        )
      } else {
        // 새 리뷰 작성
        response = await createMovieReview(movie.value.movie_id, reviewData)
      }

      // 성공 시 영화 데이터 다시 로드
      await loadMovie()
      cancelWritingReview()
    } catch (err) {
      console.error('리뷰 제출 실패:', err)
      alert(err.response?.data?.error || '리뷰 처리 중 오류가 발생했습니다.')
    } finally {
      isSubmittingReview.value = false
    }
  }

  const deleteReview = async () => {
    if (!userReview.value) return

    if (!confirm('리뷰를 삭제하시겠습니까?')) return

    try {
      await deleteMovieReview(movie.value.movie_id, userReview.value.id)
      await loadMovie()
      alert('리뷰가 삭제되었습니다.')
    } catch (err) {
      console.error('리뷰 삭제 실패:', err)
      alert('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  // 별점 관련 함수들
  const setRating = (rating) => {
    reviewRating.value = rating
    clearHoveredRating()
  }

  const setHoveredRating = (rating) => {
    hoveredRating.value = rating
  }

  const clearHoveredRating = () => {
    hoveredRating.value = 0
  }

  // 예고편 관련 함수들
  const searchTrailer = async () => {
    if (!movie.value || isLoadingTrailer.value) return

    // YouTube API 키 확인
    if (!YOUTUBE_API_KEY) {
      alert(
        'YouTube API 키가 설정되지 않았습니다.\n\n설정 방법:\n1. Google Cloud Console에서 YouTube Data API v3 키 발급\n2. 프로젝트 루트에 .env 파일 생성\n3. VITE_YOUTUBE_API_KEY=your_api_key 추가'
      )
      return
    }

    isLoadingTrailer.value = true

    try {
      const searchQuery = `${movie.value.fields.title} trailer 예고편`
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          trailerVideoId.value = data.items[0].id.videoId
          showTrailerModal.value = true
        } else {
          alert('죄송합니다. 해당 영화의 예고편을 찾을 수 없습니다.')
        }
      } else {
        const errorData = await response.json()
        console.error('YouTube API 에러:', errorData)
        alert(
          `YouTube API 오류가 발생했습니다: ${errorData.error?.message || '알 수 없는 오류'}`
        )
      }
    } catch (error) {
      console.error('예고편 검색 에러:', error)
      alert(
        '예고편을 불러오는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.'
      )
    } finally {
      isLoadingTrailer.value = false
    }
  }

  const closeTrailerModal = () => {
    showTrailerModal.value = false
    trailerVideoId.value = ''
  }

  // 키보드 이벤트 처리
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      if (showTrailerModal.value) {
        closeTrailerModal()
      } else if (isWritingReview.value) {
        cancelWritingReview()
      }
    }
  }

  const translateProviderType = (type) => {
    const typeMap = {
      flatrate: '스트리밍',
      rent: '대여',
      buy: '구매'
    }
    return typeMap[type] || type
  }

  const goToReviewerProfile = (review) => {
    const currentUserId = authStore.user?.id
    const reviewerId = review.user_profile?.id // 이제 바로 접근 가능

    if (reviewerId) {
      if (currentUserId && parseInt(reviewerId) === parseInt(currentUserId)) {
        router.push({ name: 'MyProfile' })
      } else {
        router.push({ name: 'UserProfile', params: { userId: reviewerId } })
      }
    }
  }

  // 모달이 열릴 때 키보드 이벤트 리스너 추가
  watch(showTrailerModal, (newValue) => {
    if (newValue) {
      document.addEventListener('keydown', handleKeydown)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      // 스크롤 복원
      document.body.style.overflow = ''
    }
  })

  watch(isWritingReview, (newValue) => {
    if (newValue) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  // 마운트 시 영화 로드
  onMounted(() => {
    loadMovie()
  })
</script>

<style scoped>
  .movie-detail-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', sans-serif;
    position: relative;
  }

  /* 백드롭 배경 */
  .movie-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
  }

  .backdrop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(12, 11, 10, 0.3) 0%,
      rgba(12, 11, 10, 0.7) 50%,
      rgba(12, 11, 10, 1) 100%
    );
  }

  .movie-detail-main {
    position: relative;
    z-index: 2;
    padding-top: 40vh;
  }

  .movie-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* 커스텀 헤더 */
  .movie-detail-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .movie-detail-header__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* 뒤로가기 버튼 */
  .movie-detail-header__back-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .movie-detail-header__back-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .back-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }

  /* 페이지 제목 */
  .movie-detail-header__title {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    text-align: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 우측 액션들 */
  .movie-detail-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .movie-detail-header__search-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .movie-detail-header__search-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .search-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }

  /* 검색 바 */
  .movie-detail-search-bar {
    background-color: var(--color-card-background);
    border-top: 1px solid var(--color-inactive-icon);
    padding: 16px 0;
  }

  .search-bar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: var(--color-search-box);
    border: 2px solid var(--border-color-focus);
    border-radius: var(--border-radius-medium);
    padding: 0 16px;
    gap: 12px;
    height: 44px;
  }

  .search-input-icon {
    width: 20px;
    height: 20px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: 15px;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .search-input::placeholder {
    color: var(--color-highlight-text);
  }

  .search-execute-btn,
  .search-cancel-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .search-execute-btn:hover {
    background-color: var(--color-main-opacity-20);
  }

  .search-cancel-btn:hover {
    background-color: var(--color-background-opacity-50);
  }

  .execute-icon {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  .cancel-icon {
    width: 18px;
    height: 18px;
    color: var(--color-inactive-text);
  }

  /* 검색 바 트랜지션 */
  .search-bar-enter-active,
  .search-bar-leave-active {
    transition: all 0.3s ease;
  }

  .search-bar-enter-from,
  .search-bar-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* 영화 히어로 섹션 */
  .movie-hero {
    display: flex;
    gap: 32px;
    margin-bottom: 40px;
    position: relative;
    z-index: 3;
  }

  .movie-poster {
    width: 300px;
    height: 450px;
    object-fit: cover;
    border-radius: var(--border-radius-large);
    flex-shrink: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .movie-info {
    flex: 1;
    min-width: 0;
  }

  .movie-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 8px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .movie-tagline {
    font-size: 18px;
    color: var(--color-main);
    font-style: italic;
    margin: 0 0 16px 0;
  }

  .movie-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .movie-date,
  .movie-runtime {
    font-size: 16px;
    color: var(--color-highlight-text);
    background-color: var(--color-card-background);
    padding: 4px 12px;
    border-radius: var(--border-radius-small);
  }

  .movie-status {
    font-size: 16px;
    background-color: var(--color-card-background);
    padding: 4px 12px;
    border-radius: var(--border-radius-small);
  }

  .movie-genres {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .genre-tag {
    font-size: 14px;
    color: var(--color-text);
    background-color: rgba(255, 183, 0, 0.15); /* 투명한 노란색 */
    padding: 6px 12px;
    border-radius: var(--border-radius-medium);
    font-weight: 500;
    backdrop-filter: blur(4px); /* 고급스러운 블러 효과 */
    transition: all 0.2s ease;
  }

  .genre-tag:hover {
    background-color: rgba(255, 183, 0, 0.25);
  }

  .movie-ratings {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-bottom: 24px;
  }

  .rating-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-icon {
    width: 20px;
    height: 20px;
    color: var(--color-main);
  }

  .rating-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
  }

  .popularity-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .popularity-label {
    font-size: 14px;
    color: var(--color-highlight-text);
  }

  .popularity-value {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  .movie-overview {
    margin-bottom: 32px;
  }

  .overview-text {
    font-size: 16px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  /* 섹션 제목 */
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 16px 0;
  }

  /* 출연진 섹션 */
  .movie-cast-section {
    margin-bottom: 40px;
  }

  .cast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .cast-card {
    background: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    border: 1px solid transparent;
  }

  .cast-card:hover {
    background-color: var(--color-highlight-background);
    border-color: var(--color-main-opacity-50);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .cast-card:hover .cast-photo {
    border-color: var(--color-main);
  }

  .cast-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .cast-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-card-background);
    border: none;
    cursor: pointer;
    padding: 12px;
    border-radius: var(--border-radius-medium);
    transition: background-color 0.2s;
    text-align: left;
  }

  .cast-item:hover {
    background-color: var(--color-highlight-background);
  }

  .cast-photo {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid var(--color-inactive-icon);
    transition: border-color 0.2s ease;
    background-color: var(--color-inactive-icon);
  }

  .cast-info {
    min-height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .cast-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .cast-character {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .cast-character.no-character {
    color: var(--color-inactive-text);
    font-style: italic;
  }

  .show-more-btn {
    background: none;
    border: 1px solid var(--color-inactive-icon);
    color: var(--color-text);
    padding: 12px 24px;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    transition:
      background-color 0.2s,
      border-color 0.2s;
    display: block;
    margin: 0 auto;
  }

  .show-more-btn:hover {
    background-color: var(--color-highlight-background);
    border-color: var(--color-highlight-text);
  }

  /* 추가 정보 */
  .movie-additional-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    margin-bottom: 40px;
  }

  .collection-info,
  .technical-info {
    background-color: var(--color-card-background);
    padding: 24px;
    border-radius: var(--border-radius-large);
  }

  /* 컬렉션 스타일링 */
  .collection-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .collection-poster {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--border-radius-medium);
    flex-shrink: 0;
  }

  .collection-details {
    flex: 1;
    min-width: 0;
  }

  .collection-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-main);
    margin: 0 0 8px 0;
  }

  .collection-overview {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.5;
    margin: 0;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: 14px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .info-value {
    font-size: 14px;
    color: var(--color-text);
  }

  /* 로딩 상태 */
  .movie-detail-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 40px;
  }

  .loading-content {
    text-align: center;
    max-width: 400px;
  }

  .loading-icon {
    width: 64px;
    height: 64px;
    color: var(--color-inactive-icon);
    margin-bottom: 24px;
  }

  .loading-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .loading-subtitle {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .loading-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .loading-btn {
    min-width: 120px;
  }

  /* 영화 상세 정보 */
  .movie-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .detail-item {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .detail-label {
    font-size: 16px;
    color: var(--color-highlight-text);
    font-weight: 500;
    min-width: 10px;
  }

  /* 예고편 버튼 */
  .trailer-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: var(--border-radius-medium);
    transition: background-color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .trailer-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .trailer-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .youtube-icon {
    width: 20px;
    height: 20px;
  }

  .trailer-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-highlight-text);
    font-size: 14px;
    padding: 6px 0;
  }

  .trailer-loading .loading-icon {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 예고편 모달 */
  .trailer-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  .trailer-modal {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .trailer-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .trailer-modal-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .trailer-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .trailer-modal-close:hover {
    background-color: var(--color-highlight-background);
  }

  .close-icon {
    width: 24px;
    height: 24px;
    color: var(--color-text);
  }

  .trailer-video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 비율 */
    height: 0;
  }

  .trailer-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* 모달 트랜지션 */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .trailer-modal,
  .modal-leave-to .trailer-modal {
    transform: scale(0.9) translateY(-20px);
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  .loading-icon.error {
    color: var(--color-alert);
  }

  /* 좋아요 버튼 */
  .like-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent !important; /* 모든 상태에서 투명 */
    border: 2px solid var(--color-inactive-icon);
    color: #fff; /* 숫자, 아이콘 모두 밝게 */
    padding: 8px 16px;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
    transition: all 0.2s;
  }

  .like-btn:hover {
    border-color: var(--color-main);
    /* 배경색 없음 */
  }

  .like-btn.liked {
    border-color: var(--color-alert);
    /* 배경색 없음 */
    color: #fff;
  }

  .like-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .like-icon {
    width: 18px;
    height: 18px;
    color: #fff; /* 아이콘도 밝게 */
    transition: color 0.2s;
  }

  .like-btn.liked .like-icon {
    color: #ff4b5c; /* 좋아요 눌렀을 때만 포인트 컬러 */
  }

  .like-count {
    font-weight: 500;
    min-width: 20px;
    text-align: center;
  }

  /* 별점 표시 */
  .stars-display {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .stars-display.small {
    transform: scale(0.8);
    transform-origin: left center;
  }

  .star-half {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    padding: 4px 2px;
    transition: transform 0.1s;
    filter: grayscale(100%);
    opacity: 0.4;
    position: relative;
    overflow: hidden;
    width: 16px; /* 별의 절반 너비 */
  }

  .star-half-left {
    clip-path: polygon(
      0% 0%,
      50% 0%,
      50% 100%,
      0% 100%
    ); /* 왼쪽 절반만 보이기 */
  }

  .star-half-right {
    clip-path: polygon(
      50% 0%,
      100% 0%,
      100% 100%,
      50% 100%
    ); /* 오른쪽 절반만 보이기 */
    margin-left: -16px; /* 왼쪽 반과 겹치게 */
  }

  .star-half:hover {
    transform: scale(1.05);
  }

  .star-half.active,
  .star-half.hovered {
    filter: none;
    opacity: 1;
    color: var(--color-main);
  }

  /* 전체 별 컨테이너 호버 효과 */
  .star-container:hover .star-half {
    transform: scale(1.05);
  }

  .star-item {
    font-size: 16px;
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

  /* 사용자 평점 */
  .user-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    padding: 8px 12px;
    border: 1px solid var(--color-main-opacity-20);
  }

  .user-rating .rating-icon {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  .user-rating .rating-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  .user-rating .rating-label {
    font-size: 14px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  /* OTT 시청 정보 */
  .movie-watch-providers {
    margin-bottom: 32px;
  }

  .watch-providers-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .watch-provider-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: var(--color-card-background);
    padding: 12px;
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
  }

  .provider-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: var(--border-radius-small);
    flex-shrink: 0;
  }

  .provider-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .provider-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .provider-type {
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  .provider-types {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .provider-type-tag {
    font-size: 11px;
    color: var(--color-text);
    background-color: rgba(255, 183, 0, 0.15); /* 투명한 노란색 */
    padding: 3px 8px;
    border-radius: var(--border-radius-small);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(4px); /* 고급스러운 블러 효과 */
  }

  .provider-price {
    font-size: 10px;
    color: var(--color-main);
    background-color: rgba(255, 183, 0, 0.2);
    padding: 1px 4px;
    border-radius: 2px;
    font-weight: 600;
  }

  /* 리뷰 섹션 */
  .movie-reviews-section {
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .write-review-btn {
    min-width: 120px;
  }

  /* 리뷰 작성 폼 */
  .review-form {
    background-color: var(--color-card-background);
    padding: 24px;
    border-radius: var(--border-radius-large);
    margin-bottom: 32px;
    border: 2px solid var(--color-main-opacity-50);
  }

  .review-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .review-form-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .form-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--color-highlight-text);
    transition: color 0.2s;
  }

  .form-close-btn:hover {
    color: var(--color-text);
  }

  /* 별점 입력 (새로운 스타일로 대체) */
  .rating-input {
    margin-bottom: 20px;
  }

  .rating-input-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .stars-rating {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }

  .star-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 28px;
    padding: 4px;
    transition: all 0.2s ease;
    filter: grayscale(100%);
    opacity: 0.3;
    transform-origin: center;
  }

  .star-button:hover {
    transform: scale(1.1);
  }

  .star-button.filled {
    filter: none;
    opacity: 1;
    color: var(--color-main);
  }

  .star-button.hovered {
    filter: none;
    opacity: 1;
    color: var(--color-main);
    transform: scale(1.1);
  }

  .rating-feedback {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rating-display {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-main);
  }

  .rating-text {
    font-size: 16px;
    color: var(--color-highlight-text);
    font-style: italic;
  }

  /* 리뷰 내용 입력 */
  .content-input {
    margin-bottom: 20px;
  }

  .content-input-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .content-textarea {
    width: 100%;
    background-color: var(--color-search-box);
    border: 2px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    padding: 12px 16px;
    color: var(--color-text);
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
    line-height: 1.5;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s;
  }

  .content-textarea:focus {
    outline: none;
    border-color: var(--color-main);
  }

  .content-textarea::placeholder {
    color: var(--color-highlight-text);
  }

  /* 폼 액션 버튼들 */
  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
  }

  .form-actions button {
    flex-shrink: 0;
    min-width: 80px;
  }

  .submit-btn {
    min-width: 64px;
    max-width: 100px;
    width: auto;
  }

  .delete-btn {
    min-width: 64px;
    max-width: 100px;
    width: auto;
    background-color: var(--color-alert);
    border-color: var(--color-alert);
  }

  .delete-btn:hover {
    background-color: var(--color-alert);
    opacity: 0.9;
  }

  .cancel-btn {
    min-width: 64px;
    max-width: 100px;
    width: auto;
  }

  /* 내 리뷰 표시 */
  .user-review {
    background-color: var(--color-highlight-background);
    padding: 20px;
    border-radius: var(--border-radius-large);
    margin-bottom: 32px;
    border-left: 4px solid var(--color-main);
    font-size: 16px;
  }

  .user-review .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .user-review .review-header h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-main);
    margin: 0;
  }

  .edit-review-btn {
    background: none;
    border: 1px solid var(--color-inactive-icon);
    color: var(--color-text);
    padding: 6px 12px;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .edit-review-btn:hover {
    border-color: var(--color-main);
    background-color: var(--color-main-opacity-20);
  }

  /* 다른 사용자 리뷰들 */
  .other-reviews {
    margin-top: 32px;
  }

  .other-reviews-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 20px 0;
  }

  .review-item {
    background-color: var(--color-card-background);
    padding: 20px;
    border-radius: var(--border-radius-large);
    margin-bottom: 16px;
    font-size: 16px;
  }

  .review-item .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .reviewer-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .reviewer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .reviewer-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .reviewer-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .review-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-text {
    font-size: 12px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .review-content {
    font-size: 16px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0 0 8px 0;
  }

  .review-date {
    font-size: 14px;
    color: var(--color-highlight-text);
  }

  /* 리뷰 없음 상태 */
  .no-reviews {
    text-align: center;
    padding: 40px 20px;
    color: var(--color-highlight-text);
  }

  .no-reviews-icon {
    width: 48px;
    height: 48px;
    color: var(--color-inactive-icon);
    margin-bottom: 16px;
  }

  .no-reviews h3 {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .no-reviews p {
    font-size: 14px;
    margin: 0;
  }

  .clickable-author {
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .clickable-author:hover {
    color: var(--color-main) !important;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .movie-detail-container {
      padding: 0 16px;
    }

    .movie-hero {
      flex-direction: column;
      gap: 24px;
      align-items: center;
    }

    .movie-poster {
      width: 250px;
      height: 375px;
    }

    .movie-title {
      font-size: 24px;
      text-align: center;
    }

    .movie-tagline {
      font-size: 16px;
      text-align: center;
    }

    .movie-meta {
      justify-content: center;
    }

    .movie-genres {
      justify-content: center;
    }

    .movie-ratings {
      justify-content: center;
    }

    .overview-text {
      text-align: center;
    }

    .cast-list {
      grid-template-columns: 1fr;
    }

    .movie-additional-info {
      grid-template-columns: 1fr;
    }

    .collection-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .collection-poster {
      width: 100px;
      height: 150px;
    }

    .trailer-modal {
      max-width: 95vw;
      margin: 10px;
    }

    .trailer-modal-header {
      padding: 16px 20px;
    }

    .trailer-modal-title {
      font-size: 18px;
    }

    .detail-item {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .detail-label {
      min-width: auto;
      font-size: 14px;
    }

    .trailer-btn {
      font-size: 14px;
      padding: 6px 12px;
    }

    .youtube-icon {
      width: 18px;
      height: 18px;
    }

    .reviews-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .write-review-btn {
      width: 100%;
    }

    .review-form {
      padding: 20px 16px;
    }

    .stars-input {
      justify-content: center;
    }

    .starts-container {
      position: relative;
      display: flex;
    }

    .form-actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
      justify-content: space-between;
    }

    .form-actions button {
      flex: 1;
      max-width: 120px;
    }

    .reviewer-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .review-item .review-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .watch-providers-list {
      grid-template-columns: 1fr;
    }

    .movie-ratings {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .like-btn {
      align-self: flex-start;
    }

    .cast-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }

    .cast-card {
      padding: 12px;
    }

    .cast-photo {
      width: 60px;
      height: 60px;
    }

    .cast-name {
      font-size: 13px;
    }

    .cast-character {
      font-size: 11px;
    }
  }

  @media (max-width: 480px) {
    .movie-detail-main {
      padding-top: 30vh;
    }

    .movie-poster {
      width: 200px;
      height: 300px;
    }

    .movie-title {
      font-size: 20px;
    }

    .loading-actions {
      flex-direction: column;
    }

    .loading-title {
      font-size: 20px;
    }

    .loading-subtitle {
      font-size: 14px;
    }

    .trailer-modal-overlay {
      padding: 10px;
    }

    .trailer-modal-header {
      padding: 12px 16px;
    }

    .trailer-modal-title {
      font-size: 16px;
    }

    .movie-reviews-section {
      margin-top: 32px;
    }

    .review-form {
      padding: 16px 12px;
    }

    .review-item {
      padding: 16px 12px;
    }

    .stars-input .star-btn {
      font-size: 20px;
      padding: 2px;
    }

    .rating-display {
      font-size: 14px;
    }

    .content-textarea {
      font-size: 14px;
      padding: 10px 12px;
    }

    .cast-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .cast-card {
      padding: 10px;
    }

    .cast-photo {
      width: 50px;
      height: 50px;
    }

    .cast-name {
      font-size: 12px;
    }

    .cast-character {
      font-size: 10px;
    }

    .form-actions {
      gap: 6px;
    }

    .form-actions button {
      font-size: 14px;
      padding: 8px 12px;
    }
  }

  .person-ratings .like-btn {
    background: transparent !important;
    border: 1px solid var(--color-inactive-icon);
    color: #fff;
    /* ...기타 동일... */
  }

  .person-ratings .like-btn:hover {
    border-color: var(--color-main);
    /* 배경 없음 */
  }

  .person-ratings .like-btn.liked {
    border-color: var(--color-alert);
    /* 배경 없음 */
    color: #fff;
  }

  .person-ratings .like-icon {
    color: #fff;
  }

  .person-ratings .like-btn.liked .like-icon {
    color: #ff4b5c;
  }
</style>
