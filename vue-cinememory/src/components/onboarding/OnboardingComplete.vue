<template>
  <div class="onboarding-complete">
    <!-- 완료 헤더 -->
    <div class="complete-header">
      <div class="success-animation">
        <BaseIcon
          name="check-circle"
          class="success-icon" />
      </div>
      <h1 class="complete-title">🎉 취향 분석이 완료되었습니다!</h1>
      <p class="complete-subtitle">
        당신만의 개인화된 영화 타임라인이 준비되었어요
      </p>
    </div>

    <!-- 취향 분석 결과 -->
    <div
      class="taste-analysis-section"
      v-if="tasteAnalysis">
      <div class="section-header">
        <BaseIcon
          name="user"
          class="section-icon" />
        <h2 class="section-title">당신의 영화 취향</h2>
      </div>
      <div class="taste-card">
        <p class="taste-text">{{ tasteAnalysis }}</p>
      </div>
    </div>

    <!-- 추천 영화 목록 -->
    <div
      class="recommendations-section"
      v-if="recommendations.length > 0">
      <div class="section-header">
        <BaseIcon
          name="star"
          class="section-icon" />
        <h2 class="section-title">당신을 위한 추천 영화</h2>
        <p class="section-description">
          취향 분석을 바탕으로 선별한 {{ recommendations.length }}편의
          영화입니다
        </p>
      </div>

      <div class="movies-grid">
        <div
          v-for="(movie, index) in recommendations"
          :key="movie.movie_id"
          class="movie-recommendation-card"
          @click="goToMovieDetail(movie.movie_id)">
          <!-- 추천 순서 배지 -->
          <div class="recommendation-badge">
            {{ index + 1 }}
          </div>

          <!-- 영화 포스터 -->
          <div class="movie-poster-container">
            <img
              :src="getMoviePosterUrl(movie.poster_path)"
              :alt="movie.title"
              class="movie-poster"
              @error="handleImageError" />

            <!-- 나이 표시 -->
            <div
              class="age-badge"
              v-if="movie.target_age">
              {{ movie.target_age }}세
            </div>
          </div>

          <!-- 영화 정보 -->
          <div class="movie-info">
            <h3 class="movie-title">{{ movie.title }}</h3>
            <p
              class="movie-year"
              v-if="movie.release_date">
              {{ new Date(movie.release_date).getFullYear() }}
            </p>

            <!-- 추천 이유 -->
            <div class="recommendation-reason">
              <BaseIcon
                name="message-circle"
                class="reason-icon" />
              <p class="reason-text">{{ movie.reason }}</p>
            </div>
          </div>

          <!-- 호버 효과 -->
          <div class="card-overlay">
            <BaseIcon
              name="play-circle"
              class="play-icon" />
            <span class="overlay-text">자세히 보기</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <div class="complete-actions">
      <div class="primary-actions">
        <BaseButton
          variant="primary"
          size="large"
          @click="goToTimeline"
          class="timeline-button">
          <BaseIcon name="calendar" />
          내 영화 타임라인 보기
        </BaseButton>

        <BaseButton
          variant="secondary"
          size="large"
          @click="exploreMovies"
          class="explore-button">
          <BaseIcon name="search" />
          영화 둘러보기
        </BaseButton>
      </div>

      <div class="secondary-actions">
        <BaseButton
          variant="outline"
          @click="$emit('regenerate')"
          class="regenerate-button">
          <BaseIcon name="refresh-cw" />
          추천 다시 받기
        </BaseButton>

        <BaseButton
          variant="outline"
          @click="shareResults"
          class="share-button">
          <BaseIcon name="share-2" />
          결과 공유하기
        </BaseButton>
      </div>
    </div>

    <!-- 다음 단계 안내 -->
    <div class="next-steps">
      <h3 class="next-title">이제 뭘 할 수 있나요?</h3>
      <div class="features-grid">
        <div class="feature-item">
          <BaseIcon
            name="calendar"
            class="feature-icon" />
          <h4 class="feature-title">개인 타임라인</h4>
          <p class="feature-description">
            나이별로 추천받은 영화들을 타임라인으로 확인하세요
          </p>
        </div>

        <div class="feature-item">
          <BaseIcon
            name="heart"
            class="feature-icon" />
          <h4 class="feature-title">좋아요 & 리뷰</h4>
          <p class="feature-description">
            마음에 드는 영화에 좋아요를 누르고 리뷰를 남겨보세요
          </p>
        </div>

        <div class="feature-item">
          <BaseIcon
            name="users"
            class="feature-icon" />
          <h4 class="feature-title">커뮤니티</h4>
          <p class="feature-description">
            다른 사용자들과 영화 이야기를 나누어보세요
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import BaseIcon from '../base/BaseIcon.vue'
  import BaseButton from '../base/BaseButton.vue'

  export default {
    name: 'OnboardingComplete',
    components: {
      BaseIcon,
      BaseButton
    },
    props: {
      recommendations: {
        type: Array,
        default: () => []
      },
      tasteAnalysis: {
        type: String,
        default: ''
      }
    },
    emits: ['go-to-timeline', 'regenerate'],
    methods: {
      getMoviePosterUrl(posterPath) {
        if (!posterPath) return '/images/no-poster.png'

        if (posterPath.startsWith('http')) {
          return posterPath
        }

        return `https://image.tmdb.org/t/p/w500${posterPath}`
      },

      handleImageError(event) {
        event.target.src = '/images/no-poster.png'
      },

      goToMovieDetail(movieId) {
        this.$router.push(`/movie/${movieId}`)
      },

      goToTimeline() {
        this.$emit('go-to-timeline')
      },

      exploreMovies() {
        this.$router.push('/')
      },

      shareResults() {
        // 결과 공유 기능 (추후 구현)
        if (navigator.share) {
          navigator.share({
            title: '씨네메모리 - 내 영화 취향 분석 결과',
            text: '나만의 영화 취향을 분석받았어요!',
            url: window.location.origin
          })
        } else {
          // 폴백: 클립보드에 복사
          navigator.clipboard
            .writeText(
              `씨네메모리에서 내 영화 취향을 분석받았어요! ${window.location.origin}`
            )
            .then(() => {
              // 성공 토스트 표시 (추후 구현)
              console.log('클립보드에 복사되었습니다!')
            })
        }
      }
    }
  }
</script>

<style scoped>
  .onboarding-complete {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  /* 완료 헤더 */
  .complete-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .success-animation {
    margin-bottom: 24px;
  }

  .success-icon {
    font-size: 72px;
    color: var(--color-rating-good-text);
    animation: success-bounce 0.8s ease;
  }

  .complete-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .complete-subtitle {
    font-size: 18px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.5;
  }

  /* 섹션 공통 스타일 */
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .section-icon {
    font-size: 24px;
    color: var(--color-main);
  }

  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .section-description {
    color: var(--color-highlight-text);
    margin: 0;
    margin-left: auto;
    font-size: 14px;
  }

  /* 취향 분석 섹션 */
  .taste-analysis-section {
    margin-bottom: 48px;
  }

  .taste-card {
    background: linear-gradient(
      135deg,
      var(--color-main-opacity-20) 0%,
      var(--color-card-background) 100%
    );
    border: 1px solid var(--color-main-opacity-50);
    border-radius: var(--border-radius-large);
    padding: 32px;
    position: relative;
    overflow: hidden;
  }

  .taste-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--color-main) 0%,
      var(--color-gold-medium) 100%
    );
  }

  .taste-text {
    font-size: 18px;
    line-height: 1.6;
    color: var(--color-text);
    margin: 0;
    font-weight: 500;
  }

  /* 추천 영화 섹션 */
  .recommendations-section {
    margin-bottom: 48px;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  /* 영화 추천 카드 */
  .movie-recommendation-card {
    position: relative;
    background: var(--color-card-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .movie-recommendation-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-main);
    box-shadow: 0 12px 32px var(--color-background-opacity-80);
  }

  .recommendation-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 32px;
    height: 32px;
    background: var(--color-main);
    color: var(--color-background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    z-index: 2;
  }

  .movie-poster-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  .movie-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .movie-recommendation-card:hover .movie-poster {
    transform: scale(1.05);
  }

  .age-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--color-rating-good-text);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .movie-info {
    padding: 20px;
  }

  .movie-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .movie-year {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0 0 16px 0;
  }

  .recommendation-reason {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .reason-icon {
    font-size: 16px;
    color: var(--color-main);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .reason-text {
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 1.4;
    margin: 0;
  }

  /* 카드 오버레이 */
  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(12, 11, 10, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .movie-recommendation-card:hover .card-overlay {
    opacity: 1;
  }

  .play-icon {
    font-size: 48px;
    color: var(--color-main);
  }

  .overlay-text {
    color: var(--color-text);
    font-weight: 600;
    font-size: 16px;
  }

  /* 액션 버튼들 */
  .complete-actions {
    margin-bottom: 48px;
  }

  .primary-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 16px;
  }

  .timeline-button,
  .explore-button {
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .secondary-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .regenerate-button,
  .share-button {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* 다음 단계 안내 */
  .next-steps {
    text-align: center;
  }

  .next-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 32px 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .feature-item {
    background: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    padding: 24px;
    text-align: center;
  }

  .feature-icon {
    font-size: 32px;
    color: var(--color-main);
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .feature-description {
    font-size: 14px;
    color: var(--color-highlight-text);
    line-height: 1.4;
    margin: 0;
  }

  /* 애니메이션 */
  @keyframes success-bounce {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-complete {
      padding: 24px 16px;
    }

    .complete-title {
      font-size: 24px;
    }

    .complete-subtitle {
      font-size: 16px;
    }

    .section-header {
      flex-wrap: wrap;
      gap: 8px;
    }

    .section-title {
      font-size: 20px;
    }

    .section-description {
      margin-left: 0;
      width: 100%;
    }

    .taste-card {
      padding: 24px;
    }

    .taste-text {
      font-size: 16px;
    }

    .movies-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .primary-actions {
      flex-direction: column;
      align-items: center;
    }

    .timeline-button,
    .explore-button {
      width: 100%;
      max-width: 300px;
      min-width: auto;
    }

    .secondary-actions {
      flex-wrap: wrap;
      justify-content: center;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>
