<!-- 댓글 작성 폼 -->
<template>
  <div class="comment-form">
    <form @submit.prevent="submitComment">
      <!-- 사용자 아바타 -->
      <div class="comment-form__avatar">
        <BaseAvatar
          :username="currentUser?.username || 'Guest'"
          size="sm" />
      </div>

      <!-- 입력 영역 -->
      <div class="comment-form__input-area">
        <!-- 텍스트 입력 -->
        <BaseTextarea
          v-model="content"
          :placeholder="placeholder"
          :rows="isExpanded ? 4 : 2"
          :disabled="!isAuthenticated || isSubmitting"
          class="comment-form__textarea"
          @focus="handleFocus"
          @blur="handleBlur" />

        <!-- 액션 버튼들 -->
        <div
          v-if="isExpanded || content.trim()"
          class="comment-form__actions">
          <div class="comment-form__actions-left">
            <!-- 글자 수 표시 -->
            <span
              :class="[
                'comment-form__char-count',
                { 'comment-form__char-count--warning': isNearLimit },
                { 'comment-form__char-count--error': isOverLimit }
              ]">
              {{ content.length }} / {{ maxLength }}
            </span>
          </div>

          <div class="comment-form__actions-right">
            <!-- 취소 버튼 -->
            <BaseButton
              v-if="isExpanded && !isReply"
              variant="secondary"
              size="small"
              :disabled="isSubmitting"
              @click="cancelComment">
              취소
            </BaseButton>

            <!-- 제출 버튼 -->
            <BaseButton
              type="submit"
              variant="primary"
              size="small"
              :disabled="!canSubmit"
              :loading="isSubmitting">
              {{ submitButtonText }}
            </BaseButton>
          </div>
        </div>

        <!-- 로그인 안내 -->
        <div
          v-if="!isAuthenticated"
          class="comment-form__login-notice">
          <BaseIcon name="info" />
          <span>댓글을 작성하려면 로그인이 필요합니다.</span>
          <BaseButton
            variant="primary"
            size="small"
            @click="openLoginModal">
            로그인
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const props = defineProps({
    postId: {
      type: [String, Number],
      required: true
    },
    parentCommentId: {
      type: [String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: '댓글을 입력하세요...'
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['comment-created', 'reply-created', 'cancel'])

  const { isAuthenticated, user: currentUser } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const content = ref('')
  const isExpanded = ref(false)
  const isSubmitting = ref(false)
  const maxLength = 1000

  // 계산된 속성들
  const isReply = computed(() => !!props.parentCommentId)

  const submitButtonText = computed(() => {
    return isReply.value ? '답글 달기' : '댓글 달기'
  })

  const isNearLimit = computed(() => {
    return content.value.length > maxLength * 0.8
  })

  const isOverLimit = computed(() => {
    return content.value.length > maxLength
  })

  const canSubmit = computed(() => {
    return (
      isAuthenticated.value &&
      content.value.trim() &&
      !isOverLimit.value &&
      !isSubmitting.value
    )
  })

  // 이벤트 핸들러들
  const handleFocus = () => {
    if (isAuthenticated.value) {
      isExpanded.value = true
    }
  }

  const handleBlur = () => {
    // 내용이 없으면 축소
    if (!content.value.trim()) {
      setTimeout(() => {
        isExpanded.value = false
      }, 150) // 버튼 클릭을 위한 약간의 지연
    }
  }

  const openLoginModal = () => {
    // 부모 컴포넌트나 전역 상태로 로그인 모달 열기
    console.log('🔓 로그인 모달 열기')
    // TODO: 로그인 모달 구현
  }

  const cancelComment = () => {
    content.value = ''
    isExpanded.value = false
    emit('cancel')
  }

  const submitComment = async () => {
    if (!canSubmit.value) return

    try {
      isSubmitting.value = true

      const commentData = {
        content: content.value.trim()
      }

      let result

      if (isReply.value) {
        // 대댓글 작성
        result = await communityStore.createReply(
          props.postId,
          props.parentCommentId,
          commentData
        )

        if (result.success) {
          emit('reply-created', result.reply || result, props.parentCommentId)
          console.log('✅ 대댓글 작성 성공')
        }
      } else {
        // 일반 댓글 작성
        result = await communityStore.createComment(props.postId, commentData)

        if (result.success) {
          emit('comment-created', result.comment || result)
          console.log('✅ 댓글 작성 성공')
        }
      }

      if (result.success) {
        // 성공시 폼 초기화
        content.value = ''
        isExpanded.value = false
      } else {
        console.error('❌ 댓글 작성 실패:', result.error)
        alert(result.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 댓글 작성 중 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      isSubmitting.value = false
    }
  }

  // content 변경 감시 (자동 확장/축소)
  watch(content, (newContent) => {
    if (newContent.trim() && isAuthenticated.value) {
      isExpanded.value = true
    }
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .comment-form {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .comment-form form {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .comment-form__avatar {
    flex-shrink: 0;
  }

  .comment-form__input-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comment-form__textarea {
    resize: vertical;
    min-height: 40px;
    transition: min-height 0.2s ease;
  }

  .comment-form__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .comment-form__actions-left {
    display: flex;
    align-items: center;
  }

  .comment-form__actions-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .comment-form__char-count {
    font-size: 12px;
    color: var(--color-highlight-text);
    transition: color 0.2s ease;
  }

  .comment-form__char-count--warning {
    color: var(--color-warning);
  }

  .comment-form__char-count--error {
    color: var(--color-alert);
  }

  .comment-form__login-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--color-main-opacity-20);
    border: 1px solid var(--color-main-opacity-50);
    border-radius: var(--border-radius-medium);
    font-size: 13px;
    color: var(--color-text);
  }

  .comment-form__login-notice svg {
    width: 16px;
    height: 16px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .comment-form form {
      gap: 8px;
    }

    .comment-form__actions {
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .comment-form__actions-left {
      align-self: flex-start;
    }

    .comment-form__login-notice {
      padding: 10px 12px;
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .comment-form__actions-right {
      gap: 6px;
    }

    .comment-form__login-notice {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
  }
</style>
