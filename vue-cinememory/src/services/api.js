// 🌐 API 통신 서비스
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  // 토큰이 있으면 Authorization 헤더 추가
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)

    // 응답이 JSON이 아닐 수 있으므로 체크
    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')

    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: isJson ? data : { message: data }
        }
      }
    }

    return data
  } catch (error) {
    if (error.response) {
      throw error
    }

    // 네트워크 에러 등
    throw {
      response: {
        status: 0,
        data: { message: '네트워크 오류가 발생했습니다.' }
      }
    }
  }
}

// 🔐 인증 관련 API

// 로그인
export const login = async (credentials) => {
  // 임시로 더미 응답 반환 (Django 연결 전까지)
  if (import.meta.env.MODE === 'development') {
    // 개발 환경에서는 더미 데이터 반환
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 로딩 시뮬레이션

    if (
      credentials.username === 'admin' &&
      credentials.password === 'password'
    ) {
      return {
        token: 'dummy-jwt-token-' + Date.now(),
        user: {
          user_pk: 1,
          username: credentials.username,
          birth: '1990-01-01'
        }
      }
    } else {
      throw {
        response: {
          status: 400,
          data: { message: '아이디 또는 비밀번호가 일치하지 않습니다.' }
        }
      }
    }
  }

  return await apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

// 회원가입
export const signup = async (userData) => {
  // 임시로 더미 응답 반환 (Django 연결 전까지)
  if (import.meta.env.MODE === 'development') {
    await new Promise((resolve) => setTimeout(resolve, 1200)) // 로딩 시뮬레이션

    // 간단한 유효성 검사
    if (!userData.username || userData.username.length < 3) {
      throw {
        response: {
          status: 400,
          data: { message: '사용자명은 3글자 이상이어야 합니다.' }
        }
      }
    }

    if (!userData.password || userData.password.length < 6) {
      throw {
        response: {
          status: 400,
          data: { message: '비밀번호는 6글자 이상이어야 합니다.' }
        }
      }
    }

    if (!userData.birth) {
      throw {
        response: {
          status: 400,
          data: { message: '생년월일을 입력해주세요.' }
        }
      }
    }

    return {
      token: 'dummy-jwt-token-' + Date.now(),
      user: {
        user_pk: Math.floor(Math.random() * 1000) + 2,
        username: userData.username,
        birth: userData.birth
      }
    }
  }

  return await apiRequest('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

// 로그아웃
export const logout = async () => {
  // 임시로 더미 응답 반환 (Django 연결 전까지)
  if (import.meta.env.MODE === 'development') {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { message: '로그아웃 되었습니다.' }
  }

  return await apiRequest('/auth/logout/', {
    method: 'POST'
  })
}

// 현재 사용자 정보 조회
export const getCurrentUser = async () => {
  // 임시로 더미 응답 반환 (Django 연결 전까지)
  if (import.meta.env.MODE === 'development') {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const token = localStorage.getItem('token')
    if (!token || !token.startsWith('dummy-jwt-token')) {
      throw {
        response: {
          status: 401,
          data: { message: '인증이 필요합니다.' }
        }
      }
    }

    return {
      user_pk: 1,
      username: 'admin',
      birth: '1990-01-01'
    }
  }

  return await apiRequest('/auth/user/')
}

// 🎬 영화 관련 API (기존 코드와 연동 가능)

// 영화 검색
export const searchMovies = async (query) => {
  return await apiRequest(`/movies/search/?q=${encodeURIComponent(query)}`)
}

// 영화 상세 정보
export const getMovieDetail = async (movieId) => {
  return await apiRequest(`/movies/${movieId}/`)
}

// 인물 상세 정보
export const getPersonDetail = async (personId) => {
  return await apiRequest(`/persons/${personId}/`)
}
