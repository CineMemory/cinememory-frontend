// 🔐 인증 관련 API 서비스
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// API 요청 헬퍼 함수
const authApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  // 로그아웃 등 인증이 필요한 요청의 경우 토큰 추가
  if (options.requireAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
  }

  console.log('🌐 API 요청:', {
    url,
    method: config.method,
    hasAuth: !!config.headers.Authorization,
    hasBody: !!config.body
  })

  try {
    const response = await fetch(url, config)

    console.log('📡 API 응답 상태:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    // 응답이 JSON이 아닐 수 있으므로 체크
    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')

    let data
    if (isJson) {
      data = await response.json()
      console.log('📄 JSON 응답 데이터:', data)
    } else {
      // HTML 에러 페이지 등은 사용자에게 보여주지 않음
      const textData = await response.text()
      console.log('📄 텍스트 응답:', textData?.substring(0, 200) + '...')

      if (textData.includes('<!DOCTYPE html>')) {
        data = { error: '서버에서 오류가 발생했습니다.' }
      } else {
        data = { error: textData }
      }
    }

    if (!response.ok) {
      console.log('❌ API 요청 실패:', {
        status: response.status,
        data: data
      })

      throw {
        response: {
          status: response.status,
          statusText: response.statusText,
          data: data
        }
      }
    }

    console.log('✅ API 요청 성공:', { url, data })
    return data
  } catch (error) {
    if (error.response) {
      console.log('🔄 API 에러 재던지기:', error)
      throw error
    }

    // 네트워크 에러 등
    console.error('🌐 네트워크 에러:', error)
    throw {
      response: {
        status: 0,
        data: { error: '네트워크 오류가 발생했습니다.' }
      }
    }
  }
}

/**
 * 회원가입
 */
export const signup = async (userData) => {
  console.log('🔍 프론트엔드에서 받은 원본 데이터:', userData)

  // 백엔드 serializer에 맞춰 데이터 변환
  const requestData = {
    username: userData.username,
    password1: userData.password, // password -> password1
    password2: userData.passwordConfirm || userData.password, // passwordConfirm이 없으면 password 사용
    birth: userData.birth
  }

  console.log('🔄 백엔드로 전송할 데이터:', requestData)

  return await authApiRequest('/cinememory/accounts/signup/', {
    method: 'POST',
    body: JSON.stringify(requestData)
  })
}

/**
 * 닉네임 중복 확인
 */
export const checkUsernameAvailability = async (username) => {
  return await authApiRequest('/cinememory/accounts/check-username/', {
    method: 'POST',
    body: JSON.stringify({ username })
  })
}

/**
 * 로그인
 */
export const login = async (credentials) => {
  return await authApiRequest('/cinememory/accounts/login/', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

/**
 * 로그아웃
 */
export const logout = async () => {
  return await authApiRequest('/cinememory/accounts/logout/', {
    method: 'POST',
    requireAuth: true
  })
}

/**
 * 현재 사용자 정보 조회
 */
export const getUserProfile = async () => {
  return await authApiRequest('/cinememory/accounts/me/', {
    method: 'GET',
    requireAuth: true
  })
}

/**
 * 사용자 정보 수정
 */
export const updateUserProfile = async (updateData) => {
  // 일반 객체인 경우 JSON으로, FormData인 경우 그대로 전송
  const isFormData = updateData instanceof FormData

  const config = {
    method: 'PUT', // 백엔드에서 PUT, PATCH 둘 다 지원
    requireAuth: true
  }

  if (isFormData) {
    // FormData인 경우 Content-Type 헤더 제거 (브라우저가 boundary 자동 설정)
    config.headers = {}
    config.body = updateData
  } else {
    // 일반 객체인 경우 JSON으로 전송
    config.body = JSON.stringify(updateData)
  }

  return await authApiRequest('/cinememory/accounts/me/update/', config)
}

/**
 * 회원 탈퇴
 */
export const deleteUserAccount = async (password) => {
  console.log('🔍 회원탈퇴 요청 시작 - 비밀번호 길이:', password?.length)

  // 백엔드 API 스펙에 따라 다양한 필드명 시도
  const requestData = {
    password: password,
    current_password: password,
    password1: password,
    old_password: password,
    confirm_password: password
  }

  console.log('📤 전송할 데이터:', {
    ...requestData,
    password: '***',
    current_password: '***',
    password1: '***',
    old_password: '***',
    confirm_password: '***'
  })

  try {
    const result = await authApiRequest('/cinememory/accounts/me/delete/', {
      method: 'DELETE',
      requireAuth: true,
      body: JSON.stringify(requestData)
    })

    console.log('✅ 회원탈퇴 API 성공 응답:', result)

    // 응답에서 실제로 삭제가 성공했는지 확인
    if (result && result.message && result.message.includes('성공')) {
      return result
    } else if (result && result.success === false) {
      // 성공이 false로 명시된 경우
      throw {
        response: {
          status: 400,
          data: { error: result.error || '회원 탈퇴에 실패했습니다.' }
        }
      }
    } else {
      // 기본적으로 성공으로 처리하되, 백엔드 응답을 확인
      console.log('⚠️ 회원탈퇴 응답 확인 필요:', result)
      return result
    }
  } catch (error) {
    console.error('❌ 회원탈퇴 API 에러:', error)
    console.log('📝 요청 실패 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: '/cinememory/accounts/me/delete/'
    })

    // 에러를 다시 throw해서 호출하는 곳에서 처리할 수 있도록 함
    throw error
  }
}
