<template>
  <div
    class="onboarding-movie-card"
    :class="{ selected: isSelected }"
    @click="handleClick">
    <!-- 선택 체크 표시 -->
    <div
      class="selection-indicator"
      v-if="isSelected">
      <BaseIcon name="check" />
    </div>

    <!-- 영화 포스터 -->
    <div class="poster-container">
      <img
        :src="posterUrl"
        :alt="movie.title"
        class="poster-image"
        @error="handleImageError" />

      <!-- 포스터 로딩 상태 -->
      <div
        v-if="imageLoading"
        class="poster-loading">
        <BaseSpinner size="small" />
      </div>
    </div>

    <!-- 영화 정보 -->
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p
        class="movie-year"
        v-if="releaseYear">
        {{ releaseYear }}
      </p>

      <!-- 상세 정보 (1단계에서만 표시) -->
      <p
        class="movie-overview"
        v-if="showOverview && movie.overview">
        {{ truncatedOverview }}
      </p>
    </div>

    <!-- 선택 효과 오버레이 -->
    <div
      class="selection-overlay"
      v-if="isSelected"></div>
  </div>
</template>

<script>
  import BaseIcon from '../base/BaseIcon.vue'
  import BaseSpinner from '../base/BaseSpinner.vue'

  export default {
    name: 'OnboardingMovieCard',
    components: {
      BaseIcon,
      BaseSpinner
    },
    props: {
      movie: {
        type: Object,
        required: true,
        validator(value) {
          return value && typeof value.movie_id !== 'undefined' && value.title
        }
      },
      isSelected: {
        type: Boolean,
        default: false
      },
      showOverview: {
        type: Boolean,
        default: false // 1단계에서는 true, 2단계에서는 false
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    emits: ['select', 'unselect'],
    data() {
      return {
        imageLoading: true,
        imageError: false
      }
    },
    computed: {
      posterUrl() {
        if (this.imageError || !this.movie.poster_path) {
          return '/images/no-poster.png' // 기본 이미지
        }

        // TMDB 이미지 URL 생성
        if (this.movie.poster_path.startsWith('http')) {
          return this.movie.poster_path
        }
        return `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
      },

      releaseYear() {
        if (!this.movie.release_date) return null
        return new Date(this.movie.release_date).getFullYear()
      },

      truncatedOverview() {
        if (!this.movie.overview) return ''
        return this.movie.overview.length > 100
          ? this.movie.overview.substring(0, 100) + '...'
          : this.movie.overview
      }
    },
    methods: {
      handleClick() {
        if (this.disabled) return

        if (this.isSelected) {
          this.$emit('unselect', this.movie.movie_id)
        } else {
          this.$emit('select', this.movie.movie_id)
        }
      },

      handleImageError() {
        this.imageError = true
        this.imageLoading = false
      },

      handleImageLoad() {
        this.imageLoading = false
      }
    },
    mounted() {
      // 이미지 로드 이벤트 리스너 추가
      const img = this.$el.querySelector('.poster-image')
      if (img) {
        img.addEventListener('load', this.handleImageLoad)
      }
    }
  }
</script>

<style scoped>
  .onboarding-movie-card {
    position: relative;
    background: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .onboarding-movie-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--color-main-opacity-50);
  }

  .onboarding-movie-card.selected {
    border-color: var(--color-main);
    background: var(--color-highlight-background);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px var(--color-main-opacity-20);
  }

  .onboarding-movie-card:active {
    transform: translateY(-2px);
  }

  /* 선택 체크 표시 */
  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: var(--color-main);
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .selection-indicator .base-icon {
    color: var(--color-background);
    font-size: 14px;
  }

  /* 포스터 컨테이너 */
  .poster-container {
    position: relative;
    width: 100%;
    aspect-ratio: 2/3; /* 영화 포스터 비율 */
    overflow: hidden;
    background: var(--color-background);
  }

  .poster-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .onboarding-movie-card:hover .poster-image {
    transform: scale(1.05);
  }

  .poster-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* 영화 정보 */
  .movie-info {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .movie-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .movie-year {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .movie-overview {
    font-size: 11px;
    color: var(--color-highlight-text);
    line-height: 1.3;
    margin: 4px 0 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 선택 효과 오버레이 */
  .selection-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      var(--color-main-opacity-20) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  /* 비활성화 상태 */
  .onboarding-movie-card:disabled,
  .onboarding-movie-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .movie-info {
      padding: 10px;
    }

    .movie-title {
      font-size: 13px;
    }

    .movie-year {
      font-size: 11px;
    }

    .movie-overview {
      font-size: 10px;
    }
  }
</style>
