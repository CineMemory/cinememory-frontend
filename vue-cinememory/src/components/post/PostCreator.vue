<!-- 게시글 작성기 -->
<template>
  <div class="post-creator">
    <form
      class="post-creator__form"
      @submit.prevent="handleSubmit">
      <!-- 제목 입력 -->
      <div class="post-creator__field">
        <PostCreatorTitle
          v-model="formData.title"
          :error-message="errors.title"
          @input="clearFieldError('title')" />
      </div>

      <!-- 내용 입력 -->
      <div class="post-creator__field">
        <PostCreatorContent
          v-model="formData.content"
          :error-message="errors.content"
          @input="clearFieldError('content')" />
      </div>

      <!-- 태그 선택 -->
      <div class="post-creator__field">
        <PostCreatorTags
          v-model="formData.tags"
          :available-tags="availableTags"
          @tags-changed="handleTagsChanged" />
      </div>

      <!-- 미리보기 -->
      <div
        v-if="showPreview"
        class="post-creator__field">
        <PostCreatorPreview
          :title="formData.title"
          :content="formData.content"
          :tags="formData.tags"
          :author="currentUser" />
      </div>

      <!-- 액션 버튼들 -->
      <div class="post-creator__actions">
        <div class="post-creator__actions-left">
          <BaseButton
            type="button"
            variant="ghost"
            icon-left="eye"
            @click="togglePreview">
            {{ showPreview ? '미리보기 숨기기' : '미리보기' }}
          </BaseButton>
        </div>

        <div class="post-creator__actions-right">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCancel">
            취소
          </BaseButton>

          <BaseButton
            type="submit"
            variant="primary"
            icon-left="send"
            :loading="isSubmitting"
            :disabled="!isFormValid">
            {{ isEditing ? '수정하기' : '게시하기' }}
          </BaseButton>
        </div>
      </div>
    </form>

    <!-- 나가기 확인 모달 -->
    <BaseModal
      v-model="showExitConfirm"
      title="작성 중인 내용이 있습니다"
      size="small">
      <p>작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?</p>

      <template #footer>
        <div class="post-creator__modal-actions">
          <BaseButton
            variant="secondary"
            @click="showExitConfirm = false">
            계속 작성
          </BaseButton>
          <BaseButton
            variant="danger"
            @click="confirmExit">
            나가기
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useCommunityStore } from '@/stores/community'
  import PostCreatorTitle from './PostCreatorTitle.vue'
  import PostCreatorContent from './PostCreatorContent.vue'
  import PostCreatorTags from './PostCreatorTags.vue'
  import PostCreatorPreview from './PostCreatorPreview.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  const props = defineProps({
    editingPost: {
      type: Object,
      default: null
    }
  })

  const emit = defineEmits(['post-created', 'post-updated', 'cancel'])

  const router = useRouter()
  const route = useRoute()
  const { isAuthenticated, user: currentUser } = useAuth()
  const communityStore = useCommunityStore()

  // 로컬 상태
  const formData = ref({
    title: '',
    content: '',
    tags: []
  })

  const errors = ref({
    title: null,
    content: null
  })

  const isSubmitting = ref(false)
  const showPreview = ref(false)
  const showExitConfirm = ref(false)
  const hasUnsavedChanges = ref(false)

  // 계산된 속성
  const isEditing = computed(() => !!props.editingPost)
  const availableTags = computed(() => {
    // 새로운 구조: popularTags에서 태그명 추출
    return communityStore.popularTags.map((tag) => tag.name) || []
  })

  const isFormValid = computed(() => {
    return (
      formData.value.title.trim().length > 0 &&
      formData.value.content.trim().length > 0 &&
      !errors.value.title &&
      !errors.value.content
    )
  })

  // 초기 데이터 설정
  onMounted(async () => {
    // 인증 확인
    if (!isAuthenticated.value) {
      router.push({
        name: 'Auth',
        query: { mode: 'login', redirect: route.fullPath }
      })
      return
    }

    // 커뮤니티 홈 데이터 로드 (인기 태그 포함)
    await communityStore.fetchCommunityHome()

    // 수정 모드인 경우 기존 데이터 로드
    if (isEditing.value && props.editingPost) {
      formData.value = {
        title: props.editingPost.title || props.editingPost.post_title || '',
        content: props.editingPost.content || '',
        tags: [...(props.editingPost.tags || [])]
      }
    }

    // 페이지 떠나기 방지
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // 폼 데이터 변경 감시
  watch(
    formData,
    () => {
      hasUnsavedChanges.value = true
    },
    { deep: true }
  )

  // 페이지 떠나기 전 확인
  const handleBeforeUnload = (event) => {
    if (hasUnsavedChanges.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  // 폼 제출
  const handleSubmit = async () => {
    if (!isFormValid.value || isSubmitting.value) return

    // 유효성 검사
    if (!validateForm()) return

    try {
      isSubmitting.value = true
      let result

      if (isEditing.value) {
        // 수정
        const postId = props.editingPost.id || props.editingPost.post_id
        result = await communityStore.updatePost(postId, formData.value)

        if (result.success) {
          emit('post-updated', result.post || result)
          hasUnsavedChanges.value = false

          // 성공 메시지 표시
          if (result.message) {
            alert(result.message)
          }

          router.push({
            name: 'PostDetail',
            params: { id: postId }
          })
        }
      } else {
        // 새 게시글 작성
        result = await communityStore.createPost(formData.value)

        if (result.success) {
          emit('post-created', result.post || result)
          hasUnsavedChanges.value = false

          // 성공 메시지 표시
          if (result.message) {
            alert(result.message)
          } else {
            alert('게시글이 성공적으로 작성되었습니다!')
          }

          // 커뮤니티 페이지로 이동 (새로운 구조에서는 post_id만 반환)
          router.push({ name: 'Community' })
        }
      }

      if (!result.success) {
        console.error('❌ 게시글 저장 실패:', result.error)
        alert(result.error || '게시글 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 게시글 저장 중 오류:', error)
      alert('게시글 저장 중 오류가 발생했습니다.')
    } finally {
      isSubmitting.value = false
    }
  }

  // 폼 유효성 검사
  const validateForm = () => {
    let isValid = true

    // 제목 검사
    if (!formData.value.title.trim()) {
      errors.value.title = '제목을 입력해주세요.'
      isValid = false
    } else if (formData.value.title.trim().length < 2) {
      errors.value.title = '제목은 2글자 이상 입력해주세요.'
      isValid = false
    } else if (formData.value.title.trim().length > 100) {
      errors.value.title = '제목은 100글자 이하로 입력해주세요.'
      isValid = false
    }

    // 내용 검사
    if (!formData.value.content.trim()) {
      errors.value.content = '내용을 입력해주세요.'
      isValid = false
    } else if (formData.value.content.trim().length < 10) {
      errors.value.content = '내용은 10글자 이상 입력해주세요.'
      isValid = false
    } else if (formData.value.content.trim().length > 5000) {
      errors.value.content = '내용은 5000글자 이하로 입력해주세요.'
      isValid = false
    }

    return isValid
  }

  // 필드 에러 초기화
  const clearFieldError = (fieldName) => {
    if (errors.value[fieldName]) {
      errors.value[fieldName] = null
    }
  }

  // 미리보기 토글
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  // 태그 변경 처리
  const handleTagsChanged = (tags) => {
    formData.value.tags = tags
  }

  // 취소 처리
  const handleCancel = () => {
    if (hasUnsavedChanges.value) {
      showExitConfirm.value = true
    } else {
      confirmExit()
    }
  }

  // 나가기 확인
  const confirmExit = () => {
    hasUnsavedChanges.value = false
    showExitConfirm.value = false
    emit('cancel')

    if (isEditing.value && props.editingPost) {
      const postId = props.editingPost.id || props.editingPost.post_id
      router.push({ name: 'PostDetail', params: { id: postId } })
    } else {
      router.push({ name: 'Community' })
    }
  }
</script>

<style scoped>
  @import '@/assets/colors.css';
  @import '@/assets/fonts.css';

  .post-creator {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-creator__form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .post-creator__field {
    width: 100%;
  }

  .post-creator__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-inactive-icon);
  }

  .post-creator__actions-left {
    display: flex;
    gap: 8px;
  }

  .post-creator__actions-right {
    display: flex;
    gap: 8px;
  }

  .post-creator__modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .post-creator {
      padding: 16px 12px;
    }

    .post-creator__form {
      gap: 20px;
    }

    .post-creator__actions {
      flex-direction: column;
      gap: 12px;
    }

    .post-creator__actions-left,
    .post-creator__actions-right {
      width: 100%;
      justify-content: center;
    }

    .post-creator__actions-right {
      flex-direction: column-reverse;
    }
  }
</style>
