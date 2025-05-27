<!-- 홈 검색 섹션 (히어로용 간소화 버전) -->
<template>
  <section class="home-search-section">
    <div class="home-search-section__container">
      <!-- 🔍 검색 박스 - 클릭 시 입력 모드로 전환 -->
      <div
        v-if="!isInputMode"
        class="home-search-section__search-box"
        @click="enterInputMode">
        <BaseIcon
          name="search"
          class="home-search-section__icon" />
        <span class="home-search-section__placeholder">
          작품, 인물을 검색해보세요.
        </span>
      </div>

      <!-- ✏️ 입력 모드 - 실제 검색 입력 -->
      <div
        v-else
        class="home-search-section__input-container">
        <div class="home-search-section__input-wrapper">
          <BaseIcon
            name="search"
            class="home-search-section__icon" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="작품, 인물을 검색해보세요."
            class="home-search-section__input"
            @keyup.enter="handleSearch"
            @blur="handleBlur"
            @focus="handleFocus" />
        </div>

        <!-- 검색 버튼 -->
        <button
          v-if="searchQuery.trim()"
          @click="handleSearch"
          class="home-search-section__search-btn">
          <BaseIcon
            name="search"
            class="search-btn-icon" />
        </button>

        <!-- 취소 버튼 -->
        <button
          @click="exitInputMode"
          class="home-search-section__cancel-btn">
          <BaseIcon
            name="x"
            class="cancel-btn-icon" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseIcon from '@/components/base/BaseIcon.vue'

  const router = useRouter()

  // 검색 관련 상태
  const isInputMode = ref(false)
  const searchQuery = ref('')
  const searchInput = ref(null)

  // 입력 모드 진입
  const enterInputMode = async () => {
    isInputMode.value = true
    await nextTick()
    searchInput.value?.focus()
  }

  // 입력 모드 종료
  const exitInputMode = () => {
    isInputMode.value = false
    searchQuery.value = ''
  }

  // 검색 실행
  const handleSearch = () => {
    const query = searchQuery.value.trim()

    if (!query) {
      searchInput.value?.focus()
      return
    }

    console.log('🔍 검색 실행:', query)

    router.push({
      name: 'SearchResult',
      query: { q: query }
    })

    exitInputMode()
  }

  // 입력 필드 포커스 처리
  const handleFocus = () => {
    // 포커스 시 추가 동작이 필요하면 여기에
  }

  // 입력 필드 블러 처리
  const handleBlur = () => {
    setTimeout(() => {
      if (!searchQuery.value.trim()) {
        exitInputMode()
      }
    }, 150)
  }
</script>

<style scoped>
  .home-search-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .home-search-section__container {
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: center;
  }

  /* 🔍 검색 박스 및 입력 영역 */
  .home-search-section__search-box,
  .home-search-section__input-container {
    width: 100%;
    display: flex;
    align-items: center;
    height: 56px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    font-family: 'Pretendard-Regular', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .home-search-section__search-box {
    border: 2px solid transparent;
    padding: 0 20px;
    gap: 16px;
    cursor: text;
  }

  .home-search-section__search-box:hover {
    border-color: var(--color-main);
    box-shadow: 0 6px 25px rgba(255, 183, 0, 0.15);
    transform: translateY(-2px);
  }

  .home-search-section__input-container {
    border: 2px solid var(--color-main);
    padding: 0 20px;
    gap: 16px;
    box-shadow: 0 6px 25px rgba(255, 183, 0, 0.2);
  }

  .home-search-section__input-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 16px;
    overflow: hidden;
  }

  .home-search-section__input {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: 16px;
    font-family: 'Pretendard-Regular', sans-serif;
    line-height: 1.5;
  }

  .home-search-section__icon {
    width: 24px;
    height: 24px;
    color: var(--color-main);
    flex-shrink: 0;
  }

  .home-search-section__placeholder {
    flex: 1;
    font-size: 16px;
    color: var(--color-highlight-text);
    line-height: 1.5;
    user-select: none;
  }

  .home-search-section__input::placeholder {
    color: var(--color-highlight-text);
  }

  /* 🔍 검색 및 취소 버튼 */
  .home-search-section__search-btn,
  .home-search-section__cancel-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: var(--border-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .home-search-section__search-btn:hover {
    background-color: var(--color-main-opacity-20);
    transform: scale(1.1);
  }

  .home-search-section__cancel-btn:hover {
    background-color: var(--color-background-opacity-50);
    transform: scale(1.1);
  }

  .search-btn-icon {
    width: 20px;
    height: 20px;
    color: var(--color-main);
  }

  .cancel-btn-icon {
    width: 20px;
    height: 20px;
    color: var(--color-inactive-text);
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .home-search-section__search-box,
    .home-search-section__input-container {
      height: 52px;
    }

    .home-search-section__placeholder,
    .home-search-section__input {
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    .home-search-section__search-box,
    .home-search-section__input-container {
      height: 48px;
      padding: 0 16px;
      gap: 12px;
    }

    .home-search-section__placeholder,
    .home-search-section__input {
      font-size: 14px;
    }

    .home-search-section__icon {
      width: 20px;
      height: 20px;
    }

    .search-btn-icon,
    .cancel-btn-icon {
      width: 18px;
      height: 18px;
    }
  }
</style>
