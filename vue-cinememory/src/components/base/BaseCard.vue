<!-- 기본 카드 -->
<template>
  <div
    :class="[
      'base-card',
      `base-card--${variant}`,
      {
        'base-card--hoverable': hoverable,
        'base-card--clickable': clickable
      }
    ]"
    @click="handleClick"
  >
    <div
      v-if="$slots.header"
      class="base-card__header"
    >
      <slot name="header" />
    </div>
    
    <div
      v-if="$slots.default"
      class="base-card__content"
    >
      <slot />
    </div>
    
    <div
      v-if="$slots.footer"
      class="base-card__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'transparent'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
.base-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: 'Pretendard', sans-serif;
}

/* Variants */
.base-card--default {
  background-color: #242018;
  border: 1px solid #6b645f;
}

.base-card--elevated {
  background-color: #242018;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.base-card--outlined {
  background-color: transparent;
  border: 1px solid #6b645f;
}

.base-card--transparent {
  background-color: transparent;
}

/* Hover effects */
.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 10px -2px rgba(0, 0, 0, 0.3);
}

.base-card--hoverable.base-card--outlined:hover {
  border-color: #9c9490;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

/* Clickable */
.base-card--clickable {
  cursor: pointer;
}

.base-card--clickable:hover {
  border-color: #ffb700;
}

.base-card--clickable:active {
  transform: scale(0.98);
}

/* Card sections */
.base-card__header {
  padding: 16px;
  padding-bottom: 0;
}

.base-card__content {
  padding: 16px;
}

.base-card__footer {
  padding: 16px;
  padding-top: 0;
}

/* Remove padding when slots are combined */
.base-card__header + .base-card__content {
  padding-top: 8px;
}

.base-card__content + .base-card__footer {
  padding-top: 8px;
}

.base-card__header + .base-card__content + .base-card__footer {
  padding-top: 8px;
}
</style>