<!-- 댓글 작성자 정보 -->
<template>
  <div class="comment-item-author">
    <span class="comment-item-author__username">{{ author.username }}</span>
    <span class="comment-item-author__time">{{ formatTime(createdAt) }}</span>
  </div>
</template>

<script setup>
defineProps({
  author: {
    type: Object,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
})

// 시간 포맷팅
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return '방금 전'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}시간 전`
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.comment-item-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.comment-item-author__username {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.comment-item-author__time {
  font-size: 12px;
  color: var(--color-highlight-text);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .comment-item-author__username {
    font-size: 13px;
  }
  
  .comment-item-author__time {
    font-size: 11px;
  }
}
</style>