<template>
  <div class="search-result-view">
    <!-- 페이지 헤더 (기존과 동일) -->
    <header class="search-result-header">
      <div class="search-result-header__container">
        <button
          @click="goBack"
          class="search-result-header__back-btn">
          <BaseIcon
            name="arrow-left"
            class="back-icon" />
        </button>

        <h1 class="search-result-header__title">{{ pageTitle }}</h1>

        <div class="search-result-header__actions">
          <button
            @click="toggleSearchMode"
            class="search-result-header__search-btn">
            <BaseIcon
              name="search"
              class="search-icon" />
          </button>
          <HeaderMenu class="search-result-header__menu" />
        </div>
      </div>

      <!-- 검색 모드 -->
      <Transition name="search-bar">
        <div
          v-if="isSearchMode"
          class="search-result-search-bar">
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <BaseIcon
                name="search"
                class="search-input-icon" />
              <input
                ref="searchInput"
                v-model="newSearchQuery"
                type="text"
                placeholder="새로운 검색어를 입력하세요"
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

    <!-- 메인 콘텐츠 -->
    <main class="search-result-main">
      <div class="search-result-container">
        <!-- 로딩 상태 -->
        <div
          v-if="isLoading"
          class="loading-state">
          <BaseIcon
            name="search"
            class="loading-icon spinning" />
          <h2 class="loading-title">검색 중...</h2>
          <p class="loading-subtitle">
            "{{ searchQuery }}"를 검색하고 있습니다
          </p>
        </div>

        <!-- 에러 상태 -->
        <div
          v-else-if="error"
          class="error-state">
          <BaseIcon
            name="alert-circle"
            class="error-icon" />
          <h2 class="error-title">검색 중 오류가 발생했습니다</h2>
          <p class="error-subtitle">{{ error }}</p>
          <button
            @click="performSearch(searchQuery)"
            class="retry-btn">
            다시 시도
          </button>
        </div>

        <!-- 검색 결과가 있을 때 -->
        <div
          v-else-if="totalResults > 0"
          class="search-results">
          <!-- 탭 네비게이션 -->
          <div class="result-tabs">
            <button
              @click="activeTab = 'movies'"
              :class="[
                'result-tab',
                { 'result-tab--active': activeTab === 'movies' }
              ]">
              영화 ({{ movieResults.length }})
            </button>
            <button
              @click="activeTab = 'people'"
              :class="[
                'result-tab',
                { 'result-tab--active': activeTab === 'people' }
              ]">
              인물 ({{ personResults.length }})
            </button>
          </div>

          <!-- 영화 결과 -->
          <div
            v-if="activeTab === 'movies'"
            class="movie-results">
            <div
              v-for="movie in movieResults"
              :key="movie.movie_id"
              @click="goToMovieDetail(movie.movie_id)"
              class="movie-item">
              <img
                :src="movie.poster_path"
                :alt="movie.title"
                class="movie-poster"
                @error="handleImageError" />
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.title }}</h3>
                <p class="movie-date">{{ formatDate(movie.release_date) }}</p>
                <div class="movie-meta">
                  <span
                    v-if="movie.vote_average"
                    class="movie-rating">
                    ⭐ {{ movie.vote_average.toFixed(1) }}
                  </span>
                  <span
                    v-if="movie.runtime"
                    class="movie-runtime">
                    {{ movie.runtime }}분
                  </span>
                </div>
                <p
                  v-if="movie.overview"
                  class="movie-overview">
                  {{ movie.overview.slice(0, 100)
                  }}{{ movie.overview.length > 100 ? '...' : '' }}
                </p>
                <!-- 장르 표시 -->
                <div
                  v-if="movie.genres && movie.genres.length > 0"
                  class="movie-genres">
                  <span
                    v-for="genre in movie.genres.slice(0, 3)"
                    :key="genre.genre_id"
                    class="genre-tag">
                    {{ genre.genre_name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 인물 결과 -->
          <div
            v-if="activeTab === 'people'"
            class="person-results">
            <!-- 배우들 -->
            <div
              v-for="actor in searchResults.actors"
              :key="`actor-${actor.actor_id}`"
              @click="goToPersonDetail(actor.actor_id, true)"
              class="person-item">
              <img
                :src="actor.profile_path"
                :alt="actor.name"
                class="person-photo"
                @error="handlePersonImageError" />
              <div class="person-info">
                <h3 class="person-name">{{ actor.name }}</h3>
                <p class="person-role">{{ translateRole(actor.role) }}</p>
                <span class="person-type">배우</span>
              </div>
            </div>

            <!-- 감독들 -->
            <div
              v-for="director in searchResults.directors"
              :key="`director-${director.director_id}`"
              @click="goToPersonDetail(director.director_id, false)"
              class="person-item">
              <img
                :src="director.profile_path"
                :alt="director.name"
                class="person-photo"
                @error="handlePersonImageError" />
              <div class="person-info">
                <h3 class="person-name">{{ director.name }}</h3>
                <p class="person-role">{{ translateRole(director.role) }}</p>
                <span class="person-type">감독</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과가 없을 때 -->
        <div
          v-else-if="!isLoading && searchQuery"
          class="no-results">
          <BaseIcon
            name="search"
            class="no-results-icon" />
          <h2 class="no-results-title">
            "{{ searchQuery }}"에 대한 검색 결과가 없습니다
          </h2>
          <p class="no-results-subtitle">다른 키워드로 검색해보세요</p>
          <div class="search-suggestions">
            <p class="suggestions-title">검색 팁:</p>
            <ul class="suggestions-list">
              <li>영화 제목의 일부만 입력해보세요</li>
              <li>배우나 감독의 이름을 검색해보세요</li>
              <li>맞춤법을 확인해보세요</li>
            </ul>
          </div>
        </div>

        <!-- 초기 상태 (검색어 없음) -->
        <div
          v-else-if="!searchQuery"
          class="initial-state">
          <BaseIcon
            name="search"
            class="initial-icon" />
          <h2 class="initial-title">검색어를 입력해주세요</h2>
          <p class="initial-subtitle">원하는 영화나 인물을 검색해보세요</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // Django API 함수 import
  import { searchMovies } from '@/services/api'

  const route = useRoute()
  const router = useRouter()

  // 상태
  const searchQuery = ref('')
  const searchResults = ref({
    movies: [],
    actors: [],
    directors: []
  })
  const activeTab = ref('movies')
  const isLoading = ref(false)
  const error = ref(null)

  // 새로운 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 계산된 속성
  const pageTitle = computed(() => {
    return searchQuery.value ? `"${searchQuery.value}" 검색 결과` : '검색 결과'
  })

  const movieResults = computed(() => searchResults.value.movies || [])
  const personResults = computed(() => [
    ...(searchResults.value.actors || []),
    ...(searchResults.value.directors || [])
  ])

  const totalResults = computed(
    () => movieResults.value.length + personResults.value.length
  )

  // Django API를 통한 검색 실행
  const performSearch = async (query) => {
    if (!query?.trim()) return

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Django API 검색 시작:', query)
      const response = await searchMovies(query)

      // Django API 응답 구조 그대로 사용
      searchResults.value = {
        movies: response.movies || [],
        actors: response.actors || [],
        directors: response.directors || []
      }

      // 결과에 따라 활성 탭 자동 설정
      if (movieResults.value.length === 0 && personResults.value.length > 0) {
        activeTab.value = 'people'
      } else {
        activeTab.value = 'movies'
      }
    } catch (err) {
      // 🔧 404 에러인 경우 (검색 결과 없음) 오류가 아닌 빈 결과로 처리
      if (err.response?.status === 404) {
        searchResults.value = { movies: [], actors: [], directors: [] }
        error.value = null // 에러 상태를 null로 설정
      } else {
        // 실제 서버 에러인 경우만 에러로 처리
        error.value =
          err.response?.data?.error || '검색 중 오류가 발생했습니다.'
        searchResults.value = { movies: [], actors: [], directors: [] }
      }
    } finally {
      isLoading.value = false
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.getFullYear()
  }

  // 직업 번역 (Django API의 role 필드 기준)
  const translateRole = (role) => {
    const roleMap = {
      Acting: '배우',
      Directing: '감독',
      Writing: '각본가',
      Production: '제작자'
    }
    return roleMap[role] || role || '인물'
  }

  // 네비게이션
  const goToMovieDetail = (movieId) => {
    console.log('🎬 영화 상세로 이동:', movieId)
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }

  const goToPersonDetail = (personId, isActor = true) => {
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

  // 이미지 에러 처리
  const handleImageError = (event) => {
    event.target.style.backgroundColor = 'var(--color-inactive-icon)'
    event.target.style.display = 'flex'
    event.target.style.alignItems = 'center'
    event.target.style.justifyContent = 'center'
    event.target.innerHTML = '🎬'
    event.target.style.fontSize = '24px'
  }

  const handlePersonImageError = (event) => {
    event.target.style.backgroundColor = 'var(--color-inactive-icon)'
    event.target.style.display = 'flex'
    event.target.style.alignItems = 'center'
    event.target.style.justifyContent = 'center'
    event.target.innerHTML = '👤'
    event.target.style.fontSize = '24px'
  }

  // URL 쿼리 변경 감지
  watch(
    () => route.query.q,
    (newQuery) => {
      if (newQuery && newQuery !== searchQuery.value) {
        searchQuery.value = newQuery
        performSearch(newQuery)
      }
    }
  )

  // 마운트 시 검색 실행
  onMounted(() => {
    searchQuery.value = route.query.q || ''
    if (searchQuery.value) {
      performSearch(searchQuery.value)
    }
  })
</script>

<style scoped>
  .search-result-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .search-result-main {
    padding: 24px 0;
    margin-top: 80px; /* 헤더 높이만큼 마진 추가 */
  }

  .search-result-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* 커스텀 헤더 */
  .search-result-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .search-result-header__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* 뒤로가기 버튼 */
  .search-result-header__back-btn {
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

  .search-result-header__back-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .back-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }

  /* 페이지 제목 */
  .search-result-header__title {
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
  .search-result-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .search-result-header__search-btn {
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

  .search-result-header__search-btn:hover {
    background-color: var(--color-highlight-background);
  }

  .search-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text);
  }

  /* 검색 바 */
  .search-result-search-bar {
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

  /* 탭 네비게이션 */
  .result-tabs {
    display: flex;
    border-bottom: 1px solid var(--color-inactive-icon);
    margin-bottom: 24px;
  }

  .result-tab {
    background: none;
    border: none;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-highlight-text);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition:
      color 0.2s,
      border-color 0.2s;
  }

  .result-tab:hover {
    color: var(--color-text);
  }

  .result-tab--active {
    color: var(--color-main);
    border-bottom-color: var(--color-main);
  }

  /* 영화 결과 */
  .movie-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  /* 중복 제거 및 통합: .movie-item */
  .movie-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }
  .movie-item:hover {
    background-color: var(--color-highlight-background);
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  /* 중복 제거 및 통합: .movie-poster */
  .movie-poster {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--border-radius-medium);
    flex-shrink: 0;
    background-color: var(--color-inactive-icon);
  }

  .movie-poster[src=''],
  .movie-poster:not([src]) {
    background-color: var(--color-inactive-icon);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .movie-poster[src='']:after,
  .movie-poster:not([src]):after {
    content: '🎬';
    font-size: 24px;
  }

  .movie-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .movie-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
  }

  .movie-date {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .movie-meta {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .movie-rating {
    font-size: 13px;
    color: var(--color-main);
    font-weight: 500;
  }

  .movie-runtime {
    font-size: 13px;
    color: var(--color-highlight-text);
  }

  .movie-overview {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.5;
    margin: 0;
    opacity: 0.9;
  }

  .movie-genres {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .genre-tag {
    font-size: 12px;
    color: var(--color-text);
    background-color: var(--color-main-opacity-20);
    padding: 4px 8px;
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-main-opacity-50);
  }

  /* 인물 결과 */
  .person-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  /* 중복 제거 및 통합: .person-item */
  .person-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }
  .person-item:hover {
    background-color: var(--color-highlight-background);
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  /* 중복 제거 및 통합: .person-photo */
  .person-photo {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: var(--color-inactive-icon);
  }

  .person-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
  }

  .person-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
  }

  .person-role {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .person-type {
    font-size: 12px;
    color: var(--color-main);
    background-color: var(--color-main-opacity-20);
    padding: 3px 8px;
    border-radius: var(--border-radius-small);
    align-self: flex-start;
    font-weight: 500;
  }

  /* 검색 결과 없음 */
  .no-results {
    text-align: center;
    padding: 80px 20px;
  }

  .no-results-icon {
    width: 64px;
    height: 64px;
    color: var(--color-inactive-icon);
    margin-bottom: 24px;
  }

  .no-results-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .no-results-subtitle {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 로딩 상태 */
  .loading-state {
    text-align: center;
    padding: 80px 20px;
  }

  .loading-icon {
    width: 48px;
    height: 48px;
    color: var(--color-main);
    margin-bottom: 20px;
  }

  .spinning {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .loading-subtitle {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 에러 상태 */
  .error-state {
    text-align: center;
    padding: 80px 20px;
  }

  .error-icon {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
    margin-bottom: 20px;
  }

  .error-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .error-subtitle {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0 0 20px 0;
  }

  .retry-btn {
    background-color: var(--color-main);
    color: var(--color-text);
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
    transition: opacity 0.2s;
  }

  .retry-btn:hover {
    opacity: 0.9;
  }

  /* 초기 상태 */
  .initial-state {
    text-align: center;
    padding: 80px 20px;
  }

  .initial-icon {
    width: 64px;
    height: 64px;
    color: var(--color-inactive-icon);
    margin-bottom: 20px;
  }

  .initial-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .initial-subtitle {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 검색 제안 */
  .search-suggestions {
    max-width: 400px;
    margin: 32px auto 0;
    text-align: left;
    background-color: var(--color-card-background);
    padding: 20px;
    border-radius: var(--border-radius-large);
  }

  .suggestions-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .suggestions-list {
    margin: 0;
    padding-left: 16px;
    list-style: none;
  }

  .suggestions-list li {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin-bottom: 8px;
    position: relative;
    line-height: 1.4;
  }

  .suggestions-list li:before {
    content: '•';
    color: var(--color-main);
    position: absolute;
    left: -12px;
  }

  .suggestions-list li:last-child {
    margin-bottom: 0;
  }

  /* 탭 스타일 개선 */
  .result-tab {
    background: none;
    border: none;
    padding: 14px 20px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-highlight-text);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .result-tab:hover {
    color: var(--color-text);
    background-color: var(--color-highlight-background);
  }

  .result-tab--active {
    color: var(--color-main);
    border-bottom-color: var(--color-main);
    background-color: var(--color-main-opacity-20);
  }

  /* 결과 그리드 개선 */
  .movie-results,
  .person-results {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .search-result-container,
    .search-result-header__container,
    .search-bar-container {
      padding: 0 16px;
    }

    .search-result-header__container {
      padding: 12px 16px;
    }

    .search-result-header__title {
      font-size: 16px;
    }

    .movie-results,
    .person-results {
      grid-template-columns: 1fr;
    }

    .result-tab {
      font-size: 14px;
      padding: 10px 12px;
    }

    .no-results-title {
      font-size: 20px;
    }

    .no-results-subtitle {
      font-size: 14px;
    }

    .search-result-main {
      margin-top: 70px;
    }

    .movie-item,
    .person-item {
      padding: 16px;
      gap: 12px;
    }

    .movie-poster {
      width: 60px;
      height: 90px;
    }

    .person-photo {
      width: 60px;
      height: 60px;
    }

    .movie-title,
    .person-name {
      font-size: 16px;
    }

    .movie-overview {
      font-size: 13px;
    }

    .movie-meta {
      gap: 12px;
    }

    .search-suggestions {
      margin: 24px auto 0;
      padding: 16px;
    }

    .loading-state,
    .error-state,
    .initial-state {
      padding: 60px 20px;
    }

    .loading-icon,
    .error-icon {
      width: 40px;
      height: 40px;
    }

    .initial-icon {
      width: 48px;
      height: 48px;
    }
  }

  @media (max-width: 480px) {
    .search-result-main {
      padding: 16px 0;
      margin-top: 65px;
    }

    .search-result-header__container {
      gap: 8px;
    }

    .search-result-header__actions {
      gap: 4px;
    }

    .search-input {
      font-size: 14px;
    }

    .search-input-wrapper {
      height: 40px;
    }

    .no-results {
      padding: 60px 16px;
    }

    .no-results-icon {
      width: 48px;
      height: 48px;
    }

    .movie-item,
    .person-item {
      padding: 12px;
      gap: 10px;
    }

    .movie-poster {
      width: 50px;
      height: 75px;
    }

    .person-photo {
      width: 50px;
      height: 50px;
    }

    .movie-title,
    .person-name {
      font-size: 15px;
    }

    .movie-date,
    .person-role {
      font-size: 13px;
    }

    .movie-overview {
      font-size: 12px;
    }

    .genre-tag,
    .person-type {
      font-size: 11px;
      padding: 3px 6px;
    }

    .result-tab {
      padding: 12px 16px;
      font-size: 14px;
    }

    .loading-state,
    .error-state,
    .initial-state {
      padding: 40px 16px;
    }

    .loading-title,
    .error-title {
      font-size: 18px;
    }

    .initial-title {
      font-size: 20px;
    }
  }
</style>
