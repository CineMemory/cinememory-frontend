<!-- 커뮤니티 메인 페이지 -->
<template>
  <div class="community-view">
    <!-- 페이지 헤더 -->
    <CommunityHeader
      title="커뮤니티"
      subtitle="영화에 대한 이야기를 나누어보세요">
      
      <!-- 헤더 액션 버튼들 -->
      <template #actions>
        <BaseButton
          v-if="isAuthenticated"
          variant="primary"
          icon-left="plus"
          @click="createPost">
          게시글 작성
        </BaseButton>
        <template v-else>
          <BaseButton
            variant="secondary"
            icon-left="log-in"
            @click="openLoginModal">
            로그인
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon-left="user-plus"
            @click="openSignupModal"
            style="margin-left: 8px;"
          >
            회원가입
          </BaseButton>
        </template>
      </template>
    </CommunityHeader>

    <!-- 인증 모달 -->
    <BaseModal
      v-model="isAuthModalOpen"
      size="small"
      :title="isLoginMode ? '로그인' : '회원가입'"
      :closable="true"
      :close-on-backdrop="true">
      <div class="auth-modal-content">
        <AuthFormLogin
          v-if="isLoginMode"
          @success="handleAuthSuccess"
          @switch-to-signup="switchToSignup" />
        <AuthFormSignup
          v-else
          @success="handleAuthSuccess"
          @switch-to-login="switchToLogin" />
      </div>
    </BaseModal>

    <!-- 커뮤니티 통계 -->
    <div class="community-view__stats">
      <CommunityStats
        :total-posts="totalPosts"
        :total-users="totalUsers"
        :active-users="activeUsers" />
    </div>

    <!-- 주요 콘텐츠 -->
    <div class="community-view__content">
      
      <!-- 사이드바 (데스크톱에서만) -->
      <aside class="community-view__sidebar">
        <CommunitySidebar />
      </aside>

      <!-- 메인 콘텐츠 -->
      <main class="community-view__main">
        
        <!-- 공지사항 (관리자용) -->
        <div
          v-if="announcements.length > 0"
          class="community-view__announcements">
          <CommunityAnnouncements :announcements="announcements" />
        </div>

        <!-- 게시글 목록 -->
        <div class="community-view__posts">
          <PostList />
        </div>
      </main>
    </div>

    <!-- 플로팅 액션 버튼 (모바일) -->
    <BaseButton
      v-if="isAuthenticated"
      class="community-view__fab"
      variant="primary"
      icon-only
      icon-left="plus"
      size="large"
      @click="createPost" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCommunityStore } from '@/stores/community'
import CommunityHeader from '@/components/layout/CommunityHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import PostList from '@/components/post/PostList.vue'
import CommunityStats from '@/components/community/CommunityStats.vue'
import CommunitySidebar from '@/components/community/CommunitySidebar.vue'
import CommunityAnnouncements from '@/components/community/CommunityAnnouncements.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import AuthFormLogin from '@/components/auth/AuthFormLogin.vue'
import AuthFormSignup from '@/components/auth/AuthFormSignup.vue'

const router = useRouter()
const { isAuthenticated } = useAuth()
const communityStore = useCommunityStore()

// 로컬 상태
const announcements = ref([
  {
    id: 1,
    title: '🎬 씨네메모리 커뮤니티 오픈!',
    content: '영화 애호가들을 위한 새로운 공간이 문을 열었습니다. 자유롭게 영화에 대한 이야기를 나누어보세요!',
    isImportant: true,
    createdAt: '2024-12-20T10:00:00Z'
  }
])

// 더미 통계 데이터 (나중에 API에서 가져올 예정)
const totalPosts = ref(127)
const totalUsers = ref(1543)
const activeUsers = ref(234)

// 계산된 속성
// isAuthenticated는 이미 useAuth에서 가져옴

// 인증 모달 상태
const isAuthModalOpen = ref(false)
const isLoginMode = ref(true)

// 로그인 모달 열기
const openLoginModal = () => {
  isLoginMode.value = true
  isAuthModalOpen.value = true
}
// 회원가입 모달 열기
const openSignupModal = () => {
  isLoginMode.value = false
  isAuthModalOpen.value = true
}
// 모드 전환
const switchToLogin = () => {
  isLoginMode.value = true
}
const switchToSignup = () => {
  isLoginMode.value = false
}
// 인증 성공 처리
const handleAuthSuccess = () => {
  isAuthModalOpen.value = false
}

// 라이프사이클
// CommunityView.vue의 script 부분에서 onMounted를 이렇게 수정해보세요

onMounted(async () => {
  // 페이지 타이틀 설정
  document.title = '커뮤니티 | 씨네메모리'
  
  console.log('🚀 CommunityView 마운트됨')
  
  // 디버깅: 더미 데이터 직접 테스트
  try {
    console.log('📡 API 함수 테스트 시작...')
    
    // getPosts 함수 직접 호출 테스트
    const { getPosts, getTags } = await import('@/services/api')
    
    console.log('🏷️ 태그 로드 테스트...')
    const tags = await getTags()
    console.log('✅ 태그 로드 성공:', tags)
    
    console.log('📋 게시글 로드 테스트...')
    const posts = await getPosts(1, 10, 'latest')
    console.log('✅ 게시글 로드 성공:', posts)
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류 발생:', error)
  }
  
  // 스토어 초기화 (PostList에서 자동으로 로드되므로 여기서는 생략)
})

// 게시글 작성 페이지로 이동
const createPost = () => {
  router.push({ name: 'PostCreate' })
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push({ 
    name: 'Auth', 
    query: { 
      mode: 'login',
      redirect: '/community' 
    } 
  })
}

// 회원가입 페이지로 이동
const goToSignup = () => {
  router.push({
    name: 'Auth',
    query: {
      mode: 'signup',
      redirect: '/community'
    }
  })
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.community-view {
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  padding-bottom: 80px; /* FAB 공간 확보 */
}

.community-view__stats {
  margin-bottom: 24px;
  margin-top: 12px; /* 헤더와의 간격 추가 */
}

.community-view__content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.community-view__sidebar {
  position: sticky;
  top: 80px; /* 헤더 높이만큼 */
  height: fit-content;
}

.community-view__main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0; /* flex item이 축소될 수 있도록 */
}

.community-view__announcements {
  margin-bottom: 16px;
}

.community-view__posts {
  flex: 1;
}

/* 플로팅 액션 버튼 (모바일용) */
.community-view__fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  box-shadow: var(--shadow-modal);
  display: none;
}

/* 태블릿 */
@media (max-width: 1024px) {
  .community-view__content {
    grid-template-columns: 240px 1fr;
    gap: 16px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .community-view__content {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 12px;
  }
  
  .community-view__sidebar {
    position: static;
    order: 2; /* 메인 콘텐츠 아래로 이동 */
  }
  
  .community-view__main {
    order: 1;
  }
  
  .community-view__fab {
    display: flex;
  }
  
  .community-view {
    padding-bottom: 100px; /* 모바일에서 FAB 공간 더 확보 */
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .community-view__content {
    padding: 0 8px;
  }
  
  .community-view__fab {
    bottom: 16px;
    right: 16px;
  }
}
</style>