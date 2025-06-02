<template>
  <div class="timeline-view">
    <!-- 헤더 -->
    <div class="timeline-header">
      <div class="header-content">
        <BaseButton
          @click="goBack"
          variant="secondary"
          class="back-button">
          <BaseIcon name="arrow-left" />
          돌아가기
        </BaseButton>

        <div class="header-title">
          <h1>🎬 나의 시네마틱 여정</h1>
          <p>당신만을 위한 개인화된 영화 추천 타임라인</p>
        </div>
      </div>
    </div>

    <!-- 타임라인 컨테이너 -->
    <TimelineContainer />
  </div>
</template>

<script>
  import { useAuth } from '@/composables/useAuth'
  import TimelineContainer from '@/components/timeline/TimelineContainer.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  export default {
    name: 'TimelineView',
    components: {
      TimelineContainer,
      BaseButton,
      BaseIcon
    },
    setup() {
      const { user, isAuthenticated } = useAuth()
      return { user, isAuthenticated }
    },
    async mounted() {
      // 인증 확인
      if (!this.isAuthenticated) {
        this.$router.push('/auth')
        return
      }

      // 온보딩 완료 확인
      if (!this.user?.onboarding_completed) {
        this.$router.push('/onboarding')
        return
      }

      console.log('📊 타임라인 뷰 마운트 완료')
      console.log('👤 사용자:', this.user)
    },
    methods: {
      goBack() {
        this.$router.push('/')
      }
    }
  }
</script>

<style scoped>
  .timeline-view {
    min-height: 100vh;
    background: var(--color-background);
  }

  /* 헤더 */
  .timeline-header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 20px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .back-button {
    flex-shrink: 0;
  }

  .header-title {
    flex: 1;
    text-align: center;
  }

  .header-title h1 {
    color: var(--color-text);
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .header-title p {
    color: var(--color-highlight-text);
    font-size: 16px;
    margin: 0;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .timeline-header {
      padding: 16px;
    }

    .header-content {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .back-button {
      align-self: flex-start;
    }

    .header-title h1 {
      font-size: 24px;
    }

    .header-title p {
      font-size: 14px;
    }
  }
</style>
