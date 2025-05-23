<!-- 홈 페이지 -->
<template>
  <div class="home-view">
    <!-- 검색 섹션 -->
    <HomeSearchSection />

    <!-- 박스오피스 섹션 -->
    <HomeBoxofficeSection />

    <!-- 네비게이션 섹션 -->
    <HomeNavigationSection />
  </div>
</template>

<style scoped>
  .home-view {
    min-height: 100vh;
    background-color: var(--color-background);
    font-family: 'Pretendard-Regular', sans-serif;
  }
</style>
