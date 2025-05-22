<!-- 헤더 검색 -->
<template>
  <div class="header-search">
    <div class="header-search__wrapper">
      <BaseIcon
        name="search"
        class="header-search__icon"
      />
      
      <input
        v-model="searchQuery"
        type="text"
        placeholder="작품, 인물, 컬렉션, 게시글을 검색해 보세요"
        class="header-search__input"
        @keypress.enter="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <button
        v-if="searchQuery"
        class="header-search__clear"
        @click="clearSearch"
      >
        <BaseIcon name="x" size="small" />
      </button>
    </div>
    
    <!-- 검색 결과 드롭다운 (나중에 구현) -->
    <div
      v-if="showResults && searchResults.length > 0"
      class="header-search__results"
    >
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="header-search__result-item"
        @click="selectResult(result)"
      >
        <BaseIcon
          :name="getResultIcon(result.type)"
          class="header-search__result-icon"
          size="small"
        />
        <span class="header-search__result-text">{{ result.title }}</span>
        <span class="header-search__result-type">{{ getResultTypeLabel(result.type) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'

const router = useRouter()

const searchQuery = ref('')
const isFocused = ref(false)
const searchResults = ref([])

const showResults = computed(() => {
  return isFocused.value && searchQuery.value.length > 0
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value.trim() }
    })
    searchQuery.value = ''
    isFocused.value = false
  }
}

const handleFocus = () => {
  isFocused.value = true
  // TODO: 실제 검색 API 호출
}

const handleBlur = () => {
  // 결과 선택 시간을 위해 약간 지연
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const selectResult = (result) => {
  // 결과 타입에 따라 다른 페이지로 이동
  switch (result.type) {
    case 'movie':
      router.push(`/movie/${result.id}`)
      break
    case 'person':
      router.push(`/person/${result.id}`)
      break
    case 'post':
      router.push(`/post/${result.id}`)
      break
    default:
      handleSearch()
  }
  
  searchQuery.value = ''
  isFocused.value = false
}

const getResultIcon = (type) => {
  const icons = {
    movie: 'play',
    person: 'user',
    post: 'message-circle',
    collection: 'bookmark'
  }
  return icons[type] || 'search'
}

const getResultTypeLabel = (type) => {
  const labels = {
    movie: '영화',
    person: '인물',
    post: '게시글',
    collection: '컬렉션'
  }
  return labels[type] || ''
}
</script>

<style scoped>
.header-search {
  position: relative;
  width: 100%;
}

.header-search__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #2a2520;
  border: 1px solid #6b645f;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
  transition: all 0.2s ease;
}

.header-search__wrapper:focus-within {
  border-color: #ffb700;
  box-shadow: 0 0 0 2px rgba(255, 183, 0, 0.2);
}

.header-search__icon {
  color: #9c9490;
  margin-right: 8px;
  flex-shrink: 0;
}

.header-search__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #f7f5f3;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;
}

.header-search__input::placeholder {
  color: #9c9490;
}

.header-search__clear {
  background: none;
  border: none;
  color: #9c9490;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.header-search__clear:hover {
  background-color: #242018;
  color: #f7f5f3;
}

.header-search__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #242018;
  border: 1px solid #6b645f;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.4);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.header-search__result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #6b645f;
}

.header-search__result-item:last-child {
  border-bottom: none;
}

.header-search__result-item:hover {
  background-color: #2a2520;
}

.header-search__result-icon {
  color: #9c9490;
  flex-shrink: 0;
}

.header-search__result-text {
  flex: 1;
  color: #f7f5f3;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-search__result-type {
  color: #9c9490;
  font-size: 12px;
  flex-shrink: 0;
}
</style>