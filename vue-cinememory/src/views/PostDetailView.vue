<!-- 게시글 상세 페이지 -->
<template>
  <div class="post-detail-view">
    <!-- 헤더 -->
    <CommunityHeader
      :title="post?.title || '게시글'"
      show-back-button>
      <template #actions>
        <!-- 수정/삭제 버튼 (작성자인 경우) -->
        <div
          v-if="canEdit"
          class="post-detail-view__author-actions">
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

        <!-- 공유 버튼 -->
        <BaseButton
          variant="ghost"
          icon-left="share"
          size="small"
          @click="sharePost">
          공유
        </BaseButton>
      </template>
    </CommunityHeader>

    <!-- 메인 콘텐츠 -->
    <div class="post-detail-view__content">
      <!-- 로딩 상태 -->
      <div
        v-if="isLoading"
        class="post-detail-view__loading">
        <BaseSpinner size="lg" />
        <p>게시글을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="post-detail-view__error">
        <BaseIcon name="alert-circle" />
        <h3>게시글을 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="secondary"
          @click="retryLoad">
          다시 시도
        </BaseButton>
      </div>

      <!-- 게시글 상세 내용 -->
      <div
        v-else-if="post"
        class="post-detail-view__post">
        <!-- 게시글 상세 -->
        <PostDetail
          :post="post"
          :on-login-required="openLoginModal"
          @post-updated="handlePostUpdated"
          @post-deleted="handlePostDeleted" />

        <!-- 댓글 섹션 -->
        <div class="post-detail-view__comments">
          <CommentSection
            :post-id="String(post?.id || route.params.id)"
            :on-login-required="openLoginModal" />
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <BaseModal
      v-model="showDeleteConfirm"
      title="게시글 삭제"
      size="small">
      <p>정말로 이 게시글을 삭제하시겠습니까?</p>
      <p class="post-detail-view__delete-warning">
        삭제된 게시글은 복구할 수 없습니다.
      </p>

      <template #footer>
        <div class="post-detail-view__modal-actions">
          <BaseButton
            variant="secondary"
            @click="showDeleteConfirm = false">
            취소
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isDeleting"
            @click="confirmDelete">
            삭제
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- 🔐 인증 모달 -->
    <BaseModal
      v-model="isAuthModalOpen"
      size="small"
      :title="isLoginMode ? '로그인' : '회원가입'"
      :closable="true"
      :close-on-backdrop="true">
      <div class="auth-modal-content">
        <!-- 로그인 폼 -->
        <AuthFormLogin
          v-if="isLoginMode"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup" />

        <!-- 회원가입 폼 -->
        <AuthFormSignup
          v-else
          @success="handleAuthSuccess"
          @switch-to-login="switchToLogin" />
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import CommunityHeader from '@/components/layout/CommunityHeader.vue'
  import PostDetail from '@/components/post/PostDetail.vue'
  import CommentSection from '@/components/comment/CommentSection.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
  import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

  const route = useRoute()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const showDeleteConfirm = ref(false)
  const isDeleting = ref(false)
  const isAuthModalOpen = ref(false)
  const isLoginMode = ref(true)

  // 인증 모달 관련 함수들
  const openLoginModal = () => {
    console.log('🔓 로그인 모달 열기')
    isLoginMode.value = true
    isAuthModalOpen.value = true
  }

  const openSignupModal = () => {
    isLoginMode.value = false
    isAuthModalOpen.value = true
  }

  const switchToLogin = () => {
    isLoginMode.value = true
  }

  const switchToSignup = () => {
    isLoginMode.value = false
  }

  const handleAuthSuccess = () => {
    console.log('✅ 인증 성공!')
    isAuthModalOpen.value = false
    // 로그인 성공 후 게시글 다시 로드
    loadPost()
  }

  // 계산된 속성
  const post = computed(() => communityStore.currentPost)
  const isLoading = computed(() => communityStore.isLoading)
  const error = computed(() => communityStore.error)

  const canEdit = computed(() => {
    console.log('🔍 PostDetailView 권한 체크:', {
      isAuthenticated: isAuthenticated.value,
      currentUser: user.value,
      post: post.value,
      postAuthor: post.value?.author,
      userIds: {
        currentUserId: user.value?.id,
        currentUserPk: user.value?.user_pk,
        postAuthorId: post.value?.author?.id,
        postAuthorUserId: post.value?.author?.user_id
      }
    })

    // 🔍 API 원본 응답 데이터 확인을 위한 추가 로그
    if (post.value) {
      console.log(
        '🔍 게시글 원본 데이터 전체:',
        JSON.stringify(post.value, null, 2)
      )
      console.log(
        '🔍 게시글 작성자 원본 데이터:',
        JSON.stringify(post.value.author, null, 2)
      )
    }

    if (!isAuthenticated.value || !user.value || !post.value?.author) {
      console.log('❌ PostDetailView 기본 조건 실패')
      return false
    }

    // 현재 사용자 정보
    const currentUserId = user.value.id || user.value.user_pk || user.value.pk
    const currentUsername = user.value.username

    // 게시글 작성자 정보
    const postAuthorId =
      post.value.author.id ||
      post.value.author.user_id ||
      post.value.author.pk ||
      post.value.author.user_pk
    const postAuthorUsername = post.value.author.username

    // ID가 있으면 ID로 비교, 없으면 username으로 비교
    let isOwner = false
    if (currentUserId && postAuthorId) {
      isOwner = String(currentUserId) === String(postAuthorId)
    } else if (currentUsername && postAuthorUsername) {
      isOwner = currentUsername === postAuthorUsername
    }

    console.log('🔍 PostDetailView 상세 권한 체크:', {
      currentUserId,
      currentUsername,
      postAuthorId,
      postAuthorUsername,
      isOwner,
      comparisonMethod:
        currentUserId && postAuthorId ? 'ID 비교' : 'Username 비교'
    })

    return isOwner
  })

  // 라이프사이클
  onMounted(() => {
    loadPost()
  })

  // 라우트 파라미터 변경 감시
  watch(
    () => route.params.id,
    () => {
      loadPost()
    }
  )

  // 게시글 로드
  // 게시글 로드
  const loadPost = async () => {
    console.log('🔍 PostDetailView route.params:', route.params)
    console.log('🔍 PostDetailView route.params.id:', route.params.id)
    console.log('🔍 PostDetailView route 전체:', route)

    const postId = route.params.id
    console.log('PostDetailView 원본 postId:', postId)

    // postId가 없거나 undefined인 경우 체크
    if (!postId || postId === 'undefined' || postId === undefined) {
      console.error('❌ PostDetailView: postId가 유효하지 않습니다:', postId)
      router.push({ name: 'Community' })
      return
    }

    // postId를 문자열로 변환
    const postIdStr = String(postId)
    console.log('PostDetailView 최종 postId:', postIdStr)

    const result = await communityStore.fetchPost(postIdStr)
    console.log('fetchPost 결과:', result)

    if (result.success && result.post) {
      if (communityStore.comments.length > 0) {
      }

      // 페이지 타이틀 설정
      document.title = `${result.post.title} | 씨네메모리`
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

  // 게시글 수정
  const editPost = () => {
    router.push({
      name: 'PostEdit',
      params: { id: post.value.id }
    })
  }

  // 게시글 삭제
  const deletePost = () => {
    showDeleteConfirm.value = true
  }

  // 삭제 확인
  const confirmDelete = async () => {
    try {
      isDeleting.value = true

      const result = await communityStore.deletePost(post.value.id)

      if (result.success) {
        showDeleteConfirm.value = false
        router.push({ name: 'Community' })
      } else {
        alert(result.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    } finally {
      isDeleting.value = false
    }
  }

  // 게시글 공유
  const sharePost = () => {
    const url = window.location.href

    if (navigator.share && post.value) {
      navigator.share({
        title: post.value.title,
        text: post.value.content,
        url: url
      })
    } else {
      // 폴백: 클립보드에 복사
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

  // 게시글 업데이트 처리
  const handlePostUpdated = (updatedPost) => {
    // 스토어에서 자동으로 처리되므로 별도 처리 불필요
    document.title = `${updatedPost.title} | 씨네메모리`
  }

  // 게시글 삭제 처리
  const handlePostDeleted = () => {
    router.push({ name: 'Community' })
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-detail-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-detail-view__content {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .post-detail-view__author-actions {
    display: flex;
    gap: 8px;
  }

  .post-detail-view__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 16px;
    color: var(--color-highlight-text);
  }

  .post-detail-view__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 16px;
    text-align: center;
  }

  .post-detail-view__error svg {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
  }

  .post-detail-view__error h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .post-detail-view__error p {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .post-detail-view__post {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .post-detail-view__comments {
    border-top: 1px solid var(--color-inactive-icon);
    padding-top: 32px;
  }

  .post-detail-view__delete-warning {
    font-size: 13px;
    color: var(--color-alert);
    font-style: italic;
    margin: 8px 0 0 0;
  }

  .post-detail-view__modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* 🔐 인증 모달 내용 */
  .auth-modal-content {
    padding: 0;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-detail-view__content {
      padding: 16px 12px;
    }

    .post-detail-view__author-actions {
      flex-direction: column;
      gap: 4px;
    }

    .post-detail-view__post {
      gap: 24px;
    }

    .post-detail-view__comments {
      padding-top: 24px;
    }
  }
</style>
