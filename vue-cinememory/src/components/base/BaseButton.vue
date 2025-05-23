<!-- 기본 버튼 -->
<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--disabled': disabled,
        'base-button--loading': loading,
        'base-button--icon-only': iconOnly
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick">
    <BaseIcon
      v-if="iconLeft && !loading"
      :name="iconLeft"
      class="base-button__icon base-button__icon--left" />

    <BaseSpinner
      v-if="loading"
      class="base-button__spinner"
      size="sm" />

    <span
      v-if="!iconOnly || loading"
      class="base-button__text">
      <slot />
    </span>

    <BaseIcon
      v-if="iconRight && !loading"
      :name="iconRight"
      class="base-button__icon base-button__icon--right" />
  </button>
</template>

<script setup>
  import BaseIcon from './BaseIcon.vue'
  import BaseSpinner from './BaseSpinner.vue'

  defineProps({
    variant: {
      type: String,
      default: 'primary',
      validator: (value) =>
        ['primary', 'secondary', 'ghost', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
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
    },
    iconOnly: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['click'])

  const handleClick = (event) => {
    emit('click', event)
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--border-radius-medium);
    font-weight: 600;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    outline: none;
  }

  .base-button:focus {
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-main);
  }

  /* Variants */
  .base-button--primary {
    background-color: var(--color-main);
    color: var(--color-background);
  }

  .base-button--primary:hover:not(:disabled) {
    background-color: var(--color-gold-dark);
  }

  .base-button--primary:focus {
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-main);
  }

  .base-button--secondary {
    background-color: var(--color-search-box);
    color: var(--color-text);
    border: 1px solid var(--color-inactive-icon);
  }

  .base-button--secondary:hover:not(:disabled) {
    background-color: var(--color-card-background);
    border-color: var(--color-highlight-text);
  }

  .base-button--secondary:focus {
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-highlight-text);
  }

  .base-button--ghost {
    background-color: transparent;
    color: var(--color-highlight-text);
  }

  .base-button--ghost:hover:not(:disabled) {
    background-color: var(--color-main-opacity-20);
    color: var(--color-text);
  }

  .base-button--ghost:focus {
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-highlight-text);
  }

  .base-button--danger {
    background-color: var(--color-alert);
    color: var(--color-text);
  }

  .base-button--danger:hover:not(:disabled) {
    background-color: #e53030;
  }

  .base-button--danger:focus {
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-alert);
  }

  /* Sizes */
  .base-button--small {
    padding: 6px 12px;
    font-size: 14px;
    min-height: 32px;
  }

  .base-button--medium {
    padding: 8px 16px;
    font-size: 14px;
    min-height: 40px;
  }

  .base-button--large {
    padding: 12px 24px;
    font-size: 16px;
    min-height: 48px;
  }

  /* Icon only */
  .base-button--icon-only.base-button--small {
    width: 32px;
    height: 32px;
    padding: 0;
  }

  .base-button--icon-only.base-button--medium {
    width: 40px;
    height: 40px;
    padding: 0;
  }

  .base-button--icon-only.base-button--large {
    width: 48px;
    height: 48px;
    padding: 0;
  }

  /* States */
  .base-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .base-button--loading {
    cursor: wait;
  }

  /* Icons */
  .base-button__icon--left {
    margin-left: -4px;
  }

  .base-button__icon--right {
    margin-right: -4px;
  }

  .base-button__spinner {
    margin-left: -4px;
  }

  .base-button__text {
    line-height: 1;
  }
</style>
