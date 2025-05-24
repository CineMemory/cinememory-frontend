<!-- 게시글 작성 페이지 -->
<template>
  <div class="post-create-view">
    <!-- 헤더 -->
    <CommunityHeader
      title="게시글 작성"
      subtitle="영화에 대한 이야기를 나누어보세요"
      show-back-button />

    <!-- 메인 콘텐츠 -->
    <div class="post-create-view__content">
      <PostCreator
        @post-created="handlePostCreated"
        @cancel="handleCancel" />
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import CommunityHeader from '@/components/layout/CommunityHeader.vue'
  import PostCreator from '@/components/post/PostCreator.vue'

  const router = useRouter()
  const { isAuthenticated, requireAuth } = useAuth()

  onMounted(() => {
    // 인증 확인
    if (!requireAuth()) {
      return
    }

    // 페이지 타이틀 설정
    document.title = '게시글 작성 | 씨네메모리'
  })

  // 게시글 작성 완료 처리
  const handlePostCreated = (post) => {
    console.log('새 게시글 작성 완료:', post)
    // PostCreator에서 자동으로 상세 페이지로 이동하므로 별도 처리 불필요
  }

  // 취소 처리
  const handleCancel = () => {
    console.log('게시글 작성 취소')
    // PostCreator에서 자동으로 커뮤니티 페이지로 이동하므로 별도 처리 불필요
  }
</script>

<style scoped>
  @import '@/assets/colors.css';

  .post-create-view {
    min-height: 100vh;
    background-color: var(--color-background);
  }

  .post-create-view__content {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
