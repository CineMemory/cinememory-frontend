<!-- BaseDropdown 컴포넌트 -->
<template>
  <div
    class="base-dropdown"
    :class="dropdownClasses"
    @keydown.esc="closeDropdown">
    <!-- 트리거 버튼 -->
    <div
      ref="triggerRef"
      class="base-dropdown__trigger"
      @click="toggleDropdown">
      <slot name="trigger">
        <BaseButton
          variant="ghost"
          icon-only
          icon-left="more-horizontal"
          size="small" />
      </slot>
    </div>

    <!-- 드롭다운 메뉴 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="base-dropdown__menu"
        :style="dropdownPosition"
        @click="handleMenuClick">
        <div class="base-dropdown__content">
          <slot name="content" />
        </div>
      </div>
    </Teleport>

    <!-- 백드롭 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="base-dropdown__backdrop"
        @click="closeDropdown" />
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
  import BaseButton from './BaseButton.vue'

  const props = defineProps({
    // 드롭다운 위치
    placement: {
      type: String,
      default: 'bottom-end',
      validator: (value) =>
        [
          'bottom-start',
          'bottom-end',
          'top-start',
          'top-end',
          'left',
          'right'
        ].includes(value)
    },
    // 트리거 방식
    trigger: {
      type: String,
      default: 'click',
      validator: (value) => ['click', 'hover'].includes(value)
    },
    // 메뉴 클릭 시 자동 닫기 여부
    closeOnMenuClick: {
      type: Boolean,
      default: true
    },
    // 비활성화 여부
    disabled: {
      type: Boolean,
      default: false
    },
    // 최대 높이
    maxHeight: {
      type: String,
      default: '200px'
    }
  })

  const emit = defineEmits(['open', 'close', 'toggle'])

  // 반응형 상태
  const isOpen = ref(false)
  const triggerRef = ref(null)
  const dropdownRef = ref(null)
  const dropdownPosition = ref({})

  // 계산된 속성
  const dropdownClasses = computed(() => ({
    'base-dropdown--open': isOpen.value,
    'base-dropdown--disabled': props.disabled
  }))

  // 드롭다운 위치 계산
  const calculatePosition = async () => {
    if (!triggerRef.value || !dropdownRef.value) return

    await nextTick()

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const dropdownRect = dropdownRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0

    // placement에 따른 기본 위치 계산
    switch (props.placement) {
      case 'bottom-start':
        top = triggerRect.bottom + 8
        left = triggerRect.left
        break
      case 'bottom-end':
        top = triggerRect.bottom + 8
        left = triggerRect.right - dropdownRect.width
        break
      case 'top-start':
        top = triggerRect.top - dropdownRect.height - 8
        left = triggerRect.left
        break
      case 'top-end':
        top = triggerRect.top - dropdownRect.height - 8
        left = triggerRect.right - dropdownRect.width
        break
      case 'left':
        top = triggerRect.top
        left = triggerRect.left - dropdownRect.width - 8
        break
      case 'right':
        top = triggerRect.top
        left = triggerRect.right + 8
        break
    }

    // 뷰포트 경계 확인 및 조정
    if (left + dropdownRect.width > viewportWidth) {
      left = viewportWidth - dropdownRect.width - 16
    }
    if (left < 16) {
      left = 16
    }

    if (top + dropdownRect.height > viewportHeight) {
      top = triggerRect.top - dropdownRect.height - 8
    }
    if (top < 16) {
      top = 16
    }

    dropdownPosition.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000,
      maxHeight: props.maxHeight
    }
  }

  // 드롭다운 열기/닫기
  const openDropdown = async () => {
    if (props.disabled || isOpen.value) return

    isOpen.value = true
    emit('open')

    await nextTick()
    await calculatePosition()
  }

  const closeDropdown = () => {
    if (!isOpen.value) return

    isOpen.value = false
    emit('close')
  }

  const toggleDropdown = () => {
    if (isOpen.value) {
      closeDropdown()
    } else {
      openDropdown()
    }
    emit('toggle', isOpen.value)
  }

  // 메뉴 클릭 핸들러
  const handleMenuClick = (event) => {
    if (props.closeOnMenuClick) {
      // BaseButton이나 다른 클릭 가능한 요소를 클릭한 경우에만 닫기
      const clickedElement = event.target.closest(
        'button, a, [role="menuitem"]'
      )
      if (clickedElement) {
        closeDropdown()
      }
    }
  }

  // 외부 클릭 감지
  const handleOutsideClick = (event) => {
    if (!isOpen.value) return

    const isClickInsideTrigger = triggerRef.value?.contains(event.target)
    const isClickInsideDropdown = dropdownRef.value?.contains(event.target)

    if (!isClickInsideTrigger && !isClickInsideDropdown) {
      closeDropdown()
    }
  }

  // 리사이즈 시 위치 재계산
  const handleResize = () => {
    if (isOpen.value) {
      calculatePosition()
    }
  }

  // 스크롤 시 위치 재계산
  const handleScroll = () => {
    if (isOpen.value) {
      calculatePosition()
    }
  }

  // 라이프사이클
  onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll, true)
  })

  // 외부에서 접근 가능한 메서드들
  defineExpose({
    open: openDropdown,
    close: closeDropdown,
    toggle: toggleDropdown,
    isOpen
  })
</script>

<style scoped>
  @import '@/assets/colors.css';

  .base-dropdown {
    position: relative;
    display: inline-block;
  }

  .base-dropdown--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .base-dropdown__trigger {
    cursor: pointer;
  }

  .base-dropdown__trigger:hover:not(
      .base-dropdown--disabled .base-dropdown__trigger
    ) {
    opacity: 0.8;
  }

  /* 드롭다운 메뉴 */
  .base-dropdown__menu {
    background-color: var(--color-card-background);
    border: 1px solid var(--color-inactive-icon);
    border-radius: var(--border-radius-medium);
    box-shadow: var(--shadow-modal);
    overflow: hidden;
    min-width: 160px;
    animation: dropdown-enter 0.15s ease-out;
  }

  .base-dropdown__content {
    padding: 8px 0;
    max-height: inherit;
    overflow-y: auto;
  }

  /* 스크롤바 스타일링 */
  .base-dropdown__content::-webkit-scrollbar {
    width: 6px;
  }

  .base-dropdown__content::-webkit-scrollbar-track {
    background: transparent;
  }

  .base-dropdown__content::-webkit-scrollbar-thumb {
    background-color: var(--color-inactive-icon);
    border-radius: 3px;
  }

  .base-dropdown__content::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-highlight-text);
  }

  /* 백드롭 */
  .base-dropdown__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background: transparent;
  }

  /* 드롭다운 내부 버튼 스타일 오버라이드 */
  .base-dropdown__content :deep(.base-button) {
    width: 100%;
    justify-content: flex-start;
    padding: 8px 16px;
    border-radius: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    background: transparent;
    border: none;
    transition: background-color 0.15s ease;
  }

  .base-dropdown__content :deep(.base-button:hover) {
    background-color: var(--color-highlight-background);
    color: var(--color-main);
  }

  .base-dropdown__content :deep(.base-button:active) {
    background-color: var(--color-main-opacity-20);
  }

  .base-dropdown__content :deep(.base-button.text-red-500) {
    color: var(--color-alert);
  }

  .base-dropdown__content :deep(.base-button.text-red-500:hover) {
    background-color: rgba(255, 56, 56, 0.1);
    color: var(--color-alert);
  }

  /* 아이콘과 텍스트 간격 */
  .base-dropdown__content :deep(.base-button .base-icon) {
    margin-right: 8px;
  }

  /* 애니메이션 */
  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .base-dropdown__menu {
      min-width: 140px;
      max-width: calc(100vw - 32px);
    }

    .base-dropdown__content :deep(.base-button) {
      padding: 12px 16px;
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    .base-dropdown__menu {
      min-width: 120px;
    }

    .base-dropdown__content :deep(.base-button) {
      padding: 10px 12px;
      font-size: 14px;
    }
  }
</style>
