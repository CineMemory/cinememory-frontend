<template>
  <div class="onboarding-analysis">
    <!-- 분석 준비 중 -->
    <div
      v-if="analysisStatus === 'preparing'"
      class="analysis-state preparing">
      <div class="state-content">
        <div class="spinner-container">
          <BaseSpinner size="large" />
        </div>
        <h3 class="state-title">분석을 준비하는 중입니다</h3>
        <p class="state-description">
          선택하신 영화들과 장르 정보를 바탕으로 취향 분석을 시작합니다...
        </p>
      </div>
    </div>

    <!-- 분석 진행 중 -->
    <div
      v-else-if="analysisStatus === 'analyzing'"
      class="analysis-state analyzing">
      <div
        class="movie-showcase"
        v-if="randomMovie">
        <!-- 배경 영화 포스터 -->
        <div class="background-poster">
          <img
            :src="
              getMoviePosterUrl(
                randomMovie.backdrop_path || randomMovie.poster_path
              )
            "
            :alt="randomMovie.title"
            class="background-image" />
          <div class="backdrop-overlay"></div>
        </div>

        <!-- 영화 정보 오버레이 -->
        <div class="movie-overlay">
          <div class="movie-info">
            <img
              :src="getMoviePosterUrl(randomMovie.poster_path)"
              :alt="randomMovie.title"
              class="movie-poster" />
            <div class="movie-details">
              <h3 class="movie-title">{{ randomMovie.title }}</h3>
              <p class="movie-subtitle">이런 영화는 어떠세요?</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 분석 상태 표시 -->
      <div class="analysis-progress">
        <div class="progress-content">
          <div class="ai-icon-container">
            <BaseIcon
              name="brain"
              class="ai-icon pulsing" />
          </div>

          <h3 class="analysis-title">
            🤖 AI가 당신의 취향을 분석하고 있습니다
          </h3>

          <!-- 진행 단계 표시 */
          <div class="progress-steps">
            <div class="progress-step" :class="{ active: currentProgressStep >= 1 }">
              <BaseIcon name="search" />
              <span>영화 선호도 패턴 분석</span>
            </div>
            <div class="progress-step" :class="{ active: currentProgressStep >= 2 }">
              <BaseIcon name="target" />
              <span>개인화 추천 알고리즘 적용</span>
            </div>
            <div class="progress-step" :class="{ active: currentProgressStep >= 3 }">
              <BaseIcon name="star" />
              <span>맞춤형 영화 큐레이션</span>
            </div>
          </div>
          
          <!-- 분석 진행률 바 -->
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"></div>
          </div>

          <p class="progress-text">
            {{ progressMessages[currentMessageIndex] }}
          </p>

          <!-- 예상 소요 시간 -->
          <div class="time-estimate">
            <BaseIcon name="clock" />
            <span>예상 소요 시간: {{ estimatedTime }}초</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 분석 완료 -->
    <div
      v-else-if="analysisStatus === 'completed'"
      class="analysis-state completed">
      <div class="state-content">
        <div class="success-animation">
          <BaseIcon
            name="check-circle"
            class="success-icon" />
        </div>
        <h3 class="state-title">✨ 취향 분석이 완료되었습니다!</h3>
        <p class="state-description">
          당신만의 개인화된 영화 추천 결과를 확인해보세요.
        </p>
        <BaseButton
          variant="primary"
          @click="$emit('complete')"
          class="view-results-button">
          결과 보기
        </BaseButton>
      </div>
    </div>

    <!-- 분석 오류 -->
    <div
      v-else-if="analysisStatus === 'error'"
      class="analysis-state error">
      <div class="state-content">
        <BaseIcon
          name="alert-circle"
          class="error-icon" />
        <h3 class="state-title">분석 중 오류가 발생했습니다</h3>
        <p class="state-description">
          일시적인 문제일 수 있습니다. 다시 시도해주세요.
        </p>
        <div class="error-actions">
          <BaseButton
            variant="primary"
            @click="$emit('retry')">
            다시 시도
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="$emit('skip')">
            나중에 하기
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import BaseSpinner from '../base/BaseSpinner.vue'
  import BaseIcon from '../base/BaseIcon.vue'
  import BaseButton from '../base/BaseButton.vue'

  export default {
    name: 'OnboardingAnalysis',
    components: {
      BaseSpinner,
      BaseIcon,
      BaseButton
    },
    props: {
      analysisStatus: {
        type: String,
        required: true,
        validator: (value) =>
          ['preparing', 'analyzing', 'completed', 'error'].includes(value)
      },
      randomMovie: {
        type: Object,
        default: null
      }
    },
    emits: ['complete', 'retry', 'skip'],
    data() {
      return {
        currentProgressStep: 1,
        progressPercentage: 0,
        currentMessageIndex: 0,
        estimatedTime: 30,

        progressMessages: [
          '영화 취향 데이터를 분석하고 있습니다...',
          '선호하는 장르와 스타일을 파악하고 있습니다...',
          '개인화된 추천 알고리즘을 적용하고 있습니다...',
          '최적의 영화들을 선별하고 있습니다...',
          '추천 이유를 생성하고 있습니다...',
          '거의 완료되었습니다!'
        ]
      }
    },
    watch: {
      analysisStatus(newStatus) {
        if (newStatus === 'analyzing') {
          this.startProgressSimulation()
        }
      }
    },
    mounted() {
      if (this.analysisStatus === 'analyzing') {
        this.startProgressSimulation()
      }
    },
    methods: {
      startProgressSimulation() {
        // 진행률과 메시지를 시뮬레이션
        let progress = 0
        let messageIndex = 0
        let step = 1

        const interval = setInterval(() => {
          if (this.analysisStatus !== 'analyzing') {
            clearInterval(interval)
            return
          }

          progress += Math.random() * 8 + 2 // 2-10% 씩 증가
          this.progressPercentage = Math.min(progress, 95) // 95%까지만

          // 단계 업데이트
          if (progress > 30 && step === 1) {
            this.currentProgressStep = 2
            step = 2
          } else if (progress > 60 && step === 2) {
            this.currentProgressStep = 3
            step = 3
          }

          // 메시지 변경
          if (progress > messageIndex * 15 + 15) {
            messageIndex++
            if (messageIndex < this.progressMessages.length) {
              this.currentMessageIndex = messageIndex
            }
          }

          // 예상 시간 감소
          if (this.estimatedTime > 0) {
            this.estimatedTime = Math.max(0, this.estimatedTime - 1)
          }

          // 완료시 정리
          if (progress >= 95) {
            clearInterval(interval)
          }
        }, 1000)
      },

      getMoviePosterUrl(posterPath) {
        if (!posterPath) return '/images/no-poster.png'

        if (posterPath.startsWith('http')) {
          return posterPath
        }

        return `https://image.tmdb.org/t/p/w500${posterPath}`
      }
    }
  }
</script>

<style scoped>
  .onboarding-analysis {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  /* 공통 상태 스타일 */
  .analysis-state {
    width: 100%;
    max-width: 800px;
    text-align: center;
  }

  .state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .state-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .state-description {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.5;
    max-width: 500px;
  }

  /* 준비 중 상태 */
  .preparing .spinner-container {
    margin-bottom: 8px;
  }

  /* 분석 중 상태 */
  .analyzing {
    max-width: none;
    width: 100%;
  }

  /* 영화 쇼케이스 */
  .movie-showcase {
    position: relative;
    height: 300px;
    border-radius: var(--border-radius-large);
    overflow: hidden;
    margin-bottom: 40px;
  }

  .background-poster {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .backdrop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(12, 11, 10, 0.8) 0%,
      rgba(12, 11, 10, 0.4) 50%,
      rgba(12, 11, 10, 0.8) 100%
    );
  }

  .movie-overlay {
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
  }

  .movie-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .movie-poster {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--border-radius-medium);
    border: 3px solid var(--color-main);
  }

  .movie-details {
    flex: 1;
    text-align: left;
  }

  .movie-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 4px 0;
  }

  .movie-subtitle {
    font-size: 16px;
    color: var(--color-main);
    margin: 0;
    font-weight: 500;
  }

  /* 분석 진행 상태 */
  .analysis-progress {
    background: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 40px;
    border: 1px solid var(--color-inactive-icon);
  }

  .progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .ai-icon-container {
    margin-bottom: 8px;
  }

  .ai-icon {
    font-size: 48px;
    color: var(--color-main);
  }

  .ai-icon.pulsing {
    animation: pulse-glow 2s infinite;
  }

  .analysis-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  /* 진행 단계 */
  .progress-steps {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin: 16px 0;
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.4;
    transition: opacity 0.5s ease;
  }

  .progress-step.active {
    opacity: 1;
  }

  .progress-step .base-icon {
    font-size: 24px;
    color: var(--color-main);
  }

  .progress-step span {
    font-size: 12px;
    color: var(--color-text);
    text-align: center;
    max-width: 100px;
    line-height: 1.2;
  }

  /* 진행률 바 */
  .progress-bar {
    width: 100%;
    max-width: 400px;
    height: 8px;
    background: var(--color-inactive-icon);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-main) 0%,
      var(--color-gold-medium) 100%
    );
    border-radius: 4px;
    transition: width 1s ease;
  }

  .progress-text {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .time-estimate {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-inactive-text);
  }

  /* 완료 상태 */
  .success-animation {
    margin-bottom: 8px;
  }

  .success-icon {
    font-size: 64px;
    color: var(--color-rating-good-text);
    animation: success-bounce 0.6s ease;
  }

  .view-results-button {
    margin-top: 16px;
    min-width: 160px;
  }

  /* 에러 상태 */
  .error-icon {
    font-size: 64px;
    color: var(--color-alert);
    margin-bottom: 8px;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 16px;
  }

  /* 애니메이션 */
  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes success-bounce {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-analysis {
      padding: 20px 16px;
    }

    .state-title {
      font-size: 22px;
    }

    .state-description {
      font-size: 14px;
    }

    .movie-showcase {
      height: 200px;
      margin-bottom: 24px;
    }

    .movie-overlay {
      bottom: 16px;
      left: 16px;
      right: 16px;
    }

    .movie-info {
      gap: 12px;
    }

    .movie-poster {
      width: 60px;
      height: 90px;
    }

    .movie-title {
      font-size: 18px;
    }

    .movie-subtitle {
      font-size: 14px;
    }

    .analysis-progress {
      padding: 24px;
    }

    .analysis-title {
      font-size: 20px;
    }

    .progress-steps {
      flex-direction: column;
      gap: 16px;
    }

    .progress-step {
      flex-direction: row;
      gap: 12px;
    }

    .progress-step span {
      max-width: none;
      text-align: left;
    }

    .error-actions {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }
  }
</style>
