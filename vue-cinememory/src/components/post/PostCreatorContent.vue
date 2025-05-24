<!-- 게시글 내용 입력 -->
<template>
  <div class="post-creator-content">
    <BaseTextarea
      v-model="contentValue"
      label="내용"
      placeholder="영화에 대한 이야기를 자유롭게 써보세요...

팁:
• 스포일러가 포함된 내용은 [스포일러] 표시를 해주세요
• 다른 사람의 의견을 존중해주세요
• 건설적인 토론을 지향해주세요"
      :error-message="errorMessage"
      :rows="12"
      :maxlength="5000"
      :show-counter="true"
      required
      @input="handleInput"
      @blur="handleBlur" />
    
    <!-- 서식 도움말 -->
    <div class="post-creator-content__help">
      <div class="post-creator-content__help-header">
        <BaseIcon name="info" />
        <span>작성 도움말</span>
      </div>
      <div class="post-creator-content__help-content">
        <div class="post-creator-content__help-item">
          <strong>줄바꿈:</strong> Enter를 두 번 누르면 문단이 나뉩니다
        </div>
        <div class="post-creator-content__help-item">
          <strong>스포일러:</strong> [스포일러] 내용 [/스포일러] 형식으로 작성해주세요
        </div>
        <div class="post-creator-content__help-item">
          <strong>영화 제목:</strong> 《영화제목》 형식으로 작성하면 더 보기 좋습니다
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

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

const contentValue = computed({
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

.post-creator-content {
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-creator-content__help {
  margin-top: 12px;
  padding: 12px;
  background-color: var(--color-card-background-opacity-50);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-inactive-icon);
}

.post-creator-content__help-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.post-creator-content__help-header svg {
  width: 14px;
  height: 14px;
  color: var(--color-main);
}

.post-creator-content__help-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.post-creator-content__help-item {
  font-size: 12px;
  color: var(--color-highlight-text);
  line-height: 1.4;
}

.post-creator-content__help-item strong {
  color: var(--color-text);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-creator-content__help {
    padding: 10px;
  }
  
  .post-creator-content__help-header {
    font-size: 12px;
  }
  
  .post-creator-content__help-item {
    font-size: 11px;
  }
}
</style>