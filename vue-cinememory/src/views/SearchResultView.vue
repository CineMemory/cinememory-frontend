<template>
  <div class="search-result-container">
    <!-- 🔙 헤더 (뒤로가기 + 검색 정보) -->
    <div class="search-header">
      <div class="search-header-content">
        <button
          @click="goBack"
          class="back-button">
          <span class="back-icon">←</span>
        </button>

        <div class="search-title-section">
          <h1 class="search-title">
            검색 결과: "<span class="search-query">{{ searchQuery }}</span
            >"
          </h1>
          <div
            class="search-info"
            v-if="!isLoading && searchResults">
            총 {{ searchResults.total_results }}개의 결과
          </div>
        </div>
      </div>
    </div>

    <!-- 📱 메인 컨텐츠 컨테이너 -->
    <div class="main-content">
      <!-- ⏳ 로딩 상태 -->
      <div
        v-if="isLoading"
        class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">검색 중...</p>
      </div>

      <!-- ❌ 에러 상태 -->
      <div
        v-else-if="hasError"
        class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">검색 중 오류가 발생했습니다</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button
          class="retry-button"
          @click="performSearch">
          다시 시도
        </button>
      </div>

      <!-- 🎬 검색 결과 -->
      <div
        v-else-if="searchResults && searchResults.results.length > 0"
        class="results-container">
        <!-- 결과 카테고리 탭 -->
        <div class="result-tabs">
          <button
            v-for="tab in availableTabs"
            :key="tab.key"
            :class="['tab-button', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key">
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>

        <!-- 결과 리스트 -->
        <div class="results-list">
          <SearchResultCard
            v-for="item in filteredResults"
            :key="`${item.media_type}-${item.id}`"
            :item="item"
            @click="handleResultClick" />
        </div>
      </div>

      <!-- 📭 검색 결과 없음 -->
      <div
        v-else-if="searchResults && searchResults.results.length === 0"
        class="no-results">
        <div class="no-results-icon">🔍</div>
        <h2 class="no-results-title">
          "{{ searchQuery }}"에 대한 검색 결과가 없습니다
        </h2>
        <p class="no-results-suggestion">다른 검색어를 시도해보세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import dummySearchService from '@/services/dummySearch'
  import SearchResultCard from '@/components/movie/SearchResultCard.vue'

  // 라우터 설정
  const route = useRoute()
  const router = useRouter()

  // 반응형 데이터
  const searchQuery = ref('')
  const searchResults = ref(null)
  const isLoading = ref(false)
  const hasError = ref(false)
  const errorMessage = ref('')
  const activeTab = ref('all')

  // URL에서 검색어 가져오기
  const getSearchQueryFromRoute = () => {
    return route.query.q || route.params.query || ''
  }

  // 검색 실행
  const performSearch = async () => {
    const query = getSearchQueryFromRoute()

    if (!query) {
      router.push('/')
      return
    }

    searchQuery.value = query
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''

    try {
      console.log('🔍 검색 시작:', query)

      // 더미 검색 실행
      const result = await dummySearchService.searchMulti(query)

      console.log('✅ 검색 결과:', result)
      searchResults.value = result
    } catch (error) {
      console.error('❌ 검색 실패:', error)
      hasError.value = true
      errorMessage.value =
        '검색 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    } finally {
      isLoading.value = false
    }
  }

  // 사용 가능한 탭들 계산
  const availableTabs = computed(() => {
    if (!searchResults.value) return []

    const results = searchResults.value.results
    const tabs = [{ key: 'all', label: '전체', count: results.length }]

    const movieCount = results.filter(
      (item) => item.media_type === 'movie'
    ).length
    const personCount = results.filter(
      (item) => item.media_type === 'person'
    ).length
    const tvCount = results.filter((item) => item.media_type === 'tv').length

    if (movieCount > 0)
      tabs.push({ key: 'movie', label: '영화', count: movieCount })
    if (personCount > 0)
      tabs.push({ key: 'person', label: '인물', count: personCount })
    if (tvCount > 0) tabs.push({ key: 'tv', label: 'TV', count: tvCount })

    return tabs
  })

  // 필터링된 결과
  const filteredResults = computed(() => {
    if (!searchResults.value) return []

    const results = searchResults.value.results

    if (activeTab.value === 'all') return results
    return results.filter((item) => item.media_type === activeTab.value)
  })

  // 검색 결과 클릭 핸들러
  const handleResultClick = (item) => {
    console.log('검색 결과 클릭:', item)
    // 나중에 상세 페이지로 이동 구현
  }

  // 뒤로가기 핸들러
  const goBack = () => {
    // 브라우저 히스토리가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push('/')
    }
  }

  // 라우트 변경 감지
  watch(
    () => route.query.q,
    () => {
      performSearch()
    }
  )

  // 컴포넌트 마운트 시 검색 실행
  onMounted(() => {
    performSearch()
  })
</script>

<style scoped>
  .search-result-container {
    min-height: 100vh;
    background-color: var(--color-background);
    color: var(--color-text);
  }

  /* 🔙 헤더 스타일 */
  .search-header {
    background-color: var(--color-card-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(8px);
  }

  .search-header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    padding: 0.75rem;
    border-radius: var(--border-radius-medium);
    transition: all 0.2s;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
  }

  .back-button:hover {
    background-color: var(--color-search-box);
    color: var(--color-main);
  }

  .back-icon {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .search-title-section {
    flex: 1;
  }

  .search-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .search-query {
    color: var(--color-main);
  }

  .search-info {
    color: var(--color-highlight-text);
    font-size: 0.9rem;
  }

  /* 📱 메인 컨텐츠 */
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* 로딩 스타일 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 0;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid var(--color-inactive-icon);
    border-top: 3px solid var(--color-main);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: var(--color-highlight-text);
    font-size: 1.1rem;
  }

  /* 에러 스타일 */
  .error-container {
    text-align: center;
    padding: 4rem 0;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    color: var(--color-alert);
    margin-bottom: 1rem;
  }

  .error-message {
    color: var(--color-highlight-text);
    margin-bottom: 2rem;
  }

  .retry-button {
    background-color: var(--color-main);
    color: var(--color-background);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-weight: bold;
    transition: opacity 0.2s;
  }

  .retry-button:hover {
    opacity: 0.8;
  }

  /* 탭 스타일 */
  .result-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--color-inactive-icon);
    overflow-x: auto;
    padding-bottom: 0;
  }

  .tab-button {
    background: none;
    border: none;
    color: var(--color-highlight-text);
    padding: 1rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
    font-size: 0.9rem;
  }

  .tab-button.active {
    color: var(--color-main);
    border-bottom-color: var(--color-main);
  }

  .tab-button:hover {
    color: var(--color-text);
  }

  /* 결과 리스트 */
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* 검색 결과 없음 */
  .no-results {
    text-align: center;
    padding: 4rem 0;
  }

  .no-results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-results-title {
    color: var(--color-text);
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  .no-results-suggestion {
    color: var(--color-highlight-text);
  }

  /* 📱 반응형 */
  @media (max-width: 768px) {
    .search-header-content {
      padding: 0 1rem;
      gap: 1rem;
    }

    .main-content {
      padding: 1.5rem 1rem;
    }

    .search-title {
      font-size: 1.2rem;
    }

    .back-button {
      width: 40px;
      height: 40px;
      padding: 0.5rem;
    }

    .back-icon {
      font-size: 1.3rem;
    }

    .result-tabs {
      gap: 0.5rem;
    }

    .tab-button {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    .search-header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .back-button {
      align-self: flex-start;
    }

    .search-title {
      font-size: 1.1rem;
    }
  }
</style>
