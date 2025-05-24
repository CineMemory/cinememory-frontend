<!-- 대댓글 (중첩된 댓글) -->
<template>
  <div class="comment-nested">
    <div class="comment-nested__container">
      <!-- 아바타 -->
      <div class="comment-nested__avatar">
        <BaseAvatar
          :username="comment.author.username"
          size="sm" />
      </div>

      <!-- 댓글 내용 -->
      <div class="comment-nested__content">
        <!-- 작성자와 시간 -->
        <div class="comment-nested__header">
          <CommentItemAuthor
            :author="comment.author"
            :created-at="comment.created_at" />

          <!-- 대댓글 표시 -->
          <span class="comment-nested__reply-indicator">
            <BaseIcon name="corner-down-right" />
            {{ parentComment.author.username }}님에게
          </span>

          <!-- 메뉴 버튼 (작성자인 경우) -->
          <BaseButton
            v-if="canEdit"
            variant="ghost"
            icon-only
            icon-left="more-horizontal"
            size="small"
            @click="toggleMenu" />
        </div>

        <!-- 댓글 텍스트 -->
        <div class="comment-nested__text">
          <CommentItemContent :content="comment.content" />
        </div>

        <!-- 액션 버튼들 (답글 기능 제외) -->
        <div class="comment-nested__actions">
          <BaseButton
            variant="ghost"
            size="small"
            icon-left="share"
            @click="handleShareClick">
            공유
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <BaseModal
      v-model="showDeleteConfirm"
      title="답글 삭제"
      size="small">
      <p>정말로 이 답글을 삭제하시겠습니까?</p>

      <template #footer>
        <div class="comment-nested__modal-actions">
          <BaseButton
            variant="secondary"
            @click="showDeleteConfirm = false">
            취소
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isDeleting"
            @click="confirmDelete">
            삭제
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- 메뉴 드롭다운 -->
    <div
      v-if="showMenu"
      class="comment-nested__menu"
      @click.stop>
      <BaseButton
        variant="ghost"
        icon-left="edit"
        size="small"
        @click="editComment">
        수정
      </BaseButton>
      <BaseButton
        variant="ghost"
        icon-left="trash-2"
        size="small"
        @click="deleteComment">
        삭제
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import CommentItemAuthor from './CommentItemAuthor.vue'
  import CommentItemContent from './CommentItemContent.vue'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  const props = defineProps({
    comment: {
      type: Object,
      required: true
    },
    parentComment: {
      type: Object,
      required: true
    },
    postId: {
      type: [String, Number],
      required: true
    }
  })

  const emit = defineEmits(['comment-deleted'])

  const { isAuthenticated, user } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const showMenu = ref(false)
  const showDeleteConfirm = ref(false)
  const isDeleting = ref(false)

  // 계산된 속성
  const canEdit = computed(() => {
    return (
      isAuthenticated.value && user.value?.user_pk === props.comment.author.id
    )
  })

  // 메뉴 토글
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }

  // 공유 클릭
  const handleShareClick = () => {
    const currentUrl = window.location.href
    const commentUrl = `${currentUrl}#comment-${props.comment.id}`

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(commentUrl)
        .then(() => {
          alert('답글 링크가 클립보드에 복사되었습니다!')
        })
        .catch(() => {
          prompt('답글 링크를 복사하세요:', commentUrl)
        })
    } else {
      prompt('답글 링크를 복사하세요:', commentUrl)
    }
  }

  // 댓글 수정
  const editComment = () => {
    showMenu.value = false
    console.log('답글 수정:', props.comment.id)
    // 향후 댓글 수정 기능 구현 시 추가
  }

  // 댓글 삭제
  const deleteComment = () => {
    showMenu.value = false
    showDeleteConfirm.value = true
  }

  // 삭제 확인
  const confirmDelete = async () => {
    try {
      isDeleting.value = true

      const result = await communityStore.deleteComment(
        props.comment.id,
        props.postId
      )

      if (result.success) {
        showDeleteConfirm.value = false
        emit('comment-deleted', props.comment.id)
      } else {
        alert(result.error || '답글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('답글 삭제 중 오류:', error)
      alert('답글 삭제 중 오류가 발생했습니다.')
    } finally {
      isDeleting.value = false
    }
  }

  // 외부 클릭으로 메뉴 닫기
  const handleClickOutside = () => {
    showMenu.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-nested {
    position: relative;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .comment-nested__container {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .comment-nested__avatar {
    flex-shrink: 0;
  }

  .comment-nested__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .comment-nested__header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .comment-nested__reply-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--color-highlight-text);
    padding: 2px 6px;
    background-color: var(--color-main-opacity-20);
    border-radius: var(--border-radius-small);
  }

  .comment-nested__reply-indicator svg {
    width: 12px;
    height: 12px;
    color: var(--color-main);
  }

  .comment-nested__text {
    word-break: break-word;
  }

  .comment-nested__actions {
    margin-top: 4px;
  }

  .comment-nested__modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .comment-nested__menu {
    position: absolute;
    top: 32px;
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
    box-shadow: var(--shadow-modal);
    min-width: 100px;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .comment-nested__container {
      gap: 8px;
    }

    .comment-nested__header {
      gap: 6px;
    }

    .comment-nested__reply-indicator {
      font-size: 11px;
    }

    .comment-nested__menu {
      top: 28px;
      right: -8px;
    }
  }
</style>
