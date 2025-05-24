<!-- 댓글 액션 버튼들 -->
<template>
  <div class="comment-item-actions">
    <!-- 답글 버튼 -->
    <BaseButton
      v-if="isAuthenticated"
      variant="ghost"
      size="small"
      icon-left="corner-down-right"
      @click="handleReplyClick">
      답글
    </BaseButton>

    <!-- 좋아요 버튼 (향후 구현) -->
    <!-- <BaseButton
      variant="ghost"
      size="small"
      icon-left="heart"
      @click="handleLikeClick">
      좋아요
    </BaseButton> -->

    <!-- 공유 버튼 -->
    <BaseButton
      variant="ghost"
      size="small"
      icon-left="share"
      @click="handleShareClick">
      공유
    </BaseButton>
  </div>
</template>

<script setup>
  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    commentId: {
      type: [String, Number],
      required: true
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['reply-click', 'like-click', 'share-click'])

  // 답글 클릭
  const handleReplyClick = () => {
    emit('reply-click', props.commentId)
  }

  // 좋아요 클릭 (향후 구현)
  const handleLikeClick = () => {
    emit('like-click', props.commentId)
  }

  // 공유 클릭
  const handleShareClick = () => {
    // 댓글 링크를 클립보드에 복사
    const currentUrl = window.location.href
    const commentUrl = `${currentUrl}#comment-${props.commentId}`

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(commentUrl)
        .then(() => {
          alert('댓글 링크가 클립보드에 복사되었습니다!')
        })
        .catch(() => {
          // 폴백: 수동으로 복사하도록 안내
          prompt('댓글 링크를 복사하세요:', commentUrl)
        })
    } else {
      // 폴백: 수동으로 복사하도록 안내
      prompt('댓글 링크를 복사하세요:', commentUrl)
    }

    emit('share-click', props.commentId)
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .comment-item-actions {
      gap: 4px;
    }
  }
</style>
