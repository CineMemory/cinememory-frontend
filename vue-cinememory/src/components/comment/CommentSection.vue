<!-- 댓글 섹션 -->
<template>
  <div class="comment-section">
    <!-- 댓글 섹션 헤더 -->
    <div class="comment-section__header">
      <h3 class="comment-section__title">
        <BaseIcon name="message-circle" />
        댓글 {{ totalComments }}개
      </h3>

      <CommentSectionStats
        :total-comments="totalComments"
        :comment-count="comments.length" />
    </div>

    <!-- 댓글 작성 폼 (로그인한 경우에만) -->
    <div
      v-if="isAuthenticated"
      class="comment-section__form">
      <CommentSectionForm
        :post-id="postId"
        :is-loading="isCreatingComment"
        @comment-created="handleCommentCreated" />
    </div>

    <!-- 로그인 안내 (비로그인 사용자) -->
    <div
      v-else
      class="comment-section__login-notice">
      <BaseIcon name="lock" />
      <span>댓글을 작성하려면 로그인이 필요합니다.</span>
      <BaseButton
        variant="secondary"
        size="small"
        @click="goToLogin">
        로그인
      </BaseButton>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment-section__list">
      <!-- 로딩 상태 -->
      <div
        v-if="isLoading"
        class="comment-section__loading">
        <BaseSpinner size="lg" />
        <p>댓글을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="comment-section__error">
        <BaseIcon name="alert-circle" />
        <p>{{ error }}</p>
        <BaseButton
          variant="secondary"
          size="small"
          @click="retryLoad">
          다시 시도
        </BaseButton>
      </div>

      <!-- 댓글이 없는 경우 -->
      <div
        v-else-if="!isLoading && comments.length === 0"
        class="comment-section__empty">
        <BaseIcon name="message-circle" />
        <h4>아직 댓글이 없습니다</h4>
        <p>첫 번째 댓글을 작성해보세요!</p>
      </div>

      <!-- 댓글 목록 -->
      <CommentSectionList
        v-else
        :comments="comments"
        :post-id="postId"
        @comment-deleted="handleCommentDeleted"
        @reply-created="handleReplyCreated" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import CommentSectionStats from './CommentSectionStats.vue'
  import CommentSectionForm from './CommentSectionForm.vue'
  import CommentSectionList from './CommentSectionList.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const props = defineProps({
    postId: {
      type: [String, Number],
      required: true
    },
    onLoginRequired: {
      type: Function,
      default: null
    }
  })

  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const isCreatingComment = ref(false)

  // 계산된 속성
  const comments = computed(() => communityStore.comments)
  const isLoading = computed(() => communityStore.isLoadingComments)
  const error = computed(() => communityStore.error)

  const totalComments = computed(() => {
    let count = comments.value.length

    // 대댓글 수도 포함
    comments.value.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += comment.replies.length
      }
    })

    return count
  })

  // 초기 댓글 로드
  onMounted(() => {
    loadComments()
  })

  // postId 변경 시 댓글 다시 로드
  watch(
    () => props.postId,
    () => {
      loadComments()
    }
  )

  // 댓글 로드
  const loadComments = async () => {
    if (!props.postId) return

    await communityStore.fetchComments(props.postId)
  }

  // 댓글 다시 로드
  const retryLoad = () => {
    communityStore.clearError()
    loadComments()
  }

  // 로그인 처리
  const goToLogin = () => {
    // onLoginRequired 콜백이 있으면 모달 사용, 없으면 로그인 페이지로 이동
    if (props.onLoginRequired) {
      props.onLoginRequired()
    } else {
      router.push({
        name: 'Auth',
        query: {
          mode: 'login',
          redirect: router.currentRoute.value.fullPath
        }
      })
    }
  }

  // 댓글 생성 처리
  const handleCommentCreated = async (commentData) => {
    try {
      isCreatingComment.value = true

      const result = await communityStore.createComment(
        props.postId,
        commentData
      )

      if (!result.success) {
        alert(result.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      isCreatingComment.value = false
    }
  }

  // 댓글 삭제 처리
  const handleCommentDeleted = async (commentId) => {
    const result = await communityStore.deleteComment(commentId, props.postId)

    if (!result.success) {
      alert(result.error || '댓글 삭제에 실패했습니다.')
    }
  }

  // 대댓글 생성 처리
  const handleReplyCreated = async (replyData) => {
    try {
      const result = await communityStore.createComment(props.postId, replyData)

      if (!result.success) {
        alert(result.error || '답글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 작성 중 오류:', error)
      alert('답글 작성 중 오류가 발생했습니다.')
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-section {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .comment-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .comment-section__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .comment-section__title svg {
    width: 20px;
    height: 20px;
    color: var(--color-main);
  }

  .comment-section__form {
    margin-bottom: 24px;
  }

  .comment-section__login-notice {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--color-highlight-text);
  }

  .comment-section__login-notice svg {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  .comment-section__list {
    min-height: 100px;
  }

  .comment-section__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px 16px;
    color: var(--color-highlight-text);
  }

  .comment-section__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px 16px;
    color: var(--color-alert);
    text-align: center;
  }

  .comment-section__error svg {
    width: 32px;
    height: 32px;
  }

  .comment-section__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 16px;
    color: var(--color-highlight-text);
    text-align: center;
  }

  .comment-section__empty svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }

  .comment-section__empty h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .comment-section__empty p {
    font-size: 14px;
    margin: 0;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .comment-section__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .comment-section__title {
      font-size: 16px;
    }

    .comment-section__login-notice {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
</style>
