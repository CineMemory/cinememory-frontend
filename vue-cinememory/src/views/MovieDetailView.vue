<template>
  <div class="movie-detail-container">
    <!-- 🎨 배경 이미지 히어로 섹션 (모바일에서는 숨김) -->
    <div v-if="movieData?.backdrop_path" class="hero-section">
      <div class="hero-background">
        <img 
          :srcset="getBackdropSrcset(movieData.backdrop_path)"
          sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1920px"
          :src="getBackdropUrl(movieData.backdrop_path, 'w1280')"
          :alt="movieData.title"
          class="hero-image"
        >
        <div class="hero-overlay"></div>
        <div class="hero-blur-bottom"></div>
      </div>
    </div>

    <!-- 🔙 헤더 (뒤로가기) -->
    <div class="detail-header" :class="{ 'with-hero': movieData?.backdrop_path }">
      <div class="detail-header-content">
        <button @click="goBack" class="back-button">
          <span class="back-icon">←</span>
        </button>
        <h1 class="page-title">영화 정보</h1>
      </div>
    </div>

    <!-- 📱 메인 컨텐츠 -->
    <div class="main-content">
      <!-- ⏳ 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">영화 정보를 불러오는 중...</p>
      </div>

      <!-- ❌ 에러 상태 -->
      <div v-else-if="hasError" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">영화 정보를 불러올 수 없습니다</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button class="retry-button" @click="loadMovieData">다시 시도</button>
      </div>

      <!-- 🎬 영화 정보 -->
      <div v-else-if="movieData" class="movie-info">
        <!-- 기본 정보 섹션 -->
        <div class="movie-basic-info">
          <div class="poster-section">
            <div class="poster-image-container">
              <img 
                v-if="movieData.poster_path" 
                :srcset="getPosterSrcset(movieData.poster_path)"
                sizes="(max-width: 768px) 200px, 280px"
                :src="getPosterUrl(movieData.poster_path, 'w500')"
                :alt="movieData.title"
                class="poster-image"
                @error="handleImageError"
              >
              <div v-else class="poster-placeholder">
                🎬
              </div>
            </div>
          </div>

          <div class="info-section">
            <h1 class="movie-title">{{ movieData.title }}</h1>
            
            <!-- 태그라인 -->
            <p v-if="movieData.tagline" class="movie-tagline">{{ movieData.tagline }}</p>
            
            <div class="movie-meta">
              <!-- 평점 -->
              <div v-if="movieData.voteAverage" class="meta-item rating-item">
                <span class="meta-label">평점</span>
                <div class="rating-display">
                  <div class="stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= Math.round(movieData.voteAverage / 2) }">
                      ⭐
                    </span>
                  </div>
                  <span class="rating-score">{{ movieData.voteAverage.toFixed(1) }}/10</span>
                </div>
              </div>

              <!-- 개봉일 -->
              <div v-if="movieData.release_date" class="meta-item">
                <span class="meta-label">개봉일</span>
                <span class="meta-value">
                  {{ formatDate(movieData.release_date) }}
                  <span v-if="releaseYear" class="year">({{ releaseYear }}년)</span>
                </span>
              </div>

              <!-- 상영시간 -->
              <div v-if="movieData.runtime" class="meta-item">
                <span class="meta-label">상영시간</span>
                <span class="meta-value">{{ formatRuntime(movieData.runtime) }}</span>
              </div>

              <!-- 장르 -->
              <div v-if="movieData.genres && movieData.genres.length > 0" class="meta-item">
                <span class="meta-label">장르</span>
                <div class="genres-container">
                  <span 
                    v-for="genre in movieData.genres" 
                    :key="genre"
                    class="genre-tag"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>

              <!-- 개봉 상태 -->
              <div v-if="movieData.status" class="meta-item">
                <span class="meta-label">상태</span>
                <span class="meta-value status" :class="movieData.status.toLowerCase()">
                  {{ translateStatus(movieData.status) }}
                </span>
              </div>

              <!-- 인기도 -->
              <div v-if="movieData.popularity" class="meta-item">
                <span class="meta-label">인기도</span>
                <span class="meta-value">{{ movieData.popularity.toFixed(1) }}</span>
              </div>
              
              <!-- 감독 -->
              <div v-if="movieData.directors && movieData.directors.length > 0" class="meta-item">
                <span class="meta-label">감독</span>
                <div class="meta-value">
                  <span 
                    v-for="(director, index) in movieData.directors" 
                    :key="director.id"
                    class="director-name"
                    @click="goToPerson(director.id)"
                  >
                    {{ director.name }}{{ index < movieData.directors.length - 1 ? ', ' : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 줄거리 -->
            <div v-if="movieData.overview" class="overview-section">
              <h3 class="section-title">줄거리</h3>
              <p class="overview-text">{{ movieData.overview }}</p>
            </div>
          </div>
        </div>

        <!-- 출연 배우 섹션 -->
        <div v-if="movieData.actors && movieData.actors.length > 0" class="cast-section">
          <h3 class="section-title">
            출연 배우 ({{ movieData.actors.length }}명)
          </h3>
          
          <div class="cast-grid">
            <div 
              v-for="actor in displayedActors" 
              :key="actor.id"
              class="cast-item"
              @click="goToPerson(actor.id)"
            >
              <div class="actor-image-container">
                <img 
                  v-if="actor.profile_path" 
                  :srcset="getProfileSrcset(actor.profile_path)"
                  sizes="(max-width: 768px) 120px, 140px"
                  :src="getProfileUrl(actor.profile_path, 'w185')"
                  :alt="actor.name"
                  class="actor-image"
                  @error="handleActorImageError"
                >
                <div v-else class="actor-placeholder">
                  🎭
                </div>
              </div>
              <div class="actor-info">
                <div class="actor-name">{{ actor.name }}</div>
                <div v-if="actor.character" class="actor-character">{{ actor.character }}</div>
                <div v-if="actor.birthday" class="actor-age">
                  {{ calculateAge(actor.birthday) }}세
                </div>
              </div>
            </div>
          </div>
          
          <!-- 배우 더보기/접기 버튼 -->
          <div v-if="movieData.actors.length > 8" class="more-cast">
            <button @click="toggleCast" class="more-button">
              <span v-if="!showAllCast">
                + {{ movieData.actors.length - 8 }}명 더 보기
              </span>
              <span v-else>
                ↑ 접기
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 📭 데이터 없음 -->
      <div v-else class="no-data">
        <div class="no-data-icon">🎬</div>
        <h2 class="no-data-title">영화 정보를 찾을 수 없습니다</h2>
        <p class="no-data-message">요청하신 영화의 정보가 존재하지 않습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dummySearchService from '@/services/dummySearch'

const route = useRoute()
const router = useRouter()

// 반응형 데이터
const movieData = ref(null)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// 더보기 상태 관리
const showAllCast = ref(false)

// 개봉 연도 계산
const releaseYear = computed(() => {
  if (!movieData.value?.release_date) return null
  return movieData.value.release_date.split('-')[0]
})

// 표시할 배우 목록 계산
const displayedActors = computed(() => {
  if (!movieData.value?.actors) return []
  
  if (showAllCast.value) {
    return movieData.value.actors
  }
  return movieData.value.actors.slice(0, 8)
})

// 나이 계산 함수
const calculateAge = (birthday) => {
  if (!birthday) return null
  
  const birthDate = new Date(birthday)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
}

// 상영시간 포맷팅
const formatRuntime = (minutes) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

// 상태 번역
const translateStatus = (status) => {
  const statusMap = {
    'Released': '개봉',
    'In Production': '제작중',
    'Post Production': '후반작업',
    'Planned': '기획',
    'Canceled': '취소'
  }
  return statusMap[status] || status
}

// 배우 더보기/접기 토글
const toggleCast = () => {
  showAllCast.value = !showAllCast.value
  
  // 접기할 때 스크롤 위치 조정
  if (!showAllCast.value) {
    const castSection = document.querySelector('.cast-section')
    if (castSection) {
      castSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 데이터 로드
const loadMovieData = async () => {
  const movieId = route.params.id
  
  if (!movieId) {
    router.push('/')
    return
  }

  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    console.log('🎬 영화 정보 로드:', movieId)
    
    // 더미 서비스에서 영화 정보 가져오기
    const movie = dummySearchService.getMovieById(parseInt(movieId))
    
    if (!movie) {
      throw new Error('영화 정보를 찾을 수 없습니다.')
    }
    
    console.log('✅ 영화 정보:', movie)
    movieData.value = movie
    
  } catch (error) {
    console.error('❌ 영화 정보 로드 실패:', error)
    hasError.value = true
    errorMessage.value = error.message || '영화 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 유틸리티 함수들
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const getPosterUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return dummySearchService.getPosterUrl(url)
}

const getBackdropUrl = (url, size = 'w1280') => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return dummySearchService.getBackdropUrl(url, size)
}

const getBackdropSrcset = (path) => {
  return dummySearchService.getBackdropSrcset(path)
}

const getPosterSrcset = (path) => {
  return dummySearchService.getPosterSrcset(path)
}

const getProfileSrcset = (path) => {
  return dummySearchService.getProfileSrcset(path)
}

const getProfileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return dummySearchService.getProfileUrl(path)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const handleActorImageError = (event) => {
  event.target.style.display = 'none'
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goToPerson = (personId) => {
  if (personId) {
    router.push({ name: 'PersonDetail', params: { id: personId } })
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadMovieData()
})
</script>

<style scoped>
.movie-detail-container {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  position: relative;
}

/* 히어로 섹션 */
.hero-section {
  position: relative;
  height: 50vh;
  min-height: 400px;
  overflow: hidden;
}

/* 768px 이하에서는 히어로 섹션 숨김 */
@media (max-width: 768px) {
  .hero-section {
    display: none;
  }
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(12, 11, 10, 0.3) 0%,
    rgba(12, 11, 10, 0.5) 60%,
    rgba(12, 11, 10, 0.8) 100%
  );
}

/* 하단 블러 효과 */
.hero-blur-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(12, 11, 10, 0.4) 30%,
    rgba(12, 11, 10, 0.8) 70%,
    var(--color-background) 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 헤더 스타일 */
.detail-header {
  background-color: var(--color-card-background);
  border-bottom: 1px solid var(--color-inactive-icon);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}

.detail-header.with-hero {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: transparent;
  border-bottom: none;
  backdrop-filter: blur(4px);
}

/* 모바일에서는 with-hero 클래스가 적용되어도 일반 헤더처럼 동작 */
@media (max-width: 768px) {
  .detail-header.with-hero {
    position: sticky !important;
    background-color: var(--color-card-background) !important;
    border-bottom: 1px solid var(--color-inactive-icon) !important;
    backdrop-filter: blur(8px) !important;
  }
}

.detail-header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
}

/* 메인 컨텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* 로딩/에러 상태 */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
  text-align: center;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  background-color: var(--color-main);
  color: var(--color-background);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.retry-button:hover {
  background-color: var(--color-gold-dark);
  transform: translateY(-1px);
}

/* 영화 기본 정보 */
.movie-basic-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.poster-section {
  flex-shrink: 0;
}

.poster-image-container {
  width: 280px;
  height: 420px;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  background-color: var(--color-search-box);
  box-shadow: var(--shadow-card);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--color-inactive-text);
}

.info-section {
  flex: 1;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--color-text);
  line-height: 1.2;
}

.movie-tagline {
  font-size: 1.1rem;
  color: var(--color-highlight-text);
  font-style: italic;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.movie-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.meta-label {
  color: var(--color-highlight-text);
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.meta-value {
  color: var(--color-text);
  flex: 1;
}

.year {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
}

/* 평점 표시 */
.rating-item {
  align-items: center;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 1rem;
  opacity: 0.3;
  transition: all 0.2s;
}

.star.filled {
  opacity: 1;
  color: var(--color-main);
}

.rating-score {
  font-weight: 600;
  color: var(--color-main);
}

/* 장르 태그 */
.genres-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.genre-tag {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-gold-dark) 100%);
  color: var(--color-background);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(255, 183, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.genre-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.genre-tag:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 183, 0, 0.4);
}

.genre-tag:hover::before {
  left: 100%;
}

/* 상태 표시 */
.status.released {
  color: var(--color-rating-good-text);
}

.status.planned {
  color: var(--color-main);
}

.status.canceled {
  color: var(--color-rating-bad-text);
}

.director-name {
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-small);
}

.director-name:hover {
  color: var(--color-main);
  background-color: var(--color-main-opacity-20);
}

/* 섹션 타이틀 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

/* 줄거리 섹션 */
.overview-section {
  margin-top: 2rem;
}

.overview-text {
  line-height: 1.7;
  color: var(--color-text);
  font-size: 1rem;
}

/* 출연 배우 섹션 */
.cast-section {
  margin-bottom: 3rem;
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
}

.cast-item {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  overflow: hidden;
}

.cast-item:hover {
  border-color: var(--color-main);
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.actor-image-container {
  width: 100%;
  height: 160px;
  background-color: var(--color-search-box);
  position: relative;
}

.actor-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actor-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--color-inactive-text);
}

.actor-info {
  padding: 1rem;
  text-align: center;
}

.actor-name {
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.actor-character {
  color: var(--color-highlight-text);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  font-style: italic;
}

.actor-age {
  color: var(--color-highlight-text);
  font-size: 0.8rem;
}

/* 더보기 버튼 */
.more-cast {
  text-align: center;
  margin-top: 2rem;
}

.more-button {
  background: none;
  border: 1px solid var(--color-inactive-icon);
  color: var(--color-text);
  padding: 0.75rem 2rem;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  font-weight: 500;
}

.more-button:hover {
  border-color: var(--color-main);
  color: var(--color-main);
  background-color: var(--color-main-opacity-20);
  transform: translateY(-1px);
}

.more-button:active {
  transform: translateY(0);
}

/* 데이터 없음 */
.no-data {
  text-align: center;
  padding: 4rem 0;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-data-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.no-data-message {
  color: var(--color-highlight-text);
}

/* 반응형 */
@media (max-width: 768px) {
  /* 히어로 섹션은 이미 위에서 display: none 처리 */
  
  /* 헤더 스타일은 위에서 !important로 이미 처리됨 */

  /* 메인 컨텐츠 여백 정상화 */
  .main-content {
    padding: 1rem;
    margin-top: 0; /* 헤더가 sticky이므로 추가 여백 불필요 */
  }

  .movie-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 1rem; /* 컨텐츠 상단 여백만 유지 */
    margin-bottom: 2rem;
  }
  
  .poster-image-container {
    width: 200px;
    height: 300px;
    margin-bottom: 1.5rem;
  }
  
  .movie-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .meta-item {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .meta-label {
    min-width: auto;
  }
  
  .cast-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .actor-image-container {
    height: 140px;
  }
  
  .more-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .rating-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .genres-container {
    justify-content: flex-start;
  }

  /* 섹션 간격 조정 */
  .overview-section {
    margin-top: 1.5rem;
    margin-bottom: 2rem;
  }

  .cast-section {
    margin-bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    margin-top: 0; /* 초소형에서도 추가 여백 불필요 */
  }

  .detail-header-content {
    padding: 0 1rem;
  }

  .movie-title {
    font-size: 1.75rem;
  }

  .poster-image-container {
    width: 180px;
    height: 270px;
    margin-bottom: 1rem;
  }

  .movie-basic-info {
    margin-top: 1.5rem;
  }

  .cast-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>