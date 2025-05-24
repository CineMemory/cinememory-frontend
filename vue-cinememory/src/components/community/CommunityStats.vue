<!-- 커뮤니티 통계 -->
<template>
  <div class="community-stats">
    <div class="community-stats__container">
      
      <div class="community-stats__item">
        <div class="community-stats__icon">
          <BaseIcon name="file-text" />
        </div>
        <div class="community-stats__content">
          <span class="community-stats__value">{{ formatNumber(totalPosts) }}</span>
          <span class="community-stats__label">게시글</span>
        </div>
      </div>

      <div class="community-stats__divider"></div>

      <div class="community-stats__item">
        <div class="community-stats__icon">
          <BaseIcon name="users" />
        </div>
        <div class="community-stats__content">
          <span class="community-stats__value">{{ formatNumber(totalUsers) }}</span>
          <span class="community-stats__label">회원</span>
        </div>
      </div>

      <div class="community-stats__divider"></div>

      <div class="community-stats__item">
        <div class="community-stats__icon community-stats__icon--active">
          <BaseIcon name="activity" />
        </div>
        <div class="community-stats__content">
          <span class="community-stats__value">{{ formatNumber(activeUsers) }}</span>
          <span class="community-stats__label">활성 회원</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@/components/base/BaseIcon.vue'

defineProps({
  totalPosts: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  }
})

// 숫자 포맷팅 (1000 이상일 때 K 표기)
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

.community-stats {
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.community-stats__container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-large);
  border: 1px solid var(--color-inactive-icon);
}

.community-stats__item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.community-stats__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  background-color: var(--color-main-opacity-20);
  color: var(--color-main);
}

.community-stats__icon--active {
  background-color: var(--color-rating-good-light);
  color: var(--color-rating-good-dark);
  animation: pulse 2s infinite;
}

.community-stats__icon svg {
  width: 20px;
  height: 20px;
}

.community-stats__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.community-stats__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.community-stats__label {
  font-size: 12px;
  color: var(--color-highlight-text);
  font-weight: 500;
}

.community-stats__divider {
  width: 1px;
  height: 30px;
  background-color: var(--color-inactive-icon);
}

/* 펄스 애니메이션 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 태블릿 */
@media (max-width: 1024px) {
  .community-stats__container {
    gap: 16px;
    padding: 16px;
  }
  
  .community-stats__icon {
    width: 36px;
    height: 36px;
  }
  
  .community-stats__icon svg {
    width: 18px;
    height: 18px;
  }
  
  .community-stats__value {
    font-size: 18px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .community-stats__container {
    gap: 12px;
    padding: 12px;
  }
  
  .community-stats__item {
    gap: 8px;
  }
  
  .community-stats__icon {
    width: 32px;
    height: 32px;
  }
  
  .community-stats__icon svg {
    width: 16px;
    height: 16px;
  }
  
  .community-stats__value {
    font-size: 16px;
  }
  
  .community-stats__label {
    font-size: 11px;
  }
  
  .community-stats__divider {
    height: 24px;
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .community-stats__container {
    flex-direction: column;
    gap: 16px;
    padding: 16px 12px;
  }
  
  .community-stats__item {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
  }
  
  .community-stats__divider {
    width: 100%;
    height: 1px;
  }
}
</style>