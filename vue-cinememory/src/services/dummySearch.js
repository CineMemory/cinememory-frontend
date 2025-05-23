// Django fixture JSON 파일들 import
import moviesFixtures from '@/data/movies_fixtures.json'
import actorsFixtures from '@/data/actors_fixtures.json'
import directorsFixtures from '@/data/directors_fixtures.json'

// 🔄 데이터 전처리 - fixture 형태를 사용하기 쉽게 변환
const processFixtureData = () => {
  // 영화 데이터 변환 - 새로운 구조 반영
  const movies = moviesFixtures.map((item) => ({
    id: item.pk,
    media_type: 'movie',
    ...item.fields,
    // 기존 호환성을 위한 alias 추가
    poster_url: item.fields.poster_path,
    vote_average: item.fields.voteAverage,
    is_adult: item.fields.isAdult,
    is_video: item.fields.isVideo
  }))

  // 배우 데이터 변환 (pk를 key로 하는 객체)
  const actors = {}
  actorsFixtures.forEach((item) => {
    actors[item.pk] = {
      id: item.pk,
      media_type: 'person',
      known_for_department: 'Acting', // 배우로 설정
      ...item.fields
    }
  })

  // 감독 데이터 변환 (pk를 key로 하는 객체)
  const directors = {}
  directorsFixtures.forEach((item) => {
    directors[item.pk] = {
      id: item.pk,
      media_type: 'person',
      known_for_department: 'Directing', // 감독으로 설정
      ...item.fields
    }
  })

  return { movies, actors, directors }
}

// 전처리된 데이터
const { movies, actors, directors } = processFixtureData()

// 🔧 유틸리티 함수들
const calculateAge = (birthday) => {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1
  }
  return age
}

// 상영시간을 "X시간 Y분" 형태로 변환
const formatRuntime = (minutes) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

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
      movies.forEach((movie) => {
        if (movie.title.toLowerCase().includes(searchQuery)) {
          results.push({
            ...movie,
            // 검색용 추가 정보
            overview:
              movie.overview ||
              `${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`,
            poster_path:
              movie.poster_path?.replace(
                'https://image.tmdb.org/t/p/w500',
                ''
              ) || null,
            release_date: movie.release_date,
            vote_average: movie.voteAverage || Math.random() * 10 // 새로운 필드 사용
          })
        }
      })

      // 2. 배우 이름 검색
      Object.values(actors).forEach((actor) => {
        if (actor.name.toLowerCase().includes(searchQuery)) {
          results.push({
            ...actor,
            // 검색용 추가 정보
            overview: `배우: ${actor.name}`,
            profile_path: actor.profile_path || null,
            known_for_department: 'Acting',
            // 생년월일이 있으면 나이 계산
            age: actor.birthday ? calculateAge(actor.birthday) : null,
            // 대표 작품 정보 (movie_credits_cast에서 인기도 높은 작품들)
            known_for: actor.movie_credits_cast
              ? actor.movie_credits_cast
                  .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                  .slice(0, 3)
                  .map((credit) => credit.title)
              : []
          })
        }
      })

      // 3. 감독 이름 검색
      Object.values(directors).forEach((director) => {
        if (director.name.toLowerCase().includes(searchQuery)) {
          results.push({
            ...director,
            // 검색용 추가 정보
            overview: `감독: ${director.name}`,
            profile_path: director.profile_path || null,
            known_for_department: 'Directing',
            // 생년월일이 있으면 나이 계산
            age: director.birthday ? calculateAge(director.birthday) : null,
            // 대표 작품 정보 (movie_credits_crew에서 감독 작품들)
            known_for: director.movie_credits_crew
              ? director.movie_credits_crew
                  .filter((credit) => credit.job === 'Director')
                  .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                  .slice(0, 3)
                  .map((credit) => credit.title)
              : []
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
      results: multiResult.results.filter((item) => item.media_type === 'movie')
    }
  },

  // 인물만 검색 (배우 + 감독)
  searchPeople: async (query, page = 1) => {
    const multiResult = await dummySearchService.searchMulti(query, page)
    return {
      ...multiResult,
      results: multiResult.results.filter(
        (item) => item.media_type === 'person'
      )
    }
  },

  // 🎬 영화 상세 정보 조회 - 새로운 구조 반영
  getMovieById: (id) => {
    const movie = movies.find((m) => m.id === parseInt(id))
    if (!movie) return null

    // credits_cast에서 감독 정보 추출 (새로운 구조에서는 별도 directors 배열이 없을 수 있음)
    const movieDirectors = []
    // credits_cast가 있다면 감독도 포함되어 있을 수 있음 (job 필드로 구분)

    // 기존 directors 필드가 있다면 사용 (하위 호환성)
    if (movie.directors && Array.isArray(movie.directors)) {
      movie.directors.forEach((directorId) => {
        if (directors[directorId]) {
          movieDirectors.push(directors[directorId])
        }
      })
    }

    // credits_cast에서 배우 정보 추출 (새로운 구조 사용)
    const movieActors = movie.credits_cast
      ? movie.credits_cast.map((cast) => ({
          id: cast.actor_id,
          name: cast.name,
          character: cast.character,
          order: cast.order,
          profile_path: cast.profile_path,
          // 필요시 전체 배우 정보 병합
          ...actors[cast.actor_id]
        }))
      : []

    // 기존 actors 필드도 하위 호환성으로 유지
    if (
      movie.actors &&
      Array.isArray(movie.actors) &&
      movieActors.length === 0
    ) {
      movie.actors.forEach((actorId) => {
        if (actors[actorId]) {
          movieActors.push(actors[actorId])
        }
      })
    }

    return {
      ...movie,
      directors: movieDirectors,
      actors: movieActors,
      // 추가 유틸리티 필드
      formatted_runtime: formatRuntime(movie.runtime),
      release_year: movie.release_date ? movie.release_date.split('-')[0] : null
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

  getBackdropUrl: (path, size = 'w1280') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  },

  // 반응형 이미지를 위한 srcset 생성
  getBackdropSrcset: (path) => {
    if (!path) return null
    const baseUrl = 'https://image.tmdb.org/t/p/'

    return [
      `${baseUrl}w780${path} 780w`,
      `${baseUrl}w1280${path} 1280w`,
      `${baseUrl}original${path} 1920w`
    ].join(', ')
  },

  getPosterSrcset: (path) => {
    if (!path) return null
    const baseUrl = 'https://image.tmdb.org/t/p/'

    return [
      `${baseUrl}w342${path} 342w`,
      `${baseUrl}w500${path} 500w`,
      `${baseUrl}w780${path} 780w`
    ].join(', ')
  },

  getProfileSrcset: (path) => {
    if (!path) return null
    const baseUrl = 'https://image.tmdb.org/t/p/'

    return [
      `${baseUrl}w185${path} 185w`,
      `${baseUrl}h632${path} 632w`,
      `${baseUrl}original${path} 1000w`
    ].join(', ')
  },

  getProfileUrl: (path, size = 'w185') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  }
}

export default dummySearchService
