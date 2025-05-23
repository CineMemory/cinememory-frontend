<!-- 기본 텍스트 영역 -->
<template>
  <div class="base-textarea">
    <label
      v-if="label"
      :for="textareaId"
      class="base-textarea__label">
      {{ label }}
      <span
        v-if="required"
        class="base-textarea__required"
        >*</span
      >
    </label>

    <div class="base-textarea__wrapper">
      <textarea
        :id="textareaId"
        v-model="textareaValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        :class="[
          'base-textarea__field',
          {
            'base-textarea__field--error': hasError,
            'base-textarea__field--disabled': disabled,
            'base-textarea__field--readonly': readonly,
            'base-textarea__field--resizable': resizable
          }
        ]"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput" />

      <div
        v-if="maxlength && showCounter"
        class="base-textarea__counter">
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>

    <div
      v-if="hasError || hint"
      class="base-textarea__footer">
      <p
        v-if="hasError"
        class="base-textarea__error">
        {{ errorMessage }}
      </p>
      <p
        v-else-if="hint"
        class="base-textarea__hint">
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
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
    rows: {
      type: Number,
      default: 4
    },
    maxlength: {
      type: Number,
      default: null
    },
    showCounter: {
      type: Boolean,
      default: false
    },
    resizable: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'input'])

  const textareaId = ref(`textarea-${Math.random().toString(36).substr(2, 9)}`)

  const textareaValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const hasError = computed(() => !!props.errorMessage)

  const characterCount = computed(() => {
    return props.modelValue ? props.modelValue.length : 0
  })

  const handleBlur = (event) => {
    emit('blur', event)
  }

  const handleFocus = (event) => {
    emit('focus', event)
  }

  const handleInput = (event) => {
    emit('input', event)
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .base-textarea {
    width: 100%;
    font-family: 'Pretendard', sans-serif;
  }

  .base-textarea__label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--color-text);
  }

  .base-textarea__required {
    color: var(--color-alert);
  }

  .base-textarea__wrapper {
    position: relative;
  }

  .base-textarea__field {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    transition: all 0.2s ease;
    outline: none;
    background-color: var(--color-search-box);
    color: var(--color-text);
    font-family: 'Pretendard', sans-serif;
    line-height: 1.5;
    box-sizing: border-box;
  }

  .base-textarea__field::placeholder {
    color: var(--color-highlight-text);
  }

  .base-textarea__field:focus {
    border-color: var(--color-main);
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-main);
  }

  .base-textarea__field--error {
    border-color: var(--color-alert);
  }

  .base-textarea__field--error:focus {
    border-color: var(--color-alert);
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--color-alert);
  }

  .base-textarea__field--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-card-background);
  }

  .base-textarea__field--readonly {
    cursor: default;
    background-color: var(--color-card-background);
  }

  .base-textarea__field--resizable {
    resize: vertical;
  }

  .base-textarea__field:not(.base-textarea__field--resizable) {
    resize: none;
  }

  .base-textarea__counter {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 12px;
    color: var(--color-highlight-text);
    background-color: var(--color-search-box);
    padding: 2px 6px;
    border-radius: var(--border-radius-small);
  }

  .base-textarea__footer {
    margin-top: 4px;
  }

  .base-textarea__error {
    font-size: 14px;
    color: var(--color-alert);
    margin: 0;
  }

  .base-textarea__hint {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }
</style>
