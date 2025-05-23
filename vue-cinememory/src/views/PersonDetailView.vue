<template>
  <div class="person-detail-container">
    <!-- 🔙 헤더 (뒤로가기) -->
    <div class="detail-header">
      <div class="detail-header-content">
        <button @click="goBack" class="back-button">
          <span class="back-icon">←</span>
        </button>
        <h1 class="page-title">인물 정보</h1>
      </div>
    </div>

    <!-- 📱 메인 컨텐츠 -->
    <div class="main-content">
      <!-- ⏳ 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">정보를 불러오는 중...</p>
      </div>

      <!-- ❌ 에러 상태 -->
      <div v-else-if="hasError" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">정보를 불러올 수 없습니다</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button class="retry-button" @click="loadPersonData">다시 시도</button>
      </div>

      <!-- 👤 인물 정보 -->
      <div v-else-if="personData" class="person-info">
        <!-- 기본 정보 섹션 -->
        <div class="person-basic-info">
          <div class="profile-section">
            <div class="profile-image-container">
              <img 
                v-if="personData.profile_path" 
                :src="getProfileUrl(personData.profile_path)"
                :alt="personData.name"
                class="profile-image"
                @error="handleImageError"
              >
              <div v-else class="profile-placeholder">
                {{ personData.known_for_department === 'Directing' ? '🎬' : '🎭' }}
              </div>
            </div>
          </div>

          <div class="info-section">
            <h1 class="person-name">{{ personData.name }}</h1>
            
            <div class="person-meta">
              <div class="meta-item">
                <span class="meta-label">직업</span>
                <span class="meta-value">
                  {{ personData.known_for_department === 'Directing' ? '감독' : '배우' }}
                </span>
              </div>
              
              <div v-if="personData.birthday" class="meta-item">
                <span class="meta-label">생년월일</span>
                <span class="meta-value">
                  {{ formatDate(personData.birthday) }}
                  <span v-if="personAge" class="age">({{ personAge }}세)</span>
                </span>
              </div>
              
              <div v-if="personData.deathday" class="meta-item">
                <span class="meta-label">사망일</span>
                <span class="meta-value">{{ formatDate(personData.deathday) }}</span>
              </div>
              
              <div v-if="personData.instagram_id" class="meta-item">
                <span class="meta-label">인스타그램</span>
                <a 
                  :href="getInstagramUrl(personData.instagram_id)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="instagram-link"
                >
                  <svg class="instagram-icon" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#833ab4"/>
                        <stop offset="50%" style="stop-color:#fd1d1d"/>
                        <stop offset="100%" style="stop-color:#fcb045"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @{{ personData.instagram_id }}
                </a>
              </div>
            </div>

            <!-- 전기 정보 -->
            <div v-if="personData.biography" class="biography">
              <h3 class="section-title">소개</h3>
              <p class="biography-text">{{ personData.biography }}</p>
            </div>
          </div>
        </div>

        <!-- 출연/참여 작품 -->
        <div v-if="movieCredits.length > 0" class="credits-section">
          <h3 class="section-title">
            {{ personData.known_for_department === 'Directing' ? '감독 작품' : '출연 작품' }}
            ({{ movieCredits.length }}편)
          </h3>
          
          <div class="credits-grid">
            <div 
              v-for="credit in displayedMovieCredits" 
              :key="credit.movie_id || credit.id"
              class="credit-item"
              @click="goToMovie(credit.movie_id || credit.id)"
            >
              <div class="credit-year">{{ credit.release_date?.split('-')[0] || 'N/A' }}</div>
              <div class="credit-title">{{ credit.title }}</div>
              <div v-if="credit.character" class="credit-character">{{ credit.character }}</div>
              <div v-if="credit.job" class="credit-job">{{ credit.job }}</div>
            </div>
          </div>
          
          <!-- 더보기/접기 버튼 -->
          <div v-if="movieCredits.length > 12" class="more-credits">
            <button @click="toggleMovieCredits" class="more-button">
              <span v-if="!showAllMovieCredits">
                + {{ movieCredits.length - 12 }}편 더 보기
              </span>
              <span v-else>
                ↑ 접기
              </span>
            </button>
          </div>
        </div>

        <!-- TV 출연작 -->
        <div v-if="tvCredits.length > 0" class="credits-section">
          <h3 class="section-title">TV 출연작 ({{ tvCredits.length }}편)</h3>
          
          <div class="tv-credits-list">
            <div 
              v-for="tvCredit in displayedTvCredits" 
              :key="tvCredit.show_id"
              class="tv-credit-item"
            >
              <span class="tv-year">{{ tvCredit.first_air_date?.split('-')[0] || 'N/A' }}</span>
              <span class="tv-title">{{ tvCredit.name }}</span>
              <span v-if="tvCredit.character" class="tv-character">{{ tvCredit.character }}</span>
            </div>
          </div>

          <!-- TV 더보기/접기 버튼 -->
          <div v-if="tvCredits.length > 6" class="more-credits">
            <button @click="toggleTvCredits" class="more-button">
              <span v-if="!showAllTvCredits">
                + {{ tvCredits.length - 6 }}편 더 보기
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
        <div class="no-data-icon">👤</div>
        <h2 class="no-data-title">인물 정보를 찾을 수 없습니다</h2>
        <p class="no-data-message">요청하신 인물의 정보가 존재하지 않습니다.</p>
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
const personData = ref(null)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// 더보기 상태 관리
const showAllMovieCredits = ref(false)
const showAllTvCredits = ref(false)

// 인물 나이 계산
const personAge = computed(() => {
  if (!personData.value?.birthday) return null
  
  const birthDate = new Date(personData.value.birthday)
  const deathDate = personData.value.deathday ? new Date(personData.value.deathday) : new Date()
  
  const age = deathDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = deathDate.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
})

// 영화 크레딧 (출연 + 제작진)
const movieCredits = computed(() => {
  if (!personData.value) return []
  
  const castCredits = personData.value.movie_credits_cast || []
  const crewCredits = personData.value.movie_credits_crew || []
  
  // 합치고 인기도/날짜순 정렬
  return [...castCredits, ...crewCredits]
    .sort((a, b) => {
      // 먼저 인기도로 정렬
      const popularityDiff = (b.popularity || 0) - (a.popularity || 0)
      if (popularityDiff !== 0) return popularityDiff
      
      // 그 다음 날짜로 정렬
      return new Date(b.release_date || '1900-01-01') - new Date(a.release_date || '1900-01-01')
    })
})

// TV 크레딧
const tvCredits = computed(() => {
  return personData.value?.tv_credits || []
})

// 표시할 영화 크레딧 계산
const displayedMovieCredits = computed(() => {
  if (showAllMovieCredits.value) {
    return movieCredits.value
  }
  return movieCredits.value.slice(0, 12)
})

// 표시할 TV 크레딧 계산
const displayedTvCredits = computed(() => {
  if (showAllTvCredits.value) {
    return tvCredits.value
  }
  return tvCredits.value.slice(0, 6)
})

// 더보기/접기 토글 함수들
const toggleMovieCredits = () => {
  showAllMovieCredits.value = !showAllMovieCredits.value
  
  // 접기할 때 스크롤 위치 조정
  if (!showAllMovieCredits.value) {
    const creditsSection = document.querySelector('.credits-section')
    if (creditsSection) {
      creditsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const toggleTvCredits = () => {
  showAllTvCredits.value = !showAllTvCredits.value
  
  // 접기할 때 스크롤 위치 조정
  if (!showAllTvCredits.value) {
    const tvSection = document.querySelectorAll('.credits-section')[1]
    if (tvSection) {
      tvSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 데이터 로드
const loadPersonData = async () => {
  const personId = route.params.id
  
  if (!personId) {
    router.push('/')
    return
  }

  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    console.log('👤 인물 정보 로드:', personId)
    
    // 더미 서비스에서 인물 정보 가져오기
    const person = dummySearchService.getPersonById(parseInt(personId))
    
    if (!person) {
      throw new Error('인물 정보를 찾을 수 없습니다.')
    }
    
    console.log('✅ 인물 정보:', person)
    personData.value = person
    
  } catch (error) {
    console.error('❌ 인물 정보 로드 실패:', error)
    hasError.value = true
    errorMessage.value = error.message || '인물 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 유틸리티 함수들
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const getProfileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w300${path}`
}

const getInstagramUrl = (instagramId) => {
  return `https://www.instagram.com/${instagramId}`
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goToMovie = (movieId) => {
  if (movieId) {
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadPersonData()
})
</script>

<style scoped>
.person-detail-container {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
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

/* 인물 기본 정보 */
.person-basic-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.profile-section {
  flex-shrink: 0;
}

.profile-image-container {
  width: 200px;
  height: 300px;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  background-color: var(--color-search-box);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
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

.person-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.person-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  gap: 1rem;
}

.meta-label {
  color: var(--color-highlight-text);
  font-weight: 500;
  min-width: 80px;
}

.meta-value {
  color: var(--color-text);
}

.instagram-link {
  color: var(--color-text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-small);
}

.instagram-link:hover {
  color: var(--color-main);
  background-color: var(--color-main-opacity-20);
  transform: translateX(2px);
}

.instagram-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.instagram-link:hover .instagram-icon {
  transform: scale(1.1);
  filter: brightness(1.2);
}

/* 섹션 타이틀 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

/* 전기 */
.biography {
  margin-top: 2rem;
}

.biography-text {
  line-height: 1.6;
  color: var(--color-text);
}

/* 크레딧 섹션 */
.credits-section {
  margin-bottom: 3rem;
}

.credits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.credit-item {
  background-color: var(--color-card-background);
  padding: 1rem;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.credit-item:hover {
  border-color: var(--color-main);
  transform: translateY(-2px);
}

.credit-year {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.credit-title {
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.credit-character, .credit-job {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
}

/* TV 크레딧 */
.tv-credits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tv-credit-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-small);
}

.tv-year {
  color: var(--color-highlight-text);
  min-width: 50px;
  font-size: 0.9rem;
}

.tv-title {
  color: var(--color-text);
  font-weight: 500;
}

.tv-character {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
}

/* 더보기 버튼 */
.more-credits {
  text-align: center;
  margin-top: 1.5rem;
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

/* 반응형 */
@media (max-width: 768px) {
  .person-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-image-container {
    width: 150px;
    height: 225px;
  }
  
  .person-name {
    font-size: 2rem;
  }
  
  .meta-item {
    justify-content: space-between;
  }
  
  .credits-grid {
    grid-template-columns: 1fr;
  }
  
  .more-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>