<!-- 게시글 목록 필터 -->
<template>
  <div class="post-list-filter">
    <!-- 검색 입력 -->
    <div class="post-list-filter__search">
      <div class="post-list-filter__search-header">
        <span class="post-list-filter__search-label">게시글 검색</span>
      </div>
      <div class="post-list-filter__search-wrapper">
        <BaseInput
          v-model="searchValue"
          placeholder="제목, 내용, 작성자로 검색..."
          icon-left="search"
          clearable
          @keydown.enter="handleSearchSubmit"
          @clear="handleSearchClear" />
        <BaseButton
          variant="primary"
          size="medium"
          icon-left="search"
          :disabled="!searchValue.trim()"
          @click="handleSearchSubmit">
          검색
        </BaseButton>
      </div>

      <!-- 검색 상태 표시 및 초기화 버튼 -->
      <div
        v-if="searchValue.trim()"
        class="post-list-filter__search-status">
        <span>
          <BaseIcon name="search" />
          <span class="search-status-text">
            검색 중: <strong>'{{ searchValue }}'</strong>
          </span>
        </span>
        <BaseButton
          variant="ghost"
          size="small"
          icon-left="x"
          @click="handleSearchClear"
          class="search-clear-btn">
          검색 초기화
        </BaseButton>
      </div>
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

      <!-- 태그 입력 필드 -->
      <div class="post-list-filter__tag-input">
        <BaseInput
          v-model="tagInputValue"
          placeholder="태그를 입력하세요..."
          icon-left="hash"
          clearable
          @keydown="handleKeyDown"
          @keyup="handleKeyUp"
          @input="handleTagInput"
          @clear="clearTagInput" />
        <BaseButton
          variant="primary"
          size="medium"
          :disabled="!canAddTag"
          icon-left="plus"
          @click="handleTagAdd">
          추가
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

      <!-- 추천 태그들 (아무것도 입력하지 않았을 때) -->
      <div
        v-if="!tagInputValue && selectedTagsValue.length === 0"
        class="post-list-filter__recommended-tags">
        <div class="post-list-filter__recommended-header">
          <BaseIcon name="star" />
          <span>추천 태그</span>
        </div>
        <div class="post-list-filter__recommended-items">
          <BaseTag
            v-for="tag in recommendedTags"
            :key="tag"
            variant="outline"
            size="small"
            clickable
            @click="addTag(tag)">
            #{{ tag }}
          </BaseTag>
        </div>
      </div>

      <!-- 인기 태그들 (입력 중일 때 필터링된 결과) -->
      <div
        v-if="tagInputValue && filteredSuggestions.length > 0"
        class="post-list-filter__suggestions">
        <div class="post-list-filter__suggestions-header">
          <BaseIcon name="trending-up" />
          <span>인기 태그</span>
        </div>
        <div class="post-list-filter__suggestions-items">
          <BaseTag
            v-for="tag in filteredSuggestions"
            :key="tag.id || tag.name"
            variant="secondary"
            size="small"
            clickable
            @click.stop="handleSuggestionClick(tag.name)"
            @keydown.stop
            @keyup.stop>
            #{{ tag.name }}
            <span
              v-if="tag.post_count"
              class="tag-count">
              ({{ tag.post_count }})
            </span>
          </BaseTag>
        </div>
      </div>

      <!-- 사용 가능한 태그들 (기존 로직 유지) -->
      <div
        v-if="
          !tagInputValue &&
          (selectedTagsValue.length > 0 || availableTagsToShow.length > 0)
        "
        class="post-list-filter__available-tags">
        <div class="post-list-filter__available-header">
          <BaseIcon name="tag" />
          <span>사용 가능한 태그</span>
        </div>
        <div class="post-list-filter__available-items">
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
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, nextTick } from 'vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import { useCommunityStore } from '@/stores/community'

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

  const communityStore = useCommunityStore()

  const emit = defineEmits([
    'update:search',
    'update:selectedTags',
    'filter-changed'
  ])

  // 로컬 상태
  const searchValue = ref(props.search)
  const selectedTagsValue = ref([...props.selectedTags])
  const showAllTags = ref(false)
  const maxVisibleTags = 8

  // 태그 입력 관련 상태
  const tagInputValue = ref('')
  const isAddingTag = ref(false) // 태그 추가 중 플래그

  // 추천 태그 (기본 태그들)
  const recommendedTags = ref([
    '영화',
    '잡담',
    '추천',
    '정보',
    '리뷰',
    '토론',
    '질문',
    '후기'
  ])

  // 계산된 속성
  const availableTags = computed(() => props.tags)

  const availableTagsToShow = computed(() => {
    const unselectedTags = availableTags.value.filter(
      (tag) => !selectedTagsValue.value.includes(tag.name)
    )

    if (showAllTags.value) {
      return unselectedTags
    }

    return unselectedTags.slice(0, maxVisibleTags)
  })

  // 태그 입력값에 따른 필터링된 제안 태그들
  const filteredSuggestions = computed(() => {
    if (!tagInputValue.value) return []

    const input = tagInputValue.value.toLowerCase().trim()
    const filtered = availableTags.value.filter((tag) => {
      const tagName = tag.name.toLowerCase()
      return (
        tagName.includes(input) && !selectedTagsValue.value.includes(tag.name)
      )
    })

    // post_count 기준으로 정렬 (인기순)
    return filtered
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 6)
  })

  // 태그 추가 가능 여부
  const canAddTag = computed(() => {
    const trimmed = tagInputValue.value.trim()
    return (
      trimmed.length > 0 &&
      !selectedTagsValue.value.includes(trimmed) &&
      trimmed.length <= 20
    ) // 태그 길이 제한
  })

  const handleSearchSubmit = () => {
    if (!searchValue.value.trim()) {
      return
    }
    emit('update:search', searchValue.value.trim())
    emit('filter-changed')
  }

  const handleSearchClear = () => {
    searchValue.value = ''
    emit('update:search', '')
    emit('filter-changed')
  }

  // 태그 입력 관련 함수
  const handleTagInput = (event) => {
    // console.log('handleTagInput 호출됨:', {
    //   입력값: tagInputValue.value,
    //   이벤트타입: event?.type,
    //   이벤트대상: event?.target?.value
    // })
    // 태그 입력 중 실시간 필터링을 위해 필요시 로직 추가
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleKeyUp = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      // DOM 업데이트가 완료될 때까지 기다림
      await nextTick()

      handleTagAdd(event)
    }
  }

  const handleTagAdd = async (event) => {
    // 이미 태그 추가 중이면 무시
    if (isAddingTag.value) {
      return
    }

    // 이벤트가 있으면 기본 동작 방지
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (canAddTag.value) {
      isAddingTag.value = true // 태그 추가 시작

      const tagToAdd = tagInputValue.value.trim()

      // 이미 추가된 태그인지 한번 더 확인
      if (!selectedTagsValue.value.includes(tagToAdd)) {
        // addTag 함수를 사용하지 않고 직접 추가 (제안 태그와 구분)
        selectedTagsValue.value.push(tagToAdd)
        emit('update:selectedTags', [...selectedTagsValue.value])
        emit('filter-changed')
        clearTagInput()
      } else {
        clearTagInput()
      }

      // 다음 틱에서 플래그 해제
      await new Promise((resolve) => setTimeout(resolve, 0))
      isAddingTag.value = false
    }
  }

  const clearTagInput = () => {
    tagInputValue.value = ''
  }

  const handleSuggestionClick = (tagName) => {
    // 제안 태그 클릭 시에는 입력값과 관계없이 해당 태그를 추가
    if (!selectedTagsValue.value.includes(tagName)) {
      selectedTagsValue.value.push(tagName)
      emit('update:selectedTags', [...selectedTagsValue.value])
      emit('filter-changed')
      clearTagInput()
    }
  }

  // 태그 관련 함수
  const addTag = (tagName) => {
    const trimmedTag = typeof tagName === 'string' ? tagName.trim() : tagName

    // 빈 태그나 이미 존재하는 태그는 추가하지 않음
    if (!trimmedTag || selectedTagsValue.value.includes(trimmedTag)) {
      return
    }

    selectedTagsValue.value.push(trimmedTag)
    emit('update:selectedTags', [...selectedTagsValue.value])
    emit('filter-changed')
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

  // props 변경 감시
  watch(
    () => props.search,
    (newSearch) => {
      searchValue.value = newSearch
    }
  )

  watch(
    () => props.selectedTags,
    (newTags) => {
      selectedTagsValue.value = [...newTags]
    },
    { deep: true }
  )

  // 컴포넌트 마운트 시 태그 목록 로드
  onMounted(async () => {
    try {
      await communityStore.fetchTags()
    } catch (error) {
      console.warn('태그 목록 로드 실패:', error)
    }
  })
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

  .post-list-filter__search-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .post-list-filter__search-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  .post-list-filter__search-wrapper {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .post-list-filter__search-wrapper .base-input {
    flex: 1;
    min-width: 0;
  }

  .post-list-filter__search-wrapper .base-button {
    flex-shrink: 0;
    min-width: 80px;
    height: auto;
    padding: 0 16px;
    border-radius: var(--border-radius-medium);
  }

  .post-list-filter__search-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    background: var(--color-card-background-opacity-50, #f5f5f7);
    border-radius: var(--border-radius-medium, 8px);
    padding: 6px 12px;
    font-size: 13px;
    color: var(--color-highlight-text, #888);
  }

  .search-status-text strong {
    color: var(--color-main, #3b82f6);
    font-weight: 600;
  }

  .search-clear-btn {
    margin-left: auto;
    font-size: 13px;
    padding: 2px 10px;
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

  /* 태그 입력 필드 */
  .post-list-filter__tag-input {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .post-list-filter__tag-input .base-input {
    flex: 1;
  }

  /* 선택된 태그들 */
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

  /* 추천 태그들 */
  .post-list-filter__recommended-tags,
  .post-list-filter__suggestions,
  .post-list-filter__available-tags {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .post-list-filter__recommended-header,
  .post-list-filter__suggestions-header,
  .post-list-filter__available-header {
    display: flex;
    align-items: center;
    margin-top: 4px;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-highlight-text);
  }

  .post-list-filter__recommended-header svg,
  .post-list-filter__suggestions-header svg,
  .post-list-filter__available-header svg {
    width: 14px;
    height: 14px;
  }

  .post-list-filter__recommended-items,
  .post-list-filter__suggestions-items,
  .post-list-filter__available-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* 태그 카운트 스타일 */
  .tag-count {
    font-size: 11px;
    color: var(--color-highlight-text);
    font-weight: 400;
  }

  /* 제안 태그 특별 스타일 */
  .post-list-filter__suggestions {
    background-color: var(--color-card-background-opacity-50);
    padding: 12px;
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
  }

  /* 기존 스타일 유지 */
  .post-list-filter__available-tags {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

    .post-list-filter__search-wrapper {
      flex-direction: column;
      gap: 8px;
    }

    .post-list-filter__search-wrapper.base-button {
      width: 100%;
      min-width: auto;
      padding: 12px 16px;
    }

    .post-list-filter__tags-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .post-list-filter__tag-input {
      flex-direction: column;
      align-items: stretch;
    }

    .post-list-filter__summary {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .post-list__filter-sort-divider {
    width: 100%;
    height: 1px;
    background: var(--color-inactive-icon, #e0e0e0);
    margin: 16px 0 8px 0;
    border-radius: 1px;
    opacity: 0.7;
  }
  @media (max-width: 767px) {
    .post-list__filter-sort-divider {
      margin: 12px 0 6px 0;
    }
  }
</style>
