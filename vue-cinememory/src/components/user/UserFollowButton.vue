<template>
  <BaseButton
    :class="['follow-button', isFollowing ? 'following' : 'not-following']"
    @click="toggleFollow"
    :disabled="loading">
    <BaseSpinner
      v-if="loading"
      size="small" />
    <span v-else>{{ isFollowing ? '팔로우 취소' : '팔로우' }}</span>
  </BaseButton>
</template>

<script>
  import { ref } from 'vue'
  import { followUser } from '@/services/api'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  export default {
    name: 'UserFollowButton',
    components: {
      BaseButton,
      BaseSpinner
    },
    props: {
      userId: {
        type: Number,
        required: true
      },
      initialFollowState: {
        type: Boolean,
        default: false
      }
    },
    emits: ['follow-changed'],
    setup(props, { emit }) {
      const isFollowing = ref(props.initialFollowState)
      const loading = ref(false)

      const toggleFollow = async () => {
        try {
          loading.value = true
          const response = await followUser(props.userId)
          isFollowing.value = response.is_following
          emit('follow-changed', {
            userId: props.userId,
            isFollowing: isFollowing.value
          })
        } catch (error) {
          console.error('팔로우 처리 중 오류:', error)
        } finally {
          loading.value = false
        }
      }

      return {
        isFollowing,
        loading,
        toggleFollow
      }
    }
  }
</script>

<style scoped>
  .follow-button {
    min-width: 100px; /* 고정 너비로 통일 */
    height: 36px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .not-following {
    background: var(--color-main);
    color: var(--color-background);
    border: 1px solid var(--color-main);
  }

  .not-following:hover {
    background: var(--color-gold-dark);
    border-color: var(--color-gold-dark);
  }

  .following {
    background: var(--color-alert); /* 항상 빨간색 */
    color: white;
    border: 1px solid var(--color-alert);
  }

  .following:hover {
    background: var(--color-alert); /* hover해도 빨간색 유지 */
    border-color: var(--color-alert);
    opacity: 0.9; /* 살짝 투명도만 변경 */
  }

  .follow-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
