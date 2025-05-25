<!-- 게시글 카드 -->
<template>
  <article class="post-card">
    <!-- 헤더 (작성자 정보) -->
    <header class="post-card__header">
      <div class="post-card__author">
        <BaseAvatar
          :username="authorName"
          size="sm" />
        <div class="post-card__author-info">
          <span class="post-card__author-name">{{ authorName }}</span>
          <time class="post-card__created-time">
            {{ formatTimeAgo(post.created_at) }}
          </time>
        </div>
      </div>

      <!-- 더보기 메뉴 (작성자 본인인 경우) -->
      <BaseDropdown
        v-if="isAuthor"
        class="post-card__menu">
        <template #trigger>
          <BaseButton
            variant="ghost"
            icon-only
            icon-left="more-horizontal"
            size="small" />
        </template>
        <template #content>
          <BaseButton
            variant="ghost"
            icon-left="edit"
            size="small"
            @click="editPost">
            수정
          </BaseButton>
          <BaseButton
            variant="ghost"
            icon-left="trash-2"
            size="small"
            class="text-red-500"
            @click="deletePost">
            삭제
          </BaseButton>
        </template>
      </BaseDropdown>
    </header>

    <!-- 내용 -->
    <div class="post-card__content">
      <!-- 제목 -->
      <h3
        class="post-card__title"
        @click="goToPost">
        {{ post.title || post.post_title }}
      </h3>

      <!-- 본문 미리보기 -->
      <p
        class="post-card__preview"
        @click="goToPost">
        {{ contentPreview }}
      </p>

      <!-- 태그들 -->
      <div
        v-if="post.tags && post.tags.length > 0"
        class="post-card__tags">
        <BaseTag
          v-for="tag in post.tags"
          :key="tag"
          variant="secondary"
          size="small"
          clickable
          @click="filterByTag(tag)">
          #{{ tag }}
        </BaseTag>
      </div>
    </div>

    <!-- 푸터 (액션 버튼들) -->
    <footer class="post-card__footer">
      <div class="post-card__stats">
        <!-- 좋아요 -->
        <BaseButton
          variant="ghost"
          size="small"
          :class="[
            'post-card__action',
            { 'post-card__action--active': post.is_liked }
          ]"
          @click="toggleLike">
          <BaseIcon
            name="heart"
            :class="{ 'text-red-500': post.is_liked }" />
          <span>{{ formatCount(post.like_count) }}</span>
        </BaseButton>

        <!-- 댓글 -->
        <BaseButton
          variant="ghost"
          size="small"
          class="post-card__action"
          @click="goToPost">
          <BaseIcon name="message-circle" />
          <span>{{ formatCount(commentCount) }}</span>
        </BaseButton>
      </div>

      <!-- 수정 시간 (수정된 경우) -->
      <div
        v-if="isEdited"
        class="post-card__edited">
        <BaseIcon name="edit-3" />
        <span>{{ formatTimeAgo(post.updated_at) }} 수정</span>
      </div>
    </footer>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseDropdown from '@/components/base/BaseDropdown.vue'

  const props = defineProps({
    post: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['post-updated', 'post-deleted'])

  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const communityStore = useCommunityStore()

  // 계산된 속성들
  const authorName = computed(() => {
    // 새로운 API 구조: author가 객체 {id, username}
    if (typeof props.post.author === 'object' && props.post.author?.username) {
      return props.post.author.username
    }
    // 레거시: author가 문자열
    if (typeof props.post.author === 'string') {
      return props.post.author
    }
    // 작성자 정보가 없는 경우에만 Unknown 표시
    return 'Unknown'
  })

  const authorId = computed(() => {
    if (typeof props.post.author === 'object' && props.post.author?.id) {
      return props.post.author.id
    }
    return null
  })

  const isAuthor = computed(() => {
    return (
      isAuthenticated.value &&
      user.value &&
      authorId.value &&
      (user.value.id === authorId.value ||
        user.value.user_pk === authorId.value)
    )
  })

  const contentPreview = computed(() => {
    const content = props.post.content || ''
    const maxLength = 150
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content
  })

  const isEdited = computed(() => {
    if (!props.post.updated_at || !props.post.created_at) {
      return false
    }

    // 날짜 문자열을 Date 객체로 변환하여 비교
    const createdTime = new Date(props.post.created_at).getTime()
    const updatedTime = new Date(props.post.updated_at).getTime()

    // 1분 이상 차이가 날 때만 수정됨으로 표시 (서버 시간 차이 고려)
    return Math.abs(updatedTime - createdTime) > 60000
  })

  // 댓글 수 계산 (실제 댓글 데이터가 있으면 그것을 우선 사용)
  const commentCount = computed(() => {
    // 게시글에 댓글 데이터가 포함되어 있는 경우 (PostDetail에서 온 경우)
    if (props.post.comments && Array.isArray(props.post.comments)) {
      let totalCount = props.post.comments.length
      props.post.comments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          totalCount += comment.replies.length
        }
      })
      return totalCount
    }

    // API에서 제공하는 comment_count 사용
    return props.post.comment_count || 0
  })

  // 유틸리티 함수들
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count?.toString() || '0'
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ''

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
      if (days < 30) {
        return `${days}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    }
  }

  // 액션 함수들
  const goToPost = () => {
    const postId = props.post.id || props.post.post_id
    router.push({
      name: 'PostDetail',
      params: { id: postId }
    })
  }

  const toggleLike = async () => {
    if (!isAuthenticated.value) {
      // 로그인 모달 열기 또는 로그인 페이지로 이동
      alert('로그인이 필요합니다.')
      return
    }

    try {
      const postId = props.post.id || props.post.post_id
      const result = await communityStore.togglePostLike(postId)

      if (result.success) {
        // 좋아요 상태가 스토어에서 자동으로 업데이트됨
        console.log('✅ 좋아요 토글 성공')
      } else {
        console.error('❌ 좋아요 토글 실패:', result.error)
      }
    } catch (error) {
      console.error('❌ 좋아요 처리 중 오류:', error)
    }
  }

  const filterByTag = async (tagName) => {
    console.log('🏷️ 태그 필터링:', tagName)
    await communityStore.toggleTagFilter(tagName)
  }

  const editPost = () => {
    const postId = props.post.id || props.post.post_id
    router.push({
      name: 'PostEdit',
      params: { id: postId }
    })
  }

  const deletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const postId = props.post.id || props.post.post_id
      const result = await communityStore.deletePost(postId)

      if (result.success) {
        console.log('✅ 게시글 삭제 성공')
        emit('post-deleted', postId)
      } else {
        console.error('❌ 게시글 삭제 실패:', result.error)
        alert('게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 게시글 삭제 중 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-card {
    background-color: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-large);
    padding: 20px;
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-card:hover {
    border-color: var(--color-main-opacity-50);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* 헤더 */
  .post-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .post-card__author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .post-card__author-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .post-card__author-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  .post-card__created-time {
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  /* 내용 */
  .post-card__content {
    margin-bottom: 16px;
  }

  .post-card__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 12px 0;
    cursor: pointer;
    line-height: 1.4;
    transition: color 0.2s ease;
  }

  .post-card__title:hover {
    color: var(--color-main);
  }

  .post-card__preview {
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 1.6;
    margin: 0 0 16px 0;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .post-card__preview:hover {
    color: var(--color-text);
  }

  .post-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* 푸터 */
  .post-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  .post-card__stats {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .post-card__action {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-highlight-text);
    transition: color 0.2s ease;
  }

  .post-card__action:hover {
    color: var(--color-main);
  }

  .post-card__action--active {
    color: var(--color-main);
  }

  .post-card__action svg {
    width: 18px;
    height: 18px;
  }

  .post-card__action span {
    font-size: 13px;
    font-weight: 500;
  }

  .post-card__view-count {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-inactive-text);
    font-size: 13px;
  }

  .post-card__view-count svg {
    width: 16px;
    height: 16px;
  }

  .post-card__edited {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-inactive-text);
    font-size: 11px;
  }

  .post-card__edited svg {
    width: 14px;
    height: 14px;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .post-card {
      padding: 16px;
    }

    .post-card__title {
      font-size: 16px;
    }

    .post-card__preview {
      font-size: 13px;
    }

    .post-card__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .post-card__stats {
      gap: 12px;
    }
  }

  @media (max-width: 480px) {
    .post-card {
      padding: 12px;
    }

    .post-card__author {
      gap: 8px;
    }

    .post-card__author-name {
      font-size: 13px;
    }

    .post-card__created-time {
      font-size: 11px;
    }

    .post-card__title {
      font-size: 15px;
    }

    .post-card__stats {
      gap: 8px;
    }
  }
</style>
