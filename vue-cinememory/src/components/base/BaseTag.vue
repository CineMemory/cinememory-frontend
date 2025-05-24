<!-- 기본 태그 -->
<template>
  <span
    :class="[
      'base-tag',
      `base-tag--${variant}`,
      `base-tag--${size}`,
      {
        'base-tag--clickable': clickable,
        'base-tag--removable': removable
      }
    ]"
    @click="handleClick">
    <BaseIcon
      v-if="iconLeft"
      :name="iconLeft"
      class="base-tag__icon base-tag__icon--left" />

    <span class="base-tag__text">
      <slot />
    </span>

    <BaseIcon
      v-if="iconRight"
      :name="iconRight"
      class="base-tag__icon base-tag__icon--right" />

    <button
      v-if="removable"
      class="base-tag__remove"
      @click.stop="handleRemove">
      <BaseIcon name="x" />
    </button>
  </span>
</template>

<script setup>
  import BaseIcon from './BaseIcon.vue'

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
          'error',
          'info'
        ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    },
    removable: {
      type: Boolean,
      default: false
    },
    iconLeft: {
      type: String,
      default: null
    },
    iconRight: {
      type: String,
      default: null
    }
  })

  const emit = defineEmits(['click', 'remove'])

  const handleClick = (event) => {
    emit('click', event)
  }

  const handleRemove = (event) => {
    emit('remove', event)
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: var(--border-radius-full);
    font-weight: 500;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  /* Variants */
  .base-tag--primary {
    background-color: var(--color-main-opacity-20);
    color: var(--color-main);
    border: 1px solid var(--color-main-opacity-50);
  }

  .base-tag--secondary {
    background-color: var(--color-card-background);
    color: var(--color-highlight-text);
    border: 1px solid var(--color-inactive-icon);
  }

  .base-tag--success {
    background-color: rgba(143, 173, 136, 0.2);
    color: var(--color-rating-good-text);
    border: 1px solid var(--color-rating-good-text);
  }

  .base-tag--warning {
    background-color: var(--color-main-opacity-20);
    color: var(--color-main);
    border: 1px solid var(--color-main);
  }

  .base-tag--error {
    background-color: rgba(255, 56, 56, 0.2);
    color: var(--color-alert);
    border: 1px solid var(--color-alert);
  }

  .base-tag--info {
    background-color: var(--color-card-background-opacity-80);
    color: var(--color-text);
    border: 1px solid var(--color-highlight-text);
  }

  /* Sizes */
  .base-tag--small {
    padding: 2px 8px;
    font-size: 12px;
    min-height: 20px;
  }

  .base-tag--medium {
    padding: 4px 12px;
    font-size: 14px;
    min-height: 24px;
  }

  .base-tag--large {
    padding: 6px 16px;
    font-size: 14px;
    min-height: 32px;
  }

  /* States */
  .base-tag--clickable {
    cursor: pointer;
  }

  .base-tag--clickable:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
  }

  .base-tag--clickable:active {
    transform: translateY(0);
  }

  .base-tag--removable {
    padding-right: 4px;
  }

  /* Icons */
  .base-tag__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .base-tag__icon--left {
    margin-left: -2px;
  }

  .base-tag__icon--right {
    margin-right: -2px;
  }

  .base-tag__text {
    line-height: 1;
  }

  .base-tag__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: var(--border-radius-full);
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    transition: all 0.2s ease;
    margin-left: 2px;
  }

  .base-tag__remove:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .base-tag__remove svg {
    width: 12px;
    height: 12px;
  }

  /* Hover effects for different variants */
  .base-tag--primary.base-tag--clickable:hover {
    background-color: var(--color-main-opacity-50);
    border-color: var(--color-main);
  }

  .base-tag--secondary.base-tag--clickable:hover {
    background-color: var(--color-search-box);
    border-color: var(--color-highlight-text);
  }

  .base-tag--success.base-tag--clickable:hover {
    background-color: rgba(143, 173, 136, 0.3);
  }

  .base-tag--error.base-tag--clickable:hover {
    background-color: rgba(255, 56, 56, 0.3);
  }
</style>
