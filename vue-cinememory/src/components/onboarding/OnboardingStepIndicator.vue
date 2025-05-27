<template>
  <div class="onboarding-step-indicator">
    <div class="step-progress">
      <!-- 진행률 바 -->
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"></div>
      </div>

      <!-- 단계 아이콘들 -->
      <div class="steps-container">
        <div
          v-for="(label, index) in stepLabels"
          :key="index"
          class="step-item"
          :class="{
            completed: index + 1 < currentStep,
            current: index + 1 === currentStep,
            upcoming: index + 1 > currentStep
          }">
          <!-- 단계 번호/아이콘 -->
          <div class="step-circle">
            <BaseIcon
              v-if="index + 1 < currentStep"
              name="check"
              class="step-icon completed-icon" />
            <BaseIcon
              v-else-if="index + 1 === currentStep"
              :name="getStepIcon(index + 1)"
              class="step-icon current-icon" />
            <span
              v-else
              class="step-number">
              {{ index + 1 }}
            </span>
          </div>

          <!-- 단계 라벨 -->
          <div class="step-label">
            <span class="step-text">{{ label }}</span>
            <span
              v-if="index + 1 === currentStep"
              class="current-indicator">
              진행 중
            </span>
          </div>

          <!-- 연결선 (마지막 단계 제외) -->
          <div
            v-if="index < stepLabels.length - 1"
            class="step-connector"
            :class="{
              completed: index + 1 < currentStep
            }"></div>
        </div>
      </div>
    </div>

    <!-- 단계 설명 -->
    <div class="step-description">
      <p class="current-step-info">
        <span class="step-counter">{{ currentStep }} / {{ totalSteps }}</span>
        <span class="step-name">{{ currentStepLabel }}</span>
      </p>
    </div>
  </div>
</template>

<script>
  import BaseIcon from '../base/BaseIcon.vue'

  export default {
    name: 'OnboardingStepIndicator',
    components: {
      BaseIcon
    },
    props: {
      currentStep: {
        type: Number,
        required: true,
        validator: (value) => value >= 1
      },
      totalSteps: {
        type: Number,
        required: true,
        validator: (value) => value >= 1
      },
      stepLabels: {
        type: Array,
        required: true,
        validator: (value) => value.length > 0
      }
    },
    computed: {
      progressPercentage() {
        // 현재 단계 기준으로 진행률 계산
        return Math.min(
          ((this.currentStep - 1) / (this.totalSteps - 1)) * 100,
          100
        )
      },

      currentStepLabel() {
        return this.stepLabels[this.currentStep - 1] || '알 수 없는 단계'
      }
    },
    methods: {
      getStepIcon(stepNumber) {
        // 각 단계별 아이콘 반환
        const icons = {
          1: 'heart', // 재밌게 본 영화
          2: 'eye', // 관심있는 영화
          3: 'x-circle', // 제외할 장르
          4: 'brain' // 취향 분석
        }
        return icons[stepNumber] || 'circle'
      }
    }
  }
</script>

<style scoped>
  .onboarding-step-indicator {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* 진행률 바 */
  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--color-inactive-icon);
    border-radius: 2px;
    margin-bottom: 32px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-main) 0%,
      var(--color-gold-medium) 100%
    );
    border-radius: 2px;
    transition: width 0.8s ease;
  }

  /* 단계 컨테이너 */
  .steps-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    margin-bottom: 24px;
  }

  /* 개별 단계 아이템 */
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    max-width: 200px;
  }

  /* 단계 원형 */
  .step-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
  }

  /* 완료된 단계 */
  .step-item.completed .step-circle {
    background: var(--color-rating-good-text);
    border: 2px solid var(--color-rating-good-text);
  }

  .step-item.completed .step-circle .completed-icon {
    color: white;
    font-size: 20px;
  }

  /* 현재 단계 */
  .step-item.current .step-circle {
    background: var(--color-main);
    border: 2px solid var(--color-main);
    box-shadow: 0 0 0 4px var(--color-main-opacity-20);
    animation: pulse 2s infinite;
  }

  .step-item.current .step-circle .current-icon {
    color: white;
    font-size: 20px;
  }

  /* 예정된 단계 */
  .step-item.upcoming .step-circle {
    background: var(--color-card-background);
    border: 2px solid var(--color-inactive-icon);
  }

  .step-item.upcoming .step-number {
    color: var(--color-inactive-text);
    font-weight: 600;
    font-size: 16px;
  }

  /* 단계 라벨 */
  .step-label {
    text-align: center;
    min-height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .step-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    text-align: center;
    line-height: 1.2;
  }

  .step-item.upcoming .step-text {
    color: var(--color-inactive-text);
  }

  .current-indicator {
    font-size: 11px;
    color: var(--color-main);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* 단계 연결선 */
  .step-connector {
    position: absolute;
    top: 24px;
    left: calc(50% + 24px);
    right: calc(-50% + 24px);
    height: 2px;
    background: var(--color-inactive-icon);
    z-index: 1;
    transition: background-color 0.3s ease;
  }

  .step-connector.completed {
    background: var(--color-rating-good-text);
  }

  /* 단계 설명 */
  .step-description {
    text-align: center;
    padding: 16px;
    background: var(--color-card-background-opacity-50);
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
  }

  .current-step-info {
    margin: 0;
    font-size: 14px;
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .step-counter {
    font-weight: 600;
    color: var(--color-main);
  }

  .step-name {
    color: var(--color-highlight-text);
  }

  /* 펄스 애니메이션 */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--color-main-opacity-50);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(255, 183, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 183, 0, 0);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-step-indicator {
      padding: 0 16px;
    }

    .steps-container {
      margin-bottom: 20px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
    }

    .step-circle .current-icon,
    .step-circle .completed-icon {
      font-size: 16px;
    }

    .step-number {
      font-size: 14px;
    }

    .step-text {
      font-size: 12px;
    }

    .current-indicator {
      font-size: 10px;
    }

    .step-connector {
      top: 20px;
      left: calc(50% + 20px);
      right: calc(-50% + 20px);
    }

    .current-step-info {
      font-size: 13px;
      flex-direction: column;
      gap: 4px;
    }
  }

  @media (max-width: 480px) {
    .step-text {
      font-size: 11px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .steps-container {
      gap: 8px;
    }
  }
</style>
