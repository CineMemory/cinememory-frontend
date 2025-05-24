<!-- 댓글 목록 -->
<template>
  <div class="comment-section-list">
    <div class="comment-section-list__items">
      <!-- 각 댓글 아이템 -->
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-section-list__item">
        <!-- 메인 댓글 -->
        <CommentItem
          :comment="comment"
          :post-id="postId"
          @reply-click="handleReplyClick"
          @comment-deleted="handleCommentDeleted" />

        <!-- 대댓글들 -->
        <div
          v-if="comment.replies && comment.replies.length > 0"
          class="comment-section-list__replies">
          <CommentNested
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :post-id="postId"
            :parent-comment="comment"
            @comment-deleted="handleCommentDeleted" />
        </div>

        <!-- 대댓글 작성 폼 -->
        <div
          v-if="replyingTo === comment.id"
          class="comment-section-list__reply-form">
          <CommentSectionForm
            :post-id="postId"
            :parent-comment="comment"
            @comment-created="handleReplyCreated"
            @cancel-reply="cancelReply" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import CommentItem from './CommentItem.vue'
  import CommentNested from './CommentNested.vue'
  import CommentSectionForm from './CommentSectionForm.vue'

  const props = defineProps({
    comments: {
      type: Array,
      default: () => []
    },
    postId: {
      type: [String, Number],
      required: true
    }
  })

  const emit = defineEmits(['comment-deleted', 'reply-created'])

  // 현재 답글 작성 중인 댓글 ID
  const replyingTo = ref(null)

  // 답글 버튼 클릭 처리
  const handleReplyClick = (commentId) => {
    if (replyingTo.value === commentId) {
      // 이미 답글 작성 중이면 취소
      replyingTo.value = null
    } else {
      // 새로운 답글 작성
      replyingTo.value = commentId
    }
  }

  // 답글 취소
  const cancelReply = () => {
    replyingTo.value = null
  }

  // 댓글 삭제 처리
  const handleCommentDeleted = (commentId) => {
    // 삭제된 댓글이 현재 답글 작성 중인 댓글이면 답글 폼 닫기
    if (replyingTo.value === commentId) {
      replyingTo.value = null
    }

    emit('comment-deleted', commentId)
  }

  // 답글 생성 처리
  const handleReplyCreated = (replyData) => {
    // 답글 폼 닫기
    replyingTo.value = null

    emit('reply-created', replyData)
  }
</script>

<style scoped>
  @import '@/assets/colors.css';

  .comment-section-list {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .comment-section-list__items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment-section-list__item {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comment-section-list__replies {
    margin-left: 48px;
    padding-left: 16px;
    border-left: 2px solid var(--color-inactive-icon);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comment-section-list__reply-form {
    margin-left: 48px;
    padding-left: 16px;
    border-left: 2px solid var(--color-main-opacity-50);
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .comment-section-list__replies {
      margin-left: 32px;
      padding-left: 12px;
    }

    .comment-section-list__reply-form {
      margin-left: 32px;
      padding-left: 12px;
    }
  }
</style>
