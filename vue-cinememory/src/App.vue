<!-- 메인 앱 -->
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup>
// 메인 홈페이지만 구현하므로 간단하게 구성
import { RouterView } from 'vue-router'
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Pretendard-Regular', sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>