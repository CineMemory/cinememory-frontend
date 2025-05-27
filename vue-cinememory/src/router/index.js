import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '씨네메모리 - 당신의 인생을 영화로'
    }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: {
      title: '취향 분석 | 씨네메모리',
      requireAuth: true
    }
  },
  // 인증 페이지
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      title: '로그인 | 씨네메모리',
      requireGuest: true // 이미 로그인한 사용자는 접근 불가
    }
  },
  // 커뮤니티 관련 라우트
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/CommunityView.vue'),
    meta: {
      title: '커뮤니티 | 씨네메모리'
    }
  },
  {
    path: '/community/post/:id',
    name: 'PostDetail',
    component: () => import('@/views/PostDetailView.vue'),
    meta: {
      title: '게시글 상세 | 씨네메모리'
    }
  },
  {
    path: '/community/post/create',
    name: 'PostCreate',
    component: () => import('@/views/PostCreateView.vue'),
    meta: {
      title: '게시글 작성 | 씨네메모리',
      requireAuth: true
    }
  },
  {
    path: '/community/post/:id/edit',
    name: 'PostEdit',
    component: () => import('@/views/PostEditView.vue'),
    meta: {
      title: '게시글 수정 | 씨네메모리',
      requireAuth: true
    }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('@/views/DummyView.vue'),
    meta: {
      title: '나의 시네마틱 여정 | 씨네메모리',
      requireAuth: true,
      requireOnboarding: true
    }
  },
  {
    path: '/profile',
    name: 'MyProfile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: '내 프로필 | 씨네메모리',
      requireAuth: true // 로그인 필요한 페이지
    }
  },
  {
    path: '/profile/:userId',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue'),
    meta: {
      title: '사용자 프로필 | 씨네메모리',
      requireAuth: false
    }
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: () => import('@/views/SearchResultView.vue'),
    meta: {
      title: '검색 결과 | 씨네메모리'
    }
  },
  // 영화 상세 페이지
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('@/views/MovieDetailView.vue'),
    meta: {
      title: '영화 상세 | 씨네메모리'
    }
  },
  {
    path: '/person/:id',
    name: 'PersonDetail',
    component: () => import('@/views/PersonDetailView.vue'),
    meta: {
      title: '인물 상세 | 씨네메모리'
    }
  },
  // 404 페이지
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '페이지를 찾을 수 없습니다 | 씨네메모리'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증 가드
// 인증 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 인증 스토어 초기화 (앱 시작 시 한 번만)
  if (to.name === 'Home' && from.name === undefined) {
    await authStore.initialize()
  }

  // 로그인이 필요한 페이지 체크
  if (to.meta.requireAuth && !authStore.isAuthenticated) {
    console.log('🔒 로그인이 필요한 페이지입니다.')
    next({
      name: 'Auth',
      query: {
        mode: 'login',
        redirect: to.fullPath
      }
    })
    return
  }

  // 게스트만 접근 가능한 페이지 체크 (이미 로그인한 사용자)
  if (to.meta.requireGuest && authStore.isAuthenticated) {
    console.log('👤 이미 로그인된 사용자입니다.')
    next({ name: 'Home' })
    return
  }

  // 온보딩 완료 체크 - 타임라인만 체크 (마이페이지는 제외)
  if (
    authStore.isAuthenticated &&
    !authStore.user?.onboarding_completed &&
    to.name !== 'Onboarding' &&
    to.name !== 'Auth' &&
    to.name === 'Timeline'
  ) {
    // 타임라인만 체크
    console.log('📝 온보딩이 필요합니다.')
    next({ name: 'Onboarding' })
    return
  }

  next()
})

// 페이지 타이틀 설정
router.afterEach((to) => {
  // 검색 페이지의 경우 검색어를 타이틀에 포함
  if (to.name === 'SearchResult' && to.query.q) {
    document.title = `"${to.query.q}" 검색 결과 | 씨네메모리`
  } else if (to.name === 'Auth') {
    // 인증 페이지의 경우 모드에 따라 타이틀 변경
    const mode = to.query.mode
    if (mode === 'signup') {
      document.title = '회원가입 | 씨네메모리'
    } else {
      document.title = '로그인 | 씨네메모리'
    }
  } else {
    document.title = to.meta.title || '씨네메모리'
  }
})

export default router
