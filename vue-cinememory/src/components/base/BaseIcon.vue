<!-- 기본 아이콘 (누락된 아이콘들 추가) -->
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
    <!-- Hash Icon (#) -->
    <line
      v-if="name === 'hash'"
      x1="4"
      y1="9"
      x2="20"
      y2="9" />
    <line
      v-if="name === 'hash'"
      x1="4"
      y1="15"
      x2="20"
      y2="15" />
    <line
      v-if="name === 'hash'"
      x1="10"
      y1="3"
      x2="8"
      y2="21" />
    <line
      v-if="name === 'hash'"
      x1="16"
      y1="3"
      x2="14"
      y2="21" />

    <!-- Activity Icon -->
    <polyline
      v-if="name === 'activity'"
      points="22,12 18,12 15,21 9,3 6,12 2,12" />

    <!-- Info Icon -->
    <circle
      v-if="name === 'info'"
      cx="12"
      cy="12"
      r="10" />
    <line
      v-if="name === 'info'"
      x1="12"
      y1="16"
      x2="12"
      y2="12" />
    <line
      v-if="name === 'info'"
      x1="12"
      y1="8"
      x2="12.01"
      y2="8" />

    <!-- Users Icon -->
    <path
      v-if="name === 'users'"
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle
      v-if="name === 'users'"
      cx="9"
      cy="7"
      r="4" />
    <path
      v-if="name === 'users'"
      d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path
      v-if="name === 'users'"
      d="M16 3.13a4 4 0 0 1 0 7.75" />

    <!-- Shield Icon -->
    <path
      v-if="name === 'shield'"
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />

    <!-- Smile Icon -->
    <circle
      v-if="name === 'smile'"
      cx="12"
      cy="12"
      r="10" />
    <path
      v-if="name === 'smile'"
      d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line
      v-if="name === 'smile'"
      x1="9"
      y1="9"
      x2="9.01"
      y2="9" />
    <line
      v-if="name === 'smile'"
      x1="15"
      y1="9"
      x2="15.01"
      y2="9" />

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

    <!-- Arrow Left Icon -->
    <path
      v-if="name === 'arrow-left'"
      d="M19 12H5" />
    <path
      v-if="name === 'arrow-left'"
      d="M12 19l-7-7 7-7" />

    <!-- Tag Icon -->
    <path
      v-if="name === 'tag'"
      d="M20.59 13.41l-7.59 7.59a2 2 0 0 1-2.83 0l-7.59-7.59a2 2 0 0 1 0-2.83l7.59-7.59a2 2 0 0 1 2.83 0l7.59 7.59a2 2 0 0 1 0 2.83z" />
    <circle
      v-if="name === 'tag'"
      cx="7.5"
      cy="7.5"
      r="1.5" />

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

    <!-- Log Out Icon -->
    <path
      v-if="name === 'log-out'"
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline
      v-if="name === 'log-out'"
      points="16,17 21,12 16,7" />
    <line
      v-if="name === 'log-out'"
      x1="21"
      y1="12"
      x2="9"
      y2="12" />

    <!-- Alert Circle Icon -->
    <circle
      v-if="name === 'alert-circle'"
      cx="12"
      cy="12"
      r="10" />
    <line
      v-if="name === 'alert-circle'"
      x1="12"
      y1="8"
      x2="12"
      y2="12" />
    <circle
      v-if="name === 'alert-circle'"
      cx="12"
      cy="16"
      r="0.01" />

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

    <!-- Clock Icon -->
    <circle
      v-if="name === 'clock'"
      cx="12"
      cy="12"
      r="10" />
    <polyline
      v-if="name === 'clock'"
      points="12,6 12,12 16,14" />

    <!-- Log In Icon -->
    <path
      v-if="name === 'log-in'"
      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline
      v-if="name === 'log-in'"
      points="10 17 15 12 10 7" />
    <line
      v-if="name === 'log-in'"
      x1="15"
      y1="12"
      x2="3"
      y2="12" />

    <!-- User Plus Icon (회원가입) -->
    <path
      v-if="name === 'user-plus'"
      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle
      v-if="name === 'user-plus'"
      cx="8.5"
      cy="7"
      r="4" />
    <line
      v-if="name === 'user-plus'"
      x1="20"
      y1="8"
      x2="20"
      y2="14" />
    <line
      v-if="name === 'user-plus'"
      x1="23"
      y1="11"
      x2="17"
      y2="11" />

    <!-- Edit Icon -->
    <path
      v-if="name === 'edit'"
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path
      v-if="name === 'edit'"
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />

    <!-- Trash 2 Icon -->
    <polyline
      v-if="name === 'trash-2'"
      points="3,6 5,6 21,6" />
    <path
      v-if="name === 'trash-2'"
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line
      v-if="name === 'trash-2'"
      x1="10"
      y1="11"
      x2="10"
      y2="17" />
    <line
      v-if="name === 'trash-2'"
      x1="14"
      y1="11"
      x2="14"
      y2="17" />

    <!-- More Horizontal Icon -->
    <circle
      v-if="name === 'more-horizontal'"
      cx="12"
      cy="12"
      r="1" />
    <circle
      v-if="name === 'more-horizontal'"
      cx="19"
      cy="12"
      r="1" />
    <circle
      v-if="name === 'more-horizontal'"
      cx="5"
      cy="12"
      r="1" />

    <!-- Chevron Up Icon -->
    <polyline
      v-if="name === 'chevron-up'"
      points="18,15 12,9 6,15" />

    <!-- Corner Down Right Icon -->
    <polyline
      v-if="name === 'corner-down-right'"
      points="15,10 20,15 15,20" />
    <path
      v-if="name === 'corner-down-right'"
      d="M4 4v7a4 4 0 0 0 4 4h12" />

    <!-- Edit 3 Icon -->
    <path
      v-if="name === 'edit-3'"
      d="M12 20h9" />
    <path
      v-if="name === 'edit-3'"
      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />

    <!-- Send Icon -->
    <line
      v-if="name === 'send'"
      x1="22"
      y1="2"
      x2="11"
      y2="13" />
    <polygon
      v-if="name === 'send'"
      points="22,2 15,22 11,13 2,9" />

    <!-- Alert Triangle Icon -->
    <path
      v-if="name === 'alert-triangle'"
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line
      v-if="name === 'alert-triangle'"
      x1="12"
      y1="9"
      x2="12"
      y2="13" />
    <circle
      v-if="name === 'alert-triangle'"
      cx="12"
      cy="17"
      r="0.01" />

    <!-- Thumb Up Icon (비율 개선) -->
    <path
      v-if="name === 'thumb-up'"
      d="M7 10V5a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5" />
    <path
      v-if="name === 'thumb-up'"
      d="M7 10h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2" />

    <!-- Video Icon -->
    <rect
      v-if="name === 'video'"
      x="2"
      y="7"
      width="15"
      height="10"
      rx="2"
      ry="2" />
    <polygon
      v-if="name === 'video'"
      points="23 7 16 12 23 17 23 7" />

    <!-- Compass Icon (모험) -->
    <circle
      v-if="name === 'compass'"
      cx="12"
      cy="12"
      r="10" />
    <polygon
      v-if="name === 'compass'"
      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />

    <!-- Eye Off Icon (공포) -->
    <path
      v-if="name === 'eye-off'"
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L6.06 6.06" />
    <path
      v-if="name === 'eye-off'"
      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.72-6.72" />
    <path
      v-if="name === 'eye-off'"
      d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line
      v-if="name === 'eye-off'"
      x1="1"
      y1="1"
      x2="23"
      y2="23" />

    <!-- Zap Icon (액션) -->
    <polygon
      v-if="name === 'zap'"
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />

    <!-- Laugh Icon (코미디) -->
    <circle
      v-if="name === 'laugh'"
      cx="12"
      cy="12"
      r="10" />
    <path
      v-if="name === 'laugh'"
      d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line
      v-if="name === 'laugh'"
      x1="9"
      y1="9"
      x2="9.01"
      y2="9" />
    <line
      v-if="name === 'laugh'"
      x1="15"
      y1="9"
      x2="15.01"
      y2="9" />

    <!-- Sunrise Icon (서부) -->
    <path
      v-if="name === 'sunrise'"
      d="M17 18a5 5 0 0 0-10 0" />
    <line
      v-if="name === 'sunrise'"
      x1="12"
      y1="2"
      x2="12"
      y2="9" />
    <line
      v-if="name === 'sunrise'"
      x1="4.22"
      y1="10.22"
      x2="5.64"
      y2="11.64" />
    <line
      v-if="name === 'sunrise'"
      x1="1"
      y1="18"
      x2="3"
      y2="18" />
    <line
      v-if="name === 'sunrise'"
      x1="21"
      y1="18"
      x2="23"
      y2="18" />
    <line
      v-if="name === 'sunrise'"
      x1="18.36"
      y1="11.64"
      x2="19.78"
      y2="10.22" />
    <line
      v-if="name === 'sunrise'"
      x1="23"
      y1="22"
      x2="1"
      y2="22" />
    <polyline
      v-if="name === 'sunrise'"
      points="8 6 12 2 16 6" />

    <!-- File Text Icon (다큐멘터리) -->
    <path
      v-if="name === 'file-text'"
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline
      v-if="name === 'file-text'"
      points="14 2 14 8 20 8" />
    <line
      v-if="name === 'file-text'"
      x1="16"
      y1="13"
      x2="8"
      y2="13" />
    <line
      v-if="name === 'file-text'"
      x1="16"
      y1="17"
      x2="8"
      y2="17" />
    <polyline
      v-if="name === 'file-text'"
      points="10 9 9 9 8 9" />

    <!-- CPU Icon (SF) -->
    <rect
      v-if="name === 'cpu'"
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      ry="2" />
    <rect
      v-if="name === 'cpu'"
      x="9"
      y="9"
      width="6"
      height="6" />
    <line
      v-if="name === 'cpu'"
      x1="9"
      y1="1"
      x2="9"
      y2="4" />
    <line
      v-if="name === 'cpu'"
      x1="15"
      y1="1"
      x2="15"
      y2="4" />
    <line
      v-if="name === 'cpu'"
      x1="9"
      y1="20"
      x2="9"
      y2="23" />
    <line
      v-if="name === 'cpu'"
      x1="15"
      y1="20"
      x2="15"
      y2="23" />
    <line
      v-if="name === 'cpu'"
      x1="20"
      y1="9"
      x2="23"
      y2="9" />
    <line
      v-if="name === 'cpu'"
      x1="20"
      y1="14"
      x2="23"
      y2="14" />
    <line
      v-if="name === 'cpu'"
      x1="1"
      y1="9"
      x2="4"
      y2="9" />
    <line
      v-if="name === 'cpu'"
      x1="1"
      y1="14"
      x2="4"
      y2="14" />

    <!-- Music Icon (음악) -->
    <path
      v-if="name === 'music'"
      d="M9 18V5l12-2v13" />
    <circle
      v-if="name === 'music'"
      cx="6"
      cy="18"
      r="3" />
    <circle
      v-if="name === 'music'"
      cx="18"
      cy="16"
      r="3" />

    <!-- Target Icon (전쟁) -->
    <circle
      v-if="name === 'target'"
      cx="12"
      cy="12"
      r="10" />
    <circle
      v-if="name === 'target'"
      cx="12"
      cy="12"
      r="6" />
    <circle
      v-if="name === 'target'"
      cx="12"
      cy="12"
      r="2" />

    <!-- TV Icon (TV영화) -->
    <rect
      v-if="name === 'tv'"
      x="2"
      y="3"
      width="20"
      height="14"
      rx="2"
      ry="2" />
    <line
      v-if="name === 'tv'"
      x1="8"
      y1="21"
      x2="16"
      y2="21" />
    <line
      v-if="name === 'tv'"
      x1="12"
      y1="17"
      x2="12"
      y2="21" />

    <!-- Film Icon (기본 영화 아이콘) -->
    <rect
      v-if="name === 'film'"
      x="2"
      y="3"
      width="20"
      height="18"
      rx="2"
      ry="2" />
    <line
      v-if="name === 'film'"
      x1="7"
      y1="3"
      x2="7"
      y2="21" />
    <line
      v-if="name === 'film'"
      x1="17"
      y1="3"
      x2="17"
      y2="21" />
    <line
      v-if="name === 'film'"
      x1="2"
      y1="9"
      x2="22"
      y2="9" />
    <line
      v-if="name === 'film'"
      x1="2"
      y1="15"
      x2="22"
      y2="15" />

    <!-- Mouse Pointer Icon -->
    <path
      v-if="name === 'mouse-pointer'"
      d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path
      v-if="name === 'mouse-pointer'"
      d="M13 13l6 6" />

    <!-- Check Circle Icon -->
    <path
      v-if="name === 'check-circle'"
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline
      v-if="name === 'check-circle'"
      points="22 4 12 14.01 9 11.01" />

    <!-- X Circle Icon -->
    <circle
      v-if="name === 'x-circle'"
      cx="12"
      cy="12"
      r="10" />
    <line
      v-if="name === 'x-circle'"
      x1="15"
      y1="9"
      x2="9"
      y2="15" />
    <line
      v-if="name === 'x-circle'"
      x1="9"
      y1="9"
      x2="15"
      y2="15" />

    <!-- Play Circle Icon -->
    <circle
      v-if="name === 'play-circle'"
      cx="12"
      cy="12"
      r="10" />
    <polygon
      v-if="name === 'play-circle'"
      points="10 8 16 12 10 16 10 8" />

    <!-- Brain Icon -->
    <path
      v-if="name === 'brain'"
      d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V6a2.5 2.5 0 0 1 2.5-2.5z" />
    <path
      v-if="name === 'brain'"
      d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0V6a2.5 2.5 0 0 0-2.5-2.5z" />

    <!-- Refresh CW Icon -->
    <polyline
      v-if="name === 'refresh-cw'"
      points="23 4 23 10 17 10" />
    <polyline
      v-if="name === 'refresh-cw'"
      points="1 20 1 14 7 14" />
    <path
      v-if="name === 'refresh-cw'"
      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />

    <!-- Share 2 Icon -->
    <circle
      v-if="name === 'share-2'"
      cx="18"
      cy="5"
      r="3" />
    <circle
      v-if="name === 'share-2'"
      cx="6"
      cy="12"
      r="3" />
    <circle
      v-if="name === 'share-2'"
      cx="18"
      cy="19"
      r="3" />
    <line
      v-if="name === 'share-2'"
      x1="8.59"
      y1="13.51"
      x2="15.42"
      y2="17.49" />
    <line
      v-if="name === 'share-2'"
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
