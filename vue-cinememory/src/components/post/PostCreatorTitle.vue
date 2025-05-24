<!-- 게시글 제목 입력 -->
<template>
  <div class="post-creator-title">
    <BaseInput
      v-model="titleValue"
      label="제목"
      placeholder="게시글 제목을 입력하세요..."
      :error-message="errorMessage"
      :maxlength="100"
      required
      @input="handleInput"
      @blur="handleBlur" />
    
    <div class="post-creator-title__counter">
      {{ titleValue.length }}/100
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'blur'])

const titleValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleInput = (event) => {
  emit('input', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-creator-title {
  position: relative;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-creator-title__counter {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: var(--color-highlight-text);
  background-color: var(--color-search-box);
  padding: 2px 6px;
  border-radius: var(--border-radius-small);
  pointer-events: none;
}
</style>