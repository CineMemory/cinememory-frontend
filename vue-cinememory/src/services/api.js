// 🌐 API 통신 서비스
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// 커뮤니티 더미 데이터 import (수정된 부분)
let communityFixtures = null

// 더미 데이터 동적 로드
const loadCommunityFixtures = async () => {
  if (!communityFixtures) {
    try {
      const module = await import('@/data/community_fixtures.json')
      communityFixtures = module.default
      console.log('✅ 커뮤니티 더미 데이터 로드 성공:', communityFixtures)
    } catch (error) {
      console.error('❌ 커뮤니티 더미 데이터 로드 실패:', error)
      communityFixtures = {
        posts: [],
        comments: [],
        like_posts: [],
        like_movies: [],
        like_directors: [],
        like_actors: [],
        tags: [],
        post_tags: []
      }
    }
  }
  return communityFixtures
}

// 더미 데이터에서 필요한 데이터 추출 및 가공 (수정된 부분)
const processFixtures = async () => {
  const fixtures = await loadCommunityFixtures()
  
  const posts = fixtures.posts || []
  const comments = fixtures.comments || []
  const likePosts = fixtures.like_posts || []
  const likeMovies = fixtures.like_movies || []
  const likeDirectors = fixtures.like_directors || []
  const likeActors = fixtures.like_actors || []
  const tags = fixtures.tags || []
  const postTags = fixtures.post_tags || []

  console.log('📊 처리된 데이터:', { 
    posts: posts.length, 
    comments: comments.length, 
    tags: tags.length 
  })

  return { posts, comments, likePosts, likeMovies, likeDirectors, likeActors, tags, postTags }
}

// API 요청 헬퍼 함수 (기존 코드 그대로)
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

// 🏘️ 커뮤니티 관련 API (수정된 부분)

// 게시글 목록 조회
export const getPosts = async (page = 1, limit = 10, sortBy = 'latest') => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      const { posts, tags, postTags } = await processFixtures()
      
      console.log('🔍 getPosts 호출됨:', { page, limit, sortBy })
      console.log('📋 사용 가능한 게시글:', posts.length)
      
      // 게시글에 태그 정보 추가
      const postsWithTags = posts.map(post => {
        const postTagRelations = postTags.filter(pt => pt.fields.post_pk === post.pk)
        const postTagIds = postTagRelations.map(pt => pt.fields.tag_pk)
        const postTagList = tags.filter(tag => postTagIds.includes(tag.pk))
        
        return {
          ...post.fields,
          id: post.pk,
          tags: postTagList.map(tag => tag.fields.tag_name),
          author: {
            id: post.fields.user_pk,
            username: `user${post.fields.user_pk}`
          }
        }
      })

      console.log('✅ 처리된 게시글:', postsWithTags.length)

      // 정렬
      let sortedPosts = [...postsWithTags]
      if (sortBy === 'latest') {
        sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else if (sortBy === 'popular') {
        sortedPosts.sort((a, b) => b.like_count - a.like_count)
      }

      // 페이지네이션
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPosts = sortedPosts.slice(startIndex, endIndex)

      const result = {
        results: paginatedPosts,
        count: sortedPosts.length,
        next: endIndex < sortedPosts.length ? page + 1 : null,
        previous: page > 1 ? page - 1 : null
      }

      console.log('📤 반환할 결과:', result)
      return result
      
    } catch (error) {
      console.error('❌ getPosts 오류:', error)
      throw {
        response: {
          status: 500,
          data: { message: '게시글을 불러오는 중 오류가 발생했습니다.' }
        }
      }
    }
  }

  return await apiRequest(`/community/posts/?page=${page}&limit=${limit}&sort=${sortBy}`)
}

// 개별 게시글 조회
export const getPost = async (postId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const { posts, tags, postTags, comments } = await processFixtures()
      
      console.log('🔍 getPost 호출됨:', { postId })
      
      // postId를 숫자로 변환
      const numericPostId = parseInt(postId)
      
      // 해당 ID의 게시글 찾기
      const post = posts.find(p => p.pk === numericPostId)
      
      if (!post) {
        throw {
          response: {
            status: 404,
            data: { message: '게시글을 찾을 수 없습니다.' }
          }
        }
      }
      
      // 태그 정보 추가
      const postTagRelations = postTags.filter(pt => pt.fields.post_pk === post.pk)
      const postTagIds = postTagRelations.map(pt => pt.fields.tag_pk)
      const postTagList = tags.filter(tag => postTagIds.includes(tag.pk))
      
      // 댓글 수 계산
      const postComments = comments.filter(c => c.fields.post_pk === post.pk)
      
      const result = {
        ...post.fields,
        id: post.pk,
        tags: postTagList.map(tag => tag.fields.tag_name),
        author: {
          id: post.fields.user_pk,
          username: `user${post.fields.user_pk}`
        },
        comment_count: postComments.length,
        is_liked: false, // 더미 데이터에서는 좋아요 상태를 false로 설정
        view_count: 0 // 더미 데이터에서는 조회수를 0으로 설정
      }
      
      console.log('✅ 게시글 조회 성공:', result)
      return result
      
    } catch (error) {
      console.error('❌ getPost 오류:', error)
      throw error
    }
  }

  return await apiRequest(`/community/posts/${postId}/`)
}

// 게시글 작성
export const createPost = async (postData) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 더미 데이터에서는 실제 생성은 하지 않고 시뮬레이션만
    const newPost = {
      id: Math.floor(Math.random() * 10000) + 1000,
      title: postData.title,
      content: postData.content,
      tags: postData.tags || [],
      author: {
        id: 1, // 더미 사용자 ID
        username: 'user1'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      is_liked: false,
      view_count: 0
    }
    
    console.log('✅ 게시글 작성 시뮬레이션:', newPost)
    return newPost
  }

  return await apiRequest('/community/posts/', {
    method: 'POST',
    body: JSON.stringify(postData)
  })
}

// 게시글 수정
export const updatePost = async (postId, postData) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 더미 데이터에서는 실제 수정은 하지 않고 시뮬레이션만
    const updatedPost = {
      id: parseInt(postId),
      title: postData.title,
      content: postData.content,
      tags: postData.tags || [],
      author: {
        id: 1, // 더미 사용자 ID
        username: 'user1'
      },
      created_at: '2024-12-15T10:30:00Z', // 더미 생성 시간
      updated_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      is_liked: false,
      view_count: 0
    }
    
    console.log('✅ 게시글 수정 시뮬레이션:', updatedPost)
    return updatedPost
  }

  return await apiRequest(`/community/posts/${postId}/`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  })
}

// 게시글 삭제
export const deletePost = async (postId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ 게시글 삭제 시뮬레이션:', postId)
    return { message: '게시글이 삭제되었습니다.' }
  }

  return await apiRequest(`/community/posts/${postId}/`, {
    method: 'DELETE'
  })
}

// 댓글 목록 조회
export const getComments = async (postId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    try {
      const { comments } = await processFixtures()
      
      // 해당 게시글의 댓글들 필터링
      const postComments = comments.filter(c => c.fields.post_pk === parseInt(postId))
      
      // 댓글 데이터 가공
      const processedComments = postComments.map(comment => ({
        id: comment.pk,
        content: comment.fields.content,
        created_at: comment.fields.created_at,
        author: {
          id: comment.fields.user_pk,
          username: `user${comment.fields.user_pk}`
        },
        parent_id: comment.fields.parent_pk,
        replies: []
      }))
      
      // 대댓글 구조 생성
      const topLevelComments = processedComments.filter(c => !c.parent_id)
      const replies = processedComments.filter(c => c.parent_id)
      
      topLevelComments.forEach(comment => {
        comment.replies = replies.filter(r => r.parent_id === comment.id)
      })
      
      console.log('✅ 댓글 조회 성공:', topLevelComments)
      return topLevelComments
      
    } catch (error) {
      console.error('❌ getComments 오류:', error)
      throw {
        response: {
          status: 500,
          data: { message: '댓글을 불러오는 중 오류가 발생했습니다.' }
        }
      }
    }
  }

  return await apiRequest(`/community/posts/${postId}/comments/`)
}

// 댓글 작성
export const createComment = async (postId, commentData) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const newComment = {
      id: Math.floor(Math.random() * 10000) + 1000,
      content: commentData.content,
      created_at: new Date().toISOString(),
      author: {
        id: 1, // 더미 사용자 ID
        username: 'user1'
      },
      parent_id: commentData.parent_pk || null,
      replies: []
    }
    
    console.log('✅ 댓글 작성 시뮬레이션:', newComment)
    return newComment
  }

  return await apiRequest(`/community/posts/${postId}/comments/`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  })
}

// 댓글 삭제
export const deleteComment = async (commentId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ 댓글 삭제 시뮬레이션:', commentId)
    return { message: '댓글이 삭제되었습니다.' }
  }

  return await apiRequest(`/community/comments/${commentId}/`, {
    method: 'DELETE'
  })
}

// 게시글 좋아요 토글
export const togglePostLike = async (postId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 더미 데이터에서는 간단한 토글 시뮬레이션
    const isLiked = Math.random() > 0.5
    const likeCount = Math.floor(Math.random() * 50) + 1
    
    const result = {
      is_liked: isLiked,
      like_count: likeCount
    }
    
    console.log('✅ 좋아요 토글 시뮬레이션:', result)
    return result
  }

  return await apiRequest(`/community/posts/${postId}/like/`, {
    method: 'POST'
  })
}

// 영화 좋아요 토글
export const toggleMovieLike = async (movieId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const result = {
      is_liked: Math.random() > 0.5,
      like_count: Math.floor(Math.random() * 100) + 1
    }
    
    console.log('✅ 영화 좋아요 토글 시뮬레이션:', result)
    return result
  }

  return await apiRequest(`/community/movies/${movieId}/like/`, {
    method: 'POST'
  })
}

// 감독 좋아요 토글
export const toggleDirectorLike = async (directorId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const result = {
      is_liked: Math.random() > 0.5,
      like_count: Math.floor(Math.random() * 50) + 1
    }
    
    console.log('✅ 감독 좋아요 토글 시뮬레이션:', result)
    return result
  }

  return await apiRequest(`/community/directors/${directorId}/like/`, {
    method: 'POST'
  })
}

// 배우 좋아요 토글
export const toggleActorLike = async (actorId) => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const result = {
      is_liked: Math.random() > 0.5,
      like_count: Math.floor(Math.random() * 50) + 1
    }
    
    console.log('✅ 배우 좋아요 토글 시뮬레이션:', result)
    return result
  }

  return await apiRequest(`/community/actors/${actorId}/like/`, {
    method: 'POST'
  })
}

// 태그 목록 조회
export const getTags = async () => {
  if (import.meta.env.MODE === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const { tags } = await processFixtures()
      
      const result = tags.map(tag => ({
        id: tag.pk,
        name: tag.fields.tag_name
      }))
      
      console.log('✅ 태그 조회 성공:', result)
      return result
      
    } catch (error) {
      console.error('❌ getTags 오류:', error)
      throw {
        response: {
          status: 500,
          data: { message: '태그를 불러오는 중 오류가 발생했습니다.' }
        }
      }
    }
  }

  return await apiRequest('/community/tags/')
}