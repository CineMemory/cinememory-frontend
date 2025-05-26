<!-- 커뮤니티 사이드바 (소셜 미디어 스타일) -->
<template>
  <aside class="community-sidebar">
    <!-- 커뮤니티 개요 -->
    <div class="sidebar-section community-overview">
      <div class="section-header">
        <BaseIcon name="users" />
        <h3>씨네메모리</h3>
        <span class="live-indicator">LIVE</span>
      </div>

      <div class="community-stats">
        <div class="stat-item">
          <span class="stat-number">{{
            formatNumber(stats.users?.total || 0)
          }}</span>
          <span class="stat-label">멤버</span>
          <span
            v-if="stats.users?.today > 0"
            class="stat-badge new">
            +{{ stats.users.today }}
          </span>
        </div>

        <div class="stat-item">
          <span class="stat-number">{{
            formatNumber(stats.posts?.total || 0)
          }}</span>
          <span class="stat-label">게시글</span>
          <span
            v-if="stats.posts?.today > 0"
            class="stat-badge new">
            +{{ stats.posts.today }}
          </span>
        </div>

        <div class="stat-item">
          <span class="stat-number">{{
            formatNumber(stats.comments?.total || 0)
          }}</span>
          <span class="stat-label">댓글</span>
          <span
            v-if="stats.comments?.today > 0"
            class="stat-badge new">
            +{{ stats.comments.today }}
          </span>
        </div>
      </div>
    </div>

    <!-- 🔥 최신 활동 피드 -->
    <div class="sidebar-section activity-feed">
      <div class="section-header">
        <BaseIcon name="activity" />
        <h3>최신 활동</h3>
        <BaseButton
          variant="ghost"
          size="small"
          icon-left="refresh-cw"
          @click="refreshStats"
          :loading="isRefreshing">
        </BaseButton>
      </div>

      <!-- 최신 게시글 -->
      <div class="activity-group">
        <h4>최신 게시글</h4>
        <div class="activity-list">
          <div
            v-for="post in recentPosts"
            :key="post.id"
            class="activity-item post-item"
            @click="goToPost(post.id)">
            <BaseAvatar
              :username="post.author"
              size="xs" />
            <div class="activity-content">
              <div class="activity-text">
                <span class="author">{{ post.author }}</span
                >님이 새 글을 작성했습니다
              </div>
              <div class="activity-title">{{ post.title }}</div>
              <div class="activity-meta">
                <span class="time">{{ formatTimeAgo(post.created_at) }}</span>
                <div class="activity-stats">
                  <span class="stat">
                    <BaseIcon name="heart" />
                    {{ post.like_count }}
                  </span>
                  <span class="stat">
                    <BaseIcon name="message-circle" />
                    {{ post.comment_count }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 최신 댓글 -->
      <div class="activity-group">
        <h4>최신 댓글</h4>
        <div class="activity-list">
          <div
            v-for="comment in recentComments"
            :key="comment.id"
            class="activity-item comment-item"
            @click="goToPost(comment.post_id)">
            <BaseAvatar
              :username="comment.author"
              size="xs" />
            <div class="activity-content">
              <div class="activity-text">
                <span class="author">{{ comment.author }}</span
                >님이 댓글을 남겼습니다
              </div>
              <div class="activity-subtitle">{{ comment.post_title }}</div>
              <div class="comment-preview">{{ comment.content }}</div>
              <div class="activity-meta">
                <span class="time">{{
                  formatTimeAgo(comment.created_at)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 인기 태그 클라우드 -->
    <div class="sidebar-section tag-cloud">
      <div class="section-header">
        <BaseIcon
          name="tag"
          size="large" />
        <h3>인기 태그</h3>
      </div>

      <div class="tag-cloud-container">
        <BaseTag
          v-for="tag in popularTags"
          :key="tag.id"
          :variant="getTagVariant(tag.post_count)"
          :size="getTagSize(tag.post_count)"
          clickable
          @click="filterByTag(tag.name)">
          #{{ tag.name }}
          <span class="tag-count">({{ tag.post_count }})</span>
        </BaseTag>
      </div>
    </div>

    <!-- 오늘의 활동 -->
    <div class="sidebar-section daily-activity">
      <div class="section-header">
        <BaseIcon name="calendar" />
        <h3>오늘의 활동</h3>
      </div>

      <div class="daily-stats">
        <div class="daily-stat">
          <div class="daily-icon">📝</div>
          <div class="daily-info">
            <span class="daily-number">{{ stats.posts?.today || 0 }}</span>
            <span class="daily-label">새 게시글</span>
          </div>
        </div>

        <div class="daily-stat">
          <div class="daily-icon">💬</div>
          <div class="daily-info">
            <span class="daily-number">{{ stats.comments?.today || 0 }}</span>
            <span class="daily-label">새 댓글</span>
          </div>
        </div>

        <div class="daily-stat">
          <div class="daily-icon">👋</div>
          <div class="daily-info">
            <span class="daily-number">{{ stats.users?.today || 0 }}</span>
            <span class="daily-label">새 멤버</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 마지막 업데이트 시간 -->
    <div class="sidebar-footer">
      <span class="last-updated">
        마지막 업데이트: {{ formatLastUpdated(stats.last_updated) }}
      </span>
    </div>
  </aside>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCommunityStore } from '@/stores/community'
  import { formatTimeAgo } from '@/utils/dateUtils'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import * as communityAPI from '@/services/api'

  const router = useRouter()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const stats = ref({})
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref(null)

  // 계산된 속성
  const recentPosts = computed(() => stats.value.recent_posts || [])
  const recentComments = computed(() => stats.value.recent_comments || [])
  const popularTags = computed(() => stats.value.popular_tags || [])

  // 유틸리티 함수들
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatLastUpdated = (dateString) => {
    if (!dateString) return '방금 전'

    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    return `${Math.floor(diffInMinutes / 60)}시간 전`
  }

  const getTagVariant = (postCount) => {
    if (postCount >= 10) return 'primary'
    if (postCount >= 5) return 'secondary'
    return 'outline'
  }

  const getTagSize = (postCount) => {
    if (postCount >= 15) return 'medium'
    return 'small'
  }

  // 액션 함수들
  const fetchStats = async () => {
    try {
      isLoading.value = true
      error.value = null

      console.log('📊 커뮤니티 통계 로드 중...')
      const response = await communityAPI.getCommunityStats()

      if (response.success) {
        stats.value = response.data
        console.log('✅ 커뮤니티 통계 로드 성공:', stats.value)
      } else {
        throw new Error('통계 데이터 로드 실패')
      }
    } catch (err) {
      console.error('❌ 커뮤니티 통계 로드 실패:', err)
      error.value = '통계를 불러올 수 없습니다.'
    } finally {
      isLoading.value = false
    }
  }

  const refreshStats = async () => {
    try {
      isRefreshing.value = true
      await fetchStats()
    } catch (err) {
      console.error('❌ 통계 새로고침 실패:', err)
    } finally {
      isRefreshing.value = false
    }
  }

  const goToPost = (postId) => {
    router.push({ name: 'PostDetail', params: { id: postId } })
  }

  const filterByTag = (tagName) => {
    router.push({ name: 'Community', query: { tag: tagName } })
  }

  // 라이프사이클
  onMounted(() => {
    fetchStats()

    // 30초마다 자동 새로고침
    setInterval(() => {
      if (!isRefreshing.value) {
        refreshStats()
      }
    }, 30000)
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .community-sidebar {
    width: 320px;
    padding: 0px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: fit-content;
    position: sticky;
    top: 100px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  /* 📱 섹션 공통 스타일 */
  .sidebar-section {
    background: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 14px 16px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.3s ease;
  }

  .sidebar-section:hover {
    border-color: var(--color-main-opacity-50);
    box-shadow: var(--shadow-card);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-header svg {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  .section-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    flex: 1;
  }

  /* 🎬 커뮤니티 개요 */
  .community-overview {
    background: linear-gradient(
      135deg,
      var(--color-main-opacity-20) 0%,
      var(--color-card-background) 100%
    );
    border: 2px solid var(--color-main-opacity-50);
  }

  .live-indicator {
    background: #ff4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 12px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .community-stats {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .stat-number {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-main);
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin-top: 4px;
  }

  .stat-badge {
    position: absolute;
    top: -8px;
    right: -12px;
    background: var(--color-success);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 8px;
    animation: bounceIn 0.5s ease;
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 🔥 활동 피드 */
  .activity-group {
    margin-bottom: 10px;
  }

  .activity-group:last-child {
    margin-bottom: 0;
  }

  .activity-group h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 12px 0;
    padding-left: 4px;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: var(--color-search-box);
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .activity-item:hover {
    background: var(--color-highlight-background);
    transform: translateY(-1px);
  }

  .activity-content {
    flex: 1;
    min-width: 0;
  }

  .activity-text {
    font-size: 13px;
    color: var(--color-highlight-text);
    margin-bottom: 4px;
  }

  .author {
    color: var(--color-main);
    font-weight: 600;
  }

  .activity-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .activity-subtitle {
    font-size: 12px;
    color: var(--color-main);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .comment-preview {
    font-size: 13px;
    color: var(--color-highlight-text);
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .activity-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: var(--color-inactive-text);
  }

  .activity-stats {
    display: flex;
    gap: 8px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .stat svg {
    width: 12px;
    height: 12px;
  }

  /* 🏷️ 태그 클라우드 */
  .tag-cloud-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .tag-count {
    font-size: 10px;
    opacity: 0.7;
    margin-left: 2px;
  }

  /* 📈 오늘의 활동 */
  .daily-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .daily-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background: var(--color-search-box);
    border-radius: var(--border-radius-medium);
  }

  .daily-icon {
    font-size: 20px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-main-opacity-20);
    border-radius: var(--border-radius-small);
  }

  .daily-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .daily-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
  }

  .daily-label {
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  /* 푸터 */
  .sidebar-footer {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  .last-updated {
    font-size: 11px;
    color: var(--color-inactive-text);
  }

  /* 반응형 */
  @media (max-width: 1200px) {
    .community-sidebar {
      display: none;
    }
  }

  .community-view__layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .community-view__content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 12px;
  }

  .community-view__main {
    flex: 1 1 0%;
    min-width: 0;
  }

  .community-view__sidebar {
    flex-shrink: 0;
    width: 320px;
  }
</style>
