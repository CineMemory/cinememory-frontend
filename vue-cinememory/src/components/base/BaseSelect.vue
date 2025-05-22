<!-- 기본 선택 박스 -->
<template>
  <div class="base-select">
    <label
      v-if="label"
      :for="selectId"
      class="base-select__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="base-select__required"
      >*</span>
    </label>
    
    <div class="base-select__wrapper">
      <select
        :id="selectId"
        v-model="selectValue"
        :disabled="disabled"
        :class="[
          'base-select__field',
          {
            'base-select__field--error': hasError,
            'base-select__field--disabled': disabled
          }
        ]"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option
          v-if="placeholder"
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <BaseIcon
        name="arrow-down"
        class="base-select__arrow"
      />
    </div>
    
    <div
      v-if="hasError || hint"
      class="base-select__footer"
    >
      <p
        v-if="hasError"
        class="base-select__error"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="hint"
        class="base-select__hint"
      >
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
    type: [String, Number, Object],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
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
  required: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`)

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.errorMessage)

const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey]
  }
  return option
}

const handleChange = (event) => {
  emit('change', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.base-select {
  width: 100%;
  font-family: 'Pretendard', sans-serif;
}

.base-select__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #f7f5f3;
}

.base-select__required {
  color: #ff3838;
}

.base-select__wrapper {
  position: relative;
}

.base-select__field {
  width: 100%;
  padding: 8px 40px 8px 12px;
  font-size: 14px;
  border: 1px solid #6b645f;
  border-radius: 8px;
  transition: all 0.2s ease;
  outline: none;
  background-color: #2a2520;
  color: #f7f5f3;
  min-height: 40px;
  box-sizing: border-box;
  appearance: none;
  cursor: pointer;
}

.base-select__field:focus {
  border-color: #ffb700;
  box-shadow: 0 0 0 2px #0c0b0a, 0 0 0 4px #ffb700;
}

.base-select__field--error {
  border-color: #ff3838;
}

.base-select__field--error:focus {
  border-color: #ff3838;
  box-shadow: 0 0 0 2px #0c0b0a, 0 0 0 4px #ff3838;
}

.base-select__field--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #242018;
}

.base-select__arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9c9490;
  pointer-events: none;
  width: 16px;
  height: 16px;
}

.base-select__footer {
  margin-top: 4px;
}

.base-select__error {
  font-size: 14px;
  color: #ff3838;
  margin: 0;
}

.base-select__hint {
  font-size: 14px;
  color: #9c9490;
  margin: 0;
}
</style>