// 🏘️ 커뮤니티 관련 Pinia 스토어
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as communityAPI from '@/services/api'

export const useCommunityStore = defineStore('community', () => {
  // 🗂️ 상태
  const posts = ref([])
  const currentPost = ref(null)
  const comments = ref([])
  const tags = ref([])
  const popularTags = ref([])
  const isLoading = ref(false)
  const isLoadingComments = ref(false)
  const error = ref(null)

  // 페이지네이션 관련
  const currentPage = ref(1)
  const totalCount = ref(0)
  const hasNextPage = ref(false)
  const hasPreviousPage = ref(false)

  // 필터링/정렬 관련
  const sortBy = ref('latest')
  const searchQuery = ref('')
  const selectedTags = ref([])
  const currentTagFilter = ref(null) // 현재 선택된 태그 필터

  // 📊 계산된 속성
  const filteredPosts = computed(() => {
    let filtered = [...posts.value]

    // 검색어 필터링
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
      )
    }

    // 태그 필터링 (로컬 필터링 - 추가 필터링용)
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.value.some((tag) => post.tags?.includes(tag))
      )
    }

    return filtered
  })

  const isAuthenticated = computed(() => {
    // 인증 스토어에서 로그인 상태 확인
    const token = localStorage.getItem('token')
    return !!token
  })

  // 🧹 유틸리티 함수
  const clearError = () => {
    error.value = null
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // 🏠 커뮤니티 홈 관련 액션
  const fetchCommunityHome = async () => {
    try {
      isLoading.value = true
      clearError()

      console.log('🏠 커뮤니티 홈 데이터 요청 중...')
      const response = await communityAPI.getCommunityHome()

      if (response.status === 'success') {
        // 최신 게시글 업데이트
        posts.value = response.data.recent_posts || []

        // 인기 태그 업데이트
        popularTags.value = response.data.popular_tags || []

        // 페이지네이션 초기화 (홈에서는 고정된 10개)
        currentPage.value = 1
        totalCount.value = posts.value.length
        hasNextPage.value = false
        hasPreviousPage.value = false

        // 태그 필터 초기화
        currentTagFilter.value = null

        console.log('✅ 커뮤니티 홈 데이터 로드 성공:', {
          posts: posts.value.length,
          popularTags: popularTags.value.length
        })

        return { success: true }
      } else {
        throw new Error('응답 상태가 success가 아닙니다.')
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        '커뮤니티 홈 데이터를 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('❌ 커뮤니티 홈 데이터 로드 실패:', err)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 🏷️ 태그별 게시글 조회
  const fetchPostsByTag = async (tagName, page = 1, limit = 10) => {
    try {
      isLoading.value = true
      clearError()

      console.log('🏷️ 태그별 게시글 요청 중...', { tagName, page, limit })
      const response = await communityAPI.getPostsByTag(tagName, page, limit)

      if (response.status === 'success') {
        posts.value = response.data.posts || []

        // 페이지네이션 정보 업데이트
        const pagination = response.data.pagination || {}
        currentPage.value = pagination.current_page || 1
        totalCount.value = pagination.total_count || 0
        hasNextPage.value = pagination.has_next || false
        hasPreviousPage.value = pagination.has_previous || false

        // 현재 태그 필터 설정
        currentTagFilter.value = tagName

        console.log('✅ 태그별 게시글 로드 성공:', {
          tag: tagName,
          posts: posts.value.length,
          pagination
        })

        return { success: true }
      } else {
        throw new Error('응답 상태가 success가 아닙니다.')
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        '태그별 게시글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('❌ 태그별 게시글 로드 실패:', err)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 게시글 관련 액션 (기존 코드 유지)
  const fetchPosts = async (page = 1, limit = 10, sort = 'latest') => {
    try {
      isLoading.value = true
      clearError()

      console.log('🔄 fetchPosts 호출:', { page, limit, sort })

      const response = await communityAPI.getPosts(page, limit, sort)

      posts.value = response.results || []
      currentPage.value = page
      totalCount.value = response.count || 0
      hasNextPage.value = !!response.next
      hasPreviousPage.value = !!response.previous
      sortBy.value = sort

      // 태그 필터 초기화
      currentTagFilter.value = null

      console.log('✅ fetchPosts 성공:', {
        sort,
        postsCount: posts.value.length,
        firstPostTitle: posts.value[0]?.title
      })

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('❌ fetchPosts 실패:', err)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 📝 게시글 관련 액션 (새로운 API 구조에 맞춰 수정)
  const fetchPost = async (postId) => {
    try {
      isLoading.value = true
      clearError()

      const response = await communityAPI.getPost(postId)

      console.log('🔍 fetchPost 응답 확인:', response)

      // API에서 이미 변환된 데이터 처리
      if (response.status === 'success') {
        const postData = response.data

        // API에서 이미 변환된 데이터를 그대로 사용
        currentPost.value = {
          id: postData.post_id,
          title: postData.post_title,
          content: postData.content,
          author: postData.author, // API에서 이미 객체로 변환됨
          like_count: postData.like_count,
          comment_count: postData.comment_count,
          is_liked: postData.is_liked,
          created_at: postData.created_at,
          updated_at: postData.updated_at,
          tags: postData.tags // API에서 이미 문자열 배열로 변환됨
        }

        // 댓글도 함께 설정 (계층형 구조 그대로 사용)
        comments.value = postData.comments || []

        return { success: true, post: currentPost.value }
      } else {
        // 레거시 응답 형태 처리 (하위 호환성)
        currentPost.value = response
        return { success: true, post: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const createPost = async (postData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await communityAPI.createPost(postData)

      // 새로운 API 응답 구조 처리
      if (response.message) {
        // 게시글 생성 성공 - 커뮤니티 홈 새로고침하여 최신 게시글 반영
        await fetchCommunityHome()

        return {
          success: true,
          message: response.message,
          post_id: response.post_id
        }
      } else {
        // 레거시 응답 처리
        posts.value.unshift(response)
        totalCount.value += 1
        return { success: true, post: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '게시글 작성에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const updatePost = async (postId, postData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await communityAPI.updatePost(postId, postData)

      // 새로운 API 응답 구조 처리
      if (response.message) {
        // 수정 성공 - 현재 게시글 다시 로드
        if (currentPost.value?.id === parseInt(postId)) {
          await fetchPost(postId)
        }

        // 게시글 목록도 새로고침
        await fetchCommunityHome()

        return {
          success: true,
          message: response.message,
          updated_at: response.updated_at
        }
      } else {
        // 레거시 응답 처리
        const index = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (index !== -1) {
          posts.value[index] = response
        }

        if (currentPost.value?.id === parseInt(postId)) {
          currentPost.value = response
        }

        return { success: true, post: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '게시글 수정에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const deletePost = async (postId) => {
    try {
      isLoading.value = true
      clearError()

      await communityAPI.deletePost(postId)

      // 게시글 목록에서 제거
      posts.value = posts.value.filter((post) => post.id !== parseInt(postId))
      totalCount.value = Math.max(0, totalCount.value - 1)

      // 현재 게시글이 삭제된 게시글이면 초기화
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value = null
        comments.value = []
      }

      // 커뮤니티 홈 새로고침하여 최신 상태 반영
      await fetchCommunityHome()

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '게시글 삭제에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 💬 댓글 관련 액션 (새로운 API 구조에 맞춰 수정)
  const fetchComments = async (postId) => {
    try {
      isLoadingComments.value = true
      clearError()

      // 새로운 구조에서는 게시글 조회시 댓글도 함께 반환됨
      const response = await communityAPI.getPost(postId)

      if (response.status === 'success') {
        comments.value = response.data.comments || []
      } else {
        // 레거시 처리
        const commentsData = await communityAPI.getComments(postId)
        comments.value = commentsData
      }

      return { success: true, comments: comments.value }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '댓글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoadingComments.value = false
    }
  }

  const createComment = async (postId, commentData) => {
    try {
      clearError()

      const response = await communityAPI.createComment(postId, commentData)

      // 새로운 API 응답 구조 처리
      if (response.message) {
        // 댓글 생성 성공 - 게시글을 다시 로드하여 최신 댓글 반영
        await fetchPost(postId)

        // 게시글 목록에서도 댓글 수 증가
        const postIndex = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (postIndex !== -1) {
          posts.value[postIndex].comment_count =
            (posts.value[postIndex].comment_count || 0) + 1
        }

        return {
          success: true,
          message: response.message,
          comment: {
            id: response.comment_id,
            content: response.content,
            author: { id: response.user_id, username: response.author },
            created_at: response.created_at,
            updated_at: response.updated_at,
            replies: response.replies || []
          }
        }
      } else {
        // 레거시 응답 처리
        comments.value.push(response)

        // 현재 게시글의 댓글 수 증가
        if (currentPost.value?.id === parseInt(postId)) {
          currentPost.value.comment_count += 1
        }

        // 게시글 목록에서도 댓글 수 증가
        const postIndex = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (postIndex !== -1) {
          posts.value[postIndex].comment_count =
            (posts.value[postIndex].comment_count || 0) + 1
        }

        return { success: true, comment: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '댓글 작성에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createReply = async (postId, commentId, replyData) => {
    try {
      clearError()

      const response = await communityAPI.createReply(
        postId,
        commentId,
        replyData
      )

      // 새로운 API 응답 구조 처리
      if (response.message) {
        // 대댓글 생성 성공 - 게시글을 다시 로드하여 최신 댓글 반영
        await fetchPost(postId)

        // 게시글 목록에서도 댓글 수 증가 (대댓글도 댓글 수에 포함)
        const postIndex = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (postIndex !== -1) {
          posts.value[postIndex].comment_count =
            (posts.value[postIndex].comment_count || 0) + 1
        }

        return {
          success: true,
          message: response.message,
          reply: {
            id: response.comment_id,
            content: response.content,
            author: { id: response.user_id, username: response.author },
            created_at: response.created_at,
            updated_at: response.updated_at,
            parent_id: response.parent_id
          }
        }
      } else {
        // 레거시 처리 - 부모 댓글의 replies에 추가
        const parentComment = comments.value.find(
          (c) => c.id === parseInt(commentId)
        )
        if (parentComment) {
          parentComment.replies.push(response)
        }

        // 게시글 목록에서도 댓글 수 증가
        const postIndex = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (postIndex !== -1) {
          posts.value[postIndex].comment_count =
            (posts.value[postIndex].comment_count || 0) + 1
        }

        return { success: true, reply: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '대댓글 작성에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteComment = async (commentId, postId) => {
    try {
      clearError()

      await communityAPI.deleteComment(postId, commentId)

      // 댓글 삭제 성공 - 게시글을 다시 로드하여 최신 댓글 반영
      await fetchPost(postId)

      // 게시글 목록에서도 댓글 수 감소
      const postIndex = posts.value.findIndex(
        (post) => post.id === parseInt(postId)
      )
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count = Math.max(
          0,
          (posts.value[postIndex].comment_count || 0) - 1
        )
      }

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '댓글 삭제에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 좋아요 관련 액션
  const togglePostLike = async (postId) => {
    try {
      clearError()

      console.log('🎯 Store togglePostLike 시작:', postId)

      const result = await communityAPI.togglePostLike(postId)

      console.log('📤 Store togglePostLike API 결과:', result)

      if (result.success) {
        const { is_liked, like_count } = result

        // 현재 게시글의 좋아요 상태 업데이트
        if (currentPost.value?.id === parseInt(postId)) {
          currentPost.value.like_count = like_count
          currentPost.value.is_liked = is_liked
          console.log('✅ currentPost 좋아요 상태 업데이트:', {
            postId,
            like_count,
            is_liked
          })
        }

        // 게시글 목록에서도 좋아요 수 업데이트
        const postIndex = posts.value.findIndex(
          (post) => post.id === parseInt(postId)
        )
        if (postIndex !== -1) {
          posts.value[postIndex].like_count = like_count
          posts.value[postIndex].is_liked = is_liked
          console.log('✅ posts 배열 좋아요 상태 업데이트:', {
            postIndex,
            postId,
            like_count,
            is_liked
          })
        }

        return {
          success: true,
          is_liked,
          like_count,
          message: result.message
        }
      } else {
        console.error('❌ togglePostLike 실패:', result.error)
        return result
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '좋아요 처리에 실패했습니다.'

      console.error('❌ togglePostLike 에러:', err)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage,
        status: err.response?.status
      }
    }
  }

  const toggleMovieLike = async (movieId) => {
    try {
      clearError()
      return await communityAPI.toggleMovieLike(movieId)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '좋아요 처리에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const toggleDirectorLike = async (directorId) => {
    try {
      clearError()
      return await communityAPI.toggleDirectorLike(directorId)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '좋아요 처리에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const toggleActorLike = async (actorId) => {
    try {
      clearError()
      return await communityAPI.toggleActorLike(actorId)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '좋아요 처리에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 검색/필터 관련 액션
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setSelectedTags = (tagList) => {
    selectedTags.value = tagList
  }

  const setSortBy = (sort) => {
    sortBy.value = sort
  }

  // 태그 필터링 토글 (새로운 기능)
  const toggleTagFilter = async (tagName) => {
    if (currentTagFilter.value === tagName) {
      // 같은 태그를 다시 클릭하면 필터 해제 (홈으로 돌아가기)
      await fetchCommunityHome()
    } else {
      // 새로운 태그로 필터링
      await fetchPostsByTag(tagName)
    }
  }

  // 🧹 초기화 함수
  const resetStore = () => {
    posts.value = []
    currentPost.value = null
    comments.value = []
    tags.value = []
    popularTags.value = []
    error.value = null
    currentPage.value = 1
    totalCount.value = 0
    hasNextPage.value = false
    hasPreviousPage.value = false
    searchQuery.value = ''
    selectedTags.value = []
    sortBy.value = 'latest'
    currentTagFilter.value = null
  }

  const resetCurrentPost = () => {
    currentPost.value = null
    comments.value = []
  }

  // 태그로 게시글 필터링
  const setTagFilter = async (tagName) => {
    try {
      isLoading.value = true
      clearError()

      console.log('🏷️ 태그 필터링 시작:', tagName)

      const response = await communityAPI.getPostsByTag(tagName)
      console.log('📤 태그별 게시글 응답:', response)

      if (response && response.posts) {
        // 🔧 이미 변환된 데이터 사용
        posts.value = response.posts
        currentTagFilter.value = tagName

        console.log('✅ 태그 필터링 성공:', {
          tag: tagName,
          count: posts.value.length,
          firstPost: posts.value[0]?.author // 첫 번째 게시글 확인
        })
      }

      return { success: true }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        '태그별 게시글을 불러오는데 실패했습니다.'

      setError(errorMessage)
      console.error('❌ 태그 필터링 실패:', error)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 태그 필터 초기화
  const clearTagFilter = async () => {
    currentTagFilter.value = null
    await fetchCommunityHome()
  }

  // 태그 필터에 추가하는 함수
  const addTagToFilter = (tagName) => {
    if (!selectedTags.value.includes(tagName)) {
      selectedTags.value.push(tagName)
      console.log('✅ 태그 필터에 추가:', tagName, selectedTags.value)
    }
  }

  // 태그 필터에서 제거하는 함수
  const removeTagFromFilter = (tagName) => {
    const index = selectedTags.value.indexOf(tagName)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
      console.log('✅ 태그 필터에서 제거:', tagName, selectedTags.value)
    }
  }

  // 태그 목록 가져오기
  const fetchTags = async () => {
    try {
      const tagsData = await communityAPI.getTags()
      tags.value = tagsData || []
      console.log('✅ 태그 목록 로드:', tags.value)
      return { success: true, tags: tagsData }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '태그를 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 태그 필터 토글
  const toggleTagInFilter = (tagName) => {
    if (selectedTags.value.includes(tagName)) {
      removeTagFromFilter(tagName)
    } else {
      addTagToFilter(tagName)
    }
  }

  // 댓글 수정
  const updateComment = async (commentId, postId, commentData) => {
    try {
      clearError()

      const response = await communityAPI.updateComment(
        postId,
        commentId,
        commentData
      )

      if (response.message) {
        // 게시글을 다시 로드하여 최신 댓글 반영
        await fetchPost(postId)

        return {
          success: true,
          message: response.message,
          updated_at: response.updated_at
        }
      } else {
        return { success: true, comment: response }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '댓글 수정에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 댓글 좋아요 토글
  const toggleCommentLike = async (postId, commentId) => {
    try {
      clearError()

      const result = await communityAPI.toggleCommentLike(postId, commentId)

      if (result.success) {
        // 로컬 상태만 업데이트, 게시글 재로드 하지 않음
        return result
      } else {
        return result
      }
    } catch (err) {
      const errorMessage = '댓글 좋아요 처리에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 댓글 좋아요 상태 업데이트 헬퍼 함수
  const updateCommentLikeStatus = (comments, commentId, isLiked, likeCount) => {
    for (const comment of comments) {
      if (
        comment.id === parseInt(commentId) ||
        comment.comment_id === parseInt(commentId)
      ) {
        comment.is_liked = isLiked
        comment.like_count = likeCount
        return
      }
      // 대댓글에서도 찾기
      if (comment.replies && comment.replies.length > 0) {
        updateCommentLikeStatus(comment.replies, commentId, isLiked, likeCount)
      }
    }
  }

  // 커뮤니티 통계 조회
  const communityStats = ref({})
  const isLoadingStats = ref(false)
  const fetchCommunityStats = async () => {
    try {
      isLoadingStats.value = true
      clearError()

      const response = await communityAPI.getCommunityStats()

      if (response.success) {
        communityStats.value = response.data
        console.log('✅ 커뮤니티 통계 로드 성공:', communityStats.value)
        return { success: true, data: response.data }
      } else {
        throw new Error('통계 데이터 로드 실패')
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '통계를 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('❌ 커뮤니티 통계 로드 실패:', err)
      return { success: false, error: errorMessage }
    } finally {
      isLoadingStats.value = false
    }
  }

  return {
    // 상태
    posts,
    currentPost,
    comments,
    tags,
    popularTags,
    isLoading,
    isLoadingComments,
    error,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    sortBy,
    searchQuery,
    selectedTags,
    currentTagFilter,

    // 계산된 속성
    filteredPosts,
    isAuthenticated,

    // 커뮤니티 홈 액션
    fetchCommunityHome,
    fetchPostsByTag,

    // 게시글 액션
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,

    // 댓글 액션
    fetchComments,
    createComment,
    createReply,
    deleteComment,

    // 좋아요 액션
    togglePostLike,
    toggleMovieLike,
    toggleDirectorLike,
    toggleActorLike,

    // 태그 액션
    fetchTags,
    toggleTagFilter,

    // 검색/필터 액션
    setSearchQuery,
    setSelectedTags,
    setSortBy,

    // 유틸리티
    clearError,
    resetStore,
    resetCurrentPost,

    setTagFilter,
    clearTagFilter,

    addTagToFilter,
    removeTagFromFilter,
    toggleTagInFilter,

    // 댓글 액션에 updateComment 추가
    updateComment,

    toggleCommentLike,
    updateCommentLikeStatus,

    // 커뮤니티 통계 관련
    communityStats,
    isLoadingStats,
    fetchCommunityStats,

    // 🔧 현재 게시글 초기화 함수 추가
    resetCurrentPost: () => {
      currentPost.value = null
      comments.value = []
      error.value = null
    }
  }
})
