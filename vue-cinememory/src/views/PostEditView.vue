<!-- PostEditView.vue 템플릿 수정 -->
<template>
  <div class="post-edit-view">
    <!-- 🔧 CommunityHeader 제거하고 간단한 헤더로 교체 -->
    <header class="post-edit-view__header">
      <div class="post-edit-view__header-content">
        <!-- 뒤로가기 버튼 -->
        <BaseButton
          variant="ghost"
          icon-left="arrow-left"
          size="small"
          @click="goBack">
          뒤로가기
        </BaseButton>

        <!-- 제목 -->
        <div class="post-edit-view__title-section">
          <h1 class="post-edit-view__title">게시글 수정</h1>
          <p class="post-edit-view__subtitle">내용을 수정하고 업데이트하세요</p>
        </div>
      </div>
    </header>

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
        <BaseIcon name="alert-triangle" />
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
  // import CommunityHeader from '@/components/layout/CommunityHeader.vue' // 🔧 제거
  import PostCreator from '@/components/post/PostCreator.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'

  const route = useRoute()
  const router = useRouter()
  const { isAuthenticated, user, requireAuth } = useAuth()
  const communityStore = useCommunityStore()

  // 🔧 뒤로가기 함수 추가
  const goBack = () => {
    // 이전 페이지가 있으면 뒤로가기, 없으면 게시글 상세로
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push({
        name: 'PostDetail',
        params: { id: route.params.id }
      })
    }
  }

  // 나머지 스크립트는 기존과 동일...
  const post = computed(() => communityStore.currentPost)
  const isLoading = computed(() => communityStore.isLoading)
  const error = computed(() => communityStore.error)

  const canEdit = computed(() => {
    return (
      isAuthenticated.value &&
      user.value &&
      post.value?.author &&
      (user.value.user_pk === post.value.author.id ||
        user.value.id === post.value.author.id)
    )
  })

  onMounted(async () => {
    if (!requireAuth()) {
      return
    }
    await loadPost()
  })

  watch(
    () => route.params.id,
    async (newId, oldId) => {
      if (newId && newId !== oldId) {
        await loadPost()
      }
    }
  )

  const loadPost = async () => {
    const postId = route.params.id
    console.log('📄 게시글 로드 시작:', postId)

    if (!postId) {
      router.push({ name: 'Community' })
      return
    }

    try {
      const result = await communityStore.fetchPost(postId)
      console.log('📄 게시글 로드 결과:', result)

      if (result.success && result.post) {
        document.title = `"${result.post.title}" 수정 | 씨네메모리`
      } else {
        if (
          result.error?.includes('404') ||
          result.error?.includes('찾을 수 없습니다')
        ) {
          router.push({ name: 'NotFound' })
        }
      }
    } catch (error) {
      console.error('❌ 게시글 로드 중 오류:', error)
    }
  }

  const retryLoad = () => {
    communityStore.clearError()
    loadPost()
  }

  const goToPost = () => {
    router.push({
      name: 'PostDetail',
      params: { id: post.value.id }
    })
  }

  const handlePostUpdated = (updatedPost) => {
    console.log('게시글 수정 완료:', updatedPost)
  }

  const handleCancel = () => {
    console.log('게시글 수정 취소')
    goBack()
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

  /* 🔧 새로운 헤더 스타일 */
  .post-edit-view__header {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    padding: 16px 24px;
  }

  .post-edit-view__header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .post-edit-view__title-section {
    flex: 1;
  }

  .post-edit-view__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 4px 0;
  }

  .post-edit-view__subtitle {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .post-edit-view__content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }

  /* 나머지 스타일은 기존과 동일... */
  .post-edit-view__loading,
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
    .post-edit-view__header {
      padding: 12px 16px;
    }

    .post-edit-view__title {
      font-size: 18px;
    }

    .post-edit-view__subtitle {
      font-size: 13px;
    }

    .post-edit-view__content {
      padding: 16px;
    }
  }
</style>
