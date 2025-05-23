<!-- 하단 레이아웃 -->
<template>
  <footer class="layout-footer">
    <div class="layout-footer__container">
      <!-- 로고 및 설명 -->
      <div class="layout-footer__brand">
        <div class="layout-footer__logo">
          <img
            src="/logo.svg"
            alt="씨네메모리"
            class="layout-footer__logo-image" />
          <span class="layout-footer__logo-text">씨네메모리</span>
        </div>
        <p class="layout-footer__description">
          당신의 인생을 영화로 되돌아보는 타임캡슐 시네마
        </p>
      </div>

      <!-- 링크 섹션들 -->
      <div class="layout-footer__links">
        <div class="layout-footer__section">
          <h3 class="layout-footer__section-title">서비스</h3>
          <ul class="layout-footer__section-list">
            <li>
              <router-link
                to="/timeline"
                class="layout-footer__link"
                >타임캡슐</router-link
              >
            </li>
            <li>
              <router-link
                to="/explore"
                class="layout-footer__link"
                >영화 탐색</router-link
              >
            </li>
            <li>
              <router-link
                to="/community"
                class="layout-footer__link"
                >커뮤니티</router-link
              >
            </li>
          </ul>
        </div>

        <div class="layout-footer__section">
          <h3 class="layout-footer__section-title">정보</h3>
          <ul class="layout-footer__section-list">
            <li>
              <a
                href="/about"
                class="layout-footer__link"
                >서비스 소개</a
              >
            </li>
            <li>
              <a
                href="/privacy"
                class="layout-footer__link"
                >개인정보처리방침</a
              >
            </li>
            <li>
              <a
                href="/terms"
                class="layout-footer__link"
                >이용약관</a
              >
            </li>
          </ul>
        </div>

        <div class="layout-footer__section">
          <h3 class="layout-footer__section-title">지원</h3>
          <ul class="layout-footer__section-list">
            <li>
              <a
                href="/help"
                class="layout-footer__link"
                >도움말</a
              >
            </li>
            <li>
              <a
                href="/contact"
                class="layout-footer__link"
                >문의하기</a
              >
            </li>
            <li>
              <a
                href="/faq"
                class="layout-footer__link"
                >자주 묻는 질문</a
              >
            </li>
          </ul>
        </div>

        <div class="layout-footer__section">
          <h3 class="layout-footer__section-title">소셜</h3>
          <div class="layout-footer__social">
            <a
              href="#"
              class="layout-footer__social-link"
              aria-label="Twitter">
              <BaseIcon name="twitter" />
            </a>
            <a
              href="#"
              class="layout-footer__social-link"
              aria-label="Instagram">
              <BaseIcon name="instagram" />
            </a>
            <a
              href="#"
              class="layout-footer__social-link"
              aria-label="YouTube">
              <BaseIcon name="youtube" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 저작권 -->
    <div class="layout-footer__bottom">
      <div class="layout-footer__container">
        <p class="layout-footer__copyright">
          © {{ currentYear }} 씨네메모리. All rights reserved.
        </p>
        <p class="layout-footer__powered">Powered by TMDB API</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
  import { computed } from 'vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
  .layout-footer {
    background-color: #242018;
    border-top: 1px solid #6b645f;
    font-family: 'Pretendard', sans-serif;
  }

  .layout-footer__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .layout-footer__brand {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 48px;
  }

  .layout-footer__logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .layout-footer__logo-image {
    width: 32px;
    height: 32px;
  }

  .layout-footer__logo-text {
    font-size: 24px;
    font-weight: 700;
    color: #ffb700;
  }

  .layout-footer__description {
    color: #9c9490;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
    max-width: 400px;
  }

  .layout-footer__links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
    margin-bottom: 48px;
  }

  .layout-footer__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .layout-footer__section-title {
    font-size: 16px;
    font-weight: 600;
    color: #f7f5f3;
    margin: 0;
  }

  .layout-footer__section-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .layout-footer__link {
    color: #9c9490;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
  }

  .layout-footer__link:hover {
    color: #ffb700;
  }

  .layout-footer__social {
    display: flex;
    gap: 12px;
  }

  .layout-footer__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #6b645f;
    color: #f7f5f3;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .layout-footer__social-link:hover {
    background-color: #ffb700;
    color: #0c0b0a;
    transform: translateY(-2px);
  }

  .layout-footer__bottom {
    border-top: 1px solid #6b645f;
    padding: 24px 0;
  }

  .layout-footer__bottom .layout-footer__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .layout-footer__copyright,
  .layout-footer__powered {
    color: #9c9490;
    font-size: 14px;
    margin: 0;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .layout-footer__container {
      padding: 0 16px;
    }

    .layout-footer__links {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .layout-footer__bottom .layout-footer__container {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .layout-footer__links {
      grid-template-columns: 1fr;
    }
  }
</style>
