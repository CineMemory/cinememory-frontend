<template>
  <BaseModal
    :show="show"
    @close="$emit('close')"
    :title="modalTitle"
    size="medium">
    <div class="follow-modal-content">
      <!-- 탭 네비게이션 -->
      <div class="follow-tabs">
        <button
          @click="activeTab = 'followers'"
          :class="[
            'follow-tab',
            { 'follow-tab--active': activeTab === 'followers' }
          ]">
          팔로워 ({{ followersCount }})
        </button>
        <button
          @click="activeTab = 'following'"
          :class="[
            'follow-tab',
            { 'follow-tab--active': activeTab === 'following' }
          ]">
          팔로잉 ({{ followingCount }})
        </button>
      </div>

      <!-- 로딩 상태 -->
      <div
        v-if="loading"
        class="loading-container">
        <BaseSpinner />
        <p>{{ loadingMessage }}</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="error-container">
        <BaseIcon
          name="alert-circle"
          class="error-icon" />
        <p>{{ error }}</p>
        <BaseButton
          @click="loadCurrentTab"
          variant="primary">
          다시 시도
        </BaseButton>
      </div>

      <!-- 사용자 목록 -->
      <div
        v-else
        class="users-list">
        <!-- 팔로워 목록 -->
        <div v-if="activeTab === 'followers'">
          <div
            v-if="followers.length === 0"
            class="empty-state">
            <BaseIcon
              name="users"
              class="empty-icon" />
            <h3>팔로워가 없습니다</h3>
            <p>아직 이 사용자를 팔로우하는 사람이 없어요.</p>
          </div>
          <div
            v-else
            class="user-list">
            <div
              v-for="user in followers"
              :key="user.id"
              class="user-item">
              <div
                class="user-info"
                @click="goToUserProfile(user.id)">
                <div class="user-avatar">
                  <img
                    v-if="user.profile_image_url"
                    :src="getFullImageUrl(user.profile_image_url)"
                    :alt="user.username + '의 프로필'"
                    class="avatar-image" />
                  <BaseIcon
                    v-else
                    name="user"
                    class="avatar-placeholder" />
                </div>
                <div class="user-details">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-meta">
                    팔로워 {{ user.followers_count || 0 }}명
                  </p>
                </div>
              </div>
              <div class="user-actions">
                <UserFollowButton
                  v-if="!isOwnProfile(user.id)"
                  :user-id="user.id"
                  :initial-follow-state="user.is_following || false"
                  @follow-changed="handleFollowChanged" />
              </div>
            </div>
          </div>
        </div>

        <!-- 팔로잉 목록 -->
        <div v-if="activeTab === 'following'">
          <div
            v-if="following.length === 0"
            class="empty-state">
            <BaseIcon
              name="users"
              class="empty-icon" />
            <h3>팔로잉이 없습니다</h3>
            <p>아직 이 사용자가 팔로우하는 사람이 없어요.</p>
          </div>
          <div
            v-else
            class="user-list">
            <div
              v-for="user in following"
              :key="user.id"
              class="user-item">
              <div
                class="user-info"
                @click="goToUserProfile(user.id)">
                <div class="user-avatar">
                  <img
                    v-if="user.profile_image_url"
                    :src="getFullImageUrl(user.profile_image_url)"
                    :alt="user.username + '의 프로필'"
                    class="avatar-image" />
                  <BaseIcon
                    v-else
                    name="user"
                    class="avatar-placeholder" />
                </div>
                <div class="user-details">
                  <h4 class="user-name">{{ user.username }}</h4>
                  <p class="user-meta">
                    팔로워 {{ user.followers_count || 0 }}명
                  </p>
                </div>
              </div>
              <div class="user-actions">
                <UserFollowButton
                  v-if="!isOwnProfile(user.id)"
                  :user-id="user.id"
                  :initial-follow-state="user.is_following || false"
                  @follow-changed="handleFollowChanged" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { getFollowers, getFollowing } from '@/services/api'

  import BaseModal from '@/components/base/BaseModal.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import UserFollowButton from '@/components/user/UserFollowButton.vue'

  export default {
    name: 'UserFollowModal',
    components: {
      BaseModal,
      BaseButton,
      BaseIcon,
      BaseSpinner,
      UserFollowButton
    },
    props: {
      show: {
        type: Boolean,
        default: false
      },
      userId: {
        type: Number,
        required: true
      },
      initialTab: {
        type: String,
        default: 'followers',
        validator: (value) => ['followers', 'following'].includes(value)
      },
      followersCount: {
        type: Number,
        default: 0
      },
      followingCount: {
        type: Number,
        default: 0
      }
    },
    emits: ['close', 'follow-changed'],
    setup(props, { emit }) {
      const router = useRouter()
      const authStore = useAuthStore()

      // 상태
      const activeTab = ref(props.initialTab)
      const loading = ref(false)
      const error = ref('')
      const followers = ref([])
      const following = ref([])

      // Computed
      const modalTitle = computed(() => {
        return activeTab.value === 'followers' ? '팔로워' : '팔로잉'
      })

      const loadingMessage = computed(() => {
        return activeTab.value === 'followers'
          ? '팔로워 목록을 불러오는 중...'
          : '팔로잉 목록을 불러오는 중...'
      })

      // 메서드
      const loadFollowers = async () => {
        try {
          loading.value = true
          error.value = ''
          const data = await getFollowers(props.userId)
          followers.value = data
        } catch (err) {
          console.error('팔로워 목록 로드 실패:', err)
          error.value = '팔로워 목록을 불러오는데 실패했습니다.'
        } finally {
          loading.value = false
        }
      }

      const loadFollowing = async () => {
        try {
          loading.value = true
          error.value = ''
          const data = await getFollowing(props.userId)
          following.value = data
        } catch (err) {
          console.error('팔로잉 목록 로드 실패:', err)
          error.value = '팔로잉 목록을 불러오는데 실패했습니다.'
        } finally {
          loading.value = false
        }
      }

      const loadCurrentTab = () => {
        if (activeTab.value === 'followers') {
          loadFollowers()
        } else {
          loadFollowing()
        }
      }

      const goToUserProfile = (userId) => {
        emit('close')
        router.push({ name: 'UserProfile', params: { userId } })
      }

      const isOwnProfile = (userId) => {
        return authStore.user && authStore.user.id === userId
      }

      const handleFollowChanged = (event) => {
        // 부모 컴포넌트에 팔로우 상태 변경 알림
        emit('follow-changed', event)

        // 현재 표시 중인 목록에서 해당 사용자의 팔로우 상태 업데이트
        const updateUserInList = (list) => {
          const userIndex = list.findIndex((user) => user.id === event.userId)
          if (userIndex !== -1) {
            list[userIndex].is_following = event.isFollowing
          }
        }

        updateUserInList(followers.value)
        updateUserInList(following.value)
      }

      const getFullImageUrl = (imageUrl) => {
        if (!imageUrl) return ''
        if (imageUrl.startsWith('http')) return imageUrl
        return `http://localhost:8000${imageUrl}`
      }

      // Watchers
      watch(
        () => props.show,
        (newShow) => {
          if (newShow) {
            loadCurrentTab()
          }
        }
      )

      watch(activeTab, (newTab) => {
        if (props.show) {
          loadCurrentTab()
        }
      })

      return {
        activeTab,
        loading,
        error,
        followers,
        following,
        modalTitle,
        loadingMessage,
        loadCurrentTab,
        goToUserProfile,
        isOwnProfile,
        handleFollowChanged,
        getFullImageUrl
      }
    }
  }
</script>

<style scoped>
  .follow-modal-content {
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  /* 탭 네비게이션 */
  .follow-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 20px;
    padding: 4px;
    gap: 4px;
  }

  .follow-tab {
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-highlight-text);
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
  }

  .follow-tab:hover {
    color: var(--color-text);
    background-color: var(--color-highlight-background);
  }

  .follow-tab--active {
    color: var(--color-background);
    background-color: var(--color-main);
  }

  /* 로딩 & 에러 상태 */
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--color-text);
  }

  .error-icon {
    width: 48px;
    height: 48px;
    color: var(--color-alert);
    margin-bottom: 16px;
  }

  /* 사용자 목록 */
  .users-list {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    transition: all 0.2s ease;
  }

  .user-item:hover {
    background-color: var(--color-highlight-background);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    cursor: pointer;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-full);
    overflow: hidden;
    background-color: var(--color-highlight-background);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 24px;
    height: 24px;
    color: var(--color-inactive-icon);
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-meta {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .user-actions {
    flex-shrink: 0;
  }

  /* 빈 상태 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--color-inactive-icon);
    margin-bottom: 20px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .empty-state p {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 0;
    line-height: 1.5;
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .follow-modal-content {
      max-height: 80vh;
    }

    .user-item {
      padding: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
    }

    .avatar-placeholder {
      width: 20px;
      height: 20px;
    }

    .user-name {
      font-size: 14px;
    }

    .user-meta {
      font-size: 12px;
    }
  }
</style>
