<!-- 기본 스피너 -->
<template>
  <div
    :class="[
      'base-spinner',
      `base-spinner--${size}`,
      `base-spinner--${variant}`
    ]">
    <svg
      class="base-spinner__svg"
      viewBox="0 0 50 50">
      <circle
        class="base-spinner__circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="4" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['sm', 'medium', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  }
})
</script>

<style scoped>
@import '@/assets/colors.css';

.base-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-spinner__svg {
  animation: base-spinner-rotate 2s linear infinite;
}

.base-spinner__circle {
  stroke-linecap: round;
  stroke-dasharray: 31.416;
  stroke-dashoffset: 31.416;
  transform-origin: 50% 50%;
  animation: base-spinner-dash 1.5s ease-in-out infinite;
}

/* 크기별 스타일 */
.base-spinner--sm .base-spinner__svg {
  width: 16px;
  height: 16px;
}

.base-spinner--medium .base-spinner__svg {
  width: 24px;
  height: 24px;
}

.base-spinner--lg .base-spinner__svg {
  width: 32px;
  height: 32px;
}

.base-spinner--xl .base-spinner__svg {
  width: 48px;
  height: 48px;
}

/* 색상별 스타일 */
.base-spinner--primary .base-spinner__circle {
  stroke: var(--color-main);
}

.base-spinner--secondary .base-spinner__circle {
  stroke: var(--color-highlight-text);
}

.base-spinner--white .base-spinner__circle {
  stroke: var(--color-text);
}

/* 애니메이션 */
@keyframes base-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes base-spinner-dash {
  0% {
    stroke-dasharray: 1, 31.416;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 15.708, 31.416;
    stroke-dashoffset: -7.854;
  }
  100% {
    stroke-dasharray: 15.708, 31.416;
    stroke-dashoffset: -23.562;
  }
}
</style>