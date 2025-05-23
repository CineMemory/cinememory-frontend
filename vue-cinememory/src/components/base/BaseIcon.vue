<!-- 기본 아이콘 -->
<template>
  <svg
    :class="[
      'base-icon',
      `base-icon--${size}`,
      {
        'base-icon--clickable': clickable
      }
    ]"
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    @click="handleClick">
    <!-- Search Icon -->
    <circle
      v-if="name === 'search'"
      cx="11"
      cy="11"
      r="8" />
    <path
      v-if="name === 'search'"
      d="M21 21l-4.35-4.35" />

    <!-- Arrow Right Icon -->
    <path
      v-if="name === 'arrow-right'"
      d="M5 12h14" />
    <path
      v-if="name === 'arrow-right'"
      d="M12 5l7 7-7 7" />

    <!-- Close/X Icon -->
    <path
      v-if="name === 'x'"
      d="M18 6L6 18" />
    <path
      v-if="name === 'x'"
      d="M6 6l12 12" />

    <!-- Home Icon -->
    <path
      v-if="name === 'home'"
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline
      v-if="name === 'home'"
      points="9,22 9,12 15,12 15,22" />

    <!-- User Icon -->
    <path
      v-if="name === 'user'"
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle
      v-if="name === 'user'"
      cx="12"
      cy="7"
      r="4" />

    <!-- Calendar Icon -->
    <rect
      v-if="name === 'calendar'"
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2" />
    <line
      v-if="name === 'calendar'"
      x1="16"
      y1="2"
      x2="16"
      y2="6" />
    <line
      v-if="name === 'calendar'"
      x1="8"
      y1="2"
      x2="8"
      y2="6" />
    <line
      v-if="name === 'calendar'"
      x1="3"
      y1="10"
      x2="21"
      y2="10" />

    <!-- Star Icon -->
    <polygon
      v-if="name === 'star'"
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />

    <!-- Heart Icon -->
    <path
      v-if="name === 'heart'"
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />

    <!-- Message Circle Icon -->
    <path
      v-if="name === 'message-circle'"
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />

    <!-- Settings Icon -->
    <circle
      v-if="name === 'settings'"
      cx="12"
      cy="12"
      r="3" />
    <path
      v-if="name === 'settings'"
      d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />

    <!-- Trophy Icon -->
    <path
      v-if="name === 'trophy'"
      d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path
      v-if="name === 'trophy'"
      d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path
      v-if="name === 'trophy'"
      d="M4 22h16" />
    <path
      v-if="name === 'trophy'"
      d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
    <path
      v-if="name === 'trophy'"
      d="M18 2H6v7a6 6 0 0 0 12 0V2z" />

    <!-- Play Icon -->
    <polygon
      v-if="name === 'play'"
      points="5,3 19,12 5,21" />

    <!-- Plus Icon -->
    <path
      v-if="name === 'plus'"
      d="M12 5v14" />
    <path
      v-if="name === 'plus'"
      d="M5 12h14" />

    <!-- Menu Icon -->
    <line
      v-if="name === 'menu'"
      x1="3"
      y1="6"
      x2="21"
      y2="6" />
    <line
      v-if="name === 'menu'"
      x1="3"
      y1="12"
      x2="21"
      y2="12" />
    <line
      v-if="name === 'menu'"
      x1="3"
      y1="18"
      x2="21"
      y2="18" />

    <!-- Arrow Down Icon -->
    <path
      v-if="name === 'arrow-down'"
      d="M6 9l6 6 6-6" />

    <!-- Check Icon -->
    <polyline
      v-if="name === 'check'"
      points="20,6 9,17 4,12" />

    <!-- Eye Icon -->
    <path
      v-if="name === 'eye'"
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle
      v-if="name === 'eye'"
      cx="12"
      cy="12"
      r="3" />

    <!-- Bookmark Icon -->
    <path
      v-if="name === 'bookmark'"
      d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />

    <!-- Share Icon -->
    <circle
      v-if="name === 'share'"
      cx="18"
      cy="5"
      r="3" />
    <circle
      v-if="name === 'share'"
      cx="6"
      cy="12"
      r="3" />
    <circle
      v-if="name === 'share'"
      cx="18"
      cy="19"
      r="3" />
    <line
      v-if="name === 'share'"
      x1="8.59"
      y1="13.51"
      x2="15.42"
      y2="17.49" />
    <line
      v-if="name === 'share'"
      x1="15.41"
      y1="6.51"
      x2="8.59"
      y2="10.49" />
  </svg>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['click'])

  const iconSize = computed(() => {
    const sizes = {
      small: 16,
      medium: 20,
      large: 24,
      xl: 32
    }
    return sizes[props.size]
  })

  const handleClick = (event) => {
    if (props.clickable) {
      emit('click', event)
    }
  }
</script>

<style scoped>
  .base-icon {
    transition: color 0.2s ease;
    color: currentColor;
  }

  .base-icon--clickable {
    cursor: pointer;
  }

  .base-icon--clickable:hover {
    opacity: 0.75;
  }

  .base-icon--small {
    width: 16px;
    height: 16px;
  }

  .base-icon--medium {
    width: 20px;
    height: 20px;
  }

  .base-icon--large {
    width: 24px;
    height: 24px;
  }

  .base-icon--xl {
    width: 32px;
    height: 32px;
  }
</style>
