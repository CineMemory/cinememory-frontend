<!-- 기본 아바타 -->
<template>
  <div
    :class="[
      'base-avatar',
      `base-avatar--${size}`,
      `base-avatar--${shape}`,
      {
        'base-avatar--clickable': clickable
      }
    ]"
    @click="handleClick"
  >
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      class="base-avatar__image"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    
    <div
      v-else-if="name"
      class="base-avatar__text"
    >
      {{ initials }}
    </div>
    
    <BaseIcon
      v-else
      name="user"
      class="base-avatar__icon"
    />
    
    <div
      v-if="badge"
      :class="[
        'base-avatar__badge',
        `base-avatar__badge--${badgeColor}`
      ]"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  src: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['xs', 'small', 'medium', 'large', 'xl'].includes(value)
  },
  shape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'square', 'rounded'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  badge: {
    type: Boolean,
    default: false
  },
  badgeColor: {
    type: String,
    default: 'green',
    validator: (value) => ['green', 'red', 'yellow', 'blue'].includes(value)
  }
})

const emit = defineEmits(['click', 'imageError', 'imageLoad'])

const imageError = ref(false)

const initials = computed(() => {
  if (!props.name) return ''
  
  return props.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleImageError = (event) => {
  imageError.value = true
  emit('imageError', event)
}

const handleImageLoad = (event) => {
  imageError.value = false
  emit('imageLoad', event)
}
</script>

<style scoped>
.base-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #6b645f;
  color: #f7f5f3;
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

/* Sizes */
.base-avatar--xs {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.base-avatar--small {
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.base-avatar--medium {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.base-avatar--large {
  width: 56px;
  height: 56px;
  font-size: 18px;
}

.base-avatar--xl {
  width: 80px;
  height: 80px;
  font-size: 24px;
}

/* Shapes */
.base-avatar--circle {
  border-radius: 50%;
}

.base-avatar--square {
  border-radius: 0;
}

.base-avatar--rounded {
  border-radius: 8px;
}

/* Clickable */
.base-avatar--clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.base-avatar--clickable:hover {
  transform: scale(1.05);
}

.base-avatar--clickable:active {
  transform: scale(0.95);
}

.base-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.base-avatar__text {
  user-select: none;
}

.base-avatar__icon {
  width: 60%;
  height: 60%;
}

.base-avatar__badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border: 2px solid #0c0b0a;
  border-radius: 50%;
}

.base-avatar__badge--green {
  background-color: #8fad88;
}

.base-avatar__badge--red {
  background-color: #ff3838;
}

.base-avatar__badge--yellow {
  background-color: #ffb700;
}

.base-avatar__badge--blue {
  background-color: #3b82f6;
}
</style>