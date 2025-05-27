import api from './api'
import onboardingApi from './onboardingApi'
import tmdbService from './tmdb'

// 타임라인 관련 API 함수들
const timelineApi = {
  // 사용자의 추천 영화 타임라인 데이터 조회
  async getTimelineData() {
    try {
      // 온보딩에서 생성된 추천 결과를 가져옴
      const recommendations = await onboardingApi.getUserRecommendations()
      
      if (!recommendations || !recommendations.movies) {
        throw new Error('추천 영화 데이터가 없습니다.')
      }

      // 타임라인 형태로 데이터 변환
      const timelineData = await this.transformToTimelineData(recommendations)
      
      return timelineData
    } catch (error) {
      console.error('타임라인 데이터 조회 실패:', error)
      throw error
    }
  },

  // 추천 데이터를 타임라인 형태로 변환
  async transformToTimelineData(recommendations) {
    const { taste_summary, movies } = recommendations
    
    // 나이별로 영화를 정렬
    const sortedMovies = movies.sort((a, b) => a.target_age - b.target_age)
    
    // 각 영화에 대해 TMDB 데이터 가져오기
    const enrichedMovies = await Promise.all(
      sortedMovies.map(async (movie, index) => {
        let posterPath = null
        let tmdbData = null

        try {
          // movie_id가 있으면 TMDB에서 상세 정보 가져오기
          if (movie.movie_id) {
            tmdbData = await tmdbService.getMovieDetails(movie.movie_id)
            posterPath = tmdbData.poster_path
          } else {
            // movie_id가 없으면 제목으로 검색
            const searchResults = await tmdbService.searchMovies(movie.title)
            if (searchResults.results && searchResults.results.length > 0) {
              const firstResult = searchResults.results[0]
              posterPath = firstResult.poster_path
              tmdbData = firstResult
            }
          }
        } catch (error) {
          console.warn(`영화 "${movie.title}" TMDB 데이터 로드 실패:`, error)
        }

        return {
          id: `timeline-${index}`,
          age: movie.target_age,
          year: movie.release_year,
          movie: {
            id: movie.movie_id || tmdbData?.id,
            title: movie.title,
            releaseYear: movie.release_year,
            reason: movie.reason,
            poster: posterPath,
            tmdbData: tmdbData
          },
          position: index,
          isWatched: false // 사용자가 실제로 봤는지 여부 (추후 기능)
        }
      })
    )

    return {
      tasteSummary: taste_summary,
      items: enrichedMovies,
      totalItems: enrichedMovies.length,
      ageRange: {
        min: Math.min(...enrichedMovies.map(item => item.age)),
        max: Math.max(...enrichedMovies.map(item => item.age))
      }
    }
  },

  // 특정 영화를 "봤음" 처리
  async markAsWatched(movieId) {
    try {
      // 추후 백엔드 API 구현 시 사용
      // const response = await api.post(`/cinememory/timeline/watched/`, {
      //   movie_id: movieId
      // })
      // return response
      
      // 현재는 로컬 상태로만 처리
      return { success: true, movieId }
    } catch (error) {
      console.error('영화 시청 처리 실패:', error)
      throw error
    }
  },

  // 타임라인 재생성 (추천 재생성)
  async regenerateTimeline() {
    try {
      const newRecommendations = await onboardingApi.regenerateRecommendations()
      const timelineData = await this.transformToTimelineData(newRecommendations)
      return timelineData
    } catch (error) {
      console.error('타임라인 재생성 실패:', error)
      throw error
    }
  }
}

export default timelineApi 