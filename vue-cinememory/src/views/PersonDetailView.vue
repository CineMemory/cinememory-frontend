<!-- 👤 인물 상세 페이지 (완전 구현) -->
<template>
  <div class="person-detail-view">
    <!-- 커스텀 헤더 (검색 기능 포함) -->
    <header class="person-detail-header">
      <div class="person-detail-header__container">
        <!-- 뒤로가기 버튼 -->
        <button
          @click="goBack"
          class="person-detail-header__back-btn">
          <BaseIcon
            name="arrow-left"
            class="back-icon" />
        </button>

        <!-- 페이지 제목 -->
        <h1 class="person-detail-header__title">
          {{ person?.name || '인물 상세' }}
        </h1>

        <!-- 우측 액션들 -->
        <div class="person-detail-header__actions">
          <!-- 검색 아이콘 -->
          <button
            @click="toggleSearchMode"
            class="person-detail-header__search-btn">
            <BaseIcon
              name="search"
              class="search-icon" />
          </button>

          <!-- 햄버거 메뉴 -->
          <HeaderMenu class="person-detail-header__menu" />
        </div>
      </div>

      <!-- 검색 모드 -->
      <Transition name="search-bar">
        <div
          v-if="isSearchMode"
          class="person-detail-search-bar">
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
            <!-- 검색 실행 버튼 -->
            <button
              v-if="newSearchQuery.trim()"
              @click="performNewSearch"
              class="search-execute-btn">
              <BaseIcon
                name="search"
                class="execute-icon" />
            </button>
            <!-- 취소 버튼 -->
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
      class="person-detail-loading">
      <div class="loading-content">
        <BaseIcon
          name="user"
          class="loading-icon spinning" />
        <h2 class="loading-title">인물 정보를 불러오는 중...</h2>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="person-detail-loading">
      <div class="loading-content">
        <BaseIcon
          :name="
            error.includes('추가되지 않았습니다') ? 'info' : 'alert-circle'
          "
          class="loading-icon"
          :class="error.includes('추가되지 않았습니다') ? 'info' : 'error'" />
        <h2 class="loading-title">
          {{
            error.includes('추가되지 않았습니다')
              ? '정보 준비 중'
              : '오류가 발생했습니다'
          }}
        </h2>
        <p class="loading-subtitle">{{ error }}</p>
        <div class="loading-actions">
          <BaseButton
            @click="loadPerson"
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
      v-else-if="person"
      class="person-detail-main">
      <div class="person-detail-container">
        <!-- 인물 히어로 섹션 -->
        <div class="person-hero">
          <img
            :src="`https://image.tmdb.org/t/p/w500${person.profile_path}`"
            :alt="person.name"
            class="person-photo" />

          <div class="person-info">
            <h1 class="person-name">{{ person.name }}</h1>
            <p class="person-department">
              {{ translateDepartment(person.role) }}
            </p>

            <!-- 좋아요 버튼 -->
            <div class="person-ratings-bar">
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
              <div
                class="person-rating-info"
                v-if="person.average_rating">
                <span class="rating-value">{{
                  person.average_rating.toFixed(1)
                }}</span>
                <span class="rating-label"
                  >사용자 ({{ person.review_count }})</span
                >
              </div>
            </div>

            <!-- 통계 정보 추가 -->
            <div class="person-stats">
              <div class="stat-item">
                <span class="stat-label">출연작</span>
                <span class="stat-value">{{ movieCredits.length }}편</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">좋아요</span>
                <span class="stat-value">{{ likeCount }}</span>
              </div>
              <div
                v-if="person.review_count"
                class="stat-item">
                <span class="stat-label">리뷰</span>
                <span class="stat-value">{{ person.review_count }}</span>
              </div>
            </div>

            <!-- 기본 정보 -->
            <div class="person-details">
              <div
                v-if="person.birth_date"
                class="detail-item">
                <span class="detail-label">생년월일</span>
                <span class="detail-value">
                  {{ formatDate(person.birth_date) }}
                  <span v-if="age > 0">({{ age }}세)</span>
                </span>
              </div>

              <div
                v-if="person.death_date"
                class="detail-item">
                <span class="detail-label">사망일</span>
                <span class="detail-value">{{
                  formatDate(person.death_date)
                }}</span>
              </div>

              <!-- 인스타그램 링크 -->
              <div
                v-if="person.instagram_username"
                class="detail-item">
                <span class="detail-label">인스타그램</span>
                <a
                  :href="`https://instagram.com/${person.instagram_username}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="instagram-link">
                  <svg
                    class="instagram-icon"
                    viewBox="0 0 24 24">
                    <defs>
                      <linearGradient
                        id="instagram-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%">
                        <stop
                          offset="0%"
                          style="stop-color: #405de6" />
                        <stop
                          offset="25%"
                          style="stop-color: #5851db" />
                        <stop
                          offset="50%"
                          style="stop-color: #833ab4" />
                        <stop
                          offset="75%"
                          style="stop-color: #c13584" />
                        <stop
                          offset="100%"
                          style="stop-color: #e1306c" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#instagram-gradient)"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @{{ person.instagram_username }}
                </a>
              </div>
            </div>

            <!-- 경력 소개 -->
            <div
              v-if="person.biography"
              class="person-biography">
              <h3 class="section-title">소개</h3>
              <p class="biography-text">{{ person.biography }}</p>
            </div>
          </div>
        </div>

        <!-- 영화 출연 작품 -->
        <div
          v-if="movieCredits.length > 0"
          class="person-filmography">
          <h2 class="section-title">출연 작품 ({{ movieCredits.length }}편)</h2>
          <div class="movies-grid">
            <div
              v-for="movieCredit in displayedMovieCredits"
              :key="`movie-${movieCredit.movie?.id || movieCredit.id}`"
              @click="goToMovieDetail(movieCredit.movie?.id || movieCredit.id)"
              class="movie-card">
              <div class="movie-year">
                {{
                  new Date(
                    movieCredit.movie?.release_date || movieCredit.release_date
                  ).getFullYear()
                }}
              </div>
              <h3 class="movie-title">
                {{ movieCredit.movie?.title || movieCredit.title }}
              </h3>
              <p
                v-if="movieCredit.character_name"
                class="movie-character">
                {{ movieCredit.character_name }}
              </p>
              <div
                v-if="movieCredit.movie?.popularity || movieCredit.popularity"
                class="movie-popularity">
                인기도:
                {{
                  (
                    movieCredit.movie?.popularity || movieCredit.popularity
                  ).toFixed(1)
                }}
              </div>
            </div>
          </div>

          <button
            v-if="movieCredits.length > 10 && !showAllCastMovies"
            @click="showAllCastMovies = true"
            class="show-more-btn">
            {{ movieCredits.length - 10 }}편 더 보기
          </button>
        </div>

        <!-- 리뷰 섹션 (간단히) -->
        <div
          v-if="person.reviews && person.reviews.length > 0"
          class="person-reviews-section">
          <h2 class="section-title">최근 리뷰</h2>
          <div
            v-for="review in person.reviews.slice(0, 3)"
            :key="review.id"
            class="review-item">
            <div class="review-header">
              <span class="reviewer-name">{{ review.user }}</span>
              <div class="review-rating">
                <span class="rating-text">{{ review.rating }}점</span>
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 데이터 없음 상태 -->
    <div
      v-else
      class="person-detail-loading">
      <div class="loading-content">
        <BaseIcon
          name="user"
          class="loading-icon" />
        <h2 class="loading-title">인물을 찾을 수 없습니다</h2>
        <p class="loading-subtitle">
          요청하신 인물이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <div class="loading-actions">
          <BaseButton
            @click="goBack"
            variant="secondary"
            class="loading-btn">
            이전으로 돌아가기
          </BaseButton>
          <BaseButton
            @click="goHome"
            variant="primary"
            class="loading-btn">
            홈으로 가기
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // Django API 함수 import (더미데이터 제거)
  import { getPersonDetail, togglePersonLike } from '@/services/api'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // 상태
  const person = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const showAllCastMovies = ref(false)
  const showAllCrewMovies = ref(false)

  // 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 좋아요 관련 상태
  const isLiked = ref(false)
  const likeCount = ref(0)
  const isTogglingLike = ref(false)

  // 계산된 속성
  const age = computed(() => {
    if (!person.value?.birth_date) return 0

    const birthDate = new Date(person.value.birth_date)
    const today = new Date()
    const deathDate = person.value.death_date
      ? new Date(person.value.death_date)
      : today

    let age = deathDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = deathDate.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  })

  // 영화 출연작 (Django API 구조에 맞게)
  const movieCredits = computed(() => {
    if (!person.value?.movies) return []

    // 중복 제거: movie_id 기준으로 중복을 제거하고, character_name이 있는 것을 우선
    const uniqueMovies = person.value.movies.reduce((acc, current) => {
      const movieId = current.movie?.id || current.id
      const existing = acc.find(
        (item) => (item.movie?.id || item.id) === movieId
      )

      if (!existing) {
        // 새로운 영화면 추가
        acc.push(current)
      } else if (current.character_name && !existing.character_name) {
        // 기존 항목에 character_name이 없고 현재 항목에 있다면 교체
        const index = acc.findIndex(
          (item) => (item.movie?.id || item.id) === movieId
        )
        acc[index] = current
      }

      return acc
    }, [])

    // 개봉일 순으로 정렬
    return uniqueMovies.sort(
      (a, b) =>
        new Date(b.movie?.release_date || b.release_date) -
        new Date(a.movie?.release_date || a.release_date)
    )
  })

  const displayedMovieCredits = computed(() => {
    return showAllCastMovies.value
      ? movieCredits.value
      : movieCredits.value.slice(0, 10)
  })

  // 유틸리티 함수들
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const translateDepartment = (role) => {
    const roleMap = {
      Actor: '배우',
      Acting: '배우',
      Director: '감독',
      Directing: '감독',
      Writer: '각본가',
      Writing: '각본가',
      Producer: '제작자',
      Production: '제작자',
      Camera: '촬영',
      Editing: '편집',
      Sound: '음향',
      Art: '미술',
      'Costume & Make-Up': '의상/분장',
      'Visual Effects': '시각효과',
      Crew: '스태프'
    }
    return roleMap[role] || role
  }

  // 네비게이션
  const goToMovieDetail = (movieId) => {
    // Django API에서는 movie.id 또는 직접 movieId 사용
    const id = movieId || movie?.id
    router.push({ name: 'MovieDetail', params: { id } })
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

  // 좋아요 토글
  const toggleLike = async () => {
    if (!authStore.isAuthenticated) {
      // authStore.openLoginModal('login') // 일단 주석 처리
      alert('로그인이 필요합니다.') // 임시로 alert 사용
      return
    }

    if (isTogglingLike.value) return

    isTogglingLike.value = true
    try {
      const result = await togglePersonLike(person.value.id) // 올바른 함수 사용
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

  // 인물 데이터 로드 (Django API 사용)
  const loadPerson = async () => {
    const personId = parseInt(route.params.id)
    isLoading.value = true
    error.value = null

    try {
      const personData = await getPersonDetail(personId)
      person.value = personData

      // 좋아요 상태 설정
      isLiked.value = personData.is_liked || false
      likeCount.value = personData.like_count || 0
    } catch (err) {
      if (err.response?.status === 404) {
        error.value =
          '아직 해당 인물의 상세 정보가 추가되지 않았습니다. 곧 업데이트될 예정입니다.'
      } else {
        error.value =
          err.response?.data?.error ||
          '인물 정보를 불러오는 중 오류가 발생했습니다.'
      }
    } finally {
      isLoading.value = false
    }
  }

  // 마운트 시 인물 로드
  onMounted(() => {
    loadPerson()
  })
</script>

<style scoped>
  .person-ratings-bar .like-btn,
  .like-btn {
    background: transparent !important;
    border: 1.5px solid var(--color-inactive-icon);
    color: #fff !important;
    padding: 8px 16px;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
    transition: all 0.2s;
    box-shadow: none;
  }

  .person-ratings-bar .like-btn:hover,
  .like-btn:hover {
    border-color: var(--color-main);
    background: transparent !important;
  }

  .person-ratings-bar .like-btn.liked,
  .like-btn.liked {
    border-color: var(--color-alert);
    background: transparent !important;
    color: #fff !important;
  }

  .person-ratings-bar .like-icon,
  .like-btn .like-icon {
    color: #fff !important;
    transition: color 0.2s;
  }

  .person-ratings-bar .like-btn.liked .like-icon,
  .like-btn.liked .like-icon {
    color: #ff4b5c !important;
  }

  .person-ratings-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .person-rating-info {
    font-size: 16px;
    color: var(--color-highlight-text);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rating-value {
    font-weight: 700;
    color: var(--color-main);
  }

  .person-ratings {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .person-ratings .like-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    color: var(--color-text);
    padding: 8px 16px;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 80px;
    justify-content: center;
  }

  .person-ratings .like-btn:hover {
    border-color: var(--color-main);
    background-color: var(--color-main-opacity-20);
  }

  .person-ratings .like-btn:hover .like-icon {
    color: var(--color-main);
  }

  .person-ratings .like-btn.liked {
    border-color: var(--color-alert);
    background-color: var(--color-alert);
    color: var(--color-text);
  }

  .person-ratings .like-btn.liked .like-icon {
    color: var(--color-text);
  }

  .person-ratings .like-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .person-ratings .like-icon {
    width: 16px;
    height: 16px;
    color: var(--color-inactive-icon);
    transition: color 0.2s ease;
  }

  .person-ratings .like-count {
    font-weight: 600;
    font-size: 14px;
  }

  .person-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    padding: 16px 0;
    border-top: 1px solid var(--color-inactive-icon);
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .stat-value {
    font-size: 18px;
    color: var(--color-text);
    font-weight: 600;
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .person-stats {
      gap: 16px;
    }

    .stat-value {
      font-size: 16px;
    }
  }
  .person-detail-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .person-detail-main {
    padding: 24px 0;
  }

  .person-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* 인물 히어로 섹션 */
  .person-hero {
    display: flex;
    gap: 32px;
    margin-bottom: 40px;
  }

  .person-photo {
    width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .person-info {
    flex: 1;
    min-width: 0;
  }

  .person-name {
    font-size: 36px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .person-department {
    font-size: 20px;
    color: var(--color-main);
    margin: 0 0 24px 0;
    font-weight: 600;
  }

  .person-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
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
    min-width: 100px;
  }

  .detail-value {
    font-size: 16px;
    color: var(--color-text);
  }

  /* 인스타그램 링크 */
  .instagram-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: var(--border-radius-medium);
    transition: background-color 0.2s;
  }

  .instagram-link:hover {
    background-color: var(--color-highlight-background);
  }

  .instagram-icon {
    width: 20px;
    height: 20px;
  }

  /* 경력 소개 */
  .person-biography {
    margin-bottom: 32px;
  }

  .biography-text {
    font-size: 16px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  /* 섹션 제목 */
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 24px 0;
  }

  /* 필모그래피 섹션 */
  .person-filmography {
    margin-bottom: 40px;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .movie-card {
    padding: 20px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid var(--color-inactive-icon);
  }

  .movie-card:hover {
    background-color: var(--color-highlight-background);
  }

  .tv-card {
    border-left: 4px solid var(--color-main);
  }

  .movie-year {
    font-size: 14px;
    color: var(--color-main);
    font-weight: 600;
    margin-bottom: 8px;
  }

  .movie-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .movie-character,
  .movie-job,
  .movie-department {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0 0 4px 0;
  }

  .movie-job {
    color: var(--color-main);
    font-weight: 500;
  }

  .movie-popularity {
    font-size: 12px;
    color: var(--color-inactive-text);
    margin-top: 8px;
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

  /* 로딩 상태 */
  .person-detail-loading {
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

  .loading-icon.info {
    color: var(--color-main);
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

  /* 반응형 */
  @media (max-width: 768px) {
    .person-detail-container {
      padding: 0 16px;
    }

    .person-hero {
      flex-direction: column;
      gap: 24px;
      align-items: center;
    }

    .person-photo {
      width: 200px;
      height: 200px;
    }

    .person-name {
      font-size: 24px;
      text-align: center;
    }

    .person-department {
      font-size: 16px;
      text-align: center;
    }

    .movies-grid {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 20px;
    }
  }

  @media (max-width: 480px) {
    .person-detail-main {
      padding: 16px 0;
    }

    .person-photo {
      width: 150px;
      height: 150px;
    }

    .person-name {
      font-size: 20px;
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

    .detail-value {
      font-size: 14px;
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
  }

  .person-detail-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
  }
  .person-detail-header__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .person-detail-header__back-btn {
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
  .person-detail-header__back-btn:hover {
    background-color: var(--color-highlight-background);
  }
  .back-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }
  .person-detail-header__title {
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
  .person-detail-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .person-detail-header__search-btn {
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
  .person-detail-header__search-btn:hover {
    background-color: var(--color-highlight-background);
  }
  .search-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }
  .person-detail-search-bar {
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
  .search-bar-enter-active,
  .search-bar-leave-active {
    transition: all 0.3s ease;
  }
  .search-bar-enter-from,
  .search-bar-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
