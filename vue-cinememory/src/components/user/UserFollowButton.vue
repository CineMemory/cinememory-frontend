<template>
  <BaseButton
    :class="['follow-button', isFollowing ? 'following' : 'not-following']"
    @click="toggleFollow"
    :disabled="loading">
    <BaseSpinner
      v-if="loading"
      size="small" />
    <span v-else>{{ isFollowing ? '팔로잉' : '팔로우' }}</span>
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
    min-width: 80px;
    height: 36px;
  }

  .following {
    background: var(--color-card-background);
    color: var(--color-text);
    border: 1px solid var(--color-main);
  }

  .not-following {
    background: var(--color-main);
    color: var(--color-background);
  }

  .follow-button:hover.following {
    background: var(--color-alert);
    color: var(--color-text);
  }

  .follow-button:hover.following span::after {
    content: ' 취소';
  }
</style>
