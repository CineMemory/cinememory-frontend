<!-- 댓글 섹션 통계 -->
<template>
  <div class="comment-section-stats">
    <div class="comment-section-stats__item">
      <BaseIcon name="message-circle" />
      <span class="comment-section-stats__count">{{ commentCount }}</span>
      <span class="comment-section-stats__label">댓글</span>
    </div>
    
    <div
      v-if="replyCount > 0"
      class="comment-section-stats__item">
      <BaseIcon name="corner-down-right" />
      <span class="comment-section-stats__count">{{ replyCount }}</span>
      <span class="comment-section-stats__label">답글</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const props = defineProps({
  totalComments: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
})

// 답글 수 계산 (전체 댓글 수 - 최상위 댓글 수)
const replyCount = computed(() => {
  return Math.max(0, props.totalComments - props.commentCount)
})
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.comment-section-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.comment-section-stats__item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.comment-section-stats__item svg {
  width: 14px;
  height: 14px;
  color: var(--color-highlight-text);
}

.comment-section-stats__count {
  font-weight: 600;
  color: var(--color-text);
}

.comment-section-stats__label {
  color: var(--color-highlight-text);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .comment-section-stats {
    gap: 12px;
  }
  
  .comment-section-stats__item {
    font-size: 12px;
  }
  
  .comment-section-stats__item svg {
    width: 12px;
    height: 12px;
  }
}
</style>