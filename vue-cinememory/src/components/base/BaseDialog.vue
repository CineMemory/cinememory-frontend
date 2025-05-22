<!-- 기본 대화상자 -->
<template>
  <BaseModal
    :model-value="modelValue"
    :closable="closable"
    :close-on-backdrop="closeOnBackdrop"
    size="small"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <template #header>
      <div class="base-dialog__header">
        <BaseIcon
          v-if="icon"
          :name="icon"
          :class="[
            'base-dialog__icon',
            `base-dialog__icon--${type}`
          ]"
          size="large"
        />
        <h3 class="base-dialog__title">{{ title }}</h3>
      </div>
    </template>

    <div class="base-dialog__content">
      <p class="base-dialog__message">
        <slot>{{ message }}</slot>
      </p>
    </div>

    <template #footer>
      <div class="base-dialog__actions">
        <BaseButton
          v-if="showCancel"
          variant="secondary"
          @click="handleCancel"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          :variant="confirmVariant"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'cancel'])

const icon = computed(() => {
  const icons = {
    info: 'message-circle',
    success: 'check',
    warning: 'alert-triangle',
    danger: 'alert-circle'
  }
  return icons[props.type]
})

const confirmVariant = computed(() => {
  const variants = {
    info: 'primary',
    success: 'primary',
    warning: 'primary',
    danger: 'danger'
  }
  return variants[props.type]
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.base-dialog__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.base-dialog__icon {
  flex-shrink: 0;
}

.base-dialog__icon--info {
  color: #9c9490;
}

.base-dialog__icon--success {
  color: #8fad88;
}

.base-dialog__icon--warning {
  color: #ffb700;
}

.base-dialog__icon--danger {
  color: #ff3838;
}

.base-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #f7f5f3;
  margin: 0;
}

.base-dialog__content {
  margin: 16px 0;
}

.base-dialog__message {
  font-size: 14px;
  line-height: 1.6;
  color: #9c9490;
  margin: 0;
}

.base-dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>