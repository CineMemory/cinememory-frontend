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

      <!-- 🔧 간단한 태그 입력으로 교체 -->
      <div class="post-creator__field">
        <label class="post-creator__label">태그 (선택사항)</label>
        <div class="post-creator__tag-input">
          <input
            v-model="newTagInput"
            type="text"
            placeholder="태그를 입력하고 Enter를 누르세요"
            class="post-creator__tag-field"
            @keydown.enter.prevent
            @keyup.enter.prevent="addTag"
            @blur="addTag" />
          <BaseButton
            type="button"
            variant="ghost"
            size="small"
            @click="addTag">
            추가
          </BaseButton>
        </div>
        
        <!-- 추가된 태그들 -->
        <div v-if="formData.tags.length > 0" class="post-creator__tags">
          <span
            v-for="(tag, index) in formData.tags"
            :key="index"
            class="post-creator__tag">
            #{{ tag }}
            <button
              type="button"
              class="post-creator__tag-remove"
              @click="removeTag(index)">
              ×
            </button>
          </span>
        </div>
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

  // 태그 관련 로컬 상태
  const newTagInput = ref('')

  // 태그 추가 함수
  const addTag = () => {
  const tag = newTagInput.value.trim()
  
  // 더 엄격한 조건 검사
  if (
    tag.length > 0 &&                           // 빈 문자열 체크
    tag.length <= 20 &&                         // 태그 길이 제한
    !formData.value.tags.includes(tag) &&       // 중복 체크
    formData.value.tags.length < 10             // 최대 개수 체크
  ) {
    formData.value.tags.push(tag)
    newTagInput.value = ''
    console.log('✅ 태그 추가됨:', tag)
  } else {
    console.log('❌ 태그 추가 실패:', { tag, 조건: {
      길이체크: tag.length > 0,
      최대길이: tag.length <= 20,
      중복체크: !formData.value.tags.includes(tag),
      개수체크: formData.value.tags.length < 10
    }})
  }
}

  // 태그 제거 함수
  // 🔧 태그 제거 함수
  const removeTag = (index) => {
    formData.value.tags.splice(index, 1)
  }

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
  // PostCreator.vue의 availableTags computed 수정


  const isFormValid = computed(() => {
    return (
      formData.value.title.trim().length > 0 &&
      formData.value.content.trim().length > 0 &&
      !errors.value.title &&
      !errors.value.content
    )
  })

  // 초기 데이터 설정
  // PostCreator.vue의 onMounted 함수 수정
onMounted(async () => {
  // 인증 확인
  if (!isAuthenticated.value) {
    router.push({
      name: 'Auth',
      query: { mode: 'login', redirect: route.fullPath }
    })
    return
  }
  // 수정 모드인 경우 기존 데이터 로드
  if (isEditing.value && props.editingPost) {
    formData.value = {
      title: props.editingPost.title || props.editingPost.post_title || '',
      content: props.editingPost.content || '',
      tags: [...(props.editingPost.tags || [])]
    }
    console.log('📝 수정 모드 데이터 로드:', formData.value)
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
        console.log('🔄 게시글 수정 시작:', { postId, formData: formData.value })
        result = await communityStore.updatePost(postId, formData.value)
        console.log('📤 수정 결과:', result)

        if (result.success) {
          emit('post-updated', result.post || result)
          hasUnsavedChanges.value = false

          // 성공 메시지 표시
          if (result.message) {
            alert(result.message)
          }
          console.log('🔄 게시글 상세로 이동 중...')

          // 현재 게시글 데이터 초기화
        communityStore.resetCurrentPost()
        
        // 약간의 지연 후 이동 (데이터 초기화 시간 확보)
        setTimeout(() => {
          router.push({
            name: 'PostDetail',
            params: { id: String(postId) }
          })
        }, 100)
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

  .post-creator__label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .post-creator__tag-input {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .post-creator__tag-field {
    flex: 1;
    padding: 12px 16px;
    background-color: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    color: var(--color-text);
    font-size: 14px;
    font-family: 'Pretendard-Regular', 'Pretendard', sans-serif;
  }

  .post-creator__tag-field:focus {
    outline: none;
    border-color: var(--color-main);
  }

  .post-creator__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .post-creator__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background-color: var(--color-main-opacity-20);
    border: 1px solid var(--color-main-opacity-50);
    border-radius: var(--border-radius-medium);
    font-size: 13px;
    color: var(--color-text);
  }

  .post-creator__tag-remove {
    background: none;
    border: none;
    color: var(--color-alert);
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    padding: 0;
    margin-left: 4px;
  }

  .post-creator__tag-remove:hover {
    color: var(--color-text);
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
