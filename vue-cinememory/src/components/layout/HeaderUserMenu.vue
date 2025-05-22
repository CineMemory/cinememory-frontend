<!-- 헤더 사용자 메뉴 -->
<template>
  <div class="header-user-menu">
    <!-- 로그인된 상태 -->
    <div
      v-if="isAuthenticated"
      class="header-user-menu__authenticated"
    >
      <!-- 알림 버튼 -->
      <button
        class="header-user-menu__notification"
        @click="toggleNotifications"
      >
        <BaseIcon name="bell" />
        <BaseBadge
          v-if="unreadNotifications > 0"
          class="header-user-menu__notification-badge"
          variant="danger"
          size="small"
          :dot="unreadNotifications > 99"
        >
          {{ unreadNotifications > 99 ? '' : unreadNotifications }}
        </BaseBadge>
      </button>

      <!-- 사용자 아바타 메뉴 -->
      <div class="header-user-menu__profile">
        <button
          class="header-user-menu__profile-button"
          @click="toggleUserMenu"
        >
          <BaseAvatar
            :src="user?.profileImage"
            :name="user?.username"
            size="small"
            :badge="user?.isOnline"
            badge-color="green"
          />
          <BaseIcon
            name="arrow-down"
            size="small"
            class="header-user-menu__dropdown-arrow"
          />
        </button>

        <!-- 드롭다운 메뉴 -->
        <div
          v-if="showUserMenu"
          class="header-user-menu__dropdown"
          @click="closeUserMenu"
        >
          <div class="header-user-menu__user-info">
            <BaseAvatar
              :src="user?.profileImage"
              :name="user?.username"
              size="medium"
            />
            <div class="header-user-menu__user-details">
              <p class="header-user-menu__username">{{ user?.username }}</p>
              <p class="header-user-menu__email">{{ user?.email }}</p>
            </div>
          </div>

          <hr class="header-user-menu__divider" />

          <nav class="header-user-menu__nav">
            <router-link
              v-for="item in userMenuItems"
              :key="item.name"
              :to="item.to"
              class="header-user-menu__nav-item"
            >
              <BaseIcon
                :name="item.icon"
                size="small"
                class="header-user-menu__nav-icon"
              />
              <span>{{ item.label }}</span>
            </router-link>
          </nav>

          <hr class="header-user-menu__divider" />

          <button
            class="header-user-menu__logout"
            @click="handleLogout"
          >
            <BaseIcon name="log-out" size="small" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 로그인되지 않은 상태 -->
    <div
      v-else
      class="header-user-menu__guest"
    >
      <BaseButton
        variant="ghost"
        size="small"
        @click="openAuthModal"
      >
        로그인
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseAvatar from '@/components/base/BaseAvatar.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)
const showNotifications = ref(false)
const unreadNotifications = ref(3) // TODO: 실제 알림 수

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const userMenuItems = [
  {
    name: 'profile',
    label: '내 프로필',
    icon: 'user',
    to: { name: 'MyProfile' }
  },
  {
    name: 'timeline',
    label: '내 타임라인',
    icon: 'calendar',
    to: { name: 'Timeline' }
  },
  {
    name: 'settings',
    label: '설정',
    icon: 'settings',
    to: { name: 'Settings' }
  }
]

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  closeUserMenu()
  router.push({ name: 'Home' })
}

const openAuthModal = () => {
  router.push({ name: 'Auth' })
}

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event) => {
  if (!event.target.closest('.header-user-menu')) {
    showUserMenu.value = false
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header-user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user-menu__authenticated {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user-menu__notification {
  position: relative;
  background: none;
  border: none;
  color: #9c9490;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.header-user-menu__notification:hover {
  background-color: rgba(156, 148, 144, 0.1);
  color: #f7f5f3;
}

.header-user-menu__notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
}

.header-user-menu__profile {
  position: relative;
}

.header-user-menu__profile-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.header-user-menu__profile-button:hover {
  background-color: rgba(156, 148, 144, 0.1);
}

.header-user-menu__dropdown-arrow {
  color: #9c9490;
  transition: transform 0.2s ease;
}

.header-user-menu__profile-button:hover .header-user-menu__dropdown-arrow {
  transform: rotate(180deg);
}

.header-user-menu__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: #242018;
  border: 1px solid #6b645f;
  border-radius: 8px;
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.4);
  padding: 16px;
  margin-top: 8px;
  z-index: 10;
}

.header-user-menu__user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-user-menu__user-details {
  flex: 1;
  min-width: 0;
}

.header-user-menu__username {
  font-size: 16px;
  font-weight: 600;
  color: #f7f5f3;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-user-menu__email {
  font-size: 14px;
  color: #9c9490;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-user-menu__divider {
  border: none;
  border-top: 1px solid #6b645f;
  margin: 16px 0;
}

.header-user-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-user-menu__nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #9c9490;
  font-size: 14px;
  transition: all 0.2s ease;
}

.header-user-menu__nav-item:hover {
  background-color: #2a2520;
  color: #f7f5f3;
}

.header-user-menu__nav-icon {
  flex-shrink: 0;
}

.header-user-menu__logout {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #ff3838;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-user-menu__logout:hover {
  background-color: rgba(255, 56, 56, 0.1);
}

.header-user-menu__guest {
  display: flex;
  align-items: center;
}
</style>