import api from './api'

// 온보딩 관련 API 함수들
const onboardingApi = {
  // 현재 온보딩 진행 상황 조회
  async getOnboardingStatus() {
    try {
      const response = await api.get('/accounts/onboarding/status/')
      return response.data
    } catch (error) {
      console.error('온보딩 상태 조회 실패:', error)
      throw error
    }
  },

  // 1단계: 유명한 영화들 목록 조회
  async getFamousMovies() {
    try {
      const response = await api.get(
        '/cinememory/accounts/onboarding/movies/famous/'
      )
      console.log('🔍 getFamousMovies API 응답:', response) // 디버깅용

      // 응답 구조에 따라 적절히 반환
      if (response && typeof response === 'object') {
        return response // 전체 응답 객체 반환
      }

      return { movies: [] } // 기본값
    } catch (error) {
      console.error('유명한 영화 목록 조회 실패:', error)
      throw error
    }
  },

  // 1단계: 재밌게 본 영화들 저장
  async saveFavoriteMovies(movieIds) {
    try {
      const response = await api.post(
        '/cinememory/accounts/onboarding/step1/save/',
        {
          movie_ids: movieIds
        }
      )
      return response.data
    } catch (error) {
      console.error('재밌게 본 영화 저장 실패:', error)
      throw error
    }
  },

  // 2단계: 숨겨진 영화들 목록 조회
  async getHiddenMovies() {
    try {
      const response = await api.get(
        '/cinememory/accounts/onboarding/movies/hidden/'
      )
      console.log('🔍 getHiddenMovies raw API 응답:', response) // 전체 응답 확인

      // response가 직접 데이터일 수 있으므로 확인
      if (response && response.movies) {
        return response
      } else if (response && Array.isArray(response)) {
        return { movies: response }
      } else {
        console.warn('예상치 못한 getHiddenMovies 응답:', response)
        return { movies: [] }
      }
    } catch (error) {
      console.error('숨겨진 영화 목록 조회 실패:', error)
      throw error
    }
  },

  // 2단계: 관심있는 영화들 저장
  async saveInterestingMovies(movieIds) {
    try {
      const response = await api.post(
        '/cinememory/accounts/onboarding/step2/save/',
        {
          movie_ids: movieIds
        }
      )
      return response.data
    } catch (error) {
      console.error('관심있는 영화 저장 실패:', error)
      throw error
    }
  },

  // 3단계: 전체 장르 목록 조회
  async getGenres() {
    try {
      const response = await api.get('/cinememory/accounts/onboarding/genres/')
      console.log('🔍 getGenres API 응답:', response)
      return response
    } catch (error) {
      console.error('장르 목록 조회 실패:', error)
      throw error
    }
  },

  // 3단계: 제외할 장르 저장
  async saveExcludedGenres(genreIds) {
    try {
      const response = await api.post(
        '/cinememory/accounts/onboarding/step3/save/',
        {
          genre_ids: genreIds
        }
      )
      return response.data
    } catch (error) {
      console.error('제외할 장르 저장 실패:', error)
      throw error
    }
  },

  // 4단계: GPT 추천 생성
  async generateGPTRecommendations() {
    try {
      const response = await api.post(
        '/cinememory/accounts/onboarding/step4/generate/'
      )
      return response.data
    } catch (error) {
      console.error('GPT 추천 생성 실패:', error)
      throw error
    }
  },

  // 분석 중 랜덤 영화 조회 (로딩 화면용)
  async getRandomMovieDuringAnalysis() {
    try {
      const response = await api.get(
        '/cinememory/accounts/onboarding/movies/random/'
      )
      return response.data
    } catch (error) {
      console.error('랜덤 영화 조회 실패:', error)
      throw error
    }
  },

  // 완료된 추천 결과 조회
  async getUserRecommendations() {
    try {
      const response = await api.get('/cinememory/accounts/recommendations/')
      return response.data
    } catch (error) {
      console.error('사용자 추천 결과 조회 실패:', error)
      throw error
    }
  },

  // 추천 결과 재생성
  async regenerateRecommendations() {
    try {
      const response = await api.post(
        '/cinememory/accounts/recommendations/regenerate/'
      )
      return response.data
    } catch (error) {
      console.error('추천 재생성 실패:', error)
      throw error
    }
  }
}

export default onboardingApi
