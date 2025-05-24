<!-- 커뮤니티 사이드바 -->
<template>
  <div class="community-sidebar">
    <!-- 인기 태그 -->
    <div class="community-sidebar__section">
      <h3 class="community-sidebar__title">
        <BaseIcon name="hash" />
        인기 태그
      </h3>
      <div class="community-sidebar__content">
        <div
          v-if="popularTags.length > 0"
          class="community-sidebar__tags">
          <BaseTag
            v-for="tag in popularTags"
            :key="tag.name"
            variant="secondary"
            size="small"
            clickable
            @click="filterByTag(tag.name)">
            #{{ tag.name }}
            <span class="community-sidebar__tag-count">({{ tag.count }})</span>
          </BaseTag>
        </div>
        <p
          v-else
          class="community-sidebar__empty">
          아직 태그가 없습니다
        </p>
      </div>
    </div>

    <!-- 최근 활동 -->
    <div class="community-sidebar__section">
      <h3 class="community-sidebar__title">
        <BaseIcon name="activity" />
        최근 활동
      </h3>
      <div class="community-sidebar__content">
        <div
          v-if="recentActivities.length > 0"
          class="community-sidebar__activities">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="community-sidebar__activity">
            <BaseAvatar
              :username="activity.user.username"
              size="sm" />
            <div class="community-sidebar__activity-content">
              <p class="community-sidebar__activity-text">
                <strong>{{ activity.user.username }}</strong
                >님이
                <span class="community-sidebar__activity-action">{{
                  activity.action
                }}</span>
              </p>
              <span class="community-sidebar__activity-time">
                {{ formatTimeAgo(activity.createdAt) }}
              </span>
            </div>
          </div>
        </div>
        <p
          v-else
          class="community-sidebar__empty">
          최근 활동이 없습니다
        </p>
      </div>
    </div>

    <!-- 커뮤니티 가이드 -->
    <div class="community-sidebar__section">
      <h3 class="community-sidebar__title">
        <BaseIcon name="info" />
        커뮤니티 가이드
      </h3>
      <div class="community-sidebar__content">
        <div class="community-sidebar__guide">
          <div class="community-sidebar__guide-item">
            <BaseIcon name="heart" />
            <span>영화에 대한 건설적인 토론을 나누어요</span>
          </div>
          <div class="community-sidebar__guide-item">
            <BaseIcon name="users" />
            <span>서로를 존중하고 배려해요</span>
          </div>
          <div class="community-sidebar__guide-item">
            <BaseIcon name="shield" />
            <span>스포일러는 주의해서 작성해요</span>
          </div>
          <div class="community-sidebar__guide-item">
            <BaseIcon name="smile" />
            <span>즐겁고 유익한 시간을 보내요</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCommunityStore } from '@/stores/community'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'

  const router = useRouter()
  const communityStore = useCommunityStore()

  // 더미 데이터 (나중에 API에서 가져올 예정)
  const popularTags = ref([
    { name: '2024영화', count: 15 },
    { name: '추천', count: 12 },
    { name: '한국영화', count: 8 },
    { name: '놀란', count: 6 },
    { name: 'SF', count: 5 },
    { name: '90년대', count: 4 },
    { name: '봉준호', count: 3 },
    { name: '아이맥스', count: 2 }
  ])

  const recentActivities = ref([
    {
      id: 1,
      user: { username: 'user2' },
      action: '새 게시글을 작성했습니다',
      createdAt: '2024-12-20T14:30:00Z'
    },
    {
      id: 2,
      user: { username: 'user3' },
      action: '댓글을 남겼습니다',
      createdAt: '2024-12-20T14:15:00Z'
    },
    {
      id: 3,
      user: { username: 'user1' },
      action: '게시글에 좋아요를 눌렀습니다',
      createdAt: '2024-12-20T13:45:00Z'
    },
    {
      id: 4,
      user: { username: 'user4' },
      action: '새 댓글을 작성했습니다',
      createdAt: '2024-12-20T13:20:00Z'
    }
  ])

  onMounted(() => {
    // 실제로는 API에서 데이터를 가져올 예정
    // loadPopularTags()
    // loadRecentActivities()
  })

  // 태그로 필터링
  const filterByTag = (tagName) => {
    const currentTags = communityStore.selectedTags
    if (!currentTags.includes(tagName)) {
      communityStore.setSelectedTags([...currentTags, tagName])
    }
  }

  // 시간 포맷팅
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}시간 전`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}일 전`
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .community-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .community-sidebar__section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    border: 1px solid var(--color-inactive-icon);
    overflow: hidden;
  }

  .community-sidebar__title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    background-color: var(--color-search-box);
    border-bottom: 1px solid var(--color-inactive-icon);
  }

  .community-sidebar__title svg {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  .community-sidebar__content {
    padding: 16px;
  }

  .community-sidebar__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .community-sidebar__tag-count {
    font-size: 11px;
    color: var(--color-highlight-text);
    margin-left: 4px;
  }

  .community-sidebar__activities {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .community-sidebar__activity {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .community-sidebar__activity-content {
    flex: 1;
    min-width: 0;
  }

  .community-sidebar__activity-text {
    font-size: 13px;
    color: var(--color-text);
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .community-sidebar__activity-action {
    color: var(--color-main);
  }

  .community-sidebar__activity-time {
    font-size: 11px;
    color: var(--color-highlight-text);
  }

  .community-sidebar__guide {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .community-sidebar__guide-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text);
    line-height: 1.4;
  }

  .community-sidebar__guide-item svg {
    width: 16px;
    height: 16px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .community-sidebar__empty {
    font-size: 13px;
    color: var(--color-highlight-text);
    text-align: center;
    margin: 16px 0;
    font-style: italic;
  }

  /* 모바일에서는 가로 스크롤 가능한 카드 형태 */
  @media (max-width: 768px) {
    .community-sidebar {
      flex-direction: row;
      gap: 16px;
      overflow-x: auto;
      padding: 0 12px 16px;
      scroll-snap-type: x mandatory;
    }

    .community-sidebar__section {
      min-width: 280px;
      scroll-snap-align: start;
    }

    .community-sidebar__title {
      font-size: 15px;
      padding: 12px;
    }

    .community-sidebar__content {
      padding: 12px;
    }
  }

  @media (max-width: 480px) {
    .community-sidebar {
      padding: 0 8px 12px;
    }

    .community-sidebar__section {
      min-width: 240px;
    }
  }
</style>
