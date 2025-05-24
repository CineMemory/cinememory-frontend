<!-- 개별 댓글 아이템 -->
<template>
  <div class="comment-item">
    <div class="comment-item__container">
      
      <!-- 아바타 -->
      <div class="comment-item__avatar">
        <BaseAvatar
          :username="comment.author.username"
          size="sm" />
      </div>

      <!-- 댓글 내용 -->
      <div class="comment-item__content">
        
        <!-- 작성자와 시간 -->
        <div class="comment-item__header">
          <CommentItemAuthor
            :author="comment.author"
            :created-at="comment.created_at" />
          
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
        <div class="comment-item__text">
          <CommentItemContent :content="comment.content" />
        </div>

        <!-- 액션 버튼들 -->
        <div class="comment-item__actions">
          <CommentItemActions
            :comment-id="comment.id"
            :is-authenticated="isAuthenticated"
            @reply-click="handleReplyClick"
            @like-click="handleLikeClick" />
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <BaseModal
      v-model="showDeleteConfirm"
      title="댓글 삭제"
      size="small">
      <p>정말로 이 댓글을 삭제하시겠습니까?</p>
      
      <template #footer>
        <div class="comment-item__modal-actions">
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
      class="comment-item__menu"
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
import CommentItemActions from './CommentItemActions.vue'
import BaseAvatar from '@/components/base/BaseAvatar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

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

const emit = defineEmits(['reply-click', 'comment-deleted'])

const { isAuthenticated, user } = useAuth()
const communityStore = useCommunityStore()

// 로컬 상태
const showMenu = ref(false)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// 계산된 속성
const canEdit = computed(() => {
  return isAuthenticated.value && 
         user.value?.user_pk === props.comment.author.id
})

// 메뉴 토글
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 답글 클릭
const handleReplyClick = () => {
  emit('reply-click', props.comment.id)
}

// 좋아요 클릭 (향후 구현)
const handleLikeClick = () => {
  console.log('댓글 좋아요:', props.comment.id)
  // 향후 댓글 좋아요 기능 구현 시 추가
}

// 댓글 수정
const editComment = () => {
  showMenu.value = false
  console.log('댓글 수정:', props.comment.id)
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
    
    const result = await communityStore.deleteComment(props.comment.id, props.postId)
    
    if (result.success) {
      showDeleteConfirm.value = false
      emit('comment-deleted', props.comment.id)
    } else {
      alert(result.error || '댓글 삭제에 실패했습니다.')
    }
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error)
    alert('댓글 삭제 중 오류가 발생했습니다.')
  } finally {
    isDeleting.value = false
  }
}

// 외부 클릭으로 메뉴 닫기
const handleClickOutside = () => {
  showMenu.value = false
}

// 컴포넌트 마운트 시 외부 클릭 이벤트 등록
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

.comment-item {
  position: relative;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.comment-item__container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.comment-item__avatar {
  flex-shrink: 0;
}

.comment-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.comment-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-item__text {
  word-break: break-word;
}

.comment-item__actions {
  margin-top: 4px;
}

.comment-item__modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.comment-item__menu {
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
  .comment-item__container {
    gap: 8px;
  }
  
  .comment-item__menu {
    top: 28px;
    right: -8px;
  }
}
</style>