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
          {{ person?.fields?.name || '인물 상세' }}
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

    <!-- 메인 콘텐츠 -->
    <main
      v-if="person"
      class="person-detail-main">
      <div class="person-detail-container">
        <!-- 인물 히어로 섹션 -->
        <div class="person-hero">
          <img
            :src="person.fields.profile_path"
            :alt="person.fields.name"
            class="person-photo" />

          <div class="person-info">
            <h1 class="person-name">{{ person.fields.name }}</h1>
            <p class="person-department">
              {{ translateDepartment(person.fields.known_for_department) }}
            </p>

            <!-- 기본 정보 -->
            <div class="person-details">
              <div
                v-if="person.fields.birthday"
                class="detail-item">
                <span class="detail-label">생년월일</span>
                <span class="detail-value">
                  {{ formatDate(person.fields.birthday) }}
                  <span v-if="age > 0">({{ age }}세)</span>
                </span>
              </div>

              <div
                v-if="person.fields.deathday"
                class="detail-item">
                <span class="detail-label">사망일</span>
                <span class="detail-value">{{
                  formatDate(person.fields.deathday)
                }}</span>
              </div>

              <!-- 인스타그램 링크 -->
              <div
                v-if="person.fields.instagram_id"
                class="detail-item">
                <span class="detail-label">인스타그램</span>
                <a
                  :href="`https://instagram.com/${person.fields.instagram_id}`"
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
                  @{{ person.fields.instagram_id }}
                </a>
              </div>
            </div>

            <!-- 경력 소개 -->
            <div
              v-if="person.fields.biography"
              class="person-biography">
              <h3 class="section-title">소개</h3>
              <p class="biography-text">{{ person.fields.biography }}</p>
            </div>
          </div>
        </div>

        <!-- 영화 출연 작품 (배우로서) -->
        <div
          v-if="movieCreditsAsCast.length > 0"
          class="person-filmography">
          <h2 class="section-title">
            출연 작품 ({{ movieCreditsAsCast.length }}편)
          </h2>
          <div class="movies-grid">
            <div
              v-for="movie in displayedMovieCreditsAsCast"
              :key="`cast-${movie.movie_id}`"
              @click="goToMovieDetail(movie.movie_id)"
              class="movie-card">
              <div class="movie-year">
                {{ new Date(movie.release_date).getFullYear() }}
              </div>
              <h3 class="movie-title">{{ movie.title }}</h3>
              <p
                v-if="movie.character"
                class="movie-character">
                {{ movie.character }}
              </p>
              <div
                v-if="movie.popularity"
                class="movie-popularity">
                인기도: {{ movie.popularity.toFixed(1) }}
              </div>
            </div>
          </div>

          <button
            v-if="movieCreditsAsCast.length > 10 && !showAllCastMovies"
            @click="showAllCastMovies = true"
            class="show-more-btn">
            {{ movieCreditsAsCast.length - 10 }}편 더 보기
          </button>
        </div>

        <!-- 영화 제작 참여 작품 (스태프로서) -->
        <div
          v-if="movieCreditsAsCrew.length > 0"
          class="person-filmography">
          <h2 class="section-title">
            제작 참여 작품 ({{ movieCreditsAsCrew.length }}편)
          </h2>
          <div class="movies-grid">
            <div
              v-for="movie in displayedMovieCreditsAsCrew"
              :key="`crew-${movie.movie_id}-${movie.job}`"
              @click="goToMovieDetail(movie.movie_id)"
              class="movie-card">
              <div class="movie-year">
                {{ new Date(movie.release_date).getFullYear() }}
              </div>
              <h3 class="movie-title">{{ movie.title }}</h3>
              <p class="movie-job">{{ translateJob(movie.job) }}</p>
              <p
                v-if="movie.department"
                class="movie-department">
                {{ translateDepartment(movie.department) }}
              </p>
              <div
                v-if="movie.popularity"
                class="movie-popularity">
                인기도: {{ movie.popularity.toFixed(1) }}
              </div>
            </div>
          </div>

          <button
            v-if="movieCreditsAsCrew.length > 10 && !showAllCrewMovies"
            @click="showAllCrewMovies = true"
            class="show-more-btn">
            {{ movieCreditsAsCrew.length - 10 }}편 더 보기
          </button>
        </div>

        <!-- TV 출연 작품 -->
        <div
          v-if="tvCredits.length > 0"
          class="person-filmography">
          <h2 class="section-title">TV 출연 작품 ({{ tvCredits.length }}편)</h2>
          <div class="movies-grid">
            <div
              v-for="show in displayedTvCredits"
              :key="`tv-${show.show_id}`"
              class="movie-card tv-card">
              <div class="movie-year">
                {{ new Date(show.first_air_date).getFullYear() }}
              </div>
              <h3 class="movie-title">{{ show.name }}</h3>
              <p
                v-if="show.character"
                class="movie-character">
                {{ show.character }}
              </p>
              <div
                v-if="show.popularity"
                class="movie-popularity">
                인기도: {{ show.popularity.toFixed(1) }}
              </div>
            </div>
          </div>

          <button
            v-if="tvCredits.length > 10 && !showAllTvShows"
            @click="showAllTvShows = true"
            class="show-more-btn">
            {{ tvCredits.length - 10 }}편 더 보기
          </button>
        </div>
      </div>
    </main>

    <!-- 로딩 또는 에러 상태 -->
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
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import HeaderMenu from '@/components/layout/HeaderMenu.vue'

  // 더미 데이터 import
  import actorsData from '@/data/actors_fixtures.json'
  import directorsData from '@/data/directors_fixtures.json'

  const route = useRoute()
  const router = useRouter()

  // 상태
  const person = ref(null)
  const showAllCastMovies = ref(false)
  const showAllCrewMovies = ref(false)
  const showAllTvShows = ref(false)

  // 검색 관련 상태
  const isSearchMode = ref(false)
  const newSearchQuery = ref('')
  const searchInput = ref(null)

  // 계산된 속성
  const age = computed(() => {
    if (!person.value?.fields?.birthday) return 0

    const birthDate = new Date(person.value.fields.birthday)
    const today = new Date()
    const deathDate = person.value.fields.deathday
      ? new Date(person.value.fields.deathday)
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

  const movieCreditsAsCast = computed(() => {
    if (!person.value?.fields?.movie_credits_cast) return []
    return person.value.fields.movie_credits_cast.sort(
      (a, b) => new Date(b.release_date) - new Date(a.release_date)
    )
  })

  const movieCreditsAsCrew = computed(() => {
    if (!person.value?.fields?.movie_credits_crew) return []
    return person.value.fields.movie_credits_crew.sort(
      (a, b) => new Date(b.release_date) - new Date(a.release_date)
    )
  })

  const tvCredits = computed(() => {
    if (!person.value?.fields?.tv_credits) return []
    return person.value.fields.tv_credits.sort(
      (a, b) => new Date(b.first_air_date) - new Date(a.first_air_date)
    )
  })

  const displayedMovieCreditsAsCast = computed(() => {
    return showAllCastMovies.value
      ? movieCreditsAsCast.value
      : movieCreditsAsCast.value.slice(0, 10)
  })

  const displayedMovieCreditsAsCrew = computed(() => {
    return showAllCrewMovies.value
      ? movieCreditsAsCrew.value
      : movieCreditsAsCrew.value.slice(0, 10)
  })

  const displayedTvCredits = computed(() => {
    return showAllTvShows.value ? tvCredits.value : tvCredits.value.slice(0, 10)
  })

  // 유틸리티 함수들
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const translateDepartment = (department) => {
    const departmentMap = {
      Acting: '배우',
      Directing: '감독',
      Writing: '각본',
      Production: '제작',
      Camera: '촬영',
      Editing: '편집',
      Sound: '음향',
      Art: '미술',
      'Costume & Make-Up': '의상/분장',
      'Visual Effects': '시각효과',
      Crew: '스태프'
    }
    return departmentMap[department] || department
  }

  const translateJob = (job) => {
    const jobMap = {
      Director: '감독',
      Producer: '제작자',
      'Executive Producer': '총제작자',
      Screenplay: '각본',
      Writer: '작가',
      Story: '원작',
      'Director of Photography': '촬영감독',
      'Camera Operator': '카메라맨',
      Editor: '편집자',
      Music: '음악',
      'Original Music Composer': '음악감독',
      Sound: '음향',
      'Production Design': '프로덕션 디자인',
      'Art Direction': '아트 디렉터',
      'Set Decoration': '세트 장식',
      'Costume Design': '의상 디자인',
      'Makeup Artist': '메이크업 아티스트',
      'Visual Effects': '시각효과',
      'Special Effects': '특수효과'
    }
    return jobMap[job] || job
  }

  // 네비게이션
  const goToMovieDetail = (movieId) => {
    router.push({ name: 'MovieDetail', params: { id: movieId } })
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

  // 인물 데이터 로드
  const loadPerson = () => {
    const personId = parseInt(route.params.id)

    // 배우 데이터에서 찾기
    let foundPerson = actorsData.find((actor) => actor.pk === personId)

    // 감독 데이터에서 찾기
    if (!foundPerson) {
      foundPerson = directorsData.find((director) => director.pk === personId)
    }

    if (foundPerson) {
      person.value = foundPerson
      console.log('✅ 인물 로드 성공:', foundPerson.fields.name)
    } else {
      console.error('❌ 인물을 찾을 수 없습니다:', personId)
      person.value = null
    }
  }

  // 마운트 시 인물 로드
  onMounted(() => {
    loadPerson()
  })
</script>

<style scoped>
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
