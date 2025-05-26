<!-- 개별 댓글 아이템 -->
<template>
  <div class="comment-item">
    <!-- 메인 댓글 -->
    <article class="comment-item__main">
      <!-- 아바타 -->
      <div class="comment-item__avatar">
        <BaseAvatar
          :username="authorName"
          size="sm" />
      </div>

      <!-- 댓글 내용 -->
      <div class="comment-item__content">
        <!-- 작성자 정보 -->
        <div class="comment-item__header">
          <span class="comment-item__author">{{ authorName }}</span>
          <time class="comment-item__time">
            {{ formatTimeAgo(comment.created_at) }}
          </time>
          <!-- 수정됨 표시 -->
          <span
            v-if="isEdited"
            class="comment-item__edited">
            (수정됨)
          </span>
        </div>

        <!-- 댓글 텍스트 -->
        <div
          v-if="!isEditingComment"
          class="comment-item__text">
          {{ comment.content }}
        </div>

        <!-- 댓글 수정 폼 -->
        <div
          v-if="isEditingComment"
          class="comment-item__edit-form">
          <BaseInput
            v-model="editCommentValue"
            type="textarea"
            placeholder="댓글을 입력하세요..."
            rows="3"
            @keydown.ctrl.enter="saveCommentEdit"
            @keydown.esc="cancelCommentEdit" />
          <div class="comment-item__edit-actions">
            <BaseButton
              variant="primary"
              size="small"
              @click="saveCommentEdit">
              저장
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="small"
              @click="cancelCommentEdit">
              취소
            </BaseButton>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="comment-item__actions">
          <!-- 좋아요 버튼 -->
          <BaseButton
            variant="ghost"
            size="small"
            :class="[
              'comment-item__action',
              { 'comment-item__action--active': comment.is_liked }
            ]"
            @click="toggleLike">
            <BaseIcon
              name="heart"
              :class="{ 'text-red-500': comment.is_liked }" />
            <span v-if="comment.like_count > 0">
              {{ formatCount(comment.like_count) }}
            </span>
          </BaseButton>

          <!-- 답글 버튼 -->
          <BaseButton
            variant="ghost"
            size="small"
            class="comment-item__action"
            @click="toggleReplyForm">
            <BaseIcon name="message-circle" />
            <span>답글</span>
          </BaseButton>

          <!-- 수정 버튼 (작성자 본인만) -->
          <BaseButton
            v-if="isAuthor"
            variant="ghost"
            size="small"
            class="comment-item__action"
            @click="startEditComment">
            <BaseIcon name="edit-3" />
            <span>수정</span>
          </BaseButton>

          <!-- 삭제 버튼 (작성자 본인만) -->
          <BaseButton
            v-if="isAuthor"
            variant="ghost"
            size="small"
            class="comment-item__action comment-item__action--danger"
            @click="deleteComment">
            <BaseIcon name="trash-2" />
            <span>삭제</span>
          </BaseButton>
        </div>

        <!-- 답글 작성 폼 -->
        <div
          v-if="showReplyForm"
          class="comment-item__reply-form">
          <CommentForm
            :post-id="postId"
            :parent-comment-id="commentId"
            placeholder="답글을 입력하세요..."
            @reply-created="handleReplyCreated"
            @cancel="showReplyForm = false" />
        </div>
      </div>
    </article>

    <!-- 대댓글들 -->
    <div
      v-if="hasReplies"
      class="comment-item__replies">
      <!-- 대댓글 토글 버튼 -->
      <BaseButton
        v-if="!showReplies && replyCount > 0"
        variant="ghost"
        size="small"
        class="comment-item__show-replies"
        @click="showReplies = true">
        <BaseIcon name="corner-down-right" />
        <span>답글 {{ replyCount }}개 보기</span>
      </BaseButton>

      <!-- 대댓글 목록 -->
      <TransitionGroup
        v-if="showReplies"
        name="reply-list"
        tag="div"
        class="comment-item__replies-list">
        <div
          v-for="reply in replies"
          :key="`reply-${reply.comment_id || reply.id}`"
          class="comment-item__reply">
          <!-- 대댓글 아바타 -->
          <div class="comment-item__reply-avatar">
            <BaseAvatar
              :username="getReplyAuthorName(reply)"
              size="xs" />
          </div>

          <!-- 대댓글 내용 -->
          <div class="comment-item__reply-content">
            <!-- 대댓글 헤더 -->
            <div class="comment-item__reply-header">
              <span class="comment-item__reply-author">
                {{ getReplyAuthorName(reply) }}
              </span>
              <time class="comment-item__reply-time">
                {{ formatTimeAgo(reply.created_at) }}
              </time>
              <!-- 대댓글 수정됨 표시 -->
              <span
                v-if="isReplyEdited(reply)"
                class="comment-item__reply-edited">
                (수정됨)
              </span>
            </div>

            <!-- 대댓글 텍스트 -->
            <div
              v-if="editingReplyId !== (reply.comment_id || reply.id)"
              class="comment-item__reply-text">
              {{ reply.content }}
            </div>

            <!-- 대댓글 수정 폼 -->
            <div
              v-if="editingReplyId === (reply.comment_id || reply.id)"
              class="comment-item__reply-edit-form">
              <BaseInput
                v-model="editReplyValue"
                type="textarea"
                placeholder="답글을 입력하세요..."
                rows="2"
                @keydown.ctrl.enter="saveReplyEdit(reply)"
                @keydown.esc="cancelReplyEdit" />
              <div class="comment-item__reply-edit-actions">
                <BaseButton
                  variant="primary"
                  size="small"
                  @click="saveReplyEdit(reply)">
                  저장
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  size="small"
                  @click="cancelReplyEdit">
                  취소
                </BaseButton>
              </div>
            </div>

            <!-- 대댓글 액션 -->
            <div class="comment-item__reply-actions">
              <!-- 좋아요 -->
              <BaseButton
                variant="ghost"
                size="small"
                :class="[
                  'comment-item__reply-action',
                  { 'comment-item__reply-action--active': reply.is_liked }
                ]"
                @click="toggleReplyLike(reply)">
                <BaseIcon
                  name="heart"
                  :class="{ 'text-red-500': reply.is_liked }" />
                <span v-if="reply.like_count > 0">
                  {{ formatCount(reply.like_count) }}
                </span>
              </BaseButton>

              <!-- 수정 (작성자 본인만) -->
              <BaseButton
                v-if="isReplyAuthor(reply)"
                variant="ghost"
                size="small"
                class="comment-item__reply-action"
                @click="startEditReply(reply)">
                <BaseIcon name="edit-3" />
                <span>수정</span>
              </BaseButton>

              <!-- 삭제 (작성자 본인만) -->
              <BaseButton
                v-if="isReplyAuthor(reply)"
                variant="ghost"
                size="small"
                class="comment-item__reply-action comment-item__reply-action--danger"
                @click="deleteReply(reply)">
                <BaseIcon name="trash-2" />
                <span>삭제</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- 대댓글 숨기기 버튼 -->
      <BaseButton
        v-if="showReplies && replyCount > 0"
        variant="ghost"
        size="small"
        class="comment-item__hide-replies"
        @click="showReplies = false">
        <BaseIcon name="chevron-up" />
        <span>답글 숨기기</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import { isContentEdited, formatTimeAgo } from '@/utils/dateUtils'
  import CommentForm from './CommentForm.vue'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseInput from '@/components/base/BaseInput.vue'

  const props = defineProps({
    comment: {
      type: Object,
      required: true
    },
    postId: {
      type: [String, Number],
      required: true
    }
  })

  const emit = defineEmits(['reply-created', 'comment-deleted'])

  const { isAuthenticated, user } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const showReplyForm = ref(false)
  const showReplies = ref(true) // 기본적으로 대댓글 표시
  const isEditingComment = ref(false)
  const editCommentValue = ref('')
  const editingReplyId = ref(null)
  const editReplyValue = ref('')

  // 계산된 속성들
  const commentId = computed(() => props.comment.comment_id || props.comment.id)

  const authorName = computed(() => {
    // 새로운 API 구조: author가 객체 {id, username}
    if (
      typeof props.comment.author === 'object' &&
      props.comment.author?.username
    ) {
      return props.comment.author.username
    }
    // 레거시: author가 문자열
    if (typeof props.comment.author === 'string') {
      return props.comment.author
    }
    // 작성자 정보가 없는 경우에만 Unknown 표시
    return 'Unknown'
  })

  const authorId = computed(() => {
  const comment = props.comment


  // 1. author 객체에서 ID 추출
  if (typeof comment.author === 'object' && comment.author?.id) {
    return comment.author.id
  }

  // 2. user_id 필드에서 ID 추출 (Django API에서 주로 사용)
  if (comment.user_id) {
    return comment.user_id
  }

  // 3. user 필드에서 ID 추출
  if (comment.user) {
    return comment.user
  }

  // 4. user_pk 필드에서 ID 추출
  if (comment.user_pk) {
    return comment.user_pk
  }

  // 5. author_id 필드에서 ID 추출
  if (comment.author_id) {
    return comment.author_id
  }
  return null
})

  const isAuthor = computed(() => {
    const isAuth = isAuthenticated.value
    const currentUser = user.value
    const commentAuthorId = authorId.value

    if (!isAuth || !currentUser || !commentAuthorId) {
      return false
    }

    // 타입을 통일해서 비교 (둘 다 문자열로 변환)
    const currentUserIdStr = String(currentUser.id)
    const commentAuthorIdStr = String(commentAuthorId)

    return currentUserIdStr === commentAuthorIdStr
  })

  // 수정 여부 확인 로직 교체
  const isEdited = computed(() => {
    return isContentEdited(
      props.comment.created_at,
      props.comment.updated_at,
      5
    )
  })

  const replies = computed(() => props.comment.replies || [])
  const replyCount = computed(() => replies.value.length)
  const hasReplies = computed(() => replyCount.value > 0)

  // 유틸리티 함수들
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count?.toString() || '0'
  }

  const getReplyAuthorName = (reply) => {
    if (typeof reply.author === 'object' && reply.author?.username) {
      return reply.author.username
    }
    if (typeof reply.author === 'string') {
      return reply.author
    }
    // 작성자 정보가 없는 경우에만 Unknown 표시
    return 'Unknown'
  }

  const isReplyAuthor = (reply) => {
  if (!isAuthenticated.value || !user.value) return false

  // 대댓글 작성자 ID 추출
  let replyAuthorId = null

  if (typeof reply.author === 'object' && reply.author?.id) {
    replyAuthorId = reply.author.id
  } else if (reply.user_id) {  // 이 부분 추가!
    replyAuthorId = reply.user_id
  } else if (reply.user) {
    replyAuthorId = reply.user
  } else if (reply.user_pk) {
    replyAuthorId = reply.user_pk
  } else if (reply.author_id) {
    replyAuthorId = reply.author_id
  }

  if (!replyAuthorId) {
    return false
  }

  // 타입을 통일해서 비교
  const currentUserIdStr = String(user.value.id)
  const replyAuthorIdStr = String(replyAuthorId)

  return currentUserIdStr === replyAuthorIdStr
}

  // 대댓글 수정 여부 확인
  const isReplyEdited = (reply) => {
    return isContentEdited(reply.created_at, reply.updated_at, 5)
  }

  // 액션 함수들
  const toggleLike = async () => {
    if (!isAuthenticated.value) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // TODO: 댓글 좋아요 API 구현 필요
      // 임시로 상태만 변경
      props.comment.is_liked = !props.comment.is_liked
      props.comment.like_count = props.comment.is_liked
        ? (props.comment.like_count || 0) + 1
        : Math.max(0, (props.comment.like_count || 0) - 1)
    } catch (error) {
      console.error('❌ 댓글 좋아요 처리 중 오류:', error)
    }
  }

  const toggleReplyLike = async (reply) => {
    if (!isAuthenticated.value) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // TODO: 대댓글 좋아요 API 구현 필요
      // 임시로 상태만 변경
      reply.is_liked = !reply.is_liked
      reply.like_count = reply.is_liked
        ? (reply.like_count || 0) + 1
        : Math.max(0, (reply.like_count || 0) - 1)
    } catch (error) {
      console.error('❌ 대댓글 좋아요 처리 중 오류:', error)
    }
  }

  const toggleReplyForm = () => {
    if (!isAuthenticated.value) {
      alert('로그인이 필요합니다.')
      return
    }
    showReplyForm.value = !showReplyForm.value
  }

  const deleteComment = async () => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const result = await communityStore.deleteComment(
        commentId.value,
        props.postId
      )

      if (result.success) {
        emit('comment-deleted', commentId.value)
      } else {
        console.error('❌ 댓글 삭제 실패:', result.error)
        alert('댓글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 댓글 삭제 중 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const deleteReply = async (reply) => {
    if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const replyId = reply.comment_id || reply.id
      const result = await communityStore.deleteComment(replyId, props.postId)

      if (result.success) {
        // 로컬에서 대댓글 제거 (스토어에서 전체 새로고침됨)
      } else {
        alert('답글 삭제에 실패했습니다.')
      }
    } catch (error) {
      alert('답글 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleReplyCreated = (newReply) => {
    showReplyForm.value = false
    showReplies.value = true // 답글 작성 후 답글 목록 표시
    emit('reply-created', newReply, commentId.value)
  }

  // 댓글 수정 시작
  const startEditComment = () => {
    isEditingComment.value = true
    editCommentValue.value = props.comment.content
  }

  // 댓글 수정 취소
  const cancelCommentEdit = () => {
    isEditingComment.value = false
    editCommentValue.value = ''
  }

  // 댓글 수정 저장
  const saveCommentEdit = async () => {
    if (!editCommentValue.value.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      const result = await communityStore.updateComment(
        commentId.value,
        props.postId,
        { content: editCommentValue.value.trim() }
      )

      if (result.success) {
        props.comment.content = editCommentValue.value.trim()
        props.comment.updated_at = result.updated_at || new Date().toISOString()
        isEditingComment.value = false
        editCommentValue.value = ''
      } else {
        console.error('❌ 댓글 수정 실패:', result.error)
        alert('댓글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 댓글 수정 중 오류:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  // 대댓글 수정 시작
  const startEditReply = (reply) => {
    editingReplyId.value = reply.comment_id || reply.id
    editReplyValue.value = reply.content
  }

  // 대댓글 수정 취소
  const cancelReplyEdit = () => {
    editingReplyId.value = null
    editReplyValue.value = ''
  }

  // 대댓글 수정 저장
  const saveReplyEdit = async (reply) => {
    if (!editReplyValue.value.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    try {
      const replyId = reply.comment_id || reply.id
      const result = await communityStore.updateComment(replyId, props.postId, {
        content: editReplyValue.value.trim()
      })

      if (result.success) {
        reply.content = editReplyValue.value.trim()
        reply.updated_at = result.updated_at || new Date().toISOString()
        editingReplyId.value = null
        editReplyValue.value = ''
      } else {
        console.error('❌ 대댓글 수정 실패:', result.error)
        alert('답글 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 대댓글 수정 중 오류:', error)
      alert('답글 수정 중 오류가 발생했습니다.')
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-item {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  /* 메인 댓글 */
  .comment-item__main {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .comment-item__avatar {
    flex-shrink: 0;
  }

  .comment-item__content {
    flex: 1;
    min-width: 0;
  }

  .comment-item__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .comment-item__author {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  .comment-item__time {
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  /* 댓글 수정 폼 */
  .comment-item__edit-form {
    margin-bottom: 12px;
  }

  .comment-item__edit-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: flex-end;
  }

  /* 대댓글 수정 폼 */
  .comment-item__reply-edit-form {
    margin-bottom: 8px;
  }

  .comment-item__reply-edit-actions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    justify-content: flex-end;
  }

  .comment-item__edited {
    font-size: 11px;
    color: var(--color-inactive-text);
    font-style: italic;
  }

  .comment-item__reply-edited {
    font-size: 10px;
    color: var(--color-inactive-text);
    font-style: italic;
  }

  .comment-item__text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text);
    margin-bottom: 12px;
    word-break: break-word;
  }

  .comment-item__actions {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .comment-item__action {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-highlight-text);
    transition: color 0.2s ease;
  }

  .comment-item__action:hover {
    color: var(--color-main);
  }

  .comment-item__action--active {
    color: var(--color-main);
  }

  .comment-item__action--danger:hover {
    color: var(--color-alert);
  }

  .comment-item__action svg {
    width: 16px;
    height: 16px;
  }

  .comment-item__action span {
    font-size: 12px;
    font-weight: 500;
  }

  .comment-item__reply-form {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  /* 대댓글 */
  .comment-item__replies {
    margin-top: 16px;
    margin-left: 44px; /* 아바타 크기 + 간격 */
  }

  .comment-item__show-replies,
  .comment-item__hide-replies {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-main);
    margin-bottom: 12px;
  }

  .comment-item__show-replies svg,
  .comment-item__hide-replies svg {
    width: 16px;
    height: 16px;
  }

  .comment-item__replies-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comment-item__reply {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 12px;
    background-color: var(--color-search-box);
    border-radius: var(--border-radius-medium);
    border-left: 3px solid var(--color-main-opacity-50);
  }

  .comment-item__reply-avatar {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comment-item__reply-content {
    flex: 1;
    min-width: 0;
  }

  .comment-item__reply-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .comment-item__reply-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
  }

  .comment-item__reply-time {
    font-size: 11px;
    color: var(--color-highlight-text);
  }

  .comment-item__reply-text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-text);
    margin-bottom: 8px;
    word-break: break-word;
  }

  .comment-item__reply-actions {
    display: flex;
    align-items: center;
  }

  .comment-item__reply-action {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-highlight-text);
    transition: color 0.2s ease;
  }

  .comment-item__reply-action:hover {
    color: var(--color-main);
  }

  .comment-item__reply-action--active {
    color: var(--color-main);
  }

  .comment-item__reply-action--danger:hover {
    color: var(--color-alert);
  }

  .comment-item__reply-action svg {
    width: 14px;
    height: 14px;
  }

  .comment-item__reply-action span {
    font-size: 11px;
    font-weight: 500;
  }

  /* 트랜지션 애니메이션 */
  .reply-list-enter-active,
  .reply-list-leave-active {
    transition: all 0.3s ease;
  }

  .reply-list-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }

  .reply-list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .reply-list-move {
    transition: transform 0.3s ease;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .comment-item__main {
      gap: 8px;
    }

    .comment-item__replies {
      margin-left: 36px;
    }

    .comment-item__actions {
      gap: 3px;
    }

    .comment-item__reply-actions {
      gap: 2px;
    }
  }

  @media (max-width: 480px) {
    .comment-item__replies {
      margin-left: 20px;
    }

    .comment-item__reply {
      padding: 8px;
      gap: 6px;
    }

    .comment-item__actions {
      flex-wrap: wrap;
      gap: 2px;
    }
  }
</style>
