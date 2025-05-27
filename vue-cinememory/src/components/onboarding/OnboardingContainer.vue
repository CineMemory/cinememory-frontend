<template>
  <div class="onboarding-container">
    <!-- 온보딩 헤더 -->
    <div class="onboarding-header">
      <div class="header-content">
        <h1 class="main-title">🎬 나만의 영화 취향 찾기</h1>
        <p class="main-description">
          몇 가지 질문을 통해 당신의 영화 취향을 분석하고, 개인화된 영화를
          추천해드릴게요!
        </p>
      </div>

      <!-- 단계 표시기 -->
      <OnboardingStepIndicator
        :current-step="currentStep"
        :total-steps="4"
        :step-labels="stepLabels" />
    </div>

    <!-- 단계별 컨텐츠 -->
    <div class="onboarding-content">
      <!-- 1단계: 재밌게 본 영화 선택 -->
      <OnboardingMovieGrid
        v-if="currentStep === 1"
        :step-title="'재밌게 본 영화를 선택해주세요'"
        :step-description="'지금까지 봤던 영화 중에서 정말 재밌게 본 영화들을 골라주세요. 최대한 다양한 장르로 선택하시면 더 정확한 분석이 가능해요.'"
        :step-number="1"
        :movies="famousMovies"
        :selected-movies="selectedFavoriteMovies"
        :min-selections="1"
        :max-selections="10"
        :show-overview="true"
        :loading="famousMoviesLoading"
        :error="famousMoviesError"
        @movie-select="handleFavoriteMovieSelect"
        @movie-unselect="handleFavoriteMovieUnselect"
        @next="handleStep1Next"
        @retry="loadFamousMovies" />

      <!-- 2단계: 관심있는 영화 선택 -->
      <OnboardingMovieGrid
        v-else-if="currentStep === 2"
        :step-title="'관심있는 영화를 선택해주세요'"
        :step-description="'포스터만 보고 재밌어 보이는 영화들을 골라주세요. 숨겨진 취향을 발견하는 데 도움이 됩니다.'"
        :step-number="2"
        :movies="hiddenMovies"
        :selected-movies="selectedInterestingMovies"
        :min-selections="1"
        :max-selections="10"
        :show-overview="false"
        :loading="hiddenMoviesLoading"
        :error="hiddenMoviesError"
        @movie-select="handleInterestingMovieSelect"
        @movie-unselect="handleInterestingMovieUnselect"
        @next="handleStep2Next"
        @retry="loadHiddenMovies" />

      <!-- 3단계: 제외할 장르 선택 -->
      <OnboardingGenreSelector
        v-else-if="currentStep === 3"
        :genres="genres"
        :selected-genres="selectedExcludedGenres"
        :loading="genresLoading"
        :error="genresError"
        @genre-select="handleGenreSelect"
        @genre-unselect="handleGenreUnselect"
        @next="handleStep3Next"
        @retry="loadGenres" />

      <!-- 4단계: GPT 분석 -->
      <OnboardingAnalysis
        v-else-if="currentStep === 4"
        :analysis-status="analysisStatus"
        :random-movie="randomMovie"
        @retry="generateRecommendations" />

      <!-- 5단계: 완료 -->
      <OnboardingComplete
        v-else-if="currentStep === 5"
        :recommendations="recommendations"
        :taste-analysis="tasteAnalysis"
        @go-to-timeline="goToTimeline"
        @regenerate="regenerateRecommendations" />
    </div>

    <!-- 하단 네비게이션 -->
    <div
      class="onboarding-footer"
      v-if="currentStep <= 3">
      <BaseButton
        v-if="currentStep > 1"
        variant="secondary"
        @click="goToPreviousStep"
        class="back-button">
        이전 단계
      </BaseButton>

      <div class="footer-spacer"></div>

      <p class="progress-text">{{ currentStep }} / 4 단계</p>
    </div>
  </div>
</template>

<script>
  import onboardingApi from '@/services/onboardingApi'
  import OnboardingStepIndicator from './OnboardingStepIndicator.vue'
  import OnboardingMovieGrid from './OnboardingMovieGrid.vue'
  import OnboardingGenreSelector from './OnboardingGenreSelector.vue'
  import OnboardingAnalysis from './OnboardingAnalysis.vue'
  import OnboardingComplete from './OnboardingComplete.vue'
  import BaseButton from '../base/BaseButton.vue'

  export default {
    name: 'OnboardingContainer',
    components: {
      OnboardingStepIndicator,
      OnboardingMovieGrid,
      OnboardingGenreSelector,
      OnboardingAnalysis,
      OnboardingComplete,
      BaseButton
    },
    data() {
      return {
        // 현재 단계
        currentStep: 1,

        // 단계 라벨
        stepLabels: [
          '재밌게 본 영화',
          '관심있는 영화',
          '제외할 장르',
          '취향 분석'
        ],

        // 1단계 데이터
        famousMovies: [],
        selectedFavoriteMovies: [],
        famousMoviesLoading: false,
        famousMoviesError: null,

        // 2단계 데이터
        hiddenMovies: [],
        selectedInterestingMovies: [],
        hiddenMoviesLoading: false,
        hiddenMoviesError: null,

        // 3단계 데이터
        genres: [],
        selectedExcludedGenres: [],
        genresLoading: false,
        genresError: null,

        // 4단계 데이터
        analysisStatus: 'preparing', // preparing, analyzing, completed, error
        randomMovie: null,

        // 5단계 데이터
        recommendations: [],
        tasteAnalysis: ''
      }
    },
    async mounted() {
      // 온보딩 상태 확인
      await this.checkOnboardingStatus()

      // 첫 번째 단계 데이터 로드
      if (this.currentStep === 1) {
        await this.loadFamousMovies()
      }
    },
    methods: {
      // 온보딩 상태 확인
      // 온보딩 상태 확인
      async checkOnboardingStatus() {
        try {
          const response = await onboardingApi.getOnboardingStatus()

          // 이미 완료된 경우 타임라인으로 이동
          if (response.completed) {
            this.$router.push('/timeline')
            return
          }

          // 현재 단계 설정
          const stepMap = {
            favorite_movies: 1,
            interesting_movies: 2,
            exclude_genres: 3,
            gpt_analysis: 4,
            completed: 5
          }

          this.currentStep = stepMap[response.current_step] || 1

          // 저장된 데이터 복원
          if (response.step_data) {
            this.selectedFavoriteMovies =
              response.step_data.favorite_movies || []
            this.selectedInterestingMovies =
              response.step_data.interesting_movies || []
            this.selectedExcludedGenres =
              response.step_data.excluded_genres || []
          }
        } catch (error) {
          console.error('온보딩 상태 확인 실패:', error)
          // 에러 시 1단계부터 시작 (에러 표시하지 않음)
          this.currentStep = 1
        }
      },

      // 1단계: 유명한 영화 로드
      // 1단계: 유명한 영화 로드
      async loadFamousMovies() {
        this.famousMoviesLoading = true
        this.famousMoviesError = null

        try {
          const response = await onboardingApi.getFamousMovies()
          console.log('🎬 getFamousMovies 응답:', response) // 디버깅용

          // API 응답 구조 확인 후 적절히 처리
          if (response && response.movies) {
            this.famousMovies = response.movies
          } else if (Array.isArray(response)) {
            // 응답이 직접 배열인 경우
            this.famousMovies = response
          } else {
            // 예상치 못한 응답 구조
            console.warn('예상치 못한 API 응답 구조:', response)
            this.famousMovies = []
          }

          console.log('✅ 로드된 영화 수:', this.famousMovies.length)
        } catch (error) {
          console.error('유명한 영화 로드 실패:', error)
          this.famousMoviesError = '영화를 불러오는 중 오류가 발생했습니다.'
        } finally {
          this.famousMoviesLoading = false
        }
      },

      // 2단계: 숨겨진 영화 로드
      // 2단계: 숨겨진 영화 로드
      async loadHiddenMovies() {
        this.hiddenMoviesLoading = true
        this.hiddenMoviesError = null

        try {
          const response = await onboardingApi.getHiddenMovies()
          console.log('🎬 getHiddenMovies 응답:', response) // 디버깅용

          // API 응답 구조 확인 후 적절히 처리
          if (response && response.movies) {
            this.hiddenMovies = response.movies
          } else if (Array.isArray(response)) {
            // 응답이 직접 배열인 경우
            this.hiddenMovies = response
          } else {
            // 예상치 못한 응답 구조
            console.warn('예상치 못한 API 응답 구조:', response)
            this.hiddenMovies = []
          }

          console.log('✅ 로드된 숨겨진 영화 수:', this.hiddenMovies.length)
        } catch (error) {
          console.error('숨겨진 영화 로드 실패:', error)
          this.hiddenMoviesError = '영화를 불러오는 중 오류가 발생했습니다.'
        } finally {
          this.hiddenMoviesLoading = false
        }
      },

      // 3단계: 장르 로드
      // 3단계: 장르 로드
      async loadGenres() {
        this.genresLoading = true
        this.genresError = null

        try {
          const response = await onboardingApi.getGenres()
          console.log('🎭 getGenres 응답:', response) // 디버깅용

          // API 응답 구조 확인 후 적절히 처리
          if (response && response.genres) {
            this.genres = response.genres
          } else if (Array.isArray(response)) {
            // 응답이 직접 배열인 경우
            this.genres = response
          } else {
            // 예상치 못한 응답 구조
            console.warn('예상치 못한 장르 API 응답 구조:', response)
            this.genres = []
          }

          console.log('✅ 로드된 장르 수:', this.genres.length)
        } catch (error) {
          console.error('장르 로드 실패:', error)
          this.genresError = '장르를 불러오는 중 오류가 발생했습니다.'
        } finally {
          this.genresLoading = false
        }
      },

      // 1단계 영화 선택 이벤트
      handleFavoriteMovieSelect(movieId) {
        if (!this.selectedFavoriteMovies.includes(movieId)) {
          this.selectedFavoriteMovies.push(movieId)
        }
      },

      handleFavoriteMovieUnselect(movieId) {
        const index = this.selectedFavoriteMovies.indexOf(movieId)
        if (index > -1) {
          this.selectedFavoriteMovies.splice(index, 1)
        }
      },

      // 2단계 영화 선택 이벤트
      handleInterestingMovieSelect(movieId) {
        if (!this.selectedInterestingMovies.includes(movieId)) {
          this.selectedInterestingMovies.push(movieId)
        }
      },

      handleInterestingMovieUnselect(movieId) {
        const index = this.selectedInterestingMovies.indexOf(movieId)
        if (index > -1) {
          this.selectedInterestingMovies.splice(index, 1)
        }
      },

      // 3단계 장르 선택 이벤트
      handleGenreSelect(genreId) {
        if (!this.selectedExcludedGenres.includes(genreId)) {
          this.selectedExcludedGenres.push(genreId)
        }
      },

      handleGenreUnselect(genreId) {
        const index = this.selectedExcludedGenres.indexOf(genreId)
        if (index > -1) {
          this.selectedExcludedGenres.splice(index, 1)
        }
      },

      // 단계별 다음 이벤트
      async handleStep1Next() {
        try {
          await onboardingApi.saveFavoriteMovies(this.selectedFavoriteMovies)
          this.currentStep = 2
          await this.loadHiddenMovies()
        } catch (error) {
          console.error('1단계 저장 실패:', error)
        }
      },

      async handleStep2Next() {
        try {
          await onboardingApi.saveInterestingMovies(
            this.selectedInterestingMovies
          )
          this.currentStep = 3
          await this.loadGenres()
        } catch (error) {
          console.error('2단계 저장 실패:', error)
        }
      },

      async handleStep3Next() {
        try {
          await onboardingApi.saveExcludedGenres(this.selectedExcludedGenres)
          this.currentStep = 4
          await this.generateRecommendations()
        } catch (error) {
          console.error('3단계 저장 실패:', error)
        }
      },

      // GPT 추천 생성
      // GPT 추천 생성
      async generateRecommendations() {
        this.analysisStatus = 'analyzing'

        try {
          this.loadRandomMovie()

          const response = await onboardingApi.generateGPTRecommendations()

          // 🔍 디버깅 추가
          console.log('🔍 GPT 추천 응답 전체:', response)
          console.log('🔍 recommended_movies:', response?.recommended_movies)
          console.log('🔍 taste_summary:', response?.taste_summary)

          // 안전한 접근
          this.recommendations = response?.recommended_movies || []
          this.tasteAnalysis = response?.taste_summary || ''
          this.analysisStatus = 'completed'
          this.currentStep = 5
        } catch (error) {
          console.error('GPT 추천 생성 실패:', error)
          this.analysisStatus = 'error'
        }
      },

      // 분석 중 랜덤 영화 로드
      async loadRandomMovie() {
        try {
          const response = await onboardingApi.getRandomMovieDuringAnalysis()
          this.randomMovie = response
        } catch (error) {
          console.error('랜덤 영화 로드 실패:', error)
        }
      },

      // 추천 재생성
      async regenerateRecommendations() {
        try {
          const response = await onboardingApi.regenerateRecommendations()
          console.log('🔍 추천 재생성 응답 전체:', response) // 디버깅용

          // API 응답 구조에 맞게 수정
          this.recommendations = response.recommended_movies || []
          this.tasteAnalysis = response.taste_summary || ''
        } catch (error) {
          console.error('추천 재생성 실패:', error)
        }
      },

      // 이전 단계로 이동
      goToPreviousStep() {
        if (this.currentStep > 1) {
          this.currentStep--

          // 이전 단계 데이터 로드
          if (this.currentStep === 1 && this.famousMovies.length === 0) {
            this.loadFamousMovies()
          } else if (this.currentStep === 2 && this.hiddenMovies.length === 0) {
            this.loadHiddenMovies()
          } else if (this.currentStep === 3 && this.genres.length === 0) {
            this.loadGenres()
          }
        }
      },

      // 타임라인으로 이동
      goToTimeline() {
        this.$router.push('/timeline')
      }
    }
  }
</script>

<style scoped>
  .onboarding-container {
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text);
  }

  /* 온보딩 헤더 */
  .onboarding-header {
    background: var(--color-card-background);
    border-bottom: 1px solid var(--color-inactive-icon);
    padding: 32px 20px;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto 24px auto;
    text-align: center;
  }

  .main-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 12px 0;
  }

  .main-description {
    font-size: 16px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  /* 온보딩 컨텐츠 */
  .onboarding-content {
    flex: 1;
    padding: 40px 0;
  }

  /* 하단 네비게이션 */
  .onboarding-footer {
    background: var(--color-card-background);
    border-top: 1px solid var(--color-inactive-icon);
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-spacer {
    flex: 1;
  }

  .progress-text {
    color: var(--color-highlight-text);
    font-size: 14px;
    margin: 0;
  }

  .back-button {
    min-width: 120px;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .onboarding-header {
      padding: 24px 16px;
    }

    .main-title {
      font-size: 24px;
    }

    .main-description {
      font-size: 14px;
    }

    .onboarding-content {
      padding: 20px 0;
    }

    .onboarding-footer {
      padding: 16px;
    }

    .back-button {
      min-width: 100px;
    }
  }
</style>
