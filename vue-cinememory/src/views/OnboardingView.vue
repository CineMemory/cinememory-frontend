<template>
  <div class="onboarding-view">
    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      class="loading-wrapper">
      <BaseSpinner size="large" />
      <p class="loading-text">온보딩을 준비하는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="error-wrapper">
      <BaseIcon
        name="alert-circle"
        class="error-icon" />
      <h2 class="error-title">온보딩을 시작할 수 없습니다</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <BaseButton
          @click="retry"
          variant="primary">
          다시 시도
        </BaseButton>
        <BaseButton
          @click="goHome"
          variant="secondary">
          홈으로 이동
        </BaseButton>
      </div>
    </div>

    <!-- 이미 완료된 경우 -->
    <div
      v-else-if="alreadyCompleted"
      class="already-completed">
      <BaseIcon
        name="check-circle"
        class="completed-icon" />
      <h2 class="completed-title">이미 취향 분석이 완료되었습니다!</h2>
      <p class="completed-message">
        당신의 개인화된 영화 타임라인을 확인해보세요.
      </p>
      <div class="completed-actions">
        <BaseButton
          @click="goToTimeline"
          variant="primary">
          내 타임라인 보기
        </BaseButton>
        <BaseButton
          @click="goHome"
          variant="secondary">
          홈으로 이동
        </BaseButton>
        <BaseButton
          @click="showRetakeOption = true"
          variant="secondary">
          다시 분석하기
        </BaseButton>
      </div>
    </div>

    <!-- 다시 분석 확인 모달 -->
    <BaseModal
      v-if="showRetakeOption"
      :modal-value="showRetakeOption"
      title="취향 분석 다시 하기"
      @close="showRetakeOption = false">
      <div class="retake-modal-content">
        <p>
          현재 분석 결과가 삭제되고 처음부터 다시 분석하게 됩니다. 정말
          진행하시겠나요?
        </p>
        <div class="retake-actions">
          <BaseButton
            @click="resetAndRestart"
            variant="primary">
            네, 다시 하겠습니다
          </BaseButton>
          <BaseButton
            @click="showRetakeOption = false"
            variant="secondary">
            취소
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- 온보딩 컨테이너 -->
    <OnboardingContainer
      v-else
      @completed="handleOnboardingCompleted"
      @error="handleOnboardingError" />
  </div>
</template>

<script>
  import { useAuth } from '@/composables/useAuth'
  import { useAuthStore } from '@/stores/auth'
  import onboardingApi from '@/services/onboardingApi'
  import OnboardingContainer from '@/components/onboarding/OnboardingContainer.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  export default {
    name: 'OnboardingView',
    components: {
      OnboardingContainer,
      BaseSpinner,
      BaseIcon,
      BaseButton,
      BaseModal
    },
    setup() {
      const { user, isAuthenticated } = useAuth()
      return { user, isAuthenticated }
    },
    data() {
      return {
        loading: true,
        error: null,
        alreadyCompleted: false,
        showRetakeOption: false
      }
    },
    async mounted() {
      await this.initializeOnboarding()
    },
    methods: {
      // 온보딩 초기화
      async initializeOnboarding() {
        // 로그인 확인
        if (!this.isAuthenticated) {
          this.$router.push('/auth')
          return
        }

        this.loading = true
        this.error = null
        this.alreadyCompleted = false // 초기화

        try {
          // 온보딩 상태 확인
          const status = await onboardingApi.getOnboardingStatus()

          // 이미 완료된 경우
          if (status.completed) {
            this.alreadyCompleted = true
            this.loading = false // 로딩 종료
            return
          }

          // 완료되지 않은 경우 로딩만 종료하고 OnboardingContainer가 표시되도록
          this.loading = false
        } catch (error) {
          console.error('온보딩 초기화 실패:', error)

          // 인증 오류 시 로그인 페이지로
          if (error.response?.status === 401) {
            this.$router.push('/auth')
            return
          }

          // 다른 에러의 경우 OnboardingContainer가 표시되도록 (API 에러 처리는 각 컴포넌트에서)
          this.loading = false
          this.error = null // 에러 상태 제거하여 OnboardingContainer 표시
        }
      },

      // 재시도
      async retry() {
        await this.initializeOnboarding()
      },

      // 홈으로 이동
      goHome() {
        console.log('🏠 홈으로 이동 시도')
        try {
          this.$router.push('/')
        } catch (error) {
          console.error('홈 이동 실패:', error)
        }
      },

      // 타임라인으로 이동
      goToTimeline() {
        console.log('🎬 타임라인으로 이동 시도')
        console.log('👤 현재 사용자:', this.user)
        console.log('✅ 온보딩 완료 상태:', this.user?.onboarding_completed)

        // 🔥 authStore 사용해서 사용자 정보 업데이트
        const authStore = useAuthStore()
        if (authStore.user) {
          const updatedUser = {
            ...authStore.user,
            onboarding_completed: true
          }
          authStore.setUser(updatedUser)
          console.log('✅ 사용자 정보 업데이트 완료:', updatedUser)
        }

        try {
          this.$router.push('/timeline')
        } catch (error) {
          console.error('타임라인 이동 실패:', error)
        }
      },

      // 온보딩 재시작 (기존 데이터 초기화)
      async resetAndRestart() {
        this.showRetakeOption = false
        this.alreadyCompleted = false

        // 여기서 기존 온보딩 데이터를 초기화하는 API를 호출해야 합니다
        // 현재 Django API에는 초기화 엔드포인트가 없으므로,
        // 필요하다면 백엔드에 추가해야 합니다

        try {
          // TODO: 온보딩 초기화 API 호출
          // await onboardingApi.resetOnboarding()

          // 일단 페이지 새로고침으로 대체
          window.location.reload()
        } catch (error) {
          console.error('온보딩 초기화 실패:', error)
          this.error = '온보딩 초기화 중 오류가 발생했습니다.'
        }
      },

      // 온보딩 완료 처리
      handleOnboardingCompleted() {
        // OnboardingContainer에서 완료 이벤트를 받으면 타임라인으로 이동
        this.$router.push('/timeline')
      },

      // 온보딩 에러 처리
      handleOnboardingError(error) {
        this.error = error
      }
    },

    // 라우트 가드 - 온보딩 완료 후 재접근 방지
    beforeRouteEnter(to, from, next) {
      next((vm) => {
        // 이미 완료된 사용자가 직접 URL로 접근하는 경우 처리
        if (vm.user?.onboarding_completed && !to.query.retake) {
          vm.alreadyCompleted = true
        }
      })
    }
  }
</script>

<style scoped>
  .onboarding-view {
    min-height: 100vh;
    background: var(--color-background);
  }

  /* 공통 래퍼 스타일 */
  .loading-wrapper,
  .error-wrapper,
  .already-completed {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px 20px;
    text-align: center;
  }

  /* 로딩 상태 */
  .loading-text {
    margin-top: 20px;
    color: var(--color-highlight-text);
    font-size: 16px;
  }

  /* 에러 상태 */
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

  .error-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* 이미 완료된 상태 */
  .completed-icon {
    font-size: 64px;
    color: var(--color-rating-good-text);
    margin-bottom: 24px;
  }

  .completed-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .completed-message {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0 0 32px 0;
    max-width: 400px;
    line-height: 1.5;
  }

  .completed-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* 재분석 모달 */
  .retake-modal-content {
    padding: 20px;
    text-align: center;
  }

  .retake-modal-content p {
    margin: 0 0 24px 0;
    color: var(--color-text);
    line-height: 1.5;
  }

  .retake-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .loading-wrapper,
    .error-wrapper,
    .already-completed {
      padding: 20px 16px;
    }

    .error-title,
    .completed-title {
      font-size: 20px;
    }

    .error-message,
    .completed-message,
    .loading-text {
      font-size: 14px;
    }

    .error-actions,
    .completed-actions {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .retake-actions {
      flex-direction: column;
    }
  }
</style>
