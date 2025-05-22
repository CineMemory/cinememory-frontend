<!-- 기본 스피너 -->
<template>
  <div
    :class="[
      'base-spinner',
      `base-spinner--${size}`,
      `base-spinner--${variant}`
    ]"
  >
    <svg
      class="base-spinner__svg"
      viewBox="0 0 50 50"
    >
      <circle
        class="base-spinner__circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['xs', 'sm', 'medium', 'large', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  }
})
</script>

<style scoped>
.base-spinner {
  display: inline-block;
}

/* Sizes */
.base-spinner--xs {
  width: 12px;
  height: 12px;
}

.base-spinner--sm {
  width: 16px;
  height: 16px;
}

.base-spinner--medium {
  width: 20px;
  height: 20px;
}

.base-spinner--large {
  width: 24px;
  height: 24px;
}

.base-spinner--xl {
  width: 32px;
  height: 32px;
}

/* Variants */
.base-spinner--primary {
  color: #ffb700;
}

.base-spinner--secondary {
  color: #9c9490;
}

.base-spinner--white {
  color: #f7f5f3;
}

.base-spinner__svg {
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
}

.base-spinner__circle {
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>