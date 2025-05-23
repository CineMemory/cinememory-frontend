<!-- 홈 검색 섹션 -->
<template>
  <section class="home-search-section">
    <div class="home-search-section__container">
      <div
        class="home-search-section__logo"
        @click="goHome">
        <BaseIcon
          name="home"
          class="home-search-section__logo-icon" />
      </div>

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

  // 반응형 데이터
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
      // 검색어가 없으면 입력 필드에 포커스
      searchInput.value?.focus()
      return
    }

    console.log('🔍 검색 실행:', query)

    // 검색 결과 페이지로 이동
    router.push({
      name: 'SearchResult',
      query: { q: query }
    })

    // 상태 초기화
    exitInputMode()
  }

  // 입력 필드 포커스 처리
  const handleFocus = () => {
    // 포커스 시 추가 동작이 필요하면 여기에
  }

  // 입력 필드 블러 처리 (약간의 딜레이 후)
  const handleBlur = () => {
    // 블러 시 바로 종료하지 않고 약간의 딜레이를 줘서
    // 검색 버튼 클릭할 시간을 확보
    setTimeout(() => {
      if (!searchQuery.value.trim()) {
        exitInputMode()
      }
    }, 150)
  }

  // 홈으로 이동
  const goHome = () => {
    router.push({ name: 'Home' })
  }
</script>

<style scoped>
  .home-search-section {
    width: 100%;
    padding: 64px 0;
    display: flex;
    justify-content: center;
    background-color: var(--color-background);
  }

  .home-search-section__container {
    width: 100%;
    max-width: 700px;
    padding: 0 24px;
    display: flex;
    align-items: center;
  }

  .home-search-section__logo {
    margin-bottom: 0;
    margin-right: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .home-search-section__logo-icon {
    width: 40px;
    height: 40px;
    color: var(--color-primary, #3b82f6);
    transition: opacity 0.2s;
  }

  .home-search-section__logo-icon:hover {
    opacity: 0.7;
  }

  /* 🔍 기본 검색 박스 (클릭 전) */
  .home-search-section__search-box,
  .home-search-section__input-container {
    flex: 1;
    display: flex;
    align-items: center;
    height: 40px;
    background-color: var(--color-search-box);
    border-radius: var(--border-radius-medium);
    font-family: 'Pretendard-Regular', sans-serif;
    min-width: 0;
    transition:
      border 0.2s,
      background-color 0.2s;
  }

  .home-search-section__search-box {
    border: 1px solid var(--border-color-default);
    padding: 0 12px;
    gap: 10px;
  }

  .home-search-section__search-box:hover {
    border-color: var(--border-color-focus);
    background-color: var(--color-highlight-background);
  }

  .home-search-section__input-container {
    flex: 1;
    display: flex;
    align-items: center;
    height: 40px;
    background-color: var(--color-search-box);
    border: 2px solid var(--border-color-focus);
    border-radius: var(--border-radius-medium);
    padding: 0 12px;
    gap: 8px;
    min-width: 0;
  }

  .home-search-section__input-wrapper {
    display: flex;
    align-items: center;
    flex: 1 1 0%;
    min-width: 0;
    gap: 8px;
    overflow: hidden;
  }

  .home-search-section__input {
    flex: 1 1 0%;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: 14px;
    font-family: 'Pretendard-Regular', sans-serif;
    line-height: 1.5;
  }

  .home-search-section__icon {
    width: 24px;
    height: 24px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .home-search-section__placeholder {
    flex: 1;
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 2.857;
    user-select: none;
  }

  .home-search-section__input::placeholder {
    color: var(--color-highlight-text);
  }

  /* 🔍 검색 버튼 */
  .home-search-section__search-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .home-search-section__search-btn:hover {
    background-color: var(--color-main-opacity-20);
  }

  .search-btn-icon {
    width: 18px;
    height: 18px;
    color: var(--color-main);
  }

  /* ❌ 취소 버튼 */
  .home-search-section__cancel-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .home-search-section__cancel-btn:hover {
    background-color: var(--color-background-opacity-50);
  }

  .cancel-btn-icon {
    width: 18px;
    height: 18px;
    color: var(--color-inactive-text);
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .home-search-section {
      padding: 48px 0;
    }

    .home-search-section__container {
      max-width: 100vw;
      padding: 0 16px;
    }

    .home-search-section__placeholder,
    .home-search-section__input {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .home-search-section__placeholder,
    .home-search-section__input {
      font-size: 12px;
    }
  }
</style>
