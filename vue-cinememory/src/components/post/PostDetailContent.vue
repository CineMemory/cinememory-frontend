<!-- 게시글 상세 내용 -->
<template>
  <div class="post-detail-content">
    <div
      class="post-detail-content__text"
      v-html="formattedContent"></div>
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
    // 줄바꿈을 문단으로 변환 (두 번의 줄바꿈)
    .replace(/\n\n/g, '</p><p>')
    // 단일 줄바꿈을 <br>로 변환
    .replace(/\n/g, '<br>')
    // 문단 태그로 감싸기
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // 빈 문단 제거
    .replace(/<p><\/p>/g, '')
    // 스포일러 처리
    .replace(/\[스포일러\](.*?)\[\/스포일러\]/gs, '<div class="spoiler-block"><span class="spoiler-warning">⚠️ 스포일러</span><div class="spoiler-content">$1</div></div>')
    // 영화 제목 강조
    .replace(/《([^》]+)》/g, '<strong class="movie-title">《$1》</strong>')
    // URL 링크 처리
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    // 인용구 처리 (> 로 시작하는 줄)
    .replace(/^&gt;\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    // 강조 처리 (**텍스트**)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 기울임 처리 (*텍스트*)
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  
  return formatted
})
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-detail-content {
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-detail-content__text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text);
  word-break: break-word;
}

/* 포맷된 내용 스타일 */
:deep(p) {
  margin: 0 0 16px 0;
}

:deep(p:last-child) {
  margin-bottom: 0;
}

:deep(br) {
  margin-bottom: 8px;
}

:deep(.spoiler-block) {
  margin: 16px 0;
  padding: 16px;
  background-color: var(--color-card-background-opacity-80);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-alert);
}

:deep(.spoiler-warning) {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-alert);
  margin-bottom: 8px;
}

:deep(.spoiler-content) {
  background-color: var(--color-inactive-text);
  color: var(--color-inactive-text);
  padding: 8px 12px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

:deep(.spoiler-content:hover) {
  background-color: var(--color-search-box);
  color: var(--color-text);
}

:deep(.movie-title) {
  color: var(--color-main);
  font-weight: 600;
}

:deep(a) {
  color: var(--color-main);
  text-decoration: none;
  word-break: break-all;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--color-main);
  background-color: var(--color-main-opacity-20);
  border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
  font-style: italic;
  color: var(--color-highlight-text);
}

:deep(strong) {
  font-weight: 600;
  color: var(--color-text);
}

:deep(em) {
  font-style: italic;
  color: var(--color-highlight-text);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-detail-content__text {
    font-size: 15px;
    line-height: 1.7;
  }
  
  :deep(p) {
    margin: 0 0 14px 0;
  }
  
  :deep(.spoiler-block) {
    margin: 12px 0;
    padding: 12px;
  }
  
  :deep(blockquote) {
    margin: 12px 0;
    padding: 10px 12px;
  }
}
</style>