<template>
  <div class="onboarding-genre-selector">
    <!-- 헤더 -->
    <div class="selector-header">
      <div class="header-content">
        <h3 class="step-title">제외할 장르를 선택해주세요</h3>
        <p class="step-description">
          보고 싶지 않은 장르가 있다면 선택해주세요. 추천에서 해당 장르의 영화는
          제외됩니다. (선택사항)
        </p>
        <div class="selection-counter">
          <span class="selected-count">{{ selectedGenres.length }}</span>
          <span class="total-limit">/ {{ maxSelections }}</span>
          <span class="limit-text">개 선택</span>
        </div>
      </div>

      <!-- 다음 단계 버튼 -->
      <BaseButton
        variant="primary"
        @click="handleNext"
        class="next-button">
        취향 분석 시작하기
      </BaseButton>
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="loading-container">
      <BaseSpinner size="large" />
      <p class="loading-text">장르 목록을 불러오는 중...</p>
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

    <!-- 장르 선택 그리드 -->
    <div
      v-else
      class="genres-grid">
      <div
        v-for="genre in genres"
        :key="genre.genre_id"
        class="genre-item"
        :class="{
          selected: isGenreSelected(genre.genre_id),
          disabled: isMaxSelected && !isGenreSelected(genre.genre_id)
        }"
        @click="handleGenreClick(genre.genre_id)">
        <!-- 선택 체크 표시 -->
        <div
          class="selection-indicator"
          v-if="isGenreSelected(genre.genre_id)">
          <BaseIcon
            name="x"
            class="exclude-icon" />
        </div>

        <!-- 장르 아이콘 -->
        <div class="genre-icon">
          <BaseIcon :name="getGenreIcon(genre.genre_name)" />
        </div>

        <!-- 장르 이름 -->
        <h4 class="genre-name">{{ genre.genre_name }}</h4>

        <!-- 제외 표시 오버레이 -->
        <div
          class="exclude-overlay"
          v-if="isGenreSelected(genre.genre_id)">
          <span class="exclude-text">제외</span>
        </div>
      </div>
    </div>

    <!-- 선택 안내 메시지 -->
    <div
      v-if="!loading && !error"
      class="selection-guide">
      <div
        v-if="selectedGenres.length === 0"
        class="guide-message">
        <BaseIcon
          name="info"
          class="guide-icon" />
        <p>
          제외하고 싶은 장르가 없다면 바로 다음 단계로 진행하세요. 모든 장르의
          영화가 추천 대상에 포함됩니다.
        </p>
      </div>

      <div
        v-else-if="isMaxSelected"
        class="guide-message warning">
        <BaseIcon
          name="alert-triangle"
          class="guide-icon" />
        <p>
          최대 {{ maxSelections }}개까지 제외할 수 있습니다. 다른 장르를
          제외하려면 기존 선택을 해제해주세요.
        </p>
      </div>

      <div
        v-else
        class="guide-message">
        <BaseIcon
          name="check-circle"
          class="guide-icon" />
        <p>
          {{ selectedGenres.length }}개 장르가 추천에서 제외됩니다. 더
          선택하거나 다음 단계로 진행하세요.
        </p>
      </div>
    </div>

    <!-- 선택된 장르 미리보기 -->
    <div
      v-if="selectedGenres.length > 0"
      class="selected-preview">
      <h4 class="preview-title">제외될 장르</h4>
      <div class="selected-tags">
        <BaseTag
          v-for="genreId in selectedGenres"
          :key="genreId"
          variant="error"
          removable
          @remove="handleGenreUnselect(genreId)">
          {{ getGenreName(genreId) }}
        </BaseTag>
      </div>
    </div>
  </div>
</template>

<script>
  import BaseButton from '../base/BaseButton.vue'
  import BaseSpinner from '../base/BaseSpinner.vue'
  import BaseIcon from '../base/BaseIcon.vue'
  import BaseTag from '../base/BaseTag.vue'

  export default {
    name: 'OnboardingGenreSelector',
    components: {
      BaseButton,
      BaseSpinner,
      BaseIcon,
      BaseTag
    },
    props: {
      genres: {
        type: Array,
        default: () => []
      },
      selectedGenres: {
        type: Array,
        default: () => []
      },
      maxSelections: {
        type: Number,
        default: 3
      },
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: null
      }
    },
    emits: ['genre-select', 'genre-unselect', 'next', 'retry'],
    computed: {
      isMaxSelected() {
        return this.selectedGenres.length >= this.maxSelections
      }
    },
    methods: {
      isGenreSelected(genreId) {
        return this.selectedGenres.includes(genreId)
      },

      handleGenreClick(genreId) {
        if (this.isGenreSelected(genreId)) {
          this.handleGenreUnselect(genreId)
        } else if (!this.isMaxSelected) {
          this.handleGenreSelect(genreId)
        }
      },

      handleGenreSelect(genreId) {
        this.$emit('genre-select', genreId)
      },

      handleGenreUnselect(genreId) {
        this.$emit('genre-unselect', genreId)
      },

      handleNext() {
        this.$emit('next', this.selectedGenres)
      },

      getGenreName(genreId) {
        const genre = this.genres.find((g) => g.genre_id === genreId)
        return genre ? genre.genre_name : '알 수 없는 장르'
      },

      getGenreIcon(genreName) {
        // 장르별 아이콘 매핑
        const iconMap = {
          액션: 'zap',
          어드벤처: 'compass',
          애니메이션: 'smile',
          코미디: 'laugh',
          범죄: 'shield',
          다큐멘터리: 'file-text',
          드라마: 'heart',
          가족: 'users',
          판타지: 'star',
          역사: 'clock',
          공포: 'eye-off',
          음악: 'music',
          미스터리: 'search',
          로맨스: 'heart',
          SF: 'cpu',
          'TV 영화': 'tv',
          스릴러: 'alert-triangle',
          전쟁: 'target',
          서부: 'sunrise'
        }

        return iconMap[genreName] || 'film'
      }
    }
  }
</script>

<style scoped>
  .onboarding-genre-selector {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  /* 헤더 */
  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    gap: 24px;
  }

  .header-content {
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
    color: var(--color-alert);
    font-size: 18px;
  }

  .total-limit {
    color: var(--color-highlight-text);
  }

  .limit-text {
    color: var(--color-highlight-text);
  }

  .next-button {
    min-width: 180px;
    height: fit-content;
    white-space: nowrap;
  }

  /* 로딩 및 에러 상태 */
  .loading-container,
  .error-container {
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

  /* 장르 그리드 */
  .genres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  /* 장르 아이템 */
  .genre-item {
    position: relative;
    background: var(--color-card-background);
    border: 2px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    padding: 24px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .genre-item:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .genre-item.selected {
    border-color: var(--color-alert);
    background: var(--color-card-background);
    transform: translateY(-2px);
  }

  .genre-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* 선택 표시 */
  .selection-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background: var(--color-alert);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .exclude-icon {
    color: white;
    font-size: 16px;
  }

  /* 장르 아이콘 */
  .genre-icon {
    font-size: 32px;
    color: var(--color-main);
    transition: color 0.3s ease;
  }

  .genre-item.selected .genre-icon {
    color: var(--color-alert);
  }

  /* 장르 이름 */
  .genre-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    transition: color 0.3s ease;
  }

  .genre-item.selected .genre-name {
    color: var(--color-alert);
  }

  /* 제외 오버레이 */
  .exclude-overlay {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-alert);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  /* 선택 안내 메시지 */
  .selection-guide {
    border-top: 1px solid var(--color-inactive-icon);
    padding-top: 24px;
    margin-bottom: 24px;
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
    background: rgba(255, 56, 56, 0.1);
    border: 1px solid var(--color-alert);
  }

  .guide-icon {
    font-size: 20px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .guide-message.warning .guide-icon {
    color: var(--color-alert);
  }

  .guide-message p {
    margin: 0;
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.4;
  }

  /* 선택된 장르 미리보기 */
  .selected-preview {
    background: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    padding: 20px;
  }

  .preview-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-genre-selector {
      padding: 16px;
    }

    .selector-header {
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

    .genres-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }

    .genre-item {
      padding: 20px 12px;
      min-height: 100px;
    }

    .genre-icon {
      font-size: 28px;
    }

    .genre-name {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .genres-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .genre-item {
      padding: 16px 8px;
      min-height: 90px;
      gap: 8px;
    }

    .genre-icon {
      font-size: 24px;
    }

    .genre-name {
      font-size: 13px;
    }

    .selected-tags {
      gap: 6px;
    }
  }
</style>
