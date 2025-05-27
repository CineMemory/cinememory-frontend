<template>
  <div class="follow-stats">
    <div
      class="stat-item"
      @click="showFollowers">
      <span class="count">{{ followersCount }}</span>
      <span class="label">팔로워</span>
    </div>
    <div
      class="stat-item"
      @click="showFollowing">
      <span class="count">{{ followingCount }}</span>
      <span class="label">팔로잉</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'UserFollowStats',
    props: {
      followersCount: {
        type: Number,
        default: 0
      },
      followingCount: {
        type: Number,
        default: 0
      }
    },
    emits: ['show-followers', 'show-following'],
    setup(props, { emit }) {
      const showFollowers = () => {
        emit('show-followers')
      }

      const showFollowing = () => {
        emit('show-following')
      }

      return {
        showFollowers,
        showFollowing
      }
    }
  }
</script>

<style scoped>
  .follow-stats {
    display: flex;
    gap: 24px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--border-radius-small);
    transition: background-color 0.2s;
  }

  .stat-item:hover {
    background: var(--color-card-background-opacity-50);
  }

  .count {
    font-size: 18px;
    font-weight: bold;
    color: var(--color-text);
  }

  .label {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin-top: 4px;
  }
</style>
