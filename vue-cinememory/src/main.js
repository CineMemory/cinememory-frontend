import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/fonts.css' // font 추가
import './assets/colors.css' // color 추가

// 인증 컴포저블 import
import { useAuth } from '@/composables/useAuth'

const app = createApp(App)

// Pinia 설정
const pinia = createPinia()
app.use(pinia)

// 라우터 설정
app.use(router)

// 앱 마운트
app.mount('#app')

// 앱이 마운트된 후 인증 상태 초기화
const { initializeAuth } = useAuth()
initializeAuth()
  .then(() => {
    console.log('🔐 인증 상태 초기화 완료')
  })
  .catch((error) => {
    console.error('🔐 인증 상태 초기화 실패:', error)
  })
