// 🌐 API 통신 서비스
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'

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
    config.headers.Authorization = `Token ${token}`
  }

  console.log('🌐 API 요청:', {
    url,
    method: config.method || 'GET',
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
    try {
      data = isJson ? await response.json() : await response.text()
    } catch (parseError) {
      console.warn('⚠️ 응답 파싱 실패:', parseError)
      data = ''
    }

    console.log('📄 API 응답 데이터:', data)

    if (!response.ok) {
      // 404이고 데이터가 비어있으면 검색 결과 없음으로 처리
      if (response.status === 404 && (!data || data.trim() === '')) {
        throw {
          response: {
            status: 404,
            data: { message: '검색 결과가 없습니다' }
          }
        }
      }

      throw {
        response: {
          status: response.status,
          data: isJson
            ? data
            : { message: data || '알 수 없는 오류가 발생했습니다' }
        }
      }
    }

    // 빈 응답이면 기본 구조 반환 (검색 API용)
    if (!data || (typeof data === 'string' && data.trim() === '')) {
      return {
        movies: [],
        actors: [],
        directors: []
      }
    }

    return data
  } catch (error) {
    console.error('❌ API 요청 실패:', error)
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

// 커뮤니티 관련 API
// 게시글 목록 조회
export const getPosts = async (page = 1, limit = 10, sortBy = 'latest') => {
  try {
    // 정렬 파라미터와 함께 API 요청
    const queryParams = new URLSearchParams({
      sort: sortBy,
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest(`/cinememory/community/?${queryParams}`)

    // 응답이 배열인 경우 (직접 게시글 목록)
    const posts = Array.isArray(response) ? response : response.results || []

    // 작성자 정보 변환
    const transformedPosts = posts.map((post) => ({
      id: post.id || post.post_id,
      title: post.title || post.post_title,
      content: post.content,
      like_count: post.like_count || 0,
      comment_count: post.comment_count || 0,
      is_liked: post.is_liked || false,
      created_at: post.created_at,
      updated_at: post.updated_at,
      tags: Array.isArray(post.tags)
        ? post.tags.map((tag) => (typeof tag === 'object' ? tag.name : tag))
        : [],
      view_count: post.view_count || 0
    }))

    const result = {
      results: transformedPosts,
      count: transformedPosts.length,
      next: null,
      previous: null
    }
    return result
  } catch (error) {
    console.error('❌ getPosts 오류:', error)
    throw error
  }
}

export const getPost = async (postId) => {
  try {
    const response = await apiRequest(`/cinememory/community/post/${postId}/`)

    // Django API 응답 구조에 맞춰 변환
    let result
    if (response.status === 'success' || response.data) {
      result = response
    } else {
      // 응답이 직접 게시글 데이터인 경우 - 데이터 변환 적용
      const transformedPost = {
        post_id: response.id || parseInt(postId),
        post_title: response.title || response.post_title,
        content: response.content,
        like_count: response.like_count || 0,
        comment_count: response.comment_count || 0,
        is_liked: response.is_liked || false,
        created_at: response.created_at,
        updated_at: response.updated_at,
        // 태그 처리: 객체 배열을 문자열 배열로 변환
        tags: Array.isArray(response.tags)
          ? response.tags.map((tag) =>
              typeof tag === 'object' ? tag.name : tag
            )
          : [],
        // 댓글 변환 로직 추가
        comments: Array.isArray(response.comments)
          ? response.comments.map((comment) => ({
              ...comment,
              // 댓글 작성자 정보도 변환
              author: {
                id: comment.user || comment.author_id || comment.author?.id,
                username:
                  comment.username ||
                  comment.author?.username ||
                  comment.author ||
                  'Unknown'
              },
              // 대댓글 작성자 정보도 변환
              replies: Array.isArray(comment.replies)
                ? comment.replies.map((reply) => ({
                    ...reply,
                    author: {
                      id: reply.user || reply.author_id || reply.author?.id,
                      username:
                        reply.username ||
                        reply.author?.username ||
                        reply.author ||
                        'Unknown'
                    }
                  }))
                : []
            }))
          : []
      }

      result = {
        status: 'success',
        data: transformedPost
      }
    }

    return result
  } catch (error) {
    console.error('❌ getPost 오류:', error)
    throw error
  }
}

// 게시글 작성
export const createPost = async (postData) => {
  try {
    // 프론트엔드 데이터를 백엔드 형식으로 변환
    const backendData = {
      title: postData.title, // post_title → title 수정
      content: postData.content,
      tag_names: postData.tags || []
    }

    const response = await apiRequest('/cinememory/community/post/', {
      method: 'POST',
      body: JSON.stringify(backendData)
    })

    return response
  } catch (error) {
    console.error('❌ createPost 오류:', error)
    throw error
  }
}

// 게시글 수정
export const updatePost = async (postId, postData) => {
  try {
    const backendData = {
      title: postData.title, // post_title → title 수정
      content: postData.content,
      tag_names: postData.tags || []
    }

    const response = await apiRequest(`/cinememory/community/post/${postId}/`, {
      method: 'PUT',
      body: JSON.stringify(backendData)
    })

    return response
  } catch (error) {
    console.error('❌ updatePost 오류:', error)
    throw error
  }
}

// 게시글 삭제
export const deletePost = async (postId) => {
  try {
    const response = await apiRequest(`/cinememory/community/post/${postId}/`, {
      method: 'DELETE'
    })

    return response || null
  } catch (error) {
    console.error('❌ deletePost 오류:', error)
    throw error
  }
}

// 댓글 목록 조회
export const getComments = async (postId) => {
  try {
    const postData = await getPost(postId)

    if (postData.status === 'success') {
      return postData.data.comments || []
    } else {
      return postData.comments || []
    }
  } catch (error) {
    console.error('❌ getComments 오류:', error)
    throw error
  }
}

// 댓글 작성
export const createComment = async (postId, commentData) => {
  try {
    const backendData = {
      content: commentData.content
    }

    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/`,
      {
        method: 'POST',
        body: JSON.stringify(backendData)
      }
    )

    return response
  } catch (error) {
    console.error('❌ createComment 오류:', error)
    throw error
  }
}

// 대댓글 작성
export const createReply = async (postId, commentId, replyData) => {
  try {
    const backendData = {
      content: replyData.content
    }

    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/${commentId}/replies/`,
      {
        method: 'POST',
        body: JSON.stringify(backendData)
      }
    )

    return response
  } catch (error) {
    console.error('❌ createReply 오류:', error)
    throw error
  }
}

// 댓글 삭제
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/${commentId}/`,
      {
        method: 'DELETE'
      }
    )
    return response || null
  } catch (error) {
    console.error('❌ deleteComment 오류:', error)
    throw error
  }
}

// 게시글 좋아요 토글
export const togglePostLike = async (postId) => {
  try {
    const response = await apiRequest(
      `/cinememory/community/post/${postId}/likes/`,
      {
        method: 'POST'
      }
    )

    // Django API 응답 구조에 맞춰 반환
    return {
      success: true,
      is_liked: response.is_liked,
      like_count: response.like_count,
      message: response.message
    }
  } catch (error) {
    console.error('❌ togglePostLike 오류:', error)

    // 상세한 에러 정보 반환
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      '좋아요 처리 중 오류가 발생했습니다.'

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status
    }
  }
}
// 태그 목록 조회 (임시)
export const getTags = async () => {
  try {
    const response = await apiRequest('/cinememory/community/tags/')
    return response
  } catch (error) {
    console.error('❌ getTags 오류:', error)
    throw error
  }
}

// 특정 태그의 게시글 조회
export const getPostsByTag = async (tagName) => {
  try {
    const encodedTagName = encodeURIComponent(tagName)
    const response = await apiRequest(
      `/cinememory/community/tags/${encodedTagName}/posts/`
    )

    // 작성자 정보 변환 추가
    if (response && response.posts) {
      const transformedPosts = response.posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        // 🔧 작성자 정보 변환
        author: {
          id: post.user || post.author_id || post.author?.id,
          username:
            post.username || post.author?.username || post.author || 'Unknown'
        },
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        is_liked: post.is_liked || false,
        created_at: post.created_at,
        updated_at: post.updated_at,
        // 태그 정보 변환
        tags: Array.isArray(post.tags)
          ? post.tags.map((tag) => (typeof tag === 'object' ? tag.name : tag))
          : [],
        view_count: post.view_count || 0
      }))

      return {
        ...response,
        posts: transformedPosts
      }
    }

    return response
  } catch (error) {
    console.error('❌ getPostsByTag 오류:', error)
    throw error
  }
}

// 커뮤니티 통계 조회
export const getCommunityStats = async () => {
  try {
    const response = await apiRequest('/cinememory/community/stats/')

    if (response.status === 'success') {
      return {
        success: true,
        data: response.data
      }
    }

    return response
  } catch (error) {
    console.error('❌ getCommunityStats 오류:', error)
    throw {
      response: {
        status: error.response?.status || 500,
        data: {
          message:
            error.response?.data?.message ||
            '통계 데이터를 불러오는 중 오류가 발생했습니다.'
        }
      }
    }
  }
}

// 커뮤니티 홈 조회 (comment_count 대응)
export const getCommunityHome = async () => {
  try {
    const response = await apiRequest('/cinememory/community/')

    // Django의 post_list 응답을 Vue가 기대하는 형식으로 변환
    const transformedPosts = Array.isArray(response)
      ? response.map((post) => {
          return {
            id: post.id || post.post_id,
            title: post.title || post.post_title,
            content: post.content,
            author: {
              id:
                post.author?.id ||
                post.author_id ||
                post.user ||
                post.user_pk ||
                post.author?.user_pk,
              username:
                post.author?.username ||
                post.author ||
                post.username ||
                '사용자'
            },
            like_count: post.like_count || 0,
            comment_count: post.comment_count || 0, // Django에서 제공하는 comment_count 사용
            is_liked: post.is_liked || false,
            created_at: post.created_at,
            updated_at: post.updated_at,
            // 태그 처리: 객체 배열을 문자열 배열로 변환
            tags: Array.isArray(post.tags)
              ? post.tags.map((tag) =>
                  typeof tag === 'object' ? tag.name : tag
                )
              : [],
            view_count: post.view_count || 0
          }
        })
      : []

    const result = {
      status: 'success',
      data: {
        recent_posts: transformedPosts,
        popular_tags: [] // 현재 Django에서 태그 데이터가 없으므로 빈 배열
      }
    }

    return result
  } catch (error) {
    console.error('❌ getCommunityHome 오류:', error)
    throw {
      response: {
        status: error.response?.status || 500,
        data: {
          message:
            error.response?.data?.message ||
            '커뮤니티 홈 데이터를 불러오는 중 오류가 발생했습니다.'
        }
      }
    }
  }
}

// 댓글 수정
export const updateComment = async (postId, commentId, commentData) => {
  try {
    const backendData = {
      content: commentData.content
    }

    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/${commentId}/`,
      {
        method: 'PUT',
        body: JSON.stringify(backendData)
      }
    )

    return response
  } catch (error) {
    console.error('❌ updateComment 오류:', error)
    throw error
  }
}

// 대댓글 수정
export const updateReply = async (postId, commentId, replyId, replyData) => {
  try {
    const backendData = {
      content: replyData.content
    }

    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/${commentId}/replies/${replyId}/`,
      {
        method: 'PUT',
        body: JSON.stringify(backendData)
      }
    )

    return response
  } catch (error) {
    console.error('❌ updateReply 오류:', error)
    throw error
  }
}

// 댓글 좋아요 토글
export const toggleCommentLike = async (postId, commentId) => {
  try {
    const response = await apiRequest(
      `/cinememory/community/post/${postId}/comments/${commentId}/likes/`,
      {
        method: 'POST'
      }
    )

    return {
      success: true,
      is_liked: response.is_liked,
      like_count: response.like_count,
      message: response.message
    }
  } catch (error) {
    console.error('❌ toggleCommentLike 오류:', error)

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      '댓글 좋아요 처리 중 오류가 발생했습니다.'

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status
    }
  }
}

// 영화 검색
export const searchMovies = async (query, page = 1) => {
  try {
    const queryParams = new URLSearchParams({
      search: query,
      page: page.toString()
    })

    const response = await apiRequest(
      `/cinememory/movies/search/?${queryParams}`
    )

    // 응답이 없거나 빈 경우 기본 구조 반환
    if (!response || (typeof response === 'string' && response.trim() === '')) {
      return {
        movies: [],
        actors: [],
        directors: []
      }
    }

    return response
  } catch (error) {
    console.error('❌ searchMovies 오류:', error)

    // JSON 파싱 에러인 경우 빈 결과 반환
    if (
      error.message &&
      error.message.includes('Unexpected end of JSON input')
    ) {
      return {
        movies: [],
        actors: [],
        directors: []
      }
    }

    throw error
  }
}

// 영화 상세 정보 조회
export const getMovieDetail = async (movieId) => {
  try {
    const response = await apiRequest(`/cinememory/movies/${movieId}/`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  } catch (error) {
    console.error('❌ getMovieDetail 오류:', error)
    throw error
  }
}

// 인물 상세 정보 조회
export const getPersonDetail = async (personId) => {
  try {
    const response = await apiRequest(`/cinememory/movies/person/${personId}/`)
    return response
  } catch (error) {
    console.error('❌ getPersonDetail 오류:', error)
    throw error
  }
}

// 영화 좋아요 토글
export const toggleMovieLike = async (movieId) => {
  try {
    const response = await apiRequest(`/cinememory/movies/like/${movieId}/`, {
      method: 'POST'
    })
    return {
      success: true,
      is_liked: response.is_liked,
      like_count: response.like_count,
      message: response.message
    }
  } catch (error) {
    console.error('❌ toggleMovieLike 오류:', error)
    return {
      success: false,
      error:
        error.response?.data?.error || '좋아요 처리 중 오류가 발생했습니다.',
      status: error.response?.status
    }
  }
}

// 인물 좋아요 토글
export const togglePersonLike = async (personId) => {
  try {
    const response = await apiRequest(
      `/cinememory/movies/person/like/${personId}/`,
      {
        method: 'POST'
      }
    )
    return {
      success: true,
      is_liked: response.is_liked,
      like_count: response.like_count,
      message: response.message
    }
  } catch (error) {
    console.error('❌ togglePersonLike 오류:', error)
    return {
      success: false,
      error:
        error.response?.data?.error || '좋아요 처리 중 오류가 발생했습니다.',
      status: error.response?.status
    }
  }
}

// 영화 리뷰 작성
export const createMovieReview = async (movieId, reviewData) => {
  try {
    const response = await apiRequest(`/cinememory/movies/review/${movieId}/`, {
      method: 'POST',
      body: JSON.stringify({
        content: reviewData.content,
        rating: reviewData.rating
      })
    })
    return response
  } catch (error) {
    console.error('❌ createMovieReview 오류:', error)
    throw error
  }
}

// 영화 리뷰 수정
export const updateMovieReview = async (movieId, reviewId, reviewData) => {
  try {
    const response = await apiRequest(
      `/cinememory/movies/review/${movieId}/${reviewId}/`, // 경로 수정
      {
        method: 'PUT',
        body: JSON.stringify({
          content: reviewData.content,
          rating: reviewData.rating
        })
      }
    )
    return response
  } catch (error) {
    console.error('❌ updateMovieReview 오류:', error)
    throw error
  }
}

// 영화 리뷰 삭제
export const deleteMovieReview = async (movieId, reviewId) => {
  try {
    const response = await apiRequest(
      `/cinememory/movies/review/${movieId}/${reviewId}/`, // 경로 수정
      {
        method: 'DELETE'
      }
    )
    return response
  } catch (error) {
    console.error('❌ deleteMovieReview 오류:', error)
    throw error
  }
}

// 사용자가 좋아요한 영화 목록
export const getUserLikedMovies = async () => {
  try {
    const response = await apiRequest('/cinememory/movies/user/liked/')
    return response
  } catch (error) {
    console.error('❌ getUserLikedMovies 오류:', error)
    throw error
  }
}

// 사용자가 작성한 리뷰 목록
export const getUserReviews = async () => {
  try {
    const response = await apiRequest('/cinememory/movies/user/reviews/')
    return response
  } catch (error) {
    console.error('❌ getUserReviews 오류:', error)
    throw error
  }
}

// 사용자가 좋아요한 배우 목록
export const getUserLikedActors = async () => {
  try {
    const response = await apiRequest('/cinememory/movies/user/liked-actors/')
    return response
  } catch (error) {
    console.error('❌ getUserLikedActors 오류:', error)
    throw error
  }
}

// 사용자가 좋아요한 감독 목록
export const getUserLikedDirectors = async () => {
  try {
    const response = await apiRequest(
      '/cinememory/movies/user/liked-directors/'
    )
    return response
  } catch (error) {
    console.error('❌ getUserLikedDirectors 오류:', error)
    throw error
  }
}

// 사용자가 작성한 게시글 목록
export const getUserPosts = async () => {
  try {
    const response = await apiRequest('/cinememory/community/user/posts/')

    // 게시글 데이터 변환
    const transformedPosts = Array.isArray(response.posts)
      ? response.posts.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: {
            id: post.user_id || post.user,
            username: post.username || '사용자'
          },
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          is_liked: post.is_liked || false,
          created_at: post.created_at,
          updated_at: post.updated_at,
          tags: Array.isArray(post.tags)
            ? post.tags.map((tag) => (typeof tag === 'object' ? tag.name : tag))
            : []
        }))
      : []

    return {
      posts: transformedPosts,
      count: response.count || transformedPosts.length
    }
  } catch (error) {
    console.error('❌ getUserPosts 오류:', error)
    throw error
  }
}

// 사용자가 작성한 댓글 목록
export const getUserComments = async () => {
  try {
    const response = await apiRequest('/cinememory/community/user/comments/')
    return response
  } catch (error) {
    console.error('❌ getUserComments 오류:', error)
    throw error
  }
}

// 사용자가 좋아요한 게시글 목록
export const getUserLikedPosts = async () => {
  try {
    const response = await apiRequest('/cinememory/community/user/liked-posts/')

    // 게시글 데이터 변환
    const transformedPosts = Array.isArray(response.liked_posts)
      ? response.liked_posts.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: {
            id: post.user_id || post.user,
            username: post.username || '사용자'
          },
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          is_liked: true, // 좋아요한 게시글이므로 항상 true
          created_at: post.created_at,
          updated_at: post.updated_at,
          tags: Array.isArray(post.tags)
            ? post.tags.map((tag) => (typeof tag === 'object' ? tag.name : tag))
            : []
        }))
      : []

    return {
      liked_posts: transformedPosts,
      count: response.count || transformedPosts.length
    }
  } catch (error) {
    console.error('❌ getUserLikedPosts 오류:', error)
    throw error
  }
}

// 팔로우/언팔로우 토글
export const followUser = async (userId) => {
  const response = await apiRequest(`/accounts/${userId}/follow/`, {
    method: 'POST'
  })
  return response
}

// 다른 사용자 프로필 조회 (팔로우 정보 포함)
export const getUserProfile = async (userId) => {
  const response = await apiRequest(`/accounts/${userId}/`)
  return response
}

// 팔로워 목록 조회
export const getFollowers = async (userId) => {
  const response = await apiRequest(`/accounts/${userId}/followers/`)
  return response
}

// 팔로잉 목록 조회
export const getFollowing = async (userId) => {
  const response = await apiRequest(`/accounts/${userId}/following/`)
  return response
}

// username으로 사용자 조회
export const getUserByUsername = async (username) => {
  const response = await apiRequest(`/accounts/username/${username}/`)
  return response
}
