<!-- 기본 아바타 -->
<template>
  <div
    :class="['base-avatar', `base-avatar--${size}`, `base-avatar--${variant}`]">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="username"
      class="base-avatar__image"
      @error="handleImageError" />

    <div
      v-else
      class="base-avatar__initial">
      {{ initial }}
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    username: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['sm', 'medium', 'large', 'xl'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'square'].includes(value)
    }
  })

  const showImage = ref(true)

  // 사용자명의 첫 글자 추출
  const initial = computed(() => {
    if (!props.username) return '?'

    // 한글인 경우 첫 글자
    if (/[가-힣]/.test(props.username[0])) {
      return props.username[0]
    }

    // 영문인 경우 첫 글자를 대문자로
    return props.username[0].toUpperCase()
  })

  // 이미지 로드 실패 처리
  const handleImageError = () => {
    showImage.value = false
  }

  // 실제 이미지 URL 계산
  const imageUrl = computed(() => {
    return showImage.value ? props.imageUrl : null
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-main);
    color: var(--color-background);
    font-weight: 600;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
  }

  /* 기본 원형 */
  .base-avatar--default {
    border-radius: var(--border-radius-full);
  }

  /* 사각형 */
  .base-avatar--square {
    border-radius: var(--border-radius-medium);
  }

  /* 크기별 스타일 */
  .base-avatar--sm {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .base-avatar--medium {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .base-avatar--large {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .base-avatar--xl {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }

  .base-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .base-avatar__initial {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  /* 그라데이션 배경 (사용자별로 다른 색상) */
  .base-avatar:not(:has(.base-avatar__image)) {
    background: linear-gradient(
      135deg,
      var(--color-main) 0%,
      var(--color-gold-dark) 100%
    );
  }

  /* 호버 효과 */
  .base-avatar:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
</style>
