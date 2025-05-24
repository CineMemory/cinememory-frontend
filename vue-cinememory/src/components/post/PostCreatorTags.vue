<!-- 게시글 태그 선택 -->
<template>
  <div class="post-creator-tags">
    <div class="post-creator-tags__header">
      <label class="post-creator-tags__label">
        <BaseIcon name="hash" />
        태그 (선택사항)
      </label>
      <span class="post-creator-tags__count"
        >{{ selectedTags.length }}/{{ maxTags }}</span
      >
    </div>

    <!-- 태그 입력 -->
    <div class="post-creator-tags__input">
      <BaseInput
        v-model="newTagInput"
        placeholder="새 태그를 입력하고 Enter를 누르세요..."
        :disabled="selectedTags.length >= maxTags"
        @keypress="handleTagInput"
        @blur="addNewTag" />
    </div>

    <!-- 선택된 태그들 -->
    <div
      v-if="selectedTags.length > 0"
      class="post-creator-tags__selected">
      <h4 class="post-creator-tags__section-title">선택된 태그</h4>
      <div class="post-creator-tags__selected-list">
        <BaseTag
          v-for="tag in selectedTags"
          :key="tag"
          variant="primary"
          size="small"
          removable
          @remove="removeTag(tag)">
          #{{ tag }}
        </BaseTag>
      </div>
    </div>

    <!-- 추천 태그들 -->
    <div
      v-if="recommendedTags.length > 0"
      class="post-creator-tags__recommended">
      <h4 class="post-creator-tags__section-title">추천 태그</h4>
      <div class="post-creator-tags__recommended-list">
        <BaseTag
          v-for="tag in recommendedTags"
          :key="tag.id || tag.name"
          variant="secondary"
          size="small"
          clickable
          @click="addTag(tag.name)">
          #{{ tag.name }}
          <span
            v-if="tag.count"
            class="post-creator-tags__tag-count"
            >({{ tag.count }})</span
          >
        </BaseTag>
      </div>
    </div>

    <!-- 도움말 -->
    <div class="post-creator-tags__help">
      <p class="post-creator-tags__help-text">
        • 태그는 최대 {{ maxTags }}개까지 선택할 수 있습니다<br />
        • 영어, 한글, 숫자를 사용해주세요 (특수문자 제외)<br />
        • 태그는 다른 사용자들이 게시글을 찾는데 도움이 됩니다
      </p>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseTag from '@/components/base/BaseTag.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    availableTags: {
      type: Array,
      default: () => []
    },
    maxTags: {
      type: Number,
      default: 5
    }
  })

  const emit = defineEmits(['update:modelValue', 'tags-changed'])

  // 로컬 상태
  const selectedTags = ref([...props.modelValue])
  const newTagInput = ref('')

  // 계산된 속성
  const recommendedTags = computed(() => {
    return props.availableTags
      .filter((tag) => !selectedTags.value.includes(tag.name))
      .slice(0, 10) // 최대 10개만 표시
  })

  // 새 태그 입력 처리
  const handleTagInput = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addNewTag()
    }
  }

  // 새 태그 추가
  const addNewTag = () => {
    const tagName = newTagInput.value.trim()
    if (tagName && isValidTagName(tagName)) {
      addTag(tagName)
      newTagInput.value = ''
    }
  }

  // 태그 추가
  const addTag = (tagName) => {
    const normalizedTag = normalizeTagName(tagName)

    if (selectedTags.value.length >= props.maxTags) {
      alert(`태그는 최대 ${props.maxTags}개까지만 선택할 수 있습니다.`)
      return
    }

    if (!selectedTags.value.includes(normalizedTag)) {
      selectedTags.value.push(normalizedTag)
      updateTags()
    }
  }

  // 태그 제거
  const removeTag = (tagName) => {
    const index = selectedTags.value.indexOf(tagName)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
      updateTags()
    }
  }

  // 태그 이름 정규화
  const normalizeTagName = (tagName) => {
    return tagName
      .replace(/[^a-zA-Z0-9가-힣]/g, '') // 특수문자 제거
      .trim()
      .toLowerCase()
  }

  // 태그 이름 유효성 검사
  const isValidTagName = (tagName) => {
    const normalized = normalizeTagName(tagName)

    if (!normalized) {
      alert('유효하지 않은 태그명입니다.')
      return false
    }

    if (normalized.length < 1) {
      alert('태그는 1글자 이상 입력해주세요.')
      return false
    }

    if (normalized.length > 20) {
      alert('태그는 20글자 이하로 입력해주세요.')
      return false
    }

    if (selectedTags.value.includes(normalized)) {
      alert('이미 선택된 태그입니다.')
      return false
    }

    return true
  }

  // 태그 업데이트
  const updateTags = () => {
    emit('update:modelValue', [...selectedTags.value])
    emit('tags-changed', [...selectedTags.value])
  }

  // props 변경 감시
  watch(
    () => props.modelValue,
    (newTags) => {
      selectedTags.value = [...newTags]
    },
    { deep: true }
  )
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-creator-tags {
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-creator-tags__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .post-creator-tags__label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  .post-creator-tags__label svg {
    width: 16px;
    height: 16px;
    color: var(--color-main);
  }

  .post-creator-tags__count {
    font-size: 12px;
    color: var(--color-highlight-text);
    padding: 2px 6px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-inactive-icon);
  }

  .post-creator-tags__input {
    margin-bottom: 16px;
  }

  .post-creator-tags__selected,
  .post-creator-tags__recommended {
    margin-bottom: 16px;
  }

  .post-creator-tags__section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .post-creator-tags__selected-list,
  .post-creator-tags__recommended-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .post-creator-tags__tag-count {
    font-size: 10px;
    color: var(--color-highlight-text);
    margin-left: 4px;
  }

  .post-creator-tags__help {
    padding: 12px;
    background-color: var(--color-card-background-opacity-50);
    border-radius: var(--border-radius-medium);
    border: 1px solid var(--color-inactive-icon);
  }

  .post-creator-tags__help-text {
    font-size: 12px;
    color: var(--color-highlight-text);
    line-height: 1.5;
    margin: 0;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-creator-tags__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .post-creator-tags__help {
      padding: 10px;
    }

    .post-creator-tags__help-text {
      font-size: 11px;
    }
  }
</style>
