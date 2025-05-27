<template>
  <div class="onboarding-movie-grid">
    <!-- 그리드 헤더 -->
    <div class="grid-header">
      <div class="selection-info">
        <h3 class="step-title">{{ stepTitle }}</h3>
        <p class="step-description">{{ stepDescription }}</p>
        <div class="selection-counter">
          <span class="selected-count">{{ selectedMovies.length }}</span>
          <span class="total-limit">/ {{ maxSelections }}</span>
          <span class="limit-text">개 선택</span>
        </div>
      </div>

      <!-- 선택 완료 버튼 -->
      <BaseButton
        variant="primary"
        :disabled="!canProceed"
        @click="handleNext"
        class="next-button">
        {{ nextButtonText }}
      </BaseButton>
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="loading-container">
      <BaseSpinner size="large" />
      <p class="loading-text">영화를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="error-container">
      <BaseIcon
        name="alert-circle"
        class="error-icon" />
      <p class="error-text">{{ error }}</p>
      <BaseButton
        @click="$emit('retry')"
        variant="secondary">
        다시 시도
      </BaseButton>
    </div>

    <!-- 영화 그리드 -->
    <div
      v-else
      class="movies-grid">
      <OnboardingMovieCard
        v-for="movie in movies"
        :key="movie.movie_id"
        :movie="movie"
        :is-selected="isMovieSelected(movie.movie_id)"
        :show-overview="showOverview"
        :disabled="isMaxSelected && !isMovieSelected(movie.movie_id)"
        @select="handleMovieSelect"
        @unselect="handleMovieUnselect" />
    </div>

    <!-- 선택 안내 메시지 -->
    <div
      v-if="!loading && !error"
      class="selection-guide">
      <div
        v-if="selectedMovies.length === 0"
        class="guide-message">
        <BaseIcon
          name="mouse-pointer"
          class="guide-icon" />
        <p>{{ selectionGuideText }}</p>
      </div>

      <div
        v-else-if="isMaxSelected"
        class="guide-message warning">
        <BaseIcon
          name="info"
          class="guide-icon" />
        <p>
          최대 {{ maxSelections }}개까지 선택할 수 있습니다. 다른 영화를
          선택하려면 기존 선택을 해제해주세요.
        </p>
      </div>

      <div
        v-else-if="selectedMovies.length >= minSelections"
        class="guide-message success">
        <BaseIcon
          name="check-circle"
          class="guide-icon" />
        <p>
          좋습니다! {{ selectedMovies.length }}개 선택했습니다. 더 선택하거나
          다음 단계로 진행하세요.
        </p>
      </div>

      <div
        v-else
        class="guide-message">
        <BaseIcon
          name="target"
          class="guide-icon" />
        <p>{{ minSelections - selectedMovies.length }}개 더 선택해주세요.</p>
      </div>
    </div>
  </div>
</template>

<script>
  import OnboardingMovieCard from './OnboardingMovieCard.vue'
  import BaseButton from '../base/BaseButton.vue'
  import BaseSpinner from '../base/BaseSpinner.vue'
  import BaseIcon from '../base/BaseIcon.vue'

  export default {
    name: 'OnboardingMovieGrid',
    components: {
      OnboardingMovieCard,
      BaseButton,
      BaseSpinner,
      BaseIcon
    },
    props: {
      // 단계 정보
      stepTitle: {
        type: String,
        required: true
      },
      stepDescription: {
        type: String,
        required: true
      },
      stepNumber: {
        type: Number,
        required: true
      },

      // 영화 데이터
      movies: {
        type: Array,
        default: () => []
      },

      // 선택 관련
      selectedMovies: {
        type: Array,
        default: () => []
      },
      minSelections: {
        type: Number,
        default: 1
      },
      maxSelections: {
        type: Number,
        default: 5
      },

      // 표시 옵션
      showOverview: {
        type: Boolean,
        default: false
      },

      // 상태
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: null
      }
    },
    emits: ['movie-select', 'movie-unselect', 'next', 'retry'],
    computed: {
      isMaxSelected() {
        return this.selectedMovies.length >= this.maxSelections
      },

      canProceed() {
        return (
          this.selectedMovies.length >= this.minSelections &&
          this.selectedMovies.length <= this.maxSelections
        )
      },

      nextButtonText() {
        if (this.stepNumber === 3) return '장르 선택하기'
        if (this.stepNumber === 2) return '분석 시작하기'
        return '다음 단계'
      },

      selectionGuideText() {
        if (this.stepNumber === 1) {
          return '재밌게 본 영화를 선택해주세요. 최소 1개, 최대 10개까지 선택 가능합니다.'
        } else if (this.stepNumber === 2) {
          return '포스터만 보고 재밌어 보이는 영화를 선택해주세요. 최소 1개, 최대 10개까지 선택 가능합니다.'
        }
        return '영화를 선택해주세요.'
      }
    },
    methods: {
      isMovieSelected(movieId) {
        return this.selectedMovies.includes(movieId)
      },

      handleMovieSelect(movieId) {
        if (this.isMaxSelected) return
        this.$emit('movie-select', movieId)
      },

      handleMovieUnselect(movieId) {
        this.$emit('movie-unselect', movieId)
      },

      handleNext() {
        if (this.canProceed) {
          this.$emit('next', this.selectedMovies)
        }
      }
    }
  }
</script>

<style scoped>
  .onboarding-movie-grid {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  /* 그리드 헤더 */
  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    gap: 24px;
  }

  .selection-info {
    flex: 1;
  }

  .step-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .step-description {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0 0 12px 0;
    line-height: 1.5;
  }

  .selection-counter {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
  }

  .selected-count {
    font-weight: 600;
    color: var(--color-main);
    font-size: 18px;
  }

  .total-limit {
    color: var(--color-highlight-text);
  }

  .limit-text {
    color: var(--color-highlight-text);
  }

  .next-button {
    min-width: 140px;
    height: fit-content;
    white-space: nowrap;
  }

  /* 로딩 상태 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 16px;
  }

  .loading-text {
    color: var(--color-highlight-text);
    font-size: 16px;
    margin: 0;
  }

  /* 에러 상태 */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 16px;
  }

  .error-icon {
    font-size: 48px;
    color: var(--color-alert);
  }

  .error-text {
    color: var(--color-text);
    font-size: 16px;
    text-align: center;
    margin: 0;
  }

  /* 영화 그리드 */
  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  /* 선택 안내 메시지 */
  .selection-guide {
    border-top: 1px solid var(--color-inactive-icon);
    padding-top: 24px;
  }

  .guide-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: var(--border-radius-medium);
    background: var(--color-card-background-opacity-50);
  }

  .guide-message.warning {
    background: var(--color-main-opacity-20);
    border: 1px solid var(--color-main-opacity-50);
  }

  .guide-message.success {
    background: var(--color-rating-good-light);
    background: rgba(143, 173, 136, 0.2);
    border: 1px solid var(--color-rating-good-text);
  }

  .guide-icon {
    font-size: 20px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .guide-message.warning .guide-icon {
    color: var(--color-main);
  }

  .guide-message.success .guide-icon {
    color: var(--color-rating-good-text);
  }

  .guide-message p {
    margin: 0;
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.4;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-movie-grid {
      padding: 16px;
    }

    .grid-header {
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
    }

    .next-button {
      width: 100%;
      min-width: auto;
    }

    .step-title {
      font-size: 20px;
    }

    .step-description {
      font-size: 14px;
    }

    .movies-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .guide-message {
      padding: 12px;
    }

    .guide-message p {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .movies-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }
</style>
