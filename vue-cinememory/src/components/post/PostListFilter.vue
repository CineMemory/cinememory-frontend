<!-- 게시글 목록 필터 -->
<template>
  <div class="post-list-filter">
    <!-- 검색 입력 -->
    <div class="post-list-filter__search">
      <BaseInput
        v-model="searchValue"
        placeholder="제목, 내용, 작성자로 검색..."
        icon-left="search"
        clearable
        @input="handleSearchChange"
        @clear="handleSearchClear" />
    </div>

    <!-- 태그 필터 -->
    <div class="post-list-filter__tags">
      <div class="post-list-filter__tags-header">
        <span class="post-list-filter__tags-label">태그 필터</span>
        <BaseButton
          v-if="selectedTagsValue.length > 0"
          variant="ghost"
          size="small"
          @click="clearAllTags">
          전체 해제
        </BaseButton>
      </div>
      
      <!-- 선택된 태그들 -->
      <div
        v-if="selectedTagsValue.length > 0"
        class="post-list-filter__selected-tags">
        <BaseTag
          v-for="tag in selectedTagsValue"
          :key="tag"
          variant="primary"
          size="small"
          removable
          @remove="removeTag(tag)">
          #{{ tag }}
        </BaseTag>
      </div>

      <!-- 사용 가능한 태그들 -->
      <div class="post-list-filter__available-tags">
        <BaseTag
          v-for="tag in availableTagsToShow"
          :key="tag.id"
          variant="secondary"
          size="small"
          clickable
          @click="addTag(tag.name)">
          #{{ tag.name }}
        </BaseTag>
        
        <BaseButton
          v-if="availableTags.length > maxVisibleTags && !showAllTags"
          variant="ghost"
          size="small"
          @click="showAllTags = true">
          +{{ availableTags.length - maxVisibleTags }}개 더보기
        </BaseButton>
        
        <BaseButton
          v-if="showAllTags && availableTags.length > maxVisibleTags"
          variant="ghost"
          size="small"
          @click="showAllTags = false">
          접기
        </BaseButton>
      </div>
    </div>

    <!-- 활성 필터 요약 -->
    <div
      v-if="hasActiveFilters"
      class="post-list-filter__summary">
      <BaseIcon name="filter" />
      <span class="post-list-filter__summary-text">
        {{ filterSummaryText }}
      </span>
      <BaseButton
        variant="ghost"
        size="small"
        icon-left="x"
        @click="clearAllFilters">
        전체 초기화
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:search', 'update:selectedTags', 'filter-changed'])

// 로컬 상태
const searchValue = ref(props.search)
const selectedTagsValue = ref([...props.selectedTags])
const showAllTags = ref(false)
const maxVisibleTags = 8

// 계산된 속성
const availableTags = computed(() => props.tags)

const availableTagsToShow = computed(() => {
  const unselectedTags = availableTags.value.filter(
    tag => !selectedTagsValue.value.includes(tag.name)
  )
  
  if (showAllTags.value) {
    return unselectedTags
  }
  
  return unselectedTags.slice(0, maxVisibleTags)
})

const hasActiveFilters = computed(() => {
  return searchValue.value.length > 0 || selectedTagsValue.value.length > 0
})

const filterSummaryText = computed(() => {
  const parts = []
  
  if (searchValue.value) {
    parts.push(`검색: "${searchValue.value}"`)
  }
  
  if (selectedTagsValue.value.length > 0) {
    parts.push(`태그: ${selectedTagsValue.value.length}개`)
  }
  
  return parts.join(', ')
})

// 검색 관련 함수
const handleSearchChange = () => {
  emit('update:search', searchValue.value)
  emit('filter-changed')
}

const handleSearchClear = () => {
  searchValue.value = ''
  emit('update:search', '')
  emit('filter-changed')
}

// 태그 관련 함수
const addTag = (tagName) => {
  if (!selectedTagsValue.value.includes(tagName)) {
    selectedTagsValue.value.push(tagName)
    emit('update:selectedTags', [...selectedTagsValue.value])
    emit('filter-changed')
  }
}

const removeTag = (tagName) => {
  const index = selectedTagsValue.value.indexOf(tagName)
  if (index > -1) {
    selectedTagsValue.value.splice(index, 1)
    emit('update:selectedTags', [...selectedTagsValue.value])
    emit('filter-changed')
  }
}

const clearAllTags = () => {
  selectedTagsValue.value = []
  emit('update:selectedTags', [])
  emit('filter-changed')
}

// 전체 필터 초기화
const clearAllFilters = () => {
  searchValue.value = ''
  selectedTagsValue.value = []
  showAllTags.value = false
  
  emit('update:search', '')
  emit('update:selectedTags', [])
  emit('filter-changed')
}

// props 변경 감시
watch(() => props.search, (newSearch) => {
  searchValue.value = newSearch
})

watch(() => props.selectedTags, (newTags) => {
  selectedTagsValue.value = [...newTags]
}, { deep: true })
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-list-filter {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-list-filter__search {
  width: 100%;
}

.post-list-filter__tags {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-list-filter__tags-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-list-filter__tags-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.post-list-filter__selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background-color: var(--color-main-opacity-20);
  border-radius: var(--border-radius-medium);
  border: 1px dashed var(--color-main-opacity-50);
  min-height: 20px;
}

.post-list-filter__available-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.post-list-filter__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--color-card-background-opacity-50);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-inactive-icon);
  font-size: 14px;
}

.post-list-filter__summary svg {
  width: 16px;
  height: 16px;
  color: var(--color-highlight-text);
}

.post-list-filter__summary-text {
  flex: 1;
  color: var(--color-highlight-text);
}

/* 빈 상태 스타일 */
.post-list-filter__selected-tags:empty::before {
  content: '선택된 태그가 없습니다';
  color: var(--color-highlight-text);
  font-size: 14px;
  font-style: italic;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-list-filter {
    gap: 12px;
  }
  
  .post-list-filter__tags-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-list-filter__summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>