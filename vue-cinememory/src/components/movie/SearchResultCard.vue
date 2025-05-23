<template>
  <div class="search-result-card" @click="handleClick">
    <!-- 🎬 영화 카드 -->
    <div v-if="item.media_type === 'movie'" class="movie-card">
      <div class="poster-container">
        <img 
          v-if="item.poster_url" 
          :src="item.poster_url" 
          :alt="item.title"
          class="poster-image"
          @error="handleImageError"
        >
        <div v-else class="poster-placeholder">
          🎬
        </div>
      </div>
      
      <div class="movie-info">
        <h3 class="movie-title">{{ item.title }}</h3>
        <div class="movie-meta">
          <span class="release-year" v-if="releaseYear">{{ releaseYear }}</span>
          <span class="rating" v-if="item.vote_average">
            <span class="star">⭐</span>
            {{ formatRating(item.vote_average) }}
          </span>
        </div>
        <div class="movie-type">영화</div>
      </div>
    </div>

    <!-- 👤 인물 카드 -->
    <div v-else-if="item.media_type === 'person'" class="person-card">
      <div class="profile-container">
        <img 
          v-if="item.profile_path" 
          :src="getProfileUrl(item.profile_path)" 
          :alt="item.name"
          class="profile-image"
          @error="handleImageError"
        >
        <div v-else class="profile-placeholder">
          {{ item.known_for_department === 'Directing' ? '🎬' : '🎭' }}
        </div>
      </div>
      
      <div class="person-info">
        <h3 class="person-name">{{ item.name }}</h3>
        <div class="person-meta">
          <span class="department">
            {{ item.known_for_department === 'Directing' ? '감독' : '배우' }}
          </span>
          <span class="age" v-if="item.age">{{ item.age }}세</span>
          <span class="birth-year" v-else-if="item.birthday">
            {{ item.birthday.split('-')[0] }}년생
          </span>
        </div>
        
        <!-- 대표 작품들 -->
        <div class="known-for" v-if="item.known_for && item.known_for.length > 0">
          <span class="known-for-label">대표작:</span>
          <span class="known-for-movies">
            {{ item.known_for.slice(0, 2).join(', ') }}
            <span v-if="item.known_for.length > 2"> 외 {{ item.known_for.length - 2 }}편</span>
          </span>
        </div>
        
        <div class="person-type">인물</div>
      </div>
    </div>

    <!-- 🔄 기타 타입 (확장용) -->
    <div v-else class="unknown-card">
      <div class="unknown-placeholder">❓</div>
      <div class="unknown-info">
        <h3>{{ item.title || item.name || '알 수 없음' }}</h3>
        <div class="unknown-type">{{ item.media_type || 'unknown' }}</div>
      </div>
    </div>

    <!-- 🎯 호버 오버레이 -->
    <div class="hover-overlay">
      <div class="hover-content">
        <span class="view-detail">자세히 보기</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props 정의
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// Emits 정의
const emit = defineEmits(['click'])

// 개봉 연도 계산
const releaseYear = computed(() => {
  return props.item.release_date?.split('-')[0] || null
})

// 평점 포맷팅
const formatRating = (rating) => {
  return Math.round(rating * 10) / 10
}

// 프로필 이미지 URL 생성
const getProfileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w185${path}`
}

// 이미지 에러 처리
const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling?.classList.remove('hidden')
}

// 클릭 이벤트 처리
const handleClick = () => {
  emit('click', props.item)
  
  // 타입별로 다른 페이지로 이동 (나중에 구현)
  if (props.item.media_type === 'movie') {
    console.log('영화 상세 페이지로 이동:', props.item.id)
    // this.$router.push(`/movie/${props.item.id}`)
  } else if (props.item.media_type === 'person') {
    console.log('인물 상세 페이지로 이동:', props.item.id)
    // this.$router.push(`/person/${props.item.id}`)
  }
}
</script>

<style scoped>
.search-result-card {
  position: relative;
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.search-result-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-modal);
  border-color: var(--color-main);
}

/* 🎬 영화 카드 스타일 */
.movie-card {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  min-height: 120px;
}

.poster-container {
  flex-shrink: 0;
  width: 80px;
  height: 120px;
  border-radius: var(--border-radius-medium);
  overflow: hidden;
  background-color: var(--color-search-box);
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
  font-size: 2rem;
  color: var(--color-inactive-text);
}

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.movie-title {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.release-year {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-rating-good-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.star {
  font-size: 0.8rem;
}

.movie-type {
  color: var(--color-main);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 👤 인물 카드 스타일 */
.person-card {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  min-height: 120px;
}

.profile-container {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-full);
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
  font-size: 1.5rem;
  color: var(--color-inactive-text);
}

.person-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.person-name {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.person-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.department {
  color: var(--color-highlight-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.age, .birth-year {
  color: var(--color-inactive-text);
  font-size: 0.85rem;
}

.known-for {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.3;
}

.known-for-label {
  color: var(--color-highlight-text);
  font-weight: 500;
  margin-right: 0.5rem;
}

.known-for-movies {
  color: var(--color-text);
}

.person-type {
  color: var(--color-main);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ❓ 알 수 없는 타입 */
.unknown-card {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  align-items: center;
}

.unknown-placeholder {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-medium);
  background-color: var(--color-search-box);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.unknown-info h3 {
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.unknown-type {
  color: var(--color-inactive-text);
  font-size: 0.8rem;
}

/* 🎯 호버 오버레이 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg, 
    var(--color-main-opacity-20) 0%, 
    var(--color-main-opacity-50) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-result-card:hover .hover-overlay {
  opacity: 1;
}

.hover-content {
  background-color: var(--color-background-opacity-80);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-medium);
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(4px);
}

/* 📱 반응형 */
@media (max-width: 768px) {
  .movie-card, .person-card {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .poster-container {
    width: 60px;
    height: 90px;
  }
  
  .profile-container {
    width: 50px;
    height: 50px;
  }
  
  .movie-title, .person-name {
    font-size: 1rem;
  }
}
</style>