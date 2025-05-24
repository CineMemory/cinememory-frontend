<!-- 게시글 목록 정렬 -->
<template>
  <div class="post-list-sort">
    <span class="post-list-sort__label">정렬</span>
    
    <div class="post-list-sort__options">
      <BaseButton
        v-for="option in sortOptions"
        :key="option.value"
        :variant="modelValue === option.value ? 'primary' : 'ghost'"
        size="small"
        :icon-left="option.icon"
        @click="handleSortChange(option.value)">
        {{ option.label }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'latest'
  }
})

const emit = defineEmits(['update:modelValue', 'sort-changed'])

// 정렬 옵션들
const sortOptions = [
  {
    value: 'latest',
    label: '최신순',
    icon: 'clock'
  },
  {
    value: 'popular',
    label: '인기순',
    icon: 'heart'
  },
  {
    value: 'comments',
    label: '댓글순',
    icon: 'message-circle'
  }
]

// 정렬 변경 처리
const handleSortChange = (sortValue) => {
  if (sortValue !== props.modelValue) {
    emit('update:modelValue', sortValue)
    emit('sort-changed', sortValue)
  }
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-list-sort {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-list-sort__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.post-list-sort__options {
  display: flex;
  gap: 4px;
  background-color: var(--color-search-box);
  border-radius: var(--border-radius-medium);
  padding: 4px;
  border: 1px solid var(--color-inactive-icon);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-list-sort {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-list-sort__options {
    width: 100%;
    justify-content: space-between;
  }
}
</style>