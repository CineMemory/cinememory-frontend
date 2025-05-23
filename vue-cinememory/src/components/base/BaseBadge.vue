<!-- 기본 배지 -->
<template>
  <span
    :class="[
      'base-badge',
      `base-badge--${variant}`,
      `base-badge--${size}`,
      {
        'base-badge--dot': dot
      }
    ]">
    <slot v-if="!dot" />
  </span>
</template>

<script setup>
  defineProps({
    variant: {
      type: String,
      default: 'primary',
      validator: (value) =>
        [
          'primary',
          'secondary',
          'success',
          'warning',
          'danger',
          'info'
        ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    dot: {
      type: Boolean,
      default: false
    }
  })
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  /* Variants */
  .base-badge--primary {
    background-color: var(--color-main);
    color: var(--color-background);
  }

  .base-badge--secondary {
    background-color: var(--color-inactive-icon);
    color: var(--color-text);
  }

  .base-badge--success {
    background-color: var(--color-rating-good-text);
    color: var(--color-background);
  }

  .base-badge--warning {
    background-color: var(--color-main);
    color: var(--color-background);
  }

  .base-badge--danger {
    background-color: var(--color-alert);
    color: var(--color-text);
  }

  .base-badge--info {
    background-color: var(--color-highlight-text);
    color: var(--color-text);
  }

  /* Sizes */
  .base-badge--small {
    min-width: 16px;
    height: 16px;
    padding: 0 6px;
    font-size: 10px;
  }

  .base-badge--medium {
    min-width: 20px;
    height: 20px;
    padding: 0 8px;
    font-size: 12px;
  }

  .base-badge--large {
    min-width: 24px;
    height: 24px;
    padding: 0 10px;
    font-size: 14px;
  }

  /* Dot variant */
  .base-badge--dot {
    padding: 0;
  }

  .base-badge--dot.base-badge--small {
    width: 8px;
    height: 8px;
    min-width: 8px;
  }

  .base-badge--dot.base-badge--medium {
    width: 10px;
    height: 10px;
    min-width: 10px;
  }

  .base-badge--dot.base-badge--large {
    width: 12px;
    height: 12px;
    min-width: 12px;
  }
</style>
