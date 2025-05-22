import { createRouter, createWebHistory } from 'vue-router'
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
  // 임시 더미 라우트들 (나중에 실제 컴포넌트로 교체)
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/DummyView.vue'),
    meta: {
      title: '커뮤니티 | 씨네메모리'
    }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('@/views/DummyView.vue'),
    meta: {
      title: '나의 시네마틱 여정 | 씨네메모리'
    }
  },
  {
    path: '/profile',
    name: 'MyProfile',
    component: () => import('@/views/DummyView.vue'),
    meta: {
      title: '내 프로필 | 씨네메모리'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/DummyView.vue'),
    meta: {
      title: '검색 | 씨네메모리'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 페이지 타이틀 설정
router.beforeEach((to) => {
  document.title = to.meta.title || '씨네메모리'
})

export default router