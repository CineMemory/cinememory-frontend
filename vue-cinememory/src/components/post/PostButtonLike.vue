<!-- 게시글 좋아요 버튼 -->
<template>
  <button
    :class="[
      'post-button-like',
      {
        'post-button-like--liked': localIsLiked,
        'post-button-like--loading': isLoading
      }
    ]"
    :disabled="isLoading"
    @click="handleLike">
    <BaseIcon
      name="heart"
      :class="[
        'post-button-like__icon',
        { 'post-button-like__icon--liked': localIsLiked }
      ]" />

    <span class="post-button-like__count">{{ localLikeCount }}</span>
  </button>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const props = defineProps({
    postId: {
      type: [String, Number],
      required: true
    },
    isLiked: {
      type: Boolean,
      default: false
    },
    likeCount: {
      type: Number,
      default: 0
    },
    onLoginRequired: {
      type: Function,
      default: () => {}
    }
  })

  const emit = defineEmits(['like-changed'])

  const { isAuthenticated } = useAuth()
  const communityStore = useCommunityStore()

  const isLoading = ref(false)

  // 로컬 상태로 좋아요 상태 관리
  const localIsLiked = ref(props.isLiked)
  const localLikeCount = ref(props.likeCount)

  // props 변경 감지하여 로컬 상태 업데이트
  watch(
    () => props.isLiked,
    (newValue) => {
      localIsLiked.value = newValue
    }
  )

  watch(
    () => props.likeCount,
    (newValue) => {
      localLikeCount.value = newValue
    }
  )

  const handleLike = async () => {
    console.log('🔔 좋아요 버튼 클릭됨', {
      postId: props.postId,
      isAuthenticated: isAuthenticated.value,
      currentLiked: localIsLiked.value,
      currentCount: localLikeCount.value
    })

    if (!isAuthenticated.value) {
      console.log('🔑 로그인 모달 호출')
      props.onLoginRequired?.()
      return
    }

    if (isLoading.value) return

    try {
      isLoading.value = true

      // 낙관적 업데이트 (즉시 UI 반영)
      const previousLiked = localIsLiked.value
      const previousCount = localLikeCount.value

      localIsLiked.value = !previousLiked
      localLikeCount.value = previousLiked
        ? previousCount - 1
        : previousCount + 1

      console.log('🚀 좋아요 API 호출 시작...', {
        postId: props.postId,
        optimisticUpdate: {
          liked: localIsLiked.value,
          count: localLikeCount.value
        }
      })

      const result = await communityStore.togglePostLike(props.postId)

      console.log('📤 좋아요 API 응답:', result)

      if (result.success) {
        // 서버 응답으로 최종 상태 업데이트
        localIsLiked.value = result.is_liked
        localLikeCount.value = result.like_count

        // 부모 컴포넌트에 변경 사항 알림
        emit('like-changed', {
          postId: props.postId,
          is_liked: result.is_liked,
          like_count: result.like_count
        })

        console.log('✅ 좋아요 처리 완료:', {
          postId: props.postId,
          finalState: {
            liked: localIsLiked.value,
            count: localLikeCount.value
          }
        })
      } else {
        // 실패시 이전 상태로 롤백
        localIsLiked.value = previousLiked
        localLikeCount.value = previousCount

        console.error('❌ 좋아요 처리 실패:', result.error)
        alert(result.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      // 에러시 이전 상태로 롤백
      localIsLiked.value = !localIsLiked.value
      localLikeCount.value = localIsLiked.value
        ? localLikeCount.value + 1
        : localLikeCount.value - 1

      console.error('❌ 좋아요 처리 중 오류:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      isLoading.value = false
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';

  .post-button-like {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: none;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: var(--color-highlight-text);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-button-like:hover:not(:disabled) {
    background-color: var(--color-main-opacity-20);
    color: var(--color-text);
  }

  .post-button-like:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .post-button-like--liked {
    color: var(--color-alert);
  }

  .post-button-like--liked:hover:not(:disabled) {
    background-color: rgba(255, 56, 56, 0.1);
  }

  .post-button-like--loading {
    cursor: wait;
  }

  .post-button-like__icon {
    width: 16px;
    height: 16px;
    transition: all 0.2s ease;
  }

  .post-button-like__icon--liked {
    color: var(--color-alert);
    transform: scale(1.1);
  }

  .post-button-like__count {
    font-weight: 500;
    min-width: 20px;
    text-align: left;
  }

  /* 애니메이션 효과 */
  .post-button-like:active:not(:disabled) {
    transform: scale(0.95);
  }

  .post-button-like:active:not(:disabled) .post-button-like__icon {
    transform: scale(1.2);
  }
</style>
