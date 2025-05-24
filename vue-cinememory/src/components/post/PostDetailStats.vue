<!-- 게시글 상세 통계 -->
<template>
  <div class="post-detail-stats">
    <div class="post-detail-stats__item">
      <BaseIcon name="heart" />
      <span class="post-detail-stats__value">{{
        formatNumber(likeCount)
      }}</span>
      <span class="post-detail-stats__label">좋아요</span>
    </div>

    <div class="post-detail-stats__divider"></div>

    <div class="post-detail-stats__item">
      <BaseIcon name="message-circle" />
      <span class="post-detail-stats__value">{{
        formatNumber(commentCount)
      }}</span>
      <span class="post-detail-stats__label">댓글</span>
    </div>

    <div class="post-detail-stats__divider"></div>

    <div class="post-detail-stats__item">
      <BaseIcon name="eye" />
      <span class="post-detail-stats__value">{{
        formatNumber(viewCount)
      }}</span>
      <span class="post-detail-stats__label">조회</span>
    </div>
  </div>
</template>

<script setup>
  import BaseIcon from '@/components/base/BaseIcon.vue'

  defineProps({
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
  })

  // 숫자 포맷팅
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-detail-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-detail-stats__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .post-detail-stats__item svg {
    width: 20px;
    height: 20px;
    color: var(--color-highlight-text);
  }

  .post-detail-stats__value {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1;
  }

  .post-detail-stats__label {
    font-size: 12px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .post-detail-stats__divider {
    width: 1px;
    height: 32px;
    background-color: var(--color-inactive-icon);
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-detail-stats {
      gap: 16px;
    }

    .post-detail-stats__item svg {
      width: 18px;
      height: 18px;
    }

    .post-detail-stats__value {
      font-size: 16px;
    }

    .post-detail-stats__label {
      font-size: 11px;
    }

    .post-detail-stats__divider {
      height: 28px;
    }
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    .post-detail-stats {
      gap: 12px;
    }

    .post-detail-stats__item {
      gap: 2px;
    }

    .post-detail-stats__item svg {
      width: 16px;
      height: 16px;
    }

    .post-detail-stats__value {
      font-size: 14px;
    }

    .post-detail-stats__label {
      font-size: 10px;
    }

    .post-detail-stats__divider {
      height: 24px;
    }
  }
</style>
