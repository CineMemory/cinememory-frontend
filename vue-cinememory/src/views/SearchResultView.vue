<!-- 🔍 검색 결과 페이지 (헤더 추가) -->
<template>
  <div class="search-result-view">
    <!-- 페이지 헤더 (검색 아이콘 추가) -->
    <header class="search-result-header">
      <div class="search-result-header__container">
        <!-- 뒤로가기 버튼 -->
        <button
          @click="goBack"
          class="search-result-header__back-btn">
          <BaseIcon
            name="arrow-left"
            class="back-icon" />
        </button>

        <!-- 페이지 제목 -->
        <h1 class="search-result-header__title">{{ pageTitle }}</h1>

        <!-- 우측 액션들 -->
        <div class="search-result-header__actions">
          <!-- 검색 아이콘 -->
          <button
            @click="toggleSearchMode"
            class="search-result-header__search-btn">
            <BaseIcon
              name="search"
              class="search-icon" />
          </button>

          <!-- 햄버거 메뉴 -->
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
    <main class="search-result-main">
      <div class="search-result-container">
        <!-- 검색 결과가 있을 때 -->
        <div
          v-if="searchResults.length > 0"
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
              :key="movie.pk"
              @click="goToMovieDetail(movie.pk)"
              class="movie-item">
              <img
                :src="movie.fields.poster_path || ''"
                :alt="movie.fields.title"
                class="movie-poster"
                @error="handleImageError" />
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.fields.title }}</h3>
                <p class="movie-date">
                  {{ formatDate(movie.fields.release_date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 인물 결과 -->
          <div
            v-if="activeTab === 'people'"
            class="person-results">
            <div
              v-for="person in personResults"
              :key="person.pk"
              @click="goToPersonDetail(person.pk)"
              class="person-item">
              <img
                :src="person.fields.profile_path"
                :alt="person.fields.name"
                class="person-photo" />
              <div class="person-info">
                <h3 class="person-name">{{ person.fields.name }}</h3>
                <p class="person-department">
                  {{ translateDepartment(person.fields.known_for_department) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과가 없을 때 -->
        <div
          v-else
          class="no-results">
          <BaseIcon
            name="search"
            class="no-results-icon" />
          <h2 class="no-results-title">
            "{{ searchQuery }}"에 대한 검색 결과가 없습니다
          </h2>
          <p class="no-results-subtitle">다른 키워드로 검색해보세요</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // 더미 데이터 import (실제로는 API 호출)
  import moviesData from '@/data/movies_fixtures.json'
  import actorsData from '@/data/actors_fixtures.json'
  import directorsData from '@/data/directors_fixtures.json'

  const route = useRoute()
  const router = useRouter()

  // 상태
  const searchQuery = ref('')
  const searchResults = ref([])
  const activeTab = ref('movies')

  // 새로운 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 계산된 속성
  const pageTitle = computed(() => {
    return searchQuery.value ? `"${searchQuery.value}" 검색 결과` : '검색 결과'
  })

  const movieResults = computed(() =>
    searchResults.value.filter((item) => item.model === 'movies.movie')
  )

  const personResults = computed(() =>
    searchResults.value.filter(
      (item) =>
        item.model === 'movies.actor' || item.model === 'movies.director'
    )
  )

  // 검색 실행
  const performSearch = (query) => {
    if (!query) return []

    const results = []
    const lowerQuery = query.toLowerCase()

    // 영화 검색
    const movies = moviesData.filter((movie) =>
      movie.fields.title.toLowerCase().includes(lowerQuery)
    )
    results.push(...movies)

    // 배우 검색
    const actors = actorsData.filter((actor) =>
      actor.fields.name.toLowerCase().includes(lowerQuery)
    )
    results.push(...actors)

    // 감독 검색
    const directors = directorsData.filter((director) =>
      director.fields.name.toLowerCase().includes(lowerQuery)
    )
    results.push(...directors)

    return results
  }

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.getFullYear()
  }

  // 직업 번역
  const translateDepartment = (department) => {
    const departmentMap = {
      Acting: '배우',
      Directing: '감독',
      Writing: '각본가',
      Production: '제작자',
      Camera: '촬영감독',
      Editing: '편집자',
      Sound: '음향감독',
      Art: '미술감독',
      'Costume & Make-Up': '의상/분장',
      'Visual Effects': '시각효과',
      Crew: '스태프'
    }
    return departmentMap[department] || department
  }

  // 네비게이션
  const goToMovieDetail = (movieId) => {
    console.log('🎬 영화 상세로 이동:', movieId)
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }

  const goToPersonDetail = (personId) => {
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

    console.log('🔍 새로운 검색 실행:', query)

    // 새로운 검색어로 페이지 이동
    router.push({
      name: 'SearchResult',
      query: { q: query }
    })

    exitSearchMode()
  }

  const handleSearchBlur = () => {
    // 약간의 딜레이를 줘서 버튼 클릭할 시간 확보
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

  // 마운트 시 검색 실행
  onMounted(() => {
    searchQuery.value = route.query.q || ''
    if (searchQuery.value) {
      searchResults.value = performSearch(searchQuery.value)

      // 결과에 따라 활성 탭 설정
      if (movieResults.value.length === 0 && personResults.value.length > 0) {
        activeTab.value = 'people'
      }
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

  .movie-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .movie-item:hover {
    background-color: var(--color-highlight-background);
  }

  .movie-poster {
    width: 60px;
    height: 90px;
    object-fit: cover;
    border-radius: var(--border-radius-small);
    flex-shrink: 0;
    background-color: var(--color-card-background);
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
  }

  .movie-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .movie-date {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 인물 결과 */
  .person-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .person-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .person-item:hover {
    background-color: var(--color-highlight-background);
  }

  .person-photo {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .person-info {
    flex: 1;
    min-width: 0;
  }

  .person-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .person-department {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
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
  }
</style>
