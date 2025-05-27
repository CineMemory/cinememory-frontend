<!-- 게시글 상세 -->
<template>
  <article class="post-detail">
    <!-- 게시글 헤더 -->
    <header class="post-detail__header">
      <div class="post-detail__meta">
        <div class="post-detail__author">
          <BaseAvatar
            :username="post.author?.username || 'Unknown'"
            size="medium" />
          <div class="post-detail__author-info">
            <h4
              class="post-detail__author-name clickable-author"
              @click="goToAuthorProfile">
              {{ post.author?.username || 'Unknown' }}
            </h4>
            <div class="post-detail__date-info">
              <span class="post-detail__created">{{
                formatDate(post.created_at)
              }}</span>
              <span
                v-if="isEdited"
                class="post-detail__updated">
                (수정됨: {{ formatDate(post.updated_at) }})
              </span>
            </div>
          </div>
        </div>

        <!-- 🔧 수정/삭제 버튼 추가 (작성자만 보임) -->
        <div
          v-if="canEdit"
          class="post-detail__author-actions">
          <BaseButton
            variant="secondary"
            icon-left="edit"
            size="small"
            @click="editPost">
            수정
          </BaseButton>
          <BaseButton
            variant="ghost"
            icon-left="trash-2"
            size="small"
            @click="deletePost">
            삭제
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 게시글 제목 -->
    <div class="post-detail__title-section">
      <h1 class="post-detail__title">{{ post.title || post.post_title }}</h1>

      <!-- 태그들 -->
      <div
        v-if="post.tags && post.tags.length > 0"
        class="post-detail__tags">
        <BaseTag
          v-for="tag in post.tags"
          :key="tag"
          variant="primary"
          size="small"
          clickable
          @click="filterByTag(tag)">
          #{{ tag }}
        </BaseTag>
      </div>
    </div>

    <!-- 게시글 내용 -->
    <div class="post-detail__content">
      <PostDetailContent :content="post.content" />
    </div>

    <!-- 게시글 액션 -->
    <footer class="post-detail__footer">
      <div class="post-detail__actions">
        <PostButtonLike
          :post-id="post.id || post.post_id"
          :is-liked="post.is_liked"
          :like-count="post.like_count"
          :on-login-required="props.onLoginRequired"
          @like-changed="handleLikeChanged" />

        <BaseButton
          variant="ghost"
          icon-left="message-circle"
          size="small">
          댓글 {{ commentCount }}
        </BaseButton>

        <BaseButton
          variant="ghost"
          icon-left="share"
          size="small"
          @click="sharePost">
          공유
        </BaseButton>
      </div>
    </footer>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCommunityStore } from '@/stores/community'
  import { isContentEdited } from '@/utils/dateUtils'
  import { useAuth } from '@/composables/useAuth'
  import { getUserByUsername } from '@/services/api'
  import BaseAvatar from '@/components/base/BaseAvatar.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import PostDetailContent from './PostDetailContent.vue'
  import PostButtonLike from './PostButtonLike.vue'

  const props = defineProps({
    post: {
      type: Object,
      required: true
    },
    onLoginRequired: {
      type: Function,
      default: () => {}
    }
  })

  const emit = defineEmits(['post-updated', 'post-deleted'])

  const router = useRouter()
  const communityStore = useCommunityStore()
  const { isAuthenticated, user } = useAuth()

  // 계산된 속성들
  const commentCount = computed(() => {
    // 스토어에서 댓글 데이터를 가져와서 대댓글도 포함해서 계산
    const comments = communityStore.comments
    if (comments && comments.length > 0) {
      let totalCount = comments.length
      comments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          totalCount += comment.replies.length
        }
      })
      return totalCount
    }
    // 스토어에 댓글이 없으면 props에서 가져옴
    return props.post.comment_count || 0
  })

  // 수정 여부 확인
  const isEdited = computed(() => {
    return isContentEdited(props.post.created_at, props.post.updated_at, 5)
  })

  // 🔧 작성자 권한 확인
  const canEdit = computed(() => {
    console.log('🔍 PostDetail canEdit 체크:', {
      isAuthenticated: isAuthenticated.value,
      currentUser: user.value,
      post: props.post,
      postAuthor: props.post?.author
    })

    if (!isAuthenticated.value || !user.value || !props.post?.author) {
      return false
    }

    const currentUserId = user.value.id || user.value.user_pk
    const postAuthorId = props.post.author.id

    const isOwner = String(currentUserId) === String(postAuthorId)

    console.log('🔍 PostDetail 권한 결과:', {
      currentUserId,
      postAuthorId,
      isOwner
    })

    return isOwner
  })

  // 🔧 게시글 수정
  const editPost = () => {
    const postId = props.post.id || props.post.post_id
    console.log('🔧 수정 버튼 클릭:', postId)
    router.push({
      name: 'PostEdit',
      params: { id: postId }
    })
  }

  // 🔧 게시글 삭제
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
        router.push({ name: 'Community' })
      } else {
        alert('게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 게시글 삭제 중 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 태그로 필터링하여 커뮤니티 페이지로 이동
  const filterByTag = (tagName) => {
    // 태그를 선택한 상태로 커뮤니티 페이지로 이동
    router.push({
      name: 'Community',
      query: { tags: tagName }
    })
  }

  // 게시글 공유
  const sharePost = () => {
    const url = window.location.href

    if (navigator.share) {
      navigator.share({
        title: props.post.title,
        text: props.post.content,
        url: url
      })
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert('게시글 링크가 클립보드에 복사되었습니다!')
        })
        .catch(() => {
          prompt('게시글 링크를 복사하세요:', url)
        })
    }
  }

  // 좋아요 변경 처리
  const handleLikeChanged = (likeData) => {
    const updatedPost = {
      ...props.post,
      is_liked: likeData.is_liked,
      like_count: likeData.like_count
    }

    emit('post-updated', updatedPost)
  }

  const goToAuthorProfile = () => {
    const currentUserId = user.value?.id
    const postAuthorId = props.post?.author?.id // 이제 바로 접근 가능

    if (!postAuthorId) {
      console.log('❌ 작성자 ID가 없습니다')
      return
    }

    if (currentUserId && parseInt(postAuthorId) === parseInt(currentUserId)) {
      router.push({ name: 'MyProfile' })
    } else {
      router.push({ name: 'UserProfile', params: { userId: postAuthorId } })
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-detail {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    border: 1px solid var(--color-inactive-icon);
    padding: 24px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-detail__header {
    margin-bottom: 20px;
  }

  .post-detail__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .post-detail__author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .post-detail__author-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .post-detail__author-actions {
    display: flex;
    gap: 8px;
  }

  .post-detail__author-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .post-detail__date-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-highlight-text);
  }

  .post-detail__updated {
    font-style: italic;
  }

  .post-detail__title-section {
    margin-bottom: 24px;
  }

  .post-detail__title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.4;
    margin: 0 0 16px 0;
    word-break: break-word;
  }

  .post-detail__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .post-detail__content {
    margin-bottom: 32px;
  }

  .post-detail__footer {
    border-top: 1px solid var(--color-inactive-icon);
    padding-top: 16px;
  }

  .post-detail__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 16px;
    background-color: var(--color-search-box);
    border-radius: var(--border-radius-medium);
  }

  .clickable-author {
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .clickable-author:hover {
    color: var(--color-main) !important;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-detail {
      padding: 16px;
    }

    .post-detail__title {
      font-size: 24px;
      margin: 0 0 12px 0;
    }

    .post-detail__content {
      margin-bottom: 24px;
    }

    .post-detail__actions {
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
    }

    .post-detail__date-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .post-detail__meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .post-detail__author-actions {
      align-self: flex-end;
    }
  }

  /* 작은 모바일 */
  @media (max-width: 480px) {
    .post-detail {
      padding: 12px;
    }

    .post-detail__title {
      font-size: 20px;
    }

    .post-detail__actions {
      justify-content: space-between;
      gap: 8px;
      padding: 10px;
    }
  }
</style>
