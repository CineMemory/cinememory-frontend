<!-- 홈 박스오피스 섹션 -->
<template>
  <section class="home-boxoffice-section">
    <div class="home-boxoffice-section__container">
      <!-- 섹션 헤더 -->
      <div class="home-boxoffice-section__header">
        <h2 class="home-boxoffice-section__title">박스오피스</h2>
        <BaseIcon
          name="arrow-right"
          class="home-boxoffice-section__arrow"
        />
      </div>

      <!-- 메인 영화 카드 -->
      <div class="home-boxoffice-section__featured">
        <MovieCard
          v-if="featuredMovie"
          :movie="featuredMovie"
          :is-ad="true"
          class="home-boxoffice-section__featured-card"
        />
      </div>

      <!-- 순위 목록 -->
      <div class="home-boxoffice-section__ranking">
        <MovieRankingItem
          v-for="(movie, index) in rankingMovies"
          :key="movie.id"
          :movie="movie"
          :rank="index + 1"
          :genres="getMovieGenres(movie)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import MovieRankingItem from '@/components/movie/MovieRankingItem.vue'

// 임시 데이터 (나중에 API로 교체)
const movies = ref([])
const genres = ref([
  { id: 28, name: '액션' },
  { id: 12, name: '모험' },
  { id: 16, name: '애니메이션' },
  { id: 35, name: '코미디' },
  { id: 80, name: '범죄' },
  { id: 18, name: '드라마' },
  { id: 10751, name: '가족' },
  { id: 14, name: '판타지' },
  { id: 27, name: '공포' },
  { id: 10749, name: '로맨스' },
  { id: 878, name: 'SF' },
  { id: 53, name: '스릴러' }
])

// 임시 영화 데이터
const mockMovies = [
  {
    id: 1,
    title: '나를 모르는 그녀의 세계에서',
    poster_path: '/poster1.jpg',
    release_date: '2024-01-15',
    vote_average: 8.5,
    genre_ids: [18, 10749]
  },
  {
    id: 2,
    title: '미션 임파서블: 파이널 레코닝',
    poster_path: '/poster2.jpg',
    release_date: '2024-02-20',
    vote_average: 9.6,
    genre_ids: [28, 12]
  },
  {
    id: 3,
    title: '미션 임파서블 : 고스트 프로토콜',
    poster_path: '/poster3.jpg',
    release_date: '2011-12-15',
    vote_average: 9.8,
    genre_ids: [28, 53]
  },
  {
    id: 4,
    title: '미션 임파서블',
    poster_path: '/poster4.jpg',
    release_date: '1996-05-22',
    vote_average: 9.9,
    genre_ids: [28, 53]
  }
]

const featuredMovie = computed(() => {
  return movies.value[0] || null
})

const rankingMovies = computed(() => {
  return movies.value.slice(1, 4)
})

const getMovieGenres = (movie) => {
  if (!movie.genre_ids) return []
  return movie.genre_ids.map(id => 
    genres.value.find(genre => genre.id === id)
  ).filter(Boolean)
}

// 데이터 로드
const loadBoxofficeData = async () => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await fetch('/api/movies/boxoffice')
    // movies.value = await response.json()
    
    // 임시로 mock 데이터 사용
    movies.value = mockMovies
  } catch (error) {
    console.error('박스오피스 데이터 로드 실패:', error)
    movies.value = mockMovies // 실패 시 mock 데이터 사용
  }
}

onMounted(() => {
  loadBoxofficeData()
})
</script>

<style scoped>
.home-boxoffice-section {
  width: 100%;
  padding: 0 0 144px 0;
  background-color: var(--color-background);
}

.home-boxoffice-section__container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-boxoffice-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0 10px;
  margin-bottom: 6px;
}

.home-boxoffice-section__title {
  font-family: 'Pretendard-Regular', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.278;
  letter-spacing: -0.011em;
  color: var(--color-text);
  margin: 0;
}

.home-boxoffice-section__arrow {
  width: 20px;
  height: 20px;
  color: var(--color-inactive-text);
}

.home-boxoffice-section__featured {
  padding-bottom: 6px;
}

.home-boxoffice-section__featured-card {
  width: 100%;
  height: 80px;
  border-radius: var(--border-radius-small);
  overflow: hidden;
}

.home-boxoffice-section__ranking {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .home-boxoffice-section {
    padding: 0 0 120px 0;
  }
  
  .home-boxoffice-section__container {
    padding: 0 16px;
  }
  
  .home-boxoffice-section__title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .home-boxoffice-section__container {
    padding: 0 12px;
  }
  
  .home-boxoffice-section__featured-card {
    height: 70px;
  }
}
</style>