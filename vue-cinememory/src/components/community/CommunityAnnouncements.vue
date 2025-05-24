<!-- 커뮤니티 공지사항 -->
<template>
  <div class="community-announcements">
    <div
      v-for="announcement in announcements"
      :key="announcement.id"
      :class="[
        'community-announcements__item',
        {
          'community-announcements__item--important': announcement.isImportant
        }
      ]">
      
      <!-- 아이콘 -->
      <div class="community-announcements__icon">
        <BaseIcon
          :name="announcement.isImportant ? 'megaphone' : 'info'"
          :class="[
            'community-announcements__icon-svg',
            {
              'community-announcements__icon-svg--important': announcement.isImportant
            }
          ]" />
      </div>

      <!-- 내용 -->
      <div class="community-announcements__content">
        <h4 class="community-announcements__title">
          {{ announcement.title }}
        </h4>
        <p class="community-announcements__text">
          {{ announcement.content }}
        </p>
        <span class="community-announcements__date">
          {{ formatDate(announcement.createdAt) }}
        </span>
      </div>

      <!-- 닫기 버튼 -->
      <BaseButton
        variant="ghost"
        icon-only
        icon-left="x"
        size="small"
        class="community-announcements__close"
        @click="dismissAnnouncement(announcement.id)" />
    </div>
  </div>
</template>

<script setup>
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  announcements: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss'])

// 공지사항 닫기
const dismissAnnouncement = (announcementId) => {
  emit('dismiss', announcementId)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
@import '@/assets/colors.css';
@import '@/assets/fonts.css';

.community-announcements {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
}

.community-announcements__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-inactive-icon);
  position: relative;
}

.community-announcements__item--important {
  background-color: var(--color-main-opacity-20);
  border-color: var(--color-main-opacity-50);
}

.community-announcements__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-full);
  background-color: var(--color-search-box);
  flex-shrink: 0;
}

.community-announcements__icon-svg {
  width: 20px;
  height: 20px;
  color: var(--color-highlight-text);
}

.community-announcements__icon-svg--important {
  color: var(--color-main);
}

.community-announcements__content {
  flex: 1;
  min-width: 0;
}

.community-announcements__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.community-announcements__text {
  font-size: 14px;
  color: var(--color-highlight-text);
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.community-announcements__date {
  font-size: 12px;
  color: var(--color-inactive-text);
}

.community-announcements__close {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.community-announcements__close:hover {
  opacity: 1;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .community-announcements__item {
    padding: 12px;
    gap: 10px;
  }
  
  .community-announcements__icon {
    width: 32px;
    height: 32px;
  }
  
  .community-announcements__icon-svg {
    width: 18px;
    height: 18px;
  }
  
  .community-announcements__title {
    font-size: 15px;
    margin: 0 0 6px 0;
  }
  
  .community-announcements__text {
    font-size: 13px;
    margin: 0 0 6px 0;
  }
  
  .community-announcements__close {
    top: 6px;
    right: 6px;
  }
}
</style>