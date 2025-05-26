<!-- 게시글 목록 -->
<template>
  <div class="post-list">
    <!-- 필터 및 정렬 헤더 -->
    <div class="post-list__header">
      <div class="post-list__header-content">
        <div class="post-list__filters">
          <PostListFilter
            v-model:search="searchQuery"
            v-model:selected-tags="selectedTags"
            :tags="availableTags"
            @filter-changed="handleFilterChanged" />
        </div>

        <div class="post-list__filter-sort-divider"></div>

        <div class="post-list__sort">
          <PostListSort
            v-model="sortBy"
            @sort-changed="handleSortChanged" />
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div
      v-if="isLoading && posts.length === 0"
      class="post-list__loading">
      <BaseSpinner size="lg" />
      <p>게시글을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="post-list__error">
      <BaseIcon name="alert-circle" />
      <p>{{ error }}</p>
      <BaseButton
        variant="secondary"
        @click="retryLoad">
        다시 시도
      </BaseButton>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!isLoading && filteredPosts.length === 0"
      class="post-list__empty">
      <BaseIcon name="file-text" />
      <h3>게시글이 없습니다</h3>
      <p v-if="searchQuery || selectedTags.length > 0">
        검색 조건을 변경해보세요.
      </p>
      <p v-else>첫 번째 게시글을 작성해보세요!</p>
      <BaseButton
        v-if="isAuthenticated"
        variant="primary"
        icon-left="plus"
        @click="createPost">
        게시글 작성
      </BaseButton>
    </div>

    <!-- 게시글 목록 -->
    <div
      v-else
      class="post-list__content">
      <TransitionGroup
        name="post-list"
        tag="div"
        class="post-list__items">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @post-updated="handlePostUpdated"
          @post-deleted="handlePostDeleted" />
      </TransitionGroup>

      <!-- 더 보기 버튼 (페이지네이션) -->
      <div
        v-if="hasNextPage"
        class="post-list__load-more">
        <BaseButton
          variant="secondary"
          size="large"
          :loading="isLoading"
          @click="loadMore">
          더 보기
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCommunityStore } from '@/stores/community'
  import { useAuth } from '@/composables/useAuth'
  import PostCard from './PostCard.vue'
  import PostListFilter from './PostListFilter.vue'
  import PostListSort from './PostListSort.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const router = useRouter()
  const communityStore = useCommunityStore()
  const { isAuthenticated } = useAuth()

  // 로컬 상태
  const searchQuery = computed({
    get: () => communityStore.searchQuery,
    set: (value) => communityStore.setSearchQuery(value)
  })

  const selectedTags = computed({
    get: () => communityStore.selectedTags,
    set: (value) => communityStore.setSelectedTags(value)
  })
  const sortBy = ref('latest')

  // 계산된 속성
  const posts = computed(() => communityStore.posts)
  const isLoading = computed(() => communityStore.isLoading)
  const error = computed(() => communityStore.error)
  const hasNextPage = computed(() => communityStore.hasNextPage)
  const availableTags = computed(() => {
    // 태그 목록을 ID와 이름이 있는 객체 형태로 반환
    return communityStore.tags.map((tag) => ({
      id: typeof tag === 'object' ? tag.id : tag,
      name: typeof tag === 'object' ? tag.name : tag
    }))
  })
  // isAuthenticated는 이미 useAuth에서 가져옴

  // 필터링된 게시글
  const filteredPosts = computed(() => {
    let filtered = [...posts.value]

    // 검색어 필터링
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
      )
    }

    // 태그 필터링
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter((post) => {
        if (!post.tags || post.tags.length === 0) {
          return false
        }
        return selectedTags.value.every((selectedTag) =>
          post.tags.includes(selectedTag)
        )
      })
    }

    return filtered
  })

  // 초기 데이터 로드
  onMounted(async () => {
    // 태그 목록 먼저 로드
    try {
      await communityStore.fetchTags()
    } catch (error) {
      console.warn('태그 로드 실패:', error)
    }

    // 기존 로직
    await loadInitialData()
  })

  // 초기 데이터 로드
  const loadInitialData = async () => {
    // 태그 목록 로드
    await communityStore.fetchTags()

    // 게시글 목록 로드
    await communityStore.fetchPosts(1, 10, sortBy.value)
  }

  // 더 보기 (페이지네이션)
  const loadMore = async () => {
    if (isLoading.value || !hasNextPage.value) return

    const nextPage = communityStore.currentPage + 1
    await communityStore.fetchPosts(nextPage, 10, sortBy.value)
  }

  // 다시 시도
  const retryLoad = async () => {
    communityStore.clearError()
    await loadInitialData()
  }

  // 게시글 작성 페이지로 이동
  const createPost = () => {
    router.push({ name: 'PostCreate' })
  }

  // 필터 변경 처리
  const handleFilterChanged = () => {
    // 필터가 변경되면 자동으로 computed에서 재계산됨
    console.log('필터 변경됨:', {
      searchQuery: searchQuery.value,
      selectedTags: selectedTags.value
    })
  }

  // 정렬 변경 처리
  const handleSortChanged = async () => {
    // 로딩 중이면 요청하지 않음
    if (isLoading.value) {
      return
    }

    try {
      await communityStore.fetchPosts(1, 10, sortBy.value)
      console.log('✅ 정렬 완료:', sortBy.value)
    } catch (error) {
      console.error('❌ 정렬 중 오류:', error)
    }
  }

  // 게시글 업데이트 처리
  const handlePostUpdated = (updatedPost) => {
    const index = posts.value.findIndex((post) => post.id === updatedPost.id)
    if (index !== -1) {
      posts.value[index] = updatedPost
    }
  }

  // 게시글 삭제 처리
  const handlePostDeleted = (postId) => {
    // 스토어에서 이미 처리되므로 여기서는 별도 처리 불필요
    console.log('게시글 삭제됨:', postId)
  }

  // 정렬 기준 변경 감시
  watch(sortBy, (newSort) => {
    communityStore.setSortBy(newSort)
  })

  // 검색어 변경 감시
  watch(searchQuery, (newQuery) => {
    communityStore.setSearchQuery(newQuery)
  })

  // 선택된 태그 변경 감시
  watch(
    selectedTags,
    (newTags) => {
      communityStore.setSelectedTags(newTags)
    },
    { deep: true }
  )
</script>

<style scoped>
  /* 개선된 PostList 스타일 */
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-list {
    width: 100%;
    max-width: none;
    margin: 0 auto;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  /* 헤더 섹션 개선 - CommunityAnnouncements와 일치하도록 */
  .post-list__header {
    margin-bottom: 20px;
  }

  .post-list__header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(
      135deg,
      var(--color-card-background) 0%,
      var(--color-search-box) 100%
    );
    border-radius: var(--border-radius-large);
    border: 1px solid var(--color-inactive-icon);
    box-shadow: var(--shadow-card);
  }

  /* 필터와 정렬 영역 레이아웃 개선 */
  .post-list__filters {
    width: 100%;
    max-width: none;
  }

  .post-list__filter-sort-divider {
    width: 100%;
    height: 1px;
    background: var(--color-inactive-icon);
    margin: 16px 0 8px 0;
    border-radius: 1px;
  }

  .post-list__sort {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 로딩 상태 개선 */
  .post-list__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 16px;
    color: var(--color-highlight-text);
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
  }

  .post-list__loading p {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  /* 에러 상태 개선 */
  .post-list__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 16px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    border: 2px dashed var(--color-alert);
    text-align: center;
  }

  .post-list__error svg {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
  }

  .post-list__error p {
    font-size: 16px;
    color: var(--color-alert);
    margin: 0;
    font-weight: 500;
  }

  /* 빈 상태 개선 */
  .post-list__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 80px 16px;
    background: linear-gradient(
      135deg,
      var(--color-card-background) 0%,
      var(--color-search-box) 100%
    );
    border-radius: var(--border-radius-large);
    border: 2px dashed var(--color-inactive-icon);
    text-align: center;
  }

  .post-list__empty svg {
    width: 64px;
    height: 64px;
    opacity: 0.6;
    color: var(--color-highlight-text);
  }

  .post-list__empty h3 {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .post-list__empty p {
    font-size: 16px;
    margin: 0;
    color: var(--color-highlight-text);
    line-height: 1.5;
  }

  /* 콘텐츠 섹션 개선 */
  .post-list__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .post-list__items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* 더 보기 버튼 개선 */
  .post-list__load-more {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    margin-top: 4px;
  }

  .post-list__load-more .base-button {
    min-width: 200px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-button);
    transition: all 0.3s ease;
  }

  .post-list__load-more .base-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px var(--color-background-opacity-50);
  }

  /* 트랜지션 애니메이션 개선 */
  .post-list-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .post-list-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .post-list-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  .post-list-leave-to {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }

  .post-list-move {
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  /* 반응형 디자인 개선 */
  @media (min-width: 768px) {
    .post-list__header-content {
      padding: 24px 32px;
      gap: 20px;
    }
  }

  @media (min-width: 1024px) {
    .post-list__header-content {
      padding: 28px 40px;
      gap: 24px;
    }
  }

  @media (max-width: 767px) {
    .post-list__header-content {
      padding: 16px;
      gap: 12px;
    }

    .post-list__items {
      gap: 12px;
    }

    .post-list__content {
      gap: 12px;
    }

    .post-list__loading,
    .post-list__error,
    .post-list__empty {
      padding: 40px 12px;
    }

    .post-list__empty h3 {
      font-size: 20px;
    }

    .post-list__empty p {
      font-size: 14px;
    }

    .post-list__load-more {
      padding: 16px 0;
    }

    .post-list__load-more .base-button {
      width: 100%;
      min-width: auto;
    }

    .post-list__filter-sort-divider {
      width: 100%;
      height: 1px;
      background: var(--color-inactive-icon, #e0e0e0);
      margin: 16px 0 8px 0;
      border-radius: 1px;
      opacity: 0.7;
    }
  }

  @media (max-width: 480px) {
    .post-list__header-content {
      padding: 12px;
      border-radius: var(--border-radius-medium);
    }

    .post-list__empty svg {
      width: 48px;
      height: 48px;
    }

    .post-list__empty h3 {
      font-size: 18px;
    }

    .post-list__load-more .base-button {
      height: 44px;
      font-size: 15px;
    }

    .post-list__filter-sort-divider {
      margin: 12px 0 6px 0;
    }
  }
</style>
