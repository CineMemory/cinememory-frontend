<!-- 홈 네비게이션 섹션 -->
<template>
  <section class="home-navigation-section">
    <div class="home-navigation-section__container">
      <div class="home-navigation-section__buttons">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.to"
          class="home-navigation-section__button"
        >
          <div class="home-navigation-section__icon">
            <component
              :is="item.iconComponent"
              class="home-navigation-section__icon-svg"
            />
          </div>
          <span class="home-navigation-section__label">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { h } from 'vue'

// 커뮤니티 아이콘 컴포넌트
const CommunityIcon = () => h('svg', {
  width: 40,
  height: 40,
  viewBox: '0 0 40 40',
  fill: 'none'
}, [
  // 말풍선 배경
  h('path', {
    d: 'M4.5454 5.4546H35.4545V32.3483H15.4162L8.6683 37.7778V32.3483H4.5454V5.4546Z',
    fill: '#FFB700'
  }),
  // 말풍선 어두운 부분
  h('path', {
    d: 'M15.4162 10.9091H24.0844V13.0758H15.4162V10.9091Z',
    fill: '#101322'
  }),
  // 입 부분
  h('path', {
    d: 'M15 14.9091H25V22.2424H15V14.9091Z',
    fill: '#172036'
  }),
  // 노란색 장식
  h('path', {
    d: 'M16.3333 19.5747H23.6667V22.2424H16.3333V19.5747Z',
    fill: '#8B7500'
  }),
  // 회색 바닥
  h('path', {
    d: 'M11.8182 35.4546H28.1818V40H11.8182V35.4546Z',
    fill: '#4D453F'
  })
])

// 타임캡슐 아이콘 컴포넌트
const TimeCapsuleIcon = () => h('svg', {
  width: 40,
  height: 40,
  viewBox: '0 0 40 40',
  fill: 'none'
}, [
  // 달력 배경
  h('path', {
    d: 'M6.0909 6.8182H34.1603V34.2961H6.0909V6.8182Z',
    fill: '#F7F5F3'
  }),
  // 상단 그라데이션
  h('path', {
    d: 'M6.1089 6.7273H34.1652V13.7472H6.1089V6.7273Z',
    fill: 'url(#timecapsule-gradient-1)'
  }),
  // 노란색 상단
  h('path', {
    d: 'M11.0376 5.8333H29.2199V11.0955H11.0376V5.8333Z',
    fill: '#FFD700'
  }),
  // 또 다른 노란색
  h('path', {
    d: 'M11.0376 4H29.2199V9.2621H11.0376V4Z',
    fill: '#FFD700'
  }),
  // 회색 부분
  h('path', {
    d: 'M6.0909 24.6499H34.1603V35.4122H6.0909V24.6499Z',
    fill: 'url(#timecapsule-gradient-2)'
  }),
  // 시계 바늘
  h('path', {
    d: 'M6.0909 25.9639H17.9236V34.2961H6.0909V25.9639Z',
    fill: '#F7F5F3'
  }),
  // 투명 장식
  h('path', {
    d: 'M16.5674 18.8394H23.3174V26.1598H16.5674V18.8394Z',
    fill: 'rgba(230, 160, 0, 0)'
  }),
  // 그라데이션 정의
  h('defs', {}, [
    h('linearGradient', {
      id: 'timecapsule-gradient-1',
      x1: '0.5',
      y1: '0',
      x2: '0.5',
      y2: '1'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#FFB700' }),
      h('stop', { offset: '100%', 'stop-color': '#B8860B' })
    ]),
    h('linearGradient', {
      id: 'timecapsule-gradient-2',
      x1: '0.35',
      y1: '0.79',
      x2: '0.09',
      y2: '1.08'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#9C9490' }),
      h('stop', { offset: '100%', 'stop-color': '#F7F5F3' })
    ])
  ])
])

// 마이페이지 아이콘 컴포넌트
const MyPageIcon = () => h('svg', {
  width: 40,
  height: 40,
  viewBox: '0 0 40 40',
  fill: 'none'
}, [
  // 반투명 배경
  h('path', {
    d: 'M6.4194 7.7273H33.6921V25.9091H6.4194V7.7273Z',
    fill: '#FFD700',
    opacity: 0.2
  }),
  // 그라데이션 요소들
  h('path', {
    d: 'M3.6357 2.2727H24.5304V26.9290H3.6357V2.2727Z',
    fill: 'url(#mypage-gradient-1)'
  }),
  h('path', {
    d: 'M18.0845 8.6061H36.1279V22.3380H18.0845V8.6061Z',
    fill: 'url(#mypage-gradient-2)'
  }),
  h('path', {
    d: 'M5.5107 17.8008H35.0615V34.9580H5.5107V17.8008Z',
    fill: 'url(#mypage-gradient-3)'
  }),
  h('path', {
    d: 'M4.4409 14.3804H35.0574V35.7462H4.4409V14.3804Z',
    fill: 'url(#mypage-gradient-4)'
  }),
  // 아이콘 장식
  h('path', {
    d: 'M15.9561 23.5693H24.9939V30.8020H15.9561V23.5693Z',
    fill: '#6B645F',
    opacity: 0.9
  }),
  // 그라데이션 정의
  h('defs', {}, [
    h('linearGradient', {
      id: 'mypage-gradient-1',
      x1: '0.26',
      y1: '0.10',
      x2: '0.74',
      y2: '0.90'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#8B7500' }),
      h('stop', { offset: '100%', 'stop-color': '#424242' })
    ]),
    h('linearGradient', {
      id: 'mypage-gradient-2',
      x1: '0.5',
      y1: '0',
      x2: '0.52',
      y2: '0.70'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#B8860B' }),
      h('stop', { offset: '100%', 'stop-color': '#FFD700' })
    ]),
    h('linearGradient', {
      id: 'mypage-gradient-3',
      x1: '0.5',
      y1: '0',
      x2: '0.5',
      y2: '1'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#FFB700' }),
      h('stop', { offset: '100%', 'stop-color': '#E6A000' })
    ]),
    h('linearGradient', {
      id: 'mypage-gradient-4',
      x1: '0.5',
      y1: '0',
      x2: '0.5',
      y2: '1'
    }, [
      h('stop', { offset: '0%', 'stop-color': '#FFB700' }),
      h('stop', { offset: '100%', 'stop-color': '#FFD700' })
    ])
  ])
])

const navigationItems = [
  {
    name: 'community',
    label: '커뮤니티',
    iconComponent: CommunityIcon,
    to: { name: 'Community' }
  },
  {
    name: 'timeline',
    label: '타임캡슐',
    iconComponent: TimeCapsuleIcon,
    to: { name: 'Timeline' }
  },
  {
    name: 'profile',
    label: '마이페이지',
    iconComponent: MyPageIcon,
    to: { name: 'MyProfile' }
  }
]
</script>

<style scoped>
.home-navigation-section {
  width: 100%;
  padding: 20px 0 0;
  background-color: var(--color-background);
}

.home-navigation-section__container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-navigation-section__buttons {
  display: flex;
  gap: 13px;
}

.home-navigation-section__button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background-color: var(--color-search-box);
  border-radius: var(--border-radius-medium);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 64px;
}

.home-navigation-section__button:hover {
  background-color: var(--color-highlight-background);
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}

.home-navigation-section__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: var(--border-radius-small);
  flex-shrink: 0;
}

.home-navigation-section__icon-svg {
  width: 100%;
  height: 100%;
}

.home-navigation-section__label {
  font-family: 'Pretendard-Regular', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.429;
  color: var(--color-highlight-text);
  text-align: center;
  transition: color 0.2s ease;
}

.home-navigation-section__button:hover .home-navigation-section__label {
  color: var(--color-text);
}

/* 반응형 */
@media (max-width: 768px) {
  .home-navigation-section__container {
    padding: 0 16px;
  }
  
  .home-navigation-section__buttons {
    gap: 10px;
  }
  
  .home-navigation-section__button {
    padding: 12px 6px;
    min-height: 56px;
  }
  
  .home-navigation-section__icon {
    width: 32px;
    height: 32px;
  }
  
  .home-navigation-section__label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .home-navigation-section__container {
    padding: 0 12px;
  }
  
  .home-navigation-section__buttons {
    gap: 8px;
  }
  
  .home-navigation-section__button {
    padding: 10px 4px;
    min-height: 52px;
  }
  
  .home-navigation-section__label {
    font-size: 11px;
  }
}
</style>