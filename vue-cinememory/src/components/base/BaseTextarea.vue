<!-- 기본 텍스트 영역 -->
<template>
  <div class="base-textarea">
    <label
      v-if="label"
      :for="textareaId"
      class="base-textarea__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="base-textarea__required"
      >*</span>
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
        @input="handleInput"
      />
      
      <div
        v-if="maxlength && showCounter"
        class="base-textarea__counter"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>
    
    <div
      v-if="hasError || hint"
      class="base-textarea__footer"
    >
      <p
        v-if="hasError"
        class="base-textarea__error"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="hint"
        class="base-textarea__hint"
      >
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
.base-textarea {
  width: 100%;
  font-family: 'Pretendard', sans-serif;
}

.base-textarea__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #f7f5f3;
}

.base-textarea__required {
  color: #ff3838;
}

.base-textarea__wrapper {
  position: relative;
}

.base-textarea__field {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #6b645f;
  border-radius: 8px;
  transition: all 0.2s ease;
  outline: none;
  background-color: #2a2520;
  color: #f7f5f3;
  font-family: 'Pretendard', sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

.base-textarea__field::placeholder {
  color: #9c9490;
}

.base-textarea__field:focus {
  border-color: #ffb700;
  box-shadow: 0 0 0 2px #0c0b0a, 0 0 0 4px #ffb700;
}

.base-textarea__field--error {
  border-color: #ff3838;
}

.base-textarea__field--error:focus {
  border-color: #ff3838;
  box-shadow: 0 0 0 2px #0c0b0a, 0 0 0 4px #ff3838;
}

.base-textarea__field--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #242018;
}

.base-textarea__field--readonly {
  cursor: default;
  background-color: #242018;
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
  color: #9c9490;
  background-color: #2a2520;
  padding: 2px 6px;
  border-radius: 4px;
}

.base-textarea__footer {
  margin-top: 4px;
}

.base-textarea__error {
  font-size: 14px;
  color: #ff3838;
  margin: 0;
}

.base-textarea__hint {
  font-size: 14px;
  color: #9c9490;
  margin: 0;
}
</style>