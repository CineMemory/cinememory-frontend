<!-- 게시글 미리보기 -->
<template>
  <div class="post-creator-preview">
    <div class="post-creator-preview__header">
      <BaseIcon name="eye" />
      <h3 class="post-creator-preview__title">미리보기</h3>
    </div>

    <div class="post-creator-preview__content">
      <!-- 미리보기 카드 -->
      <BaseCard
        class="post-creator-preview__card"
        variant="default">
        
        <!-- 카드 헤더: 작성자 정보 -->
        <template #header>
          <div class="post-creator-preview__card-header">
            <div class="post-creator-preview__author">
              <BaseAvatar
                :username="author?.username || 'Unknown'"
                size="sm" />
              <div class="post-creator-preview__author-info">
                <span class="post-creator-preview__username">
                  {{ author?.username || 'Unknown' }}
                </span>
                <span class="post-creator-preview__date">방금 전</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 카드 본문 -->
        <template #default>
          <div class="post-creator-preview__post-content">
            
            <!-- 제목 -->
            <h2 class="post-creator-preview__post-title">
              {{ title || '제목을 입력하세요...' }}
            </h2>
            
            <!-- 내용 -->
            <div class="post-creator-preview__post-text">
              <p
                v-if="content"
                v-html="formattedContent"></p>
              <p
                v-else
                class="post-creator-preview__placeholder">
                내용을 입력하세요...
              </p>
            </div>
            
            <!-- 태그들 -->
            <div
              v-if="tags && tags.length > 0"
              class="post-creator-preview__tags">
              <BaseTag
                v-for="tag in tags"
                :key="tag"
                variant="secondary"
                size="small">
                #{{ tag }}
              </BaseTag>
            </div>
          </div>
        </template>

        <!-- 카드 푸터: 좋아요, 댓글 버튼들 -->
        <template #footer>
          <div class="post-creator-preview__card-footer">
            <div class="post-creator-preview__stats">
              <div class="post-creator-preview__stat">
                <BaseIcon name="heart" />
                <span>0</span>
              </div>
              <div class="post-creator-preview__stat">
                <BaseIcon name="message-circle" />
                <span>0</span>
              </div>
            </div>
            
            <div class="post-creator-preview__actions">
              <BaseButton
                variant="ghost"
                size="small"
                icon-left="share">
                공유
              </BaseButton>
            </div>
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- 안내 메시지 -->
    <div class="post-creator-preview__notice">
      <BaseIcon name="info" />
      <span>실제 게시글과 모양이 다를 수 있습니다.</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseAvatar from '@/components/base/BaseAvatar.vue'
import BaseTag from '@/components/base/BaseTag.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  tags: {
    type: Array,
    default: () => []
  },
  author: {
    type: Object,
    default: () => ({ username: 'Unknown' })
  }
})

// 내용 포맷팅 (간단한 텍스트 서식 처리)
const formattedContent = computed(() => {
  if (!props.content) return ''
  
  let formatted = props.content
    // 줄바꿈을 <br>로 변환
    .replace(/\n/g, '<br>')
    // 스포일러 처리
    .replace(/\[스포일러\](.*?)\[\/스포일러\]/g, '<span class="spoiler">$1</span>')
    // 영화 제목 강조
    .replace(/《([^》]+)》/g, '<strong class="movie-title">《$1》</strong>')
  
  return formatted
})
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.post-creator-preview {
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.post-creator-preview__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-inactive-icon);
}

.post-creator-preview__header svg {
  width: 18px;
  height: 18px;
  color: var(--color-main);
}

.post-creator-preview__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.post-creator-preview__content {
  margin-bottom: 12px;
}

.post-creator-preview__card {
  margin-bottom: 0;
}

.post-creator-preview__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-creator-preview__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-creator-preview__author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.post-creator-preview__username {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.post-creator-preview__date {
  font-size: 12px;
  color: var(--color-highlight-text);
}

.post-creator-preview__post-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-creator-preview__post-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
}

.post-creator-preview__post-text {
  font-size: 14px;
  color: var(--color-highlight-text);
  line-height: 1.6;
}

.post-creator-preview__placeholder {
  color: var(--color-inactive-text);
  font-style: italic;
  margin: 0;
}

.post-creator-preview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-creator-preview__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-creator-preview__stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.post-creator-preview__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--color-highlight-text);
}

.post-creator-preview__stat svg {
  width: 16px;
  height: 16px;
}

.post-creator-preview__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-creator-preview__notice {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-highlight-text);
  padding: 8px 12px;
  background-color: var(--color-card-background-opacity-50);
  border-radius: var(--border-radius-small);
  border: 1px solid var(--color-inactive-icon);
}

.post-creator-preview__notice svg {
  width: 14px;
  height: 14px;
  color: var(--color-main);
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

/* 모바일 최적화 */
@media (max-width: 768px) {
  .post-creator-preview__post-title {
    font-size: 16px;
  }
  
  .post-creator-preview__card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .post-creator-preview__stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>