<!-- 🎬 영화 상세 페이지 (완전 구현) -->
<template>
  <div class="movie-detail-view">
    <!-- 커스텀 헤더 (검색 기능 포함) -->
    <header class="movie-detail-header">
      <div class="movie-detail-header__container">
        <!-- 뒤로가기 버튼 -->
        <button
          @click="goBack"
          class="movie-detail-header__back-btn">
          <BaseIcon
            name="arrow-left"
            class="back-icon" />
        </button>

        <!-- 페이지 제목 -->
        <h1 class="movie-detail-header__title">
          {{ movie?.fields?.title || '영화 상세' }}
        </h1>

        <!-- 우측 액션들 -->
        <div class="movie-detail-header__actions">
          <!-- 검색 아이콘 -->
          <button
            @click="toggleSearchMode"
            class="movie-detail-header__search-btn">
            <BaseIcon
              name="search"
              class="search-icon" />
          </button>

          <!-- 햄버거 메뉴 -->
          <HeaderMenu class="movie-detail-header__menu" />
        </div>
      </div>

      <!-- 검색 모드 -->
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

    <!-- 메인 콘텐츠 -->
    <main
      v-if="movie"
      class="movie-detail-main">
      <!-- 백드롭 배경 -->
      <div
        v-if="movie.fields.backdrop_path"
        class="movie-backdrop"
        :style="{ backgroundImage: `url(${movie.fields.backdrop_path})` }">
        <div class="backdrop-overlay"></div>
      </div>

      <div class="movie-detail-container">
        <!-- 영화 히어로 섹션 -->
        <div class="movie-hero">
          <img
            :src="movie.fields.poster_path"
            :alt="movie.fields.title"
            class="movie-poster" />

          <div class="movie-info">
            <h1 class="movie-title">{{ movie.fields.title }}</h1>

            <!-- 태그라인 -->
            <p
              v-if="movie.fields.tagline"
              class="movie-tagline">
              "{{ movie.fields.tagline }}"
            </p>

            <!-- 기본 정보 -->
            <div class="movie-meta">
              <span class="movie-date">{{
                formatDate(movie.fields.release_date)
              }}</span>
              <span
                v-if="movie.fields.runtime"
                class="movie-runtime"
                >{{ formatRuntime(movie.fields.runtime) }}</span
              >
              <span
                v-if="movie.fields.status"
                class="movie-status"
                >{{ translateStatus(movie.fields.status) }}</span
              >
            </div>

            <!-- 장르 -->
            <div
              v-if="movie.fields.genres && movie.fields.genres.length > 0"
              class="movie-genres">
              <span
                v-for="genre in movie.fields.genres"
                :key="genre"
                class="genre-tag"
                >{{ genre }}</span
              >
            </div>

            <!-- 평점 및 인기도 -->
            <div class="movie-ratings">
              <div
                v-if="movie.fields.voteAverage"
                class="rating-item">
                <BaseIcon
                  name="star"
                  class="rating-icon" />
                <span class="rating-value">{{
                  movie.fields.voteAverage.toFixed(1)
                }}</span>
              </div>
              <div
                v-if="movie.fields.popularity"
                class="popularity-item">
                <span class="popularity-label">인기도</span>
                <span class="popularity-value">{{
                  movie.fields.popularity.toFixed(1)
                }}</span>
              </div>
            </div>

            <!-- 줄거리 -->
            <div
              v-if="movie.fields.overview"
              class="movie-overview">
              <h3 class="section-title">줄거리</h3>
              <p class="overview-text">{{ movie.fields.overview }}</p>
            </div>
          </div>
        </div>

        <!-- 출연진 섹션 -->
        <div
          v-if="
            movie.fields.credits_cast && movie.fields.credits_cast.length > 0
          "
          class="movie-cast-section">
          <h2 class="section-title">출연진</h2>
          <div class="cast-list">
            <button
              v-for="actor in displayedActors"
              :key="actor.actor_id"
              @click="goToPersonDetail(actor.actor_id)"
              class="cast-item">
              <img
                :src="actor.profile_path"
                :alt="actor.name"
                class="cast-photo" />
              <div class="cast-info">
                <span class="cast-name">{{ actor.name }}</span>
                <span
                  v-if="actor.character"
                  class="cast-character"
                  >{{ actor.character }}</span
                >
              </div>
            </button>
          </div>
          <button
            v-if="movie.fields.credits_cast.length > 6 && !showAllActors"
            @click="showAllActors = true"
            class="show-more-btn">
            {{ movie.fields.credits_cast.length - 6 }}명 더 보기
          </button>
        </div>

        <!-- 추가 정보 -->
        <div class="movie-additional-info">
          <div
            v-if="collectionInfo"
            class="collection-info">
            <h3 class="section-title">컬렉션</h3>
            <div class="collection-content">
              <img
                v-if="collectionInfo.poster_path"
                :src="collectionInfo.poster_path"
                :alt="collectionInfo.name"
                class="collection-poster" />
              <div class="collection-details">
                <h4 class="collection-name">{{ collectionInfo.name }}</h4>
                <p
                  v-if="collectionInfo.overview"
                  class="collection-overview">
                  {{ collectionInfo.overview }}
                </p>
              </div>
            </div>
          </div>

          <div class="technical-info">
            <h3 class="section-title">상세 정보</h3>
            <div class="info-grid">
              <div
                v-if="movie.fields.isAdult !== undefined"
                class="info-item">
                <span class="info-label">연령 등급</span>
                <span class="info-value">{{
                  movie.fields.isAdult ? '성인' : '전체 관람가'
                }}</span>
              </div>
              <div
                v-if="movie.fields.isVideo !== undefined"
                class="info-item">
                <span class="info-label">비디오</span>
                <span class="info-value">{{
                  movie.fields.isVideo ? '예' : '아니요'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 로딩 또는 에러 상태 -->
    <div
      v-else
      class="movie-detail-loading">
      <div class="loading-content">
        <BaseIcon
          name="search"
          class="loading-icon" />
        <h2 class="loading-title">영화를 찾을 수 없습니다</h2>
        <p class="loading-subtitle">
          요청하신 영화가 존재하지 않거나 삭제되었을 수 있습니다.
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
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // 더미 데이터 import
  import moviesData from '@/data/movies_fixtures.json'

  const route = useRoute()
  const router = useRouter()

  // 상태
  const movie = ref(null)
  const showAllActors = ref(false)

  // 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 계산된 속성
  const displayedActors = computed(() => {
    if (!movie.value?.fields?.credits_cast) return []

    return showAllActors.value
      ? movie.value.fields.credits_cast
      : movie.value.fields.credits_cast.slice(0, 6)
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

  // 네비게이션
  const goToPersonDetail = (personId) => {
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

    console.log('🔍 새로운 검색 실행:', query)

    // 검색 결과 페이지로 이동
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
  const loadMovie = () => {
    const movieId = parseInt(route.params.id)
    const foundMovie = moviesData.find((m) => m.pk === movieId)

    if (foundMovie) {
      movie.value = foundMovie
      console.log('✅ 영화 로드 성공:', foundMovie.fields.title)
    } else {
      console.error('❌ 영화를 찾을 수 없습니다:', movieId)
      movie.value = null
    }
  }

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
  .movie-runtime,
  .movie-status {
    font-size: 16px;
    color: var(--color-highlight-text);
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
    background-color: var(--color-main);
    padding: 6px 12px;
    border-radius: var(--border-radius-medium);
    font-weight: 500;
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
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cast-info {
    flex: 1;
    min-width: 0;
  }

  .cast-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .cast-character {
    display: block;
    font-size: 12px;
    color: var(--color-highlight-text);
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
  }
</style>
