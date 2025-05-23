import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/fonts.css' // font 추가
import './assets/colors.css' // color 추가

const app = createApp(App)

// Pinia 설정
const pinia = createPinia()
app.use(pinia)

// 라우터 설정
app.use(router)

// 앱 마운트
app.mount('#app')

console.log('🎬 씨네메모리 앱이 시작되었습니다!')
