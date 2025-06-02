<!-- 타임라인 메인 컨테이너 -->
<template>
  <div class="timeline-container">
    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="loading-wrapper">
      <BaseSpinner size="large" />
      <p class="loading-text">타임라인을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="error-wrapper">
      <BaseIcon
        name="alert-circle"
        class="error-icon" />
      <h2 class="error-title">타임라인을 불러올 수 없습니다</h2>
      <p class="error-message">{{ error }}</p>
      <BaseButton
        @click="loadTimeline"
        variant="primary">
        다시 시도
      </BaseButton>
    </div>

    <!-- 타임라인 콘텐츠 -->
    <div
      v-else
      class="timeline-content">
      <!-- 취향 분석 요약 -->
      <div class="taste-summary-section">
        <h2 class="section-title">🎭 당신의 영화 취향</h2>
        <div class="taste-summary">
          <p>{{ timelineData.tasteSummary }}</p>
        </div>
      </div>

      <!-- 타임라인 헤더 -->
      <div class="timeline-header">
        <h2 class="section-title">🎬 나의 시네마틱 여정</h2>
        <p class="timeline-description">
          {{ timelineData.ageRange.min }}세부터
          {{ timelineData.ageRange.max }}세까지의 추천 영화들
        </p>

        <!-- 컨트롤 버튼들 -->
        <div class="timeline-controls">
          <BaseButton
            @click="regenerateTimeline"
            variant="secondary"
            :loading="regenerating">
            <BaseIcon name="refresh-cw" />
            새로운 추천받기
          </BaseButton>

          <BaseButton
            @click="scrollToAge(currentAge)"
            variant="secondary">
            <BaseIcon name="target" />
            현재 나이로 이동
          </BaseButton>
        </div>
      </div>

      <!-- 타임라인 스크롤러 -->
      <div
        class="timeline-scroller"
        ref="timelineScroller">
        <!-- 나이 축 -->
        <div class="age-axis">
          <div
            v-for="item in timelineData.items"
            :key="item.id"
            class="age-marker"
            :class="{ 'current-age': item.age === currentAge }">
            <span class="age-text">{{ item.age }}세</span>
            <span class="year-text">{{ item.year }}년</span>
          </div>
        </div>

        <!-- 영화 카드들 -->
        <div class="movies-track">
          <TimelineMovieCard
            v-for="item in timelineData.items"
            :key="item.id"
            :age="item.age"
            :movie="item.movie"
            :is-watched="watchedMovies.has(item.movie.id)"
            @mark-watched="handleMarkWatched"
            @mark-unwatched="handleMarkUnwatched"
            @show-details="handleShowDetails"
            class="timeline-movie-item" />
        </div>
      </div>

      <!-- 진행률 표시 -->
      <div class="progress-section">
        <h3 class="progress-title">시청 진행률</h3>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${watchProgress}%` }"></div>
        </div>
        <p class="progress-text">
          {{ watchedMovies.size }} / {{ timelineData.totalItems }} 영화 시청
          완료 ({{ Math.round(watchProgress) }}%)
        </p>
      </div>
    </div>

    <!-- 영화 상세 모달 -->
    <BaseModal
      v-if="selectedMovie"
      :modal-value="!!selectedMovie"
      :title="selectedMovie.title"
      @close="selectedMovie = null">
      <div class="movie-detail-content">
        <p><strong>개봉년도:</strong> {{ selectedMovie.releaseYear }}년</p>
        <p><strong>추천 이유:</strong></p>
        <p class="recommendation-reason">{{ selectedMovie.reason }}</p>
      </div>
    </BaseModal>
  </div>
</template>

<script>
  import { useAuth } from '@/composables/useAuth'
  import timelineApi from '@/services/timelineApi'
  import TimelineMovieCard from './TimelineMovieCard.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  export default {
    name: 'TimelineContainer',
    components: {
      TimelineMovieCard,
      BaseSpinner,
      BaseIcon,
      BaseButton,
      BaseModal
    },
    setup() {
      const { user } = useAuth()
      return { user }
    },
    data() {
      return {
        loading: true,
        error: null,
        regenerating: false,
        timelineData: null,
        watchedMovies: new Set(),
        selectedMovie: null
      }
    },
    computed: {
      // 현재 사용자 나이 계산
      currentAge() {
        if (!this.user?.birth_year) return null
        const currentYear = new Date().getFullYear()
        return currentYear - this.user.birth_year + 1
      },

      // 시청 진행률 계산
      watchProgress() {
        if (!this.timelineData || this.timelineData.totalItems === 0) return 0
        return (this.watchedMovies.size / this.timelineData.totalItems) * 100
      }
    },
    async mounted() {
      await this.loadTimeline()
    },
    methods: {
      // 타임라인 데이터 로드
      async loadTimeline() {
        this.loading = true
        this.error = null

        try {
          this.timelineData = await timelineApi.getTimelineData()
          console.log('📊 타임라인 데이터 로드 완료:', this.timelineData)
        } catch (error) {
          console.error('타임라인 로드 실패:', error)
          this.error =
            error.message || '타임라인을 불러오는 중 오류가 발생했습니다.'
        } finally {
          this.loading = false
        }
      },

      // 타임라인 재생성
      async regenerateTimeline() {
        this.regenerating = true

        try {
          this.timelineData = await timelineApi.regenerateTimeline()
          this.watchedMovies.clear() // 시청 기록 초기화
          console.log('🔄 타임라인 재생성 완료:', this.timelineData)
        } catch (error) {
          console.error('타임라인 재생성 실패:', error)
          this.error = '새로운 추천을 생성하는 중 오류가 발생했습니다.'
        } finally {
          this.regenerating = false
        }
      },

      // 특정 나이로 스크롤
      scrollToAge(targetAge) {
        if (!targetAge || !this.timelineData) return

        const targetItem = this.timelineData.items.find(
          (item) => item.age === targetAge
        )
        if (!targetItem) return

        const targetIndex = this.timelineData.items.indexOf(targetItem)
        const scroller = this.$refs.timelineScroller

        if (scroller) {
          const cardWidth = 320 // 카드 너비 + 마진
          const scrollPosition = targetIndex * cardWidth
          scroller.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          })
        }
      },

      // 영화 시청 완료 처리
      async handleMarkWatched(movieId) {
        try {
          await timelineApi.markAsWatched(movieId)
          this.watchedMovies.add(movieId)
          console.log('✅ 영화 시청 완료:', movieId)
        } catch (error) {
          console.error('시청 완료 처리 실패:', error)
        }
      },

      // 영화 시청 취소 처리
      handleMarkUnwatched(movieId) {
        this.watchedMovies.delete(movieId)
        console.log('❌ 영화 시청 취소:', movieId)
      },

      // 영화 상세 정보 표시
      handleShowDetails(movie) {
        this.selectedMovie = movie
      }
    }
  }
</script>

<style scoped>
  .timeline-container {
    min-height: 100vh;
    background: var(--color-background);
    padding: 20px;
  }

  /* 공통 래퍼 스타일 */
  .loading-wrapper,
  .error-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }

  .loading-text {
    margin-top: 20px;
    color: var(--color-highlight-text);
    font-size: 16px;
  }

  .error-icon {
    font-size: 64px;
    color: var(--color-alert);
    margin-bottom: 24px;
  }

  .error-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .error-message {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0 0 32px 0;
    max-width: 400px;
    line-height: 1.5;
  }

  /* 타임라인 콘텐츠 */
  .timeline-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* 섹션 공통 스타일 */
  .section-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 16px 0;
    text-align: center;
  }

  /* 취향 분석 섹션 */
  .taste-summary-section {
    margin-bottom: 40px;
    text-align: center;
  }

  .taste-summary {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 24px;
    margin: 0 auto;
    max-width: 800px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .taste-summary p {
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    margin: 0;
  }

  /* 타임라인 헤더 */
  .timeline-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .timeline-description {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0 0 24px 0;
  }

  .timeline-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* 타임라인 스크롤러 */
  .timeline-scroller {
    overflow-x: auto;
    padding: 20px 0;
    margin-bottom: 40px;
  }

  .age-axis {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 0 10px;
  }

  .age-marker {
    min-width: 280px;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    background: var(--color-surface);
    transition: all 0.3s ease;
  }

  .age-marker.current-age {
    background: var(--color-primary);
    color: white;
    transform: scale(1.05);
  }

  .age-text {
    display: block;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .year-text {
    display: block;
    font-size: 14px;
    opacity: 0.8;
  }

  .movies-track {
    display: flex;
    gap: 20px;
    padding: 0 10px;
  }

  .timeline-movie-item {
    flex-shrink: 0;
  }

  /* 진행률 섹션 */
  .progress-section {
    text-align: center;
    background: var(--color-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .progress-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 16px 0;
  }

  .progress-bar {
    width: 100%;
    height: 12px;
    background: var(--color-background);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-primary),
      var(--color-rating-good-text)
    );
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 영화 상세 모달 */
  .movie-detail-content {
    padding: 20px;
  }

  .movie-detail-content p {
    margin: 0 0 12px 0;
    color: var(--color-text);
  }

  .recommendation-reason {
    background: var(--color-background);
    padding: 16px;
    border-radius: 8px;
    line-height: 1.5;
    font-style: italic;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .timeline-container {
      padding: 16px;
    }

    .section-title {
      font-size: 24px;
    }

    .taste-summary {
      padding: 20px;
    }

    .timeline-controls {
      flex-direction: column;
      align-items: center;
    }

    .age-axis,
    .movies-track {
      gap: 16px;
    }

    .age-marker {
      min-width: 260px;
    }
  }

  /* 스크롤바 스타일링 */
  .timeline-scroller::-webkit-scrollbar {
    height: 8px;
  }

  .timeline-scroller::-webkit-scrollbar-track {
    background: var(--color-background);
    border-radius: 4px;
  }

  .timeline-scroller::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 4px;
  }

  .timeline-scroller::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-dark);
  }
</style>
