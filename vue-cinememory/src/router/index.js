import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views 컴포넌트 Import
import AuthView from '@/views/AuthView.vue'
import HomeView from '@/views/HomeView.vue'
import TimelineView from '@/views/TimelineView.vue'
import ExploreView from '@/views/ExploreView.vue'
import CommunityView from '@/views/CommunityView.vue'
import ProfileView from '@/views/ProfileView.vue'
import MovieDetailView from '@/views/MovieDetailView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import ErrorView from '@/views/ErrorView.vue'

const routes = [
  // 홈 페이지
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '씨네메모리 - 당신의 인생을 영화로',
      requiresAuth: false
    }
  },

  // 인증 페이지
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: {
      title: '로그인 | 씨네메모리',
      requiresAuth: false,
      requiresGuest: true // 로그인된 사용자는 접근 불가
    }
  },

  // 개인 타임라인 (메인 기능)
  {
    path: '/timeline',
    name: 'Timeline',
    component: TimelineView,
    meta: {
      title: '나의 시네마틱 여정 | 씨네메모리',
      requiresAuth: true
    }
  },

  // 사용자별 타임라인 (다른 사용자 타임라인 조회)
  {
    path: '/timeline/:userId',
    name: 'UserTimeline',
    component: TimelineView,
    props: true,
    meta: {
      title: '시네마틱 여정 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 영화 탐색
  {
    path: '/explore',
    name: 'Explore',
    component: ExploreView,
    meta: {
      title: '영화 탐색 | 씨네메모리',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        redirect: '/explore/trending'
      },
      {
        path: 'trending',
        name: 'ExploreTrending',
        component: () => import('@/components/movie/MovieTrendingList.vue'),
        meta: { title: '인기 영화 | 씨네메모리' }
      },
      {
        path: 'by-year/:year',
        name: 'ExploreByYear',
        component: () => import('@/components/movie/MovieYearList.vue'),
        props: true,
        meta: { title: '연도별 영화 | 씨네메모리' }
      },
      {
        path: 'by-genre/:genre',
        name: 'ExploreByGenre',
        component: () => import('@/components/movie/MovieGenreList.vue'),
        props: true,
        meta: { title: '장르별 영화 | 씨네메모리' }
      }
    ]
  },

  // 영화 상세
  {
    path: '/movie/:movieId',
    name: 'MovieDetail',
    component: MovieDetailView,
    props: true,
    meta: {
      title: '영화 상세 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 커뮤니티
  {
    path: '/community',
    name: 'Community',
    component: CommunityView,
    meta: {
      title: '커뮤니티 | 씨네메모리',
      requiresAuth: false
    },
    children: [
      {
        path: '',
        redirect: '/community/recent'
      },
      {
        path: 'recent',
        name: 'CommunityRecent',
        component: () => import('@/components/post/PostListRecent.vue'),
        meta: { title: '최신 게시글 | 씨네메모리' }
      },
      {
        path: 'popular',
        name: 'CommunityPopular',
        component: () => import('@/components/post/PostListPopular.vue'),
        meta: { title: '인기 게시글 | 씨네메모리' }
      },
      {
        path: 'generation/:generation',
        name: 'CommunityGeneration',
        component: () => import('@/components/post/PostListGeneration.vue'),
        props: true,
        meta: { title: '세대별 커뮤니티 | 씨네메모리' }
      }
    ]
  },

  // 게시글 상세
  {
    path: '/post/:postId',
    name: 'PostDetail',
    component: PostDetailView,
    props: true,
    meta: {
      title: '게시글 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 프로필
  {
    path: '/profile',
    name: 'MyProfile',
    component: ProfileView,
    meta: {
      title: '내 프로필 | 씨네메모리',
      requiresAuth: true
    }
  },

  // 다른 사용자 프로필
  {
    path: '/profile/:userId',
    name: 'UserProfile',
    component: ProfileView,
    props: true,
    meta: {
      title: '프로필 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 설정
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      title: '설정 | 씨네메모리',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/settings/profile'
      },
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/components/user/UserSettingsProfile.vue'),
        meta: { title: '프로필 설정 | 씨네메모리' }
      },
      {
        path: 'birth',
        name: 'SettingsBirth',
        component: () => import('@/components/user/UserSettingsBirth.vue'),
        meta: { title: '생년월일 설정 | 씨네메모리' }
      }
    ]
  },

  // 검색
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: {
      title: '검색 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 에러 페이지
  {
    path: '/error',
    name: 'Error',
    component: ErrorView,
    meta: {
      title: '오류 | 씨네메모리',
      requiresAuth: false
    }
  },

  // 404 페이지 (반드시 마지막에 위치)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: '페이지를 찾을 수 없습니다 | 씨네메모리',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 저장된 포지션이 있으면 그 위치로
    if (savedPosition) {
      return savedPosition
    }
    // 앵커가 있으면 해당 요소로
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // 기본적으로 상단으로
    return { top: 0 }
  }
})

// 전역 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 페이지 타이틀 설정
  document.title = to.meta.title || '씨네메모리'
  
  // 인증이 필요한 페이지 체크
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 로그인 후 원래 페이지로 돌아가기 위해 redirect 파라미터 추가
    next({
      name: 'Auth',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 게스트만 접근 가능한 페이지 체크 (이미 로그인된 사용자)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Timeline' })
    return
  }
  
  next()

// 예시 1: 로그인하지 않고 /timeline 접근 시도
// 1. to.meta.requiresAuth = true
// 2. authStore.isAuthenticated = false  
// 3. 결과: /auth?redirect=/timeline 으로 이동

// 예시 2: 로그인한 상태에서 /auth 접근 시도  
// 1. to.meta.requiresGuest = true
// 2. authStore.isAuthenticated = true
// 3. 결과: /timeline 으로 이동

// 예시 3: 정상적인 접근
// 1. 조건에 해당하지 않음
// 2. next() 호출되어 정상 이동
})

export default router