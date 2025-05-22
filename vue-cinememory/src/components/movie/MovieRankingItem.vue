<!-- 영화 순위 아이템 -->
<template>
  <div class="movie-ranking-item" @click="handleClick">
    <!-- 순위 -->
    <div class="movie-ranking-item__rank">
      {{ rank }}
    </div>
    
    <!-- 구분선 -->
    <div class="movie-ranking-item__divider" />
    
    <!-- 영화 정보 -->
    <div class="movie-ranking-item__content">
      <h4 class="movie-ranking-item__title">{{ movie.title }}</h4>
      <div class="movie-ranking-item__meta">
        <span class="movie-ranking-item__year">{{ releaseYear }}</span>
        <span class="movie-ranking-item__genres">{{ genresText }}</span>
      </div>
    </div>
    
    <!-- 평점 -->
    <div class="movie-ranking-item__rating">
      <div class="movie-ranking-item__rating-icon">
        <BaseIcon
          name="star"
          size="small"
          class="movie-ranking-item__star"
        />
      </div>
      <div class="movie-ranking-item__rating-text">
        <span class="movie-ranking-item__score">{{ formattedRating }}</span>
        <span class="movie-ranking-item__percent">%</span>
      </div>
    </div>
    
    <!-- 포스터 미니어처 -->
    <div class="movie-ranking-item__poster">
      <img
        v-if="movie.poster_path"
        :src="getPosterUrl(movie.poster_path)"
        :alt="movie.title"
        class="movie-ranking-item__poster-image"
        @error="handleImageError"
      />
      <div
        v-else
        class="movie-ranking-item__poster-placeholder"
      >
        <BaseIcon name="play" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  genres: {
    type: Array,
    default: () => []
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

const router = useRouter()

const releaseYear = computed(() => {
  if (props.movie.release_date) {
    return new Date(props.movie.release_date).getFullYear()
  }
  return ''
})

const formattedRating = computed(() => {
  if (props.movie.vote_average) {
    // TMDB 평점을 백분율로 변환 (10점 만점 -> 100점 만점)
    return Math.round(props.movie.vote_average * 10)
  }
  return 0
})

const genresText = computed(() => {
  if (props.genres && props.genres.length > 0) {
    return props.genres.slice(0, 2).map(genre => genre.name).join(', ')
  }
  return ''
})

const getPosterUrl = (posterPath) => {
  const baseUrl = 'https://image.tmdb.org/t/p/w154'
  return `${baseUrl}${posterPath}`
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.movie)
    // 임시로 더미 페이지로 이동
    console.log('영화 클릭:', props.movie.title)
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.movie-ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: transparent;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  height: 56px;
  font-family: 'Pretendard-Regular', sans-serif;
}

.movie-ranking-item:hover {
  background-color: var(--color-main-opacity-20);
}

.movie-ranking-item__rank {
  width: 24px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text);
  flex-shrink: 0;
}

.movie-ranking-item__divider {
  width: 8px;
  height: 1px;
  background-color: var(--color-main);
  flex-shrink: 0;
}

.movie-ranking-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.movie-ranking-item__title {
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-ranking-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-highlight-text);
}

.movie-ranking-item__year {
  flex-shrink: 0;
}

.movie-ranking-item__genres {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-ranking-item__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.movie-ranking-item__rating-icon {
  width: 16px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-rating-good);
  border-radius: 2px;
}

.movie-ranking-item__star {
  color: #ffffff;
}

.movie-ranking-item__rating-text {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.movie-ranking-item__score {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-rating-good-text);
  line-height: 1.6;
}

.movie-ranking-item__percent {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-rating-good-text);
  line-height: 2;
}

.movie-ranking-item__poster {
  width: 42px;
  height: 56px;
  border-radius: var(--border-radius-small);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-inactive-icon);
}

.movie-ranking-item__poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-ranking-item__poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-highlight-text);
}

/* 반응형 */
@media (max-width: 768px) {
  .movie-ranking-item {
    padding: 8px 12px;
    gap: 12px;
    height: 48px;
  }
  
  .movie-ranking-item__rank {
    font-size: 16px;
  }
  
  .movie-ranking-item__title {
    font-size: 14px;
  }
  
  .movie-ranking-item__poster {
    width: 32px;
    height: 42px;
  }
}
</style>