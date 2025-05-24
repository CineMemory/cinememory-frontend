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
  const isLoading = ref(false)
  const isLoadingComments = ref(false)
  const error = ref(null)

  // 페이지네이션 관련
  const currentPage = ref(1)
  const totalCount = ref(0)
  const hasNextPage = ref(false)
  const hasPreviousPage = ref(false)

  // 필터링/정렬 관련
  const sortBy = ref('latest') // 'latest', 'popular'
  const searchQuery = ref('')
  const selectedTags = ref([])

  // 📊 계산된 속성
  const filteredPosts = computed(() => {
    let filtered = [...posts.value]

    // 검색어 필터링
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      )
    }

    // 태그 필터링
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.value.some((tag) => post.tags.includes(tag))
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

  // 📝 게시글 관련 액션
  const fetchPosts = async (page = 1, limit = 10, sort = 'latest') => {
    try {
      isLoading.value = true
      clearError()

      const response = await communityAPI.getPosts(page, limit, sort)

      posts.value = response.results
      currentPage.value = page
      totalCount.value = response.count
      hasNextPage.value = !!response.next
      hasPreviousPage.value = !!response.previous
      sortBy.value = sort

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const fetchPost = async (postId) => {
    try {
      isLoading.value = true
      clearError()

      const post = await communityAPI.getPost(postId)
      currentPost.value = post

      return { success: true, post }
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

      const newPost = await communityAPI.createPost(postData)

      // 새 게시글을 목록 맨 앞에 추가
      posts.value.unshift(newPost)
      totalCount.value += 1

      return { success: true, post: newPost }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글 작성에 실패했습니다.'
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

      const updatedPost = await communityAPI.updatePost(postId, postData)

      // 게시글 목록에서 업데이트
      const index = posts.value.findIndex(
        (post) => post.id === parseInt(postId)
      )
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      // 현재 게시글이 업데이트된 게시글이면 교체
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value = updatedPost
      }

      return { success: true, post: updatedPost }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글 수정에 실패했습니다.'
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
      totalCount.value -= 1

      // 현재 게시글이 삭제된 게시글이면 초기화
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value = null
      }

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '게시글 삭제에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 💬 댓글 관련 액션
  const fetchComments = async (postId) => {
    try {
      isLoadingComments.value = true
      clearError()

      const commentsData = await communityAPI.getComments(postId)
      comments.value = commentsData

      return { success: true, comments: commentsData }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '댓글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoadingComments.value = false
    }
  }

  const createComment = async (postId, commentData) => {
    try {
      clearError()

      const newComment = await communityAPI.createComment(postId, commentData)

      // 대댓글인 경우 부모 댓글의 replies에 추가
      if (commentData.parent_pk) {
        const parentComment = comments.value.find(
          (c) => c.id === commentData.parent_pk
        )
        if (parentComment) {
          parentComment.replies.push(newComment)
        }
      } else {
        // 최상위 댓글인 경우 댓글 목록에 추가
        comments.value.push(newComment)
      }

      // 현재 게시글의 댓글 수 증가
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value.comment_count += 1
      }

      // 게시글 목록에서도 댓글 수 업데이트
      const postIndex = posts.value.findIndex(
        (post) => post.id === parseInt(postId)
      )
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count += 1
      }

      return { success: true, comment: newComment }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '댓글 작성에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteComment = async (commentId, postId) => {
    try {
      clearError()

      await communityAPI.deleteComment(commentId)

      // 댓글 목록에서 제거 (대댓글도 함께 처리)
      comments.value = comments.value.filter((comment) => {
        if (comment.id === commentId) {
          return false
        }
        // 대댓글에서도 제거
        comment.replies = comment.replies.filter(
          (reply) => reply.id !== commentId
        )
        return true
      })

      // 현재 게시글의 댓글 수 감소
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value.comment_count -= 1
      }

      // 게시글 목록에서도 댓글 수 업데이트
      const postIndex = posts.value.findIndex(
        (post) => post.id === parseInt(postId)
      )
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count -= 1
      }

      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '댓글 삭제에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // ❤️ 좋아요 관련 액션
  const togglePostLike = async (postId) => {
    try {
      clearError()

      const result = await communityAPI.togglePostLike(postId)

      // 현재 게시글의 좋아요 상태 업데이트
      if (currentPost.value?.id === parseInt(postId)) {
        currentPost.value.like_count = result.like_count
        currentPost.value.is_liked = result.is_liked
      }

      // 게시글 목록에서도 좋아요 수 업데이트
      const postIndex = posts.value.findIndex(
        (post) => post.id === parseInt(postId)
      )
      if (postIndex !== -1) {
        posts.value[postIndex].like_count = result.like_count
        posts.value[postIndex].is_liked = result.is_liked
      }

      return { success: true, ...result }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '좋아요 처리에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
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

  // 🏷️ 태그 관련 액션
  const fetchTags = async () => {
    try {
      const tagsData = await communityAPI.getTags()
      tags.value = tagsData
      return { success: true, tags: tagsData }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '태그를 불러오는데 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // 🔍 검색/필터 관련 액션
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setSelectedTags = (tagList) => {
    selectedTags.value = tagList
  }

  const setSortBy = (sort) => {
    sortBy.value = sort
  }

  // 🧹 초기화 함수
  const resetStore = () => {
    posts.value = []
    currentPost.value = null
    comments.value = []
    error.value = null
    currentPage.value = 1
    totalCount.value = 0
    hasNextPage.value = false
    hasPreviousPage.value = false
    searchQuery.value = ''
    selectedTags.value = []
    sortBy.value = 'latest'
  }

  const resetCurrentPost = () => {
    currentPost.value = null
    comments.value = []
  }

  return {
    // 상태
    posts,
    currentPost,
    comments,
    tags,
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

    // 계산된 속성
    filteredPosts,
    isAuthenticated,

    // 게시글 액션
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,

    // 댓글 액션
    fetchComments,
    createComment,
    deleteComment,

    // 좋아요 액션
    togglePostLike,
    toggleMovieLike,
    toggleDirectorLike,
    toggleActorLike,

    // 태그 액션
    fetchTags,

    // 검색/필터 액션
    setSearchQuery,
    setSelectedTags,
    setSortBy,

    // 유틸리티
    clearError,
    resetStore,
    resetCurrentPost
  }
})
