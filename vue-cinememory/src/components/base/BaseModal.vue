<!-- 기본 모달 -->
<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="modelValue"
        class="base-modal"
        @click="handleBackdropClick"
      >
        <div
          :class="[
            'base-modal__content',
            `base-modal__content--${size}`
          ]"
          @click.stop
        >
          <header
            v-if="$slots.header || title"
            class="base-modal__header"
          >
            <slot name="header">
              <h3 class="base-modal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              class="base-modal__close"
              @click="close"
            >
              <BaseIcon name="x" />
            </button>
          </header>
          
          <div class="base-modal__body">
            <slot />
          </div>
          
          <footer
            v-if="$slots.footer"
            class="base-modal__footer"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, nextTick } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const onEnter = () => {
  document.body.style.overflow = 'hidden'
}

const onLeave = () => {
  document.body.style.overflow = ''
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    nextTick(() => {
      document.body.style.overflow = 'hidden'
    })
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.base-modal__content {
  background-color: #242018;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Pretendard', sans-serif;
}

/* Sizes */
.base-modal__content--small {
  width: 100%;
  max-width: 400px;
}

.base-modal__content--medium {
  width: 100%;
  max-width: 600px;
}

.base-modal__content--large {
  width: 100%;
  max-width: 800px;
}

.base-modal__content--full {
  width: 95%;
  height: 95%;
  max-width: none;
  max-height: none;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #6b645f;
  margin-bottom: 24px;
  padding-bottom: 16px;
}

.base-modal__title {
  font-size: 20px;
  font-weight: 600;
  color: #f7f5f3;
  margin: 0;
}

.base-modal__close {
  background: none;
  border: none;
  color: #9c9490;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.base-modal__close:hover {
  background-color: #2a2520;
  color: #f7f5f3;
}

.base-modal__body {
  padding: 0 24px;
  color: #f7f5f3;
}

.base-modal__footer {
  padding: 24px 24px 24px 24px;
  border-top: 1px solid #6b645f;
  margin-top: 24px;
  padding-top: 16px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .base-modal__content,
.modal-leave-active .base-modal__content {
  transition: transform 0.3s ease;
}

.modal-enter-from .base-modal__content,
.modal-leave-to .base-modal__content {
  transform: scale(0.9) translateY(-20px);
}
</style>