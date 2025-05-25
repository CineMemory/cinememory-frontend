<!-- 게시글 좋아요 버튼 -->
<template>
  <button
    :class="[
      'post-button-like',
      {
        'post-button-like--liked': isLiked,
        'post-button-like--loading': isLoading
      }
    ]"
    :disabled="isLoading"
    @click="handleLike">
    <BaseIcon
      name="heart"
      :class="[
        'post-button-like__icon',
        { 'post-button-like__icon--liked': isLiked }
      ]" />

    <span class="post-button-like__count">{{ likeCount }}</span>
  </button>
</template>

<script setup>
  import { ref, computed } from 'vue'
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

  // isAuthenticated는 이미 useAuth에서 가져옴

  const handleLike = async () => {
    console.log('🔔 좋아요 버튼 클릭됨', {
      isAuthenticated: isAuthenticated.value,
      onLoginRequired: props.onLoginRequired
    })

    if (!isAuthenticated.value) {
      console.log('🔑 로그인 모달 호출')
      props.onLoginRequired?.()
      return
    }

    if (isLoading.value) return

    try {
      isLoading.value = true

      const result = await communityStore.togglePostLike(props.postId)

      if (result.success) {
        emit('like-changed', {
          is_liked: result.is_liked,
          like_count: result.like_count
        })
      } else {
        alert(result.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error)
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
