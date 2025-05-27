<template>
  <div class="timeline-view">
    <div class="timeline-header">
      <h1>🎬 나의 시네마틱 여정</h1>
      <p>온보딩이 완료되었습니다! 타임라인 기능은 준비 중입니다.</p>
    </div>

    <div class="timeline-content">
      <BaseButton
        @click="goBack"
        variant="secondary">
        돌아가기
      </BaseButton>
    </div>
  </div>
</template>

<script>
  import BaseButton from '@/components/base/BaseButton.vue'

  export default {
    name: 'TimelineView',
    components: {
      BaseButton
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
    padding: 40px 20px;
    text-align: center;
  }

  .timeline-header h1 {
    color: var(--color-text);
    font-size: 32px;
    margin-bottom: 16px;
  }

  .timeline-header p {
    color: var(--color-highlight-text);
    font-size: 16px;
    margin-bottom: 40px;
  }
</style>
