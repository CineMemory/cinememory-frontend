<!-- 댓글 내용 -->
<template>
  <div class="comment-item-content">
    <p
      class="comment-item-content__text"
      v-html="formattedContent"></p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// 내용 포맷팅
const formattedContent = computed(() => {
  let formatted = props.content
    // 줄바꿈을 <br>로 변환
    .replace(/\n/g, '<br>')
    // 스포일러 처리
    .replace(/\[스포일러\](.*?)\[\/스포일러\]/g, '<span class="spoiler">$1</span>')
    // 영화 제목 강조
    .replace(/《([^》]+)》/g, '<strong class="movie-title">《$1》</strong>')
    // URL 링크 처리
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    // 멘션 처리 (@username)
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
  
  return formatted
})
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.comment-item-content {
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.comment-item-content__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
  word-break: break-word;
}

/* 포맷된 내용 스타일 */
:deep(.spoiler) {
  background-color: var(--color-inactive-text);
  color: var(--color-inactive-text);
  padding: 2px 4px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.spoiler:hover) {
  background-color: var(--color-card-background);
  color: var(--color-text);
}

:deep(.movie-title) {
  color: var(--color-main);
  font-weight: 600;
}

:deep(a) {
  color: var(--color-main);
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(.mention) {
  color: var(--color-main);
  font-weight: 500;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .comment-item-content__text {
    font-size: 13px;
  }
}
</style>