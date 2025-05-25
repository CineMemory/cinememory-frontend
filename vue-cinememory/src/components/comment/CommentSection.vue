<!-- 댓글 섹션 -->
<template>
  <div class="comment-section">
    <!-- 댓글 작성 폼 -->
    <div class="comment-section__form">
      <CommentForm
        :post-id="postId"
        :loading="isLoadingComments"
        @comment-created="handleCommentCreated" />
    </div>

    <!-- 댓글 목록 헤더 -->
    <div class="comment-section__header">
      <h3 class="comment-section__title">댓글 {{ totalCommentCount }}개</h3>

      <!-- 정렬 옵션 -->
      <BaseSelect
        v-model="sortBy"
        :options="sortOptions"
        size="small"
        class="comment-section__sort" />
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="isLoadingComments && comments.length === 0"
      class="comment-section__loading">
      <BaseSpinner size="md" />
      <span>댓글을 불러오는 중...</span>
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

    <!-- 빈 상태 -->
    <div
      v-else-if="sortedComments.length === 0"
      class="comment-section__empty">
      <BaseIcon name="message-circle" />
      <p>아직 댓글이 없습니다.</p>
      <p>첫 번째 댓글을 작성해보세요!</p>
    </div>

    <!-- 댓글 목록 -->
    <div
      v-else
      class="comment-section__list">
      <TransitionGroup
        name="comment-list"
        tag="div">
        <CommentItem
          v-for="comment in sortedComments"
          :key="`comment-${comment.comment_id || comment.id}`"
          :comment="comment"
          :post-id="postId"
          @reply-created="handleReplyCreated"
          @comment-deleted="handleCommentDeleted" />
      </TransitionGroup>
    </div>

    <!-- 더 보기 버튼 (페이지네이션이 있는 경우) -->
    <div
      v-if="hasMoreComments"
      class="comment-section__load-more">
      <BaseButton
        variant="secondary"
        :loading="isLoadingComments"
        @click="loadMoreComments">
        더 많은 댓글 보기
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useCommunityStore } from '@/stores/community'
  import CommentForm from './CommentForm.vue'
  import CommentItem from './CommentItem.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'

  const props = defineProps({
    postId: {
      type: [String, Number],
      required: true
    }
  })

  const communityStore = useCommunityStore()

  // 로컬 상태
  const sortBy = ref('latest')
  const hasMoreComments = ref(false) // 추후 페이지네이션 지원시 사용

  // 정렬 옵션
  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'popular', label: '인기순' }
  ]

  // 스토어에서 데이터 가져오기
  const comments = computed(() => communityStore.comments)
  const isLoadingComments = computed(() => communityStore.isLoadingComments)
  const error = computed(() => communityStore.error)

  // 전체 댓글 수 계산 (대댓글 포함)
  const totalCommentCount = computed(() => {
    let count = comments.value.length
    comments.value.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += comment.replies.length
      }
    })
    return count
  })

  // 정렬된 댓글 목록
  const sortedComments = computed(() => {
    const commentsCopy = [...comments.value]

    switch (sortBy.value) {
      case 'latest':
        return commentsCopy.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      case 'oldest':
        return commentsCopy.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
      case 'popular':
        return commentsCopy.sort(
          (a, b) => (b.like_count || 0) - (a.like_count || 0)
        )
      default:
        return commentsCopy
    }
  })

  // 초기 댓글 로드
  onMounted(async () => {
    console.log('💬 CommentSection 마운트됨, postId:', props.postId)
    await loadComments()
  })

  // postId 변경시 댓글 다시 로드
  watch(
    () => props.postId,
    async (newPostId) => {
      if (newPostId) {
        await loadComments()
      }
    }
  )

  // 댓글 로드
  const loadComments = async () => {
    try {
      const result = await communityStore.fetchComments(props.postId)
      if (result.success) {
        console.log('✅ 댓글 로드 성공:', result.comments.length)
      } else {
        console.error('❌ 댓글 로드 실패:', result.error)
      }
    } catch (error) {
      console.error('❌ 댓글 로드 중 오류:', error)
    }
  }

  // 다시 시도
  const retryLoad = async () => {
    communityStore.clearError()
    await loadComments()
  }

  // 더 많은 댓글 로드 (추후 구현)
  const loadMoreComments = async () => {
    console.log('🔄 더 많은 댓글 로드 (추후 구현)')
    // TODO: 페이지네이션 지원시 구현
  }

  // 이벤트 핸들러들
  const handleCommentCreated = (newComment) => {
    console.log('✅ 새 댓글 생성됨:', newComment)
    // 스토어에서 자동으로 처리되므로 별도 작업 불필요
  }

  const handleReplyCreated = (newReply, parentCommentId) => {
    console.log('✅ 새 대댓글 생성됨:', { newReply, parentCommentId })
    // 스토어에서 자동으로 처리되므로 별도 작업 불필요
  }

  const handleCommentDeleted = (commentId) => {
    console.log('✅ 댓글 삭제됨:', commentId)
    // 스토어에서 자동으로 처리되므로 별도 작업 불필요
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-section {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .comment-section__form {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .comment-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .comment-section__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    width: 100px;
  }

  .comment-section__sort {
    width: 100px;
  }

  .comment-section__loading,
  .comment-section__error,
  .comment-section__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
  }

  .comment-section__loading {
    color: var(--color-highlight-text);
  }

  .comment-section__error {
    color: var(--color-alert);
  }

  .comment-section__empty {
    color: var(--color-highlight-text);
  }

  .comment-section__loading svg,
  .comment-section__error svg,
  .comment-section__empty svg {
    width: 48px;
    height: 48px;
    opacity: 0.6;
  }

  .comment-section__error p,
  .comment-section__empty p {
    margin: 0;
    font-size: 14px;
  }

  .comment-section__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment-section__load-more {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  /* 트랜지션 애니메이션 */
  .comment-list-enter-active,
  .comment-list-leave-active {
    transition: all 0.3s ease;
  }

  .comment-list-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .comment-list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }

  .comment-list-move {
    transition: transform 0.3s ease;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .comment-section__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .comment-section__sort {
      align-self: flex-end;
      min-width: 100px;
    }

    .comment-section__title {
      font-size: 16px;
    }

    .comment-section__loading,
    .comment-section__error,
    .comment-section__empty {
      padding: 30px 16px;
    }
  }

  @media (max-width: 480px) {
    .comment-section__form {
      margin-bottom: 20px;
      padding-bottom: 20px;
    }

    .comment-section__loading,
    .comment-section__error,
    .comment-section__empty {
      padding: 24px 12px;
    }

    .comment-section__loading svg,
    .comment-section__error svg,
    .comment-section__empty svg {
      width: 40px;
      height: 40px;
    }
  }
</style>
