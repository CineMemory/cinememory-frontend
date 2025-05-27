<!-- 기본 입력 필드 -->
<template>
  <div class="base-input">
    <label
      v-if="label"
      :for="inputId"
      class="base-input__label">
      {{ label }}
      <span
        v-if="required"
        class="base-input__required"
        >*</span
      >
    </label>

    <div class="base-input__wrapper">
      <BaseIcon
        v-if="iconLeft"
        :name="iconLeft"
        class="base-input__icon base-input__icon--left" />

      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'base-input__field',
          {
            'base-input__field--error': hasError,
            'base-input__field--disabled': disabled,
            'base-input__field--readonly': readonly,
            'base-input__field--with-icon-left': iconLeft,
            'base-input__field--with-icon-right': iconRight || clearable
          }
        ]"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
        @keypress="handleKeypress"
        @keydown="handleKeydown"
        @keyup="handleKeyup" />

      <button
        v-if="clearable && inputValue && !disabled && !readonly"
        class="base-input__clear"
        type="button"
        @click="clearInput">
        <BaseIcon name="x" />
      </button>

      <BaseIcon
        v-else-if="iconRight"
        :name="iconRight"
        class="base-input__icon base-input__icon--right" />
    </div>

    <div
      v-if="hasError || hint"
      class="base-input__footer">
      <p
        v-if="hasError"
        class="base-input__error">
        {{ errorMessage }}
      </p>
      <p
        v-else-if="hint"
        class="base-input__hint">
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import BaseIcon from './BaseIcon.vue'

  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
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

  const emit = defineEmits([
    'update:modelValue',
    'blur',
    'focus',
    'input',
    'keypress',
    'keydown',
    'keyup',
    'clear'
  ])

  const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

  const inputValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const hasError = computed(() => !!props.errorMessage)

  const handleBlur = (event) => {
    emit('blur', event)
  }

  const handleFocus = (event) => {
    emit('focus', event)
  }

  const handleInput = (event) => {
    emit('input', event)
  }

  const handleKeypress = (event) => {
    emit('keypress', event)
  }

  const handleKeydown = (event) => {
    emit('keydown', event)
  }

  const handleKeyup = (event) => {
    emit('keyup', event)
  }

  const clearInput = () => {
    inputValue.value = ''
    emit('clear')
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-input {
    width: 100%;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .base-input__label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--color-text);
  }

  .base-input__required {
    color: var(--color-alert);
  }

  .base-input__wrapper {
    position: relative;
    width: 100%;
  }

  .base-input__field {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    transition: all 0.2s ease;
    outline: none;
    background-color: var(--color-search-box);
    color: var(--color-text);
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
    min-height: 40px;
    box-sizing: border-box;
  }

  .base-input__field::placeholder {
    color: var(--color-highlight-text);
  }

  .base-input__field:focus {
    border-color: var(--color-main);
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-main);
  }

  .base-input__field--error {
    border-color: var(--color-alert);
  }

  .base-input__field--error:focus {
    border-color: var(--color-alert);
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-alert);
  }

  .base-input__field--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-card-background);
  }

  .base-input__field--readonly {
    cursor: default;
    background-color: var(--color-card-background);
  }

  .base-input__field--with-icon-left {
    padding-left: 40px;
  }

  .base-input__field--with-icon-right {
    padding-right: 40px;
  }

  .base-input__icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-highlight-text);
    width: 20px;
    height: 20px;
  }

  .base-input__icon--left {
    left: 12px;
  }

  .base-input__icon--right {
    right: 12px;
  }

  .base-input__clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px;
    border-radius: var(--border-radius-small);
    background: none;
    border: none;
    color: var(--color-highlight-text);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .base-input__clear:hover {
    background-color: var(--color-card-background);
    color: var(--color-text);
  }

  .base-input__footer {
    margin-top: 4px;
  }

  .base-input__error {
    font-size: 14px;
    color: var(--color-alert);
    margin: 0;
  }

  .base-input__hint {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }
</style>
