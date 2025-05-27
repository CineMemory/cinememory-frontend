import axios from 'axios'

// TMDB API 설정
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY // 환경변수에서 가져오기
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// axios 인스턴스 생성
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'ko-KR' // 한국어 설정
  }
})

// TMDB API 서비스 객체
export const tmdbService = {
  // 🎬 영화 상세 정보 조회
  getMovieDetails: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`)
      return response.data
    } catch (error) {
      console.error('영화 상세 정보 조회 오류:', error)
      throw error
    }
  },

  // 🔍 영화 검색
  searchMovies: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: {
          query,
          page,
          include_adult: false // 성인 컨텐츠 제외
        }
      })
      return response.data
    } catch (error) {
      console.error('영화 검색 오류:', error)
      throw error
    }
  },

  // 👤 인물 검색
  searchPeople: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/person', {
        params: {
          query,
          page,
          include_adult: false
        }
      })
      return response.data
    } catch (error) {
      console.error('인물 검색 오류:', error)
      throw error
    }
  },

  // 🔍 멀티 검색 (영화 + 인물 + TV 등)
  searchMulti: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/multi', {
        params: {
          query,
          page,
          include_adult: false
        }
      })
      return response.data
    } catch (error) {
      console.error('통합 검색 오류:', error)
      throw error
    }
  },

  // 📷 이미지 URL 생성 헬퍼 함수들
  getImageUrl: (path, size = 'w500') => {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  },

  getPosterUrl: (path, size = 'w342') => {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  },

  getBackdropUrl: (path, size = 'w780') => {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  },

  getProfileUrl: (path, size = 'w185') => {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }
}

export default tmdbService
