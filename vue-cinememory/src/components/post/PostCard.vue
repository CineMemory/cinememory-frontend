<!-- 게시글 카드 -->
<template>
  <BaseCard
    class="post-card"
    variant="default"
    hoverable
    clickable
    @click="goToPost">
    
    <!-- 헤더: 작성자 정보와 작성 시간 -->
    <template #header>
      <div class="post-card__header">
        <div class="post-card__author">
          <BaseAvatar
            :username="post.author.username"
            size="sm" />
          <div class="post-card__author-info">
            <span class="post-card__username">{{ post.author.username }}</span>
            <span class="post-card__date">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
        
        <BaseButton
          v-if="canEdit"
          variant="ghost"
          size="small"
          icon-only
          icon-left="more-horizontal"
          @click.stop="toggleMenu" />
      </div>
    </template>

    <!-- 본문 -->
    <template #default>
      <div class="post-card__content">
        <h3 class="post-card__title">{{ post.title }}</h3>
        <p class="post-card__excerpt">{{ excerptContent }}</p>
        
        <!-- 태그들 -->
        <div
          v-if="post.tags && post.tags.length > 0"
          class="post-card__tags">
          <BaseTag
            v-for="tag in post.tags"
            :key="tag"
            size="small"
            variant="secondary">
            #{{ tag }}
          </BaseTag>
        </div>
      </div>
    </template>

    <!-- 푸터: 좋아요, 댓글 수, 액션 버튼들 -->
    <template #footer>
      <div class="post-card__footer">
        <div class="post-card__stats">
          <PostButtonLike
            :post-id="post.id"
            :is-liked="post.is_liked"
            :like-count="post.like_count"
            @like-changed="handleLikeChanged" />
          
          <div class="post-card__stat">
            <BaseIcon name="message-circle" />
            <span>{{ post.comment_count }}</span>
          </div>
        </div>
        
        <div class="post-card__actions">
          <BaseButton
            variant="ghost"
            size="small"
            icon-left="share"
            @click.stop="sharePost">
            공유
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseCard>

  <!-- 메뉴 드롭다운 (작성자인 경우) -->
  <BaseModal
    v-model="showMenu"
    size="small"
    :close-on-backdrop="true">
    <div class="post-card__menu">
      <BaseButton
        variant="ghost"
        size="medium"
        icon-left="edit"
        @click="editPost">
        수정
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="medium"
        icon-left="trash-2"
        @click="deletePost">
        삭제
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCommunityStore } from '@/stores/community'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseAvatar from '@/components/base/BaseAvatar.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import PostButtonLike from './PostButtonLike.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['post-updated', 'post-deleted'])

const router = useRouter()
const { isAuthenticated, user } = useAuth()
const communityStore = useCommunityStore()

const showMenu = ref(false)

// 현재 사용자가 이 게시글을 수정할 수 있는지 확인
const canEdit = computed(() => {
  return isAuthenticated.value && 
         user.value?.user_pk === props.post.author.id
})

// 본문 요약 (150자로 제한)
const excerptContent = computed(() => {
  if (!props.post.content) return ''
  
  const maxLength = 150
  if (props.post.content.length <= maxLength) {
    return props.post.content
  }
  
  return props.post.content.substring(0, maxLength) + '...'
})

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return diffInMinutes < 1 ? '방금 전' : `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInHours < 24 * 7) {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// 게시글 상세 페이지로 이동
const goToPost = () => {
  router.push({ name: 'PostDetail', params: { id: props.post.id } })
}

// 메뉴 토글
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 게시글 수정
const editPost = () => {
  showMenu.value = false
  router.push({ name: 'PostEdit', params: { id: props.post.id } })
}

// 게시글 삭제
const deletePost = async () => {
  showMenu.value = false
  
  if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    return
  }
  
  const result = await communityStore.deletePost(props.post.id)
  
  if (result.success) {
    emit('post-deleted', props.post.id)
  } else {
    alert(result.error || '게시글 삭제에 실패했습니다.')
  }
}

// 게시글 공유
const sharePost = () => {
  const url = `${window.location.origin}/community/post/${props.post.id}`
  
  if (navigator.share) {
    navigator.share({
      title: props.post.title,
      text: props.post.content,
      url: url
    })
  } else {
    // 폴백: 클립보드에 복사
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 클립보드에 복사되었습니다!')
    })
  }
}

// 좋아요 변경 처리
const handleLikeChanged = (likeData) => {
  emit('post-updated', {
    ...props.post,
    is_liked: likeData.is_liked,
    like_count: likeData.like_count
  })
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-card {
  margin-bottom: 16px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.post-card__username {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.post-card__date {
  font-size: 12px;
  color: var(--color-highlight-text);
}

.post-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
  cursor: pointer;
}

.post-card__title:hover {
  color: var(--color-main);
}

.post-card__excerpt {
  font-size: 14px;
  color: var(--color-highlight-text);
  line-height: 1.6;
  margin: 0;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-card__stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.post-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--color-highlight-text);
}

.post-card__stat svg {
  width: 16px;
  height: 16px;
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-card__menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-card__title {
    font-size: 16px;
  }
  
  .post-card__footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .post-card__stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>