<!-- 게시글 수정 페이지 -->
<template>
  <div class="post-edit-view">
    <!-- 헤더 -->
    <CommunityHeader
      title="게시글 수정"
      subtitle="내용을 수정하고 업데이트하세요"
      show-back-button />

    <!-- 메인 콘텐츠 -->
    <div class="post-edit-view__content">
      <!-- 로딩 상태 -->
      <div
        v-if="isLoading"
        class="post-edit-view__loading">
        <BaseSpinner size="lg" />
        <p>게시글을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="post-edit-view__error">
        <BaseIcon name="alert-circle" />
        <h3>게시글을 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="secondary"
          @click="retryLoad">
          다시 시도
        </BaseButton>
      </div>

      <!-- 권한 없음 -->
      <div
        v-else-if="post && !canEdit"
        class="post-edit-view__unauthorized">
        <BaseIcon name="lock" />
        <h3>수정 권한이 없습니다</h3>
        <p>본인이 작성한 게시글만 수정할 수 있습니다.</p>
        <BaseButton
          variant="secondary"
          @click="goToPost">
          게시글 보기
        </BaseButton>
      </div>

      <!-- 게시글 수정 폼 -->
      <PostCreator
        v-else-if="post"
        :editing-post="post"
        @post-updated="handlePostUpdated"
        @cancel="handleCancel" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import CommunityHeader from '@/components/layout/CommunityHeader.vue'
  import PostCreator from '@/components/post/PostCreator.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const route = useRoute()
  const router = useRouter()
  const { isAuthenticated, user, requireAuth } = useAuth()
  const communityStore = useCommunityStore()

  // 계산된 속성
  const post = computed(() => communityStore.currentPost)
  const isLoading = computed(() => communityStore.isLoading)
  const error = computed(() => communityStore.error)

  const canEdit = computed(() => {
    return (
      isAuthenticated.value && user.value?.user_pk === post.value?.author.id
    )
  })

  // 라이프사이클
  onMounted(async () => {
    // 인증 확인
    if (!requireAuth()) {
      return
    }

    await loadPost()
  })

  // 라우트 파라미터 변경 감시
  watch(
    () => route.params.id,
    () => {
      loadPost()
    }
  )

  // 게시글 로드
  const loadPost = async () => {
    const postId = route.params.id

    if (!postId) {
      router.push({ name: 'Community' })
      return
    }

    const result = await communityStore.fetchPost(postId)

    if (result.success && result.post) {
      // 페이지 타이틀 설정
      document.title = `"${result.post.title}" 수정 | 씨네메모리`
    } else {
      // 게시글을 찾을 수 없는 경우
      if (
        result.error?.includes('404') ||
        result.error?.includes('찾을 수 없습니다')
      ) {
        router.push({ name: 'NotFound' })
      }
    }
  }

  // 재시도
  const retryLoad = () => {
    communityStore.clearError()
    loadPost()
  }

  // 게시글로 이동
  const goToPost = () => {
    router.push({
      name: 'PostDetail',
      params: { id: post.value.id }
    })
  }

  // 게시글 업데이트 완료 처리
  const handlePostUpdated = (updatedPost) => {
    console.log('게시글 수정 완료:', updatedPost)
    // PostCreator에서 자동으로 상세 페이지로 이동하므로 별도 처리 불필요
  }

  // 취소 처리
  const handleCancel = () => {
    console.log('게시글 수정 취소')
    // PostCreator에서 자동으로 상세 페이지로 이동하므로 별도 처리 불필요
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-edit-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-edit-view__content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .post-edit-view__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 16px;
    color: var(--color-highlight-text);
  }

  .post-edit-view__error,
  .post-edit-view__unauthorized {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 16px;
    text-align: center;
  }

  .post-edit-view__error svg,
  .post-edit-view__unauthorized svg {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
  }

  .post-edit-view__error h3,
  .post-edit-view__unauthorized h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .post-edit-view__error p,
  .post-edit-view__unauthorized p {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-edit-view__loading,
    .post-edit-view__error,
    .post-edit-view__unauthorized {
      padding: 60px 16px;
    }
  }
</style>
