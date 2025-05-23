// Django fixture JSON 파일들 import
import moviesFixtures from '@/data/movies_fixtures.json'
import actorsFixtures from '@/data/actors_fixtures.json'
import directorsFixtures from '@/data/directors_fixtures.json'

// 🔄 데이터 전처리 - fixture 형태를 사용하기 쉽게 변환
const processFixtureData = () => {
  // 영화 데이터 변환
  const movies = moviesFixtures.map(item => ({
    id: item.pk,
    media_type: 'movie',
    ...item.fields
  }))

  // 배우 데이터 변환 (pk를 key로 하는 객체)
  const actors = {}
  actorsFixtures.forEach(item => {
    actors[item.pk] = {
      id: item.pk,
      media_type: 'person',
      ...item.fields
    }
  })

  // 감독 데이터 변환 (pk를 key로 하는 객체)
  const directors = {}
  directorsFixtures.forEach(item => {
    directors[item.pk] = {
      id: item.pk,
      media_type: 'person',
      ...item.fields
    }
  })

  return { movies, actors, directors }
}

// 전처리된 데이터
const { movies, actors, directors } = processFixtureData()

// 🔍 검색 서비스
export const dummySearchService = {
  // 통합 검색 (영화 + 인물)
  searchMulti: async (query, page = 1) => {
    try {
      console.log('🔍 더미 검색 시작:', query)
      
      // 검색어를 소문자로 변환
      const searchQuery = query.toLowerCase().trim()
      
      if (!searchQuery) {
        return {
          results: [],
          total_results: 0,
          page: 1,
          total_pages: 1
        }
      }

      const results = []

      // 1. 영화 제목 검색
      movies.forEach(movie => {
        if (movie.title.toLowerCase().includes(searchQuery)) {
          results.push({
            ...movie,
            // 검색용 추가 정보
            overview: `${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`,
            poster_path: movie.poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || null,
            release_date: movie.release_date,
            vote_average: Math.random() * 10 // 임시 평점
          })
        }
      })

      // 2. 배우 이름 검색
      Object.values(actors).forEach(actor => {
        if (actor.name.toLowerCase().includes(searchQuery)) {
          results.push({
            ...actor,
            // 검색용 추가 정보
            overview: `배우: ${actor.name}`,
            profile_path: null, // 배우 프로필 이미지는 없음
            known_for_department: "Acting"
          })
        }
      })

      // 3. 감독 이름 검색
      Object.values(directors).forEach(director => {
        if (director.name.toLowerCase().includes(searchQuery)) {
          results.push({
            ...director,
            // 검색용 추가 정보
            overview: `감독: ${director.name}`,
            profile_path: null, // 감독 프로필 이미지는 없음
            known_for_department: "Directing"
          })
        }
      })

      // 페이지네이션 처리
      const itemsPerPage = 20
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedResults = results.slice(startIndex, endIndex)

      console.log('✅ 검색 결과:', {
        query: searchQuery,
        total: results.length,
        page: page,
        results: paginatedResults.length
      })

      return {
        results: paginatedResults,
        total_results: results.length,
        page: page,
        total_pages: Math.ceil(results.length / itemsPerPage)
      }

    } catch (error) {
      console.error('❌ 더미 검색 오류:', error)
      throw error
    }
  },

  // 영화만 검색
  searchMovies: async (query, page = 1) => {
    const multiResult = await dummySearchService.searchMulti(query, page)
    return {
      ...multiResult,
      results: multiResult.results.filter(item => item.media_type === 'movie')
    }
  },

  // 인물만 검색 (배우 + 감독)
  searchPeople: async (query, page = 1) => {
    const multiResult = await dummySearchService.searchMulti(query, page)
    return {
      ...multiResult,
      results: multiResult.results.filter(item => item.media_type === 'person')
    }
  },

  // 🎬 영화 상세 정보 조회
  getMovieById: (id) => {
    const movie = movies.find(m => m.id === parseInt(id))
    if (!movie) return null

    // 감독 정보 추가
    const movieDirectors = movie.directors?.map(directorId => directors[directorId]).filter(Boolean) || []
    
    // 배우 정보 추가
    const movieActors = movie.actors?.map(actorId => actors[actorId]).filter(Boolean) || []

    return {
      ...movie,
      directors: movieDirectors,
      actors: movieActors
    }
  },

  // 🎭 인물 정보 조회
  getPersonById: (id) => {
    return actors[id] || directors[id] || null
  },

  // 📷 이미지 URL 헬퍼 함수들 (TMDB 스타일 유지)
  getImageUrl: (path, size = 'w500') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  },

  getPosterUrl: (path, size = 'w342') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  },

  getBackdropUrl: (path, size = 'w780') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  },

  getProfileUrl: (path, size = 'w185') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  }
}

export default dummySearchService