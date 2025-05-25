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
            :variant="currentTagFilter === tag.name ? 'primary' : 'secondary'"
            size="small"
            clickable
            @click="handleTagClick(tag.name)">
            #{{ tag.name }}
            <span class="community-sidebar__tag-count">({{ tag.count }})</span>
          </BaseTag>
        </div>
        <div
          v-else-if="isLoading"
          class="community-sidebar__loading">
          <BaseSpinner size="sm" />
          <span>태그 로딩 중...</span>
        </div>
        <p
          v-else
          class="community-sidebar__empty">
          아직 태그가 없습니다
        </p>
      </div>
    </div>

    <!-- 전체 게시글 보기 버튼 -->
    <div
      v-if="currentTagFilter"
      class="community-sidebar__section">
      <div class="community-sidebar__content">
        <BaseButton
          variant="secondary"
          size="small"
          icon-left="arrow-left"
          @click="showAllPosts"
          class="community-sidebar__show-all">
          전체 게시글 보기
        </BaseButton>
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
        <div
          v-else-if="isLoadingActivities"
          class="community-sidebar__loading">
          <BaseSpinner size="sm" />
          <span>활동 로딩 중...</span>
        </div>
        <p
          v-else
          class="community-sidebar__empty">
          최근 활동이 없습니다
        </p>
      </div>
    </div>

    <!-- 커뮤니티 통계 -->
    <div class="community-sidebar__section">
      <h3 class="community-sidebar__title">
        <BaseIcon name="info" />
        커뮤니티 통계
      </h3>
      <div class="community-sidebar__content">
        <div class="community-sidebar__stats">
          <div class="community-sidebar__stat-item">
            <BaseIcon name="users" />
            <div class="community-sidebar__stat-content">
              <span class="community-sidebar__stat-label">전체 회원</span>
              <span class="community-sidebar__stat-value"
                >{{ communityStats.totalUsers }}명</span
              >
            </div>
          </div>
          <div class="community-sidebar__stat-item">
            <BaseIcon name="message-circle" />
            <div class="community-sidebar__stat-content">
              <span class="community-sidebar__stat-label">전체 게시글</span>
              <span class="community-sidebar__stat-value"
                >{{ communityStats.totalPosts }}개</span
              >
            </div>
          </div>
          <div class="community-sidebar__stat-item">
            <BaseIcon name="heart" />
            <div class="community-sidebar__stat-content">
              <span class="community-sidebar__stat-label">오늘의 활동</span>
              <span class="community-sidebar__stat-value"
                >{{ communityStats.todayActivities }}건</span
              >
            </div>
          </div>
        </div>
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
  import { ref, computed, onMounted } from 'vue'
  import { useCommunityStore } from '@/stores/community'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const communityStore = useCommunityStore()

  // 스토어에서 데이터 가져오기
  const popularTags = computed(() => communityStore.popularTags)
  const isLoading = computed(() => communityStore.isLoading)
  const currentTagFilter = computed(() => communityStore.currentTagFilter)

  // 로컬 상태
  const recentActivities = ref([])
  const isLoadingActivities = ref(false)
  const communityStats = ref({
    totalUsers: 0,
    totalPosts: 0,
    todayActivities: 0
  })

  // 태그 클릭 처리
  const handleTagClick = async (tagName) => {
    console.log('🏷️ 태그 클릭됨:', tagName)
    await communityStore.toggleTagFilter(tagName)
  }

  // 전체 게시글 보기
  const showAllPosts = async () => {
    console.log('📋 전체 게시글 보기')
    await communityStore.fetchCommunityHome()
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

  // 최근 활동 데이터 로드 (향후 API로 대체)
  const loadRecentActivities = async () => {
    try {
      isLoadingActivities.value = true

      // TODO: 실제 API 호출로 대체 필요
      // const response = await getCommunityActivities()

      // 임시 더미 데이터 (API 구현 전까지)
      await new Promise((resolve) => setTimeout(resolve, 500)) // 로딩 시뮬레이션

      recentActivities.value = [
        {
          id: 1,
          user: { username: 'moviefan' },
          action: '새 게시글을 작성했습니다',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10분 전
        },
        {
          id: 2,
          user: { username: 'cinelover' },
          action: '댓글을 남겼습니다',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30분 전
        },
        {
          id: 3,
          user: { username: 'filmcritic' },
          action: '게시글에 좋아요를 눌렀습니다',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2시간 전
        },
        {
          id: 4,
          user: { username: 'dramaaddict' },
          action: '새 댓글을 작성했습니다',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4시간 전
        }
      ]
    } catch (error) {
      console.error('❌ 최근 활동 로드 실패:', error)
      recentActivities.value = []
    } finally {
      isLoadingActivities.value = false
    }
  }

  // 커뮤니티 통계 데이터 로드 (향후 API로 대체)
  const loadCommunityStats = async () => {
    try {
      // TODO: 실제 API 호출로 대체 필요
      // const response = await getCommunityStats()

      // 임시 더미 데이터 (API 구현 전까지)
      await new Promise((resolve) => setTimeout(resolve, 300)) // 로딩 시뮬레이션

      communityStats.value = {
        totalUsers: 1847,
        totalPosts: 324,
        todayActivities: 23
      }
    } catch (error) {
      console.error('❌ 커뮤니티 통계 로드 실패:', error)
      communityStats.value = {
        totalUsers: 0,
        totalPosts: 0,
        todayActivities: 0
      }
    }
  }

  onMounted(async () => {
    console.log('🔄 CommunitySidebar 마운트됨')

    // 사이드바 데이터 로드
    await Promise.all([loadRecentActivities(), loadCommunityStats()])
  })
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

  .community-sidebar__title .base-icon {
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

  .community-sidebar__loading {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 16px 0;
    color: var(--color-highlight-text);
    font-size: 13px;
  }

  .community-sidebar__show-all {
    width: 100%;
    justify-content: center;
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

  /* 커뮤니티 통계 스타일 */
  .community-sidebar__stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .community-sidebar__stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
  }

  .community-sidebar__stat-item .base-icon {
    width: 16px;
    height: 16px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .community-sidebar__stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .community-sidebar__stat-label {
    font-size: 12px;
    color: var(--color-highlight-text);
    line-height: 1.2;
  }

  .community-sidebar__stat-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
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

  .community-sidebar__guide-item .base-icon {
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

    .community-sidebar__stat-item {
      padding: 6px 0;
    }

    .community-sidebar__stat-content {
      gap: 1px;
    }
  }

  @media (max-width: 480px) {
    .community-sidebar {
      padding: 0 8px 12px;
    }

    .community-sidebar__section {
      min-width: 240px;
    }

    .community-sidebar__title {
      font-size: 14px;
    }

    .community-sidebar__stat-label {
      font-size: 11px;
    }

    .community-sidebar__stat-value {
      font-size: 13px;
    }
  }
</style>
