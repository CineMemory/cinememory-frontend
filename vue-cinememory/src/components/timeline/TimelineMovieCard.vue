<template>
  <div
    class="timeline-movie-card"
    :class="{ 'is-watched': isWatched }">
    <!-- 나이 표시 -->
    <div class="age-indicator">
      <span class="age-number">{{ age }}</span>
      <span class="age-label">세</span>
    </div>

    <!-- 영화 포스터 -->
    <div class="movie-poster">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="movie.title"
        @error="handleImageError"
        class="poster-image" />
      <div
        v-else
        class="poster-placeholder">
        <BaseIcon
          name="film"
          class="placeholder-icon" />
      </div>

      <!-- 시청 완료 오버레이 -->
      <div
        v-if="isWatched"
        class="watched-overlay">
        <BaseIcon
          name="check-circle"
          class="watched-icon" />
      </div>
    </div>

    <!-- 영화 정보 -->
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p class="movie-year">{{ movie.releaseYear }}년</p>
      <p class="movie-reason">{{ movie.reason }}</p>
    </div>

    <!-- 액션 버튼들 -->
    <div class="movie-actions">
      <BaseButton
        v-if="!isWatched"
        @click="markAsWatched"
        variant="primary"
        size="small">
        봤어요!
      </BaseButton>
      <BaseButton
        v-else
        @click="markAsUnwatched"
        variant="secondary"
        size="small">
        취소
      </BaseButton>

      <BaseButton
        @click="showDetails"
        variant="secondary"
        size="small">
        상세보기
      </BaseButton>
    </div>
  </div>
</template>

<script>
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import tmdbService from '@/services/tmdb'

  export default {
    name: 'TimelineMovieCard',
    components: {
      BaseIcon,
      BaseButton
    },
    props: {
      age: {
        type: Number,
        required: true
      },
      movie: {
        type: Object,
        required: true,
        validator(value) {
          return value && value.title && value.releaseYear
        }
      },
      isWatched: {
        type: Boolean,
        default: false
      }
    },
    emits: ['mark-watched', 'mark-unwatched', 'show-details'],
    data() {
      return {
        posterUrl: null,
        imageError: false
      }
    },
    async mounted() {
      await this.loadPosterImage()
    },
    methods: {
      // TMDB에서 포스터 이미지 로드
      async loadPosterImage() {
        try {
          // 이미 포스터 경로가 있으면 TMDB URL 생성
          if (this.movie.poster) {
            this.posterUrl = tmdbService.getPosterUrl(this.movie.poster)
            return
          }

          // 포스터가 없으면 영화 제목으로 검색해서 포스터 찾기
          if (this.movie.title) {
            const searchResults = await tmdbService.searchMovies(
              this.movie.title
            )
            if (searchResults.results && searchResults.results.length > 0) {
              const firstResult = searchResults.results[0]
              if (firstResult.poster_path) {
                this.posterUrl = tmdbService.getPosterUrl(
                  firstResult.poster_path
                )
                return
              }
            }
          }

          // 포스터를 찾을 수 없으면 null로 설정 (placeholder 표시)
          this.posterUrl = null
        } catch (error) {
          console.error('포스터 이미지 로드 실패:', error)
          this.imageError = true
          this.posterUrl = null
        }
      },

      // 이미지 로드 에러 처리
      handleImageError() {
        this.imageError = true
        this.posterUrl = null
      },

      // 시청 완료 처리
      markAsWatched() {
        this.$emit('mark-watched', this.movie.id)
      },

      // 시청 취소 처리
      markAsUnwatched() {
        this.$emit('mark-unwatched', this.movie.id)
      },

      // 상세 정보 보기
      showDetails() {
        this.$emit('show-details', this.movie)
      }
    }
  }
</script>

<style scoped>
  .timeline-movie-card {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    max-width: 300px;
    margin: 0 auto;
  }

  .timeline-movie-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .timeline-movie-card.is-watched {
    border: 2px solid var(--color-rating-good-text);
    background: var(--color-rating-good-bg);
  }

  /* 나이 표시 */
  .age-indicator {
    position: absolute;
    top: -10px;
    left: 20px;
    background: var(--color-primary);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    z-index: 2;
  }

  .age-number {
    font-size: 16px;
    font-weight: 700;
  }

  .age-label {
    font-size: 12px;
    margin-left: 2px;
  }

  /* 영화 포스터 */
  .movie-poster {
    position: relative;
    width: 100%;
    height: 200px;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
  }

  .poster-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .poster-placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--color-border);
  }

  .placeholder-icon {
    font-size: 48px;
    color: var(--color-highlight-text);
  }

  /* 시청 완료 오버레이 */
  .watched-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .watched-icon {
    font-size: 48px;
    color: var(--color-rating-good-text);
  }

  /* 영화 정보 */
  .movie-info {
    margin-bottom: 16px;
  }

  .movie-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .movie-year {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0 0 12px 0;
  }

  .movie-reason {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.4;
    margin: 0;
  }

  /* 액션 버튼들 */
  .movie-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .timeline-movie-card {
      max-width: 280px;
      padding: 16px;
    }

    .movie-poster {
      height: 180px;
    }

    .movie-title {
      font-size: 16px;
    }

    .movie-actions {
      flex-direction: column;
    }
  }
</style>
