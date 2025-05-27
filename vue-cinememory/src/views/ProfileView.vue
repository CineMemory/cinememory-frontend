<!-- 👤 마이페이지 -->
<template>
  <div class="profile-view">
    <!-- 헤더 -->
    <PageHeader
      title="마이페이지"
      :show-back="true"
      :show-menu="true" />

    <div class="profile-container">
      <!-- 로딩 상태 -->
      <div
        v-if="isLoading"
        class="loading-container">
        <BaseSpinner />
        <p>프로필 정보를 불러오는 중...</p>
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
          @click="loadProfile"
          variant="primary">
          다시 시도
        </BaseButton>
      </div>

      <!-- 프로필 내용 -->
      <div
        v-else
        class="profile-content">
        <!-- 탭 네비게이션 -->
        <div class="profile-tabs">
          <button
            @click="handleTabChange('profile')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'profile' }
            ]">
            <BaseIcon
              name="user"
              class="tab-icon" />
            프로필
          </button>
          <button
            @click="handleTabChange('liked-movies')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-movies' }
            ]">
            <BaseIcon
              name="heart"
              class="tab-icon" />
            영화 ({{ likedMovies.length }})
          </button>
          <button
            @click="handleTabChange('reviews')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'reviews' }
            ]">
            <BaseIcon
              name="star"
              class="tab-icon" />
            리뷰 ({{ userReviews.length }})
          </button>
          <button
            @click="handleTabChange('liked-actors')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-actors' }
            ]">
            <BaseIcon
              name="users"
              class="tab-icon" />
            배우 ({{ likedActors.length }})
          </button>
          <button
            @click="handleTabChange('liked-directors')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-directors' }
            ]">
            <BaseIcon
              name="video"
              class="tab-icon" />
            감독 ({{ likedDirectors.length }})
          </button>
          <button
            @click="handleTabChange('my-posts')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'my-posts' }
            ]">
            <BaseIcon
              name="edit"
              class="tab-icon" />
            게시글 ({{ userPosts.length }})
          </button>
          <button
            @click="handleTabChange('my-comments')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'my-comments' }
            ]">
            <BaseIcon
              name="message-circle"
              class="tab-icon" />
            댓글 ({{ userComments.length }})
          </button>
          <button
            @click="handleTabChange('liked-posts')"
            :class="[
              'profile-tab',
              { 'profile-tab--active': activeTab === 'liked-posts' }
            ]">
            <BaseIcon
              name="thumb-up"
              class="tab-icon" />
            좋아요 글 ({{ likedPosts.length }})
          </button>
        </div>

        <!-- 프로필 정보 섹션 (프로필 탭에서만 표시) -->
        <div
          v-if="activeTab === 'profile'"
          class="profile-info-section">
          <div class="profile-avatar-container">
            <div
              class="profile-avatar"
              @click="openImageUpload"
              :class="{ 'profile-avatar--clickable': true }">
              <img
                v-if="profile.profile_image_url"
                :src="getFullImageUrl(profile.profile_image_url)"
                :alt="profile.username + '의 프로필'"
                class="avatar-image" />
              <BaseIcon
                v-else
                name="user"
                class="avatar-placeholder" />

              <!-- 호버 시 카메라 오버레이 -->
              <div class="avatar-overlay">
                <BaseIcon
                  name="camera"
                  class="camera-overlay-icon" />
                <span class="overlay-text">사진 변경</span>
              </div>
            </div>

            <!-- 프로필 수정 탭에서만 보이는 편집 버튼 -->
            <button
              v-if="activeTab === 'profile'"
              @click="openImageUpload"
              class="avatar-edit-btn">
              <BaseIcon
                name="camera"
                class="camera-icon" />
            </button>

            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
              class="hidden-input" />
          </div>

          <div class="profile-details">
            <h2 class="username">{{ profile.username }}</h2>
            <p class="birth-date">{{ formatBirthDate(profile.birth) }}</p>
            <p class="join-date">
              가입일: {{ formatJoinDate(profile.joined_at) }}
            </p>
          </div>
        </div>

        <!-- 프로필 수정 탭 -->
        <div
          v-if="activeTab === 'profile'"
          class="tab-content">
          <!-- 프로필 수정 폼 -->
          <div class="profile-edit-section">
            <h3 class="section-title">프로필 수정</h3>

            <form
              @submit.prevent="handleUpdateProfile"
              class="edit-form">
              <!-- 닉네임 수정 -->
              <div class="form-field">
                <label class="form-label">닉네임</label>
                <div class="username-input-container">
                  <BaseInput
                    v-model="editForm.username"
                    type="text"
                    placeholder="새로운 닉네임"
                    :disabled="isUpdating"
                    class="form-input"
                    @input="handleUsernameInput" />

                  <!-- 닉네임 확인 상태 표시 -->
                  <div class="username-status">
                    <div
                      v-if="usernameCheckState.isChecking"
                      class="username-status__checking">
                      <BaseIcon
                        name="loader"
                        class="spinner" />
                    </div>
                    <div
                      v-else-if="usernameCheckState.isAvailable === true"
                      class="username-status__available">
                      <BaseIcon
                        name="check"
                        class="check-icon" />
                    </div>
                    <div
                      v-else-if="usernameCheckState.isAvailable === false"
                      class="username-status__unavailable">
                      <BaseIcon
                        name="x"
                        class="x-icon" />
                    </div>
                  </div>
                </div>

                <!-- 닉네임 관련 메시지 -->
                <div
                  v-if="
                    editForm.username &&
                    (editForm.username.length < 3 ||
                      editForm.username.length > 20)
                  "
                  class="field-error">
                  닉네임은 3-20글자여야 합니다.
                </div>
                <div
                  v-else-if="usernameCheckState.message"
                  :class="[
                    'field-message',
                    usernameCheckState.isAvailable ? 'success' : 'error'
                  ]">
                  {{ usernameCheckState.message }}
                </div>
              </div>

              <!-- 비밀번호 변경 -->
              <div class="form-field">
                <label class="form-label">새 비밀번호</label>
                <BaseInput
                  v-model="editForm.password"
                  type="password"
                  placeholder="새 비밀번호 (변경 시에만 입력)"
                  :disabled="isUpdating"
                  class="form-input" />
                <p class="field-description">
                  영문, 숫자, 특수문자를 포함해 8자 이상
                </p>
              </div>

              <!-- 수정 버튼 -->
              <BaseButton
                type="submit"
                :disabled="isUpdating || !isFormValid"
                :loading="isUpdating"
                variant="primary"
                size="large"
                class="update-btn">
                {{ isUpdating ? '수정 중...' : '프로필 수정' }}
              </BaseButton>
            </form>
          </div>

          <!-- 회원 탈퇴 섹션 -->
          <div class="delete-section">
            <h3 class="section-title danger">회원 탈퇴</h3>
            <p class="delete-warning">
              회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <BaseButton
              @click="openDeleteModal"
              variant="danger"
              class="delete-btn">
              회원 탈퇴
            </BaseButton>
          </div>
        </div>

        <!-- 좋아요한 영화 탭 -->
        <div
          v-else-if="activeTab === 'liked-movies'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingMovies"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 영화를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="moviesError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ moviesError }}</p>
            <BaseButton
              @click="loadLikedMovies"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 영화 목록 -->
          <div
            v-else-if="likedMovies.length > 0"
            class="liked-movies-section">
            <h3 class="section-title">
              좋아요한 영화 ({{ likedMovies.length }}편)
            </h3>
            <div class="movies-grid">
              <div
                v-for="movie in likedMovies"
                :key="movie.movie_id"
                @click="goToMovieDetail(movie.movie_id)"
                class="movie-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w342${movie.poster_path}`"
                  :alt="movie.title"
                  class="movie-poster"
                  @error="handleImageError" />
                <div class="movie-info">
                  <h4 class="movie-title">{{ movie.title }}</h4>
                  <p class="movie-year">
                    {{ new Date(movie.release_date).getFullYear() }}
                  </p>
                  <div class="movie-rating">
                    <BaseIcon
                      name="star"
                      class="star-icon" />
                    <span>{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 영화 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="heart"
              class="empty-icon" />
            <h3>아직 좋아요한 영화가 없습니다</h3>
            <p>마음에 드는 영화에 좋아요를 눌러보세요!</p>
          </div>
        </div>

        <!-- 내 리뷰 탭 -->
        <div
          v-else-if="activeTab === 'reviews'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingReviews"
            class="tab-loading">
            <BaseSpinner />
            <p>리뷰를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="reviewsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ reviewsError }}</p>
            <BaseButton
              @click="loadUserReviews"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 내 리뷰 목록 -->
          <div
            v-else-if="userReviews.length > 0"
            class="user-reviews-section">
            <h3 class="section-title">내 리뷰 ({{ userReviews.length }}개)</h3>
            <div class="reviews-list">
              <div
                v-for="review in userReviews"
                :key="review.id"
                class="review-card">
                <div class="review-header">
                  <div class="movie-info-compact">
                    <img
                      v-if="review.movie?.poster_path"
                      :src="`https://image.tmdb.org/t/p/w92${review.movie.poster_path}`"
                      :alt="review.movie.title"
                      class="review-movie-poster"
                      @click="goToMovieDetail(review.movie.movie_id)" />
                    <div class="movie-details">
                      <h4
                        class="review-movie-title"
                        @click="goToMovieDetail(review.movie?.movie_id)">
                        {{ review.movie?.title || '영화 제목' }}
                      </h4>
                      <div class="review-rating">
                        <div class="stars-display">
                          <span
                            v-for="(star, index) in getStarDisplay(
                              review.rating
                            )"
                            :key="index"
                            class="star-item"
                            :class="star">
                            ⭐
                          </span>
                        </div>
                        <span class="rating-text">{{ review.rating }}점</span>
                      </div>
                    </div>
                  </div>
                  <span class="review-date">{{
                    formatRelativeDate(review.created_at)
                  }}</span>
                </div>
                <div class="review-content">
                  <p>{{ review.content }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 작성한 리뷰 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="message-square"
              class="empty-icon" />
            <h3>아직 작성한 리뷰가 없습니다</h3>
            <p>영화를 보고 첫 리뷰를 작성해보세요!</p>
          </div>
        </div>

        <!-- 좋아요한 배우 탭 -->
        <div
          v-else-if="activeTab === 'liked-actors'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingActors"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 배우를 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="actorsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ actorsError }}</p>
            <BaseButton
              @click="loadLikedActors"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 배우 목록 -->
          <div
            v-else-if="likedActors.length > 0"
            class="liked-people-section">
            <h3 class="section-title">
              좋아요한 배우 ({{ likedActors.length }}명)
            </h3>
            <div class="people-grid">
              <div
                v-for="actor in likedActors"
                :key="actor.id"
                @click="goToPersonDetail(actor.id)"
                class="person-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                  :alt="actor.name"
                  class="person-photo"
                  @error="handleImageError" />
                <div class="person-info">
                  <h4 class="person-name">{{ actor.name }}</h4>
                  <p class="person-role">{{ actor.role || '배우' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 배우 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="users"
              class="empty-icon" />
            <h3>아직 좋아요한 배우가 없습니다</h3>
            <p>마음에 드는 배우에 좋아요를 눌러보세요!</p>
          </div>
        </div>

        <!-- 좋아요한 감독 탭 -->
        <div
          v-else-if="activeTab === 'liked-directors'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingDirectors"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 감독을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="directorsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ directorsError }}</p>
            <BaseButton
              @click="loadLikedDirectors"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 감독 목록 -->
          <div
            v-else-if="likedDirectors.length > 0"
            class="liked-people-section">
            <h3 class="section-title">
              좋아요한 감독 ({{ likedDirectors.length }}명)
            </h3>
            <div class="people-grid">
              <div
                v-for="director in likedDirectors"
                :key="director.id"
                @click="goToPersonDetail(director.id)"
                class="person-card">
                <img
                  :src="`https://image.tmdb.org/t/p/w185${director.profile_path}`"
                  :alt="director.name"
                  class="person-photo"
                  @error="handleImageError" />
                <div class="person-info">
                  <h4 class="person-name">{{ director.name }}</h4>
                  <p class="person-role">{{ director.role || '감독' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 좋아요한 감독 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="video"
              class="empty-icon" />
            <h3>아직 좋아요한 감독이 없습니다</h3>
            <p>마음에 드는 감독에 좋아요를 눌러보세요!</p>
          </div>
        </div>

        <!-- 내 게시글 탭 -->
        <div
          v-else-if="activeTab === 'my-posts'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingPosts"
            class="tab-loading">
            <BaseSpinner />
            <p>작성한 게시글을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="postsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ postsError }}</p>
            <BaseButton
              @click="loadUserPosts"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 내 게시글 목록 -->
          <div
            v-else-if="userPosts.length > 0"
            class="user-posts-section">
            <h3 class="section-title">
              작성한 게시글 ({{ userPosts.length }}개)
            </h3>
            <div class="posts-list">
              <div
                v-for="post in userPosts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="post-card">
                <div class="post-header">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <span class="post-date">{{
                    formatRelativeDate(post.created_at)
                  }}</span>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-stats">
                  <span class="stat-item">
                    <BaseIcon
                      name="heart"
                      class="stat-icon" />
                    {{ post.like_count }}
                  </span>
                  <span class="stat-item">
                    <BaseIcon
                      name="message-circle"
                      class="stat-icon" />
                    {{ post.comment_count }}
                  </span>
                  <div class="post-tags">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="tag-chip">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 작성한 게시글 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="edit"
              class="empty-icon" />
            <h3>아직 작성한 게시글이 없습니다</h3>
            <p>첫 번째 게시글을 작성해보세요!</p>
          </div>
        </div>

        <!-- 내 댓글 탭 -->
        <div
          v-else-if="activeTab === 'my-comments'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingComments"
            class="tab-loading">
            <BaseSpinner />
            <p>작성한 댓글을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="commentsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ commentsError }}</p>
            <BaseButton
              @click="loadUserComments"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 내 댓글 목록 -->
          <div
            v-else-if="userComments.length > 0"
            class="user-comments-section">
            <h3 class="section-title">
              작성한 댓글 ({{ userComments.length }}개)
            </h3>
            <div class="comments-list">
              <div
                v-for="comment in userComments"
                :key="comment.id"
                class="comment-card">
                <div class="comment-header">
                  <div class="comment-post-info">
                    <h4
                      class="comment-post-title"
                      @click="goToPostDetail(comment.post.id)">
                      {{ comment.post.title }}
                    </h4>
                    <span class="comment-type">
                      {{ comment.parent_id ? '답글' : '댓글' }}
                    </span>
                  </div>
                  <span class="comment-date">{{
                    formatRelativeDate(comment.created_at)
                  }}</span>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
                <div class="comment-stats">
                  <span class="stat-item">
                    <BaseIcon
                      name="heart"
                      class="stat-icon" />
                    {{ comment.like_count }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 작성한 댓글 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="message-circle"
              class="empty-icon" />
            <h3>아직 작성한 댓글이 없습니다</h3>
            <p>게시글에 댓글을 남겨보세요!</p>
          </div>
        </div>

        <!-- 좋아요한 게시글 탭 -->
        <div
          v-else-if="activeTab === 'liked-posts'"
          class="tab-content">
          <!-- 로딩 상태 -->
          <div
            v-if="isLoadingLikedPosts"
            class="tab-loading">
            <BaseSpinner />
            <p>좋아요한 게시글을 불러오는 중...</p>
          </div>

          <!-- 에러 상태 -->
          <div
            v-else-if="likedPostsError"
            class="tab-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            <p>{{ likedPostsError }}</p>
            <BaseButton
              @click="loadLikedPosts"
              variant="primary">
              다시 시도
            </BaseButton>
          </div>

          <!-- 좋아요한 게시글 목록 -->
          <div
            v-else-if="likedPosts.length > 0"
            class="liked-posts-section">
            <h3 class="section-title">
              좋아요한 게시글 ({{ likedPosts.length }}개)
            </h3>
            <div class="posts-list">
              <div
                v-for="post in likedPosts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
                class="post-card">
                <div class="post-header">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <span class="post-author">by {{ post.author.username }}</span>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-stats">
                  <span class="stat-item">
                    <BaseIcon
                      name="heart"
                      class="stat-icon liked" />
                    {{ post.like_count }}
                  </span>
                  <span class="stat-item">
                    <BaseIcon
                      name="message-circle"
                      class="stat-icon" />
                    {{ post.comment_count }}
                  </span>
                  <div class="post-tags">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="tag-chip">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                <span class="post-date">{{
                  formatRelativeDate(post.created_at)
                }}</span>
              </div>
            </div>
          </div>

          <!-- 좋아요한 게시글 없음 -->
          <div
            v-else
            class="empty-state">
            <BaseIcon
              name="thumb-up"
              class="empty-icon" />
            <h3>아직 좋아요한 게시글이 없습니다</h3>
            <p>마음에 드는 게시글에 좋아요를 눌러보세요!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원 탈퇴 확인 모달 (기존과 동일) -->
    <BaseModal
      :modelValue="showDeleteModal"
      @update:modelValue="showDeleteModal = $event"
      @close="closeDeleteModal"
      class="delete-modal">
      <div class="delete-modal-content">
        <div class="delete-modal-header">
          <BaseIcon
            name="alert-triangle"
            class="warning-icon" />
          <h3>회원 탈퇴</h3>
        </div>

        <div class="delete-modal-body">
          <p class="delete-confirmation-text">
            정말로 회원 탈퇴를 하시겠습니까?<br />
            탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>

          <div class="password-verification">
            <label class="form-label">비밀번호 확인</label>
            <BaseInput
              v-model="deleteForm.password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              :disabled="isDeleting"
              class="password-input" />
          </div>

          <div
            v-if="deleteError"
            class="delete-error">
            <BaseIcon
              name="alert-circle"
              class="error-icon" />
            {{ deleteError }}
          </div>
        </div>

        <div class="delete-modal-footer">
          <BaseButton
            @click="closeDeleteModal"
            :disabled="isDeleting"
            variant="secondary">
            취소
          </BaseButton>
          <BaseButton
            @click="handleDeleteAccount"
            :disabled="isDeleting || !deleteForm.password"
            :loading="isDeleting"
            variant="danger">
            {{ isDeleting ? '탈퇴 중...' : '탈퇴하기' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import {
    getUserLikedMovies,
    getUserReviews,
    getUserLikedActors,
    getUserLikedDirectors,
    getUserPosts,
    getUserComments,
    getUserLikedPosts
  } from '@/services/api'
  import * as authAPI from '@/services/authApi'

  import PageHeader from '@/components/layout/PageHeader.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseIcon from '@/components/base/BaseIcon.vue'
  import BaseSpinner from '@/components/base/BaseSpinner.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  const router = useRouter()
  const { logout } = useAuth()

  // 상태
  const isLoading = ref(true)
  const isUpdating = ref(false)
  const isDeleting = ref(false)
  const error = ref('')
  const deleteError = ref('')

  const likedMovies = ref([])
  const userReviews = ref([])
  const isLoadingMovies = ref(false)
  const isLoadingReviews = ref(false)
  const moviesError = ref('')
  const reviewsError = ref('')

  const likedActors = ref([])
  const likedDirectors = ref([])
  const userPosts = ref([])
  const userComments = ref([])
  const likedPosts = ref([])

  const isLoadingActors = ref(false)
  const isLoadingDirectors = ref(false)
  const isLoadingPosts = ref(false)
  const isLoadingComments = ref(false)
  const isLoadingLikedPosts = ref(false)

  const actorsError = ref('')
  const directorsError = ref('')
  const postsError = ref('')
  const commentsError = ref('')
  const likedPostsError = ref('')

  // 탭 상태
  const activeTab = ref('profile')

  const profile = ref({
    user_id: null,
    username: '',
    birth: '',
    profile_image_url: '',
    joined_at: ''
  })

  const editForm = ref({
    username: '',
    password: '',
    profileImage: null
  })

  const deleteForm = ref({
    password: ''
  })

  // 닉네임 중복 확인 상태 추가
  const usernameCheckState = ref({
    isChecking: false,
    isAvailable: null, // null: 미확인, true: 사용가능, false: 사용불가
    message: ''
  })

  const showDeleteModal = ref(false)
  const imageInput = ref(null)

  // 닉네임 중복 확인 디바운스 타이머
  let usernameCheckTimer = null

  // 계산된 속성
  const hasChanges = computed(() => {
    return (
      editForm.value.username !== profile.value.username ||
      editForm.value.password.length > 0 ||
      editForm.value.profileImage !== null
    )
  })

  // 닉네임 변경 여부 확인
  const isUsernameChanged = computed(() => {
    return (
      editForm.value.username !== profile.value.username &&
      editForm.value.username.length >= 3
    )
  })

  // 폼 유효성 (닉네임 중복 확인 포함)
  const isFormValid = computed(() => {
    // 닉네임이 변경된 경우 중복 확인이 완료되어야 함
    if (isUsernameChanged.value) {
      return usernameCheckState.value.isAvailable === true
    }
    // 닉네임이 변경되지 않은 경우는 다른 변경사항만 확인
    return hasChanges.value
  })

  // 프로필 정보 로드
  const loadProfile = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const data = await authAPI.getUserProfile()

      profile.value = {
        user_id: data.id || data.user_id,
        username: data.username,
        birth: data.birth,
        profile_image_url: data.profile_image_url,
        joined_at:
          data.date_joined || data.joined_at || new Date().toISOString() // 가입일 fallback 추가
      }

      // 수정 폼 초기값 설정
      editForm.value.username = data.username

      // 닉네임 중복 확인 상태 초기화
      usernameCheckState.value = {
        isChecking: false,
        isAvailable: null,
        message: ''
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err)
      error.value =
        err.response?.data?.error || '프로필 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // 닉네임 입력 핸들러 (디바운스 적용)
  const handleUsernameInput = () => {
    const username = editForm.value.username.trim()

    // 이전 타이머 취소
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer)
    }

    // 상태 초기화
    usernameCheckState.value = {
      isChecking: false,
      isAvailable: null,
      message: ''
    }

    // 원래 닉네임과 같으면 확인하지 않음
    if (username === profile.value.username) {
      return
    }

    // 유효하지 않은 사용자명이면 확인하지 않음
    if (username.length < 3 || username.length > 20) {
      return
    }

    // 500ms 후에 중복 확인 실행
    usernameCheckTimer = setTimeout(async () => {
      await checkUsername(username)
    }, 500)
  }

  // 닉네임 중복 확인 실행
  const checkUsername = async (username) => {
    if (!username || username.length < 3 || username.length > 20) return

    usernameCheckState.value.isChecking = true
    usernameCheckState.value.message = ''

    try {
      const result = await authAPI.checkUsernameAvailability(username)

      if (result.message) {
        usernameCheckState.value.isAvailable = true
        usernameCheckState.value.message = result.message
      }
    } catch (err) {
      usernameCheckState.value.isAvailable = false
      usernameCheckState.value.message =
        err.response?.data?.error || '닉네임 확인에 실패했습니다.'
    } finally {
      usernameCheckState.value.isChecking = false
    }
  }
  const openImageUpload = () => {
    imageInput.value?.click()
  }

  // 이미지 선택 처리
  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }

      editForm.value.profileImage = file

      // 미리보기 업데이트
      const reader = new FileReader()
      reader.onload = (e) => {
        profile.value.profile_image_url = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 에러 처리 (기존 함수가 있다면 수정, 없다면 추가)
  const handleImageError = (event) => {
    event.target.style.display = 'none'
  }

  // 프로필 수정
  const handleUpdateProfile = async () => {
    try {
      isUpdating.value = true

      // 이미지가 있으면 FormData, 없으면 일반 객체 사용
      if (editForm.value.profileImage) {
        console.log('🖼️ 이미지 업로드 시도:', editForm.value.profileImage)

        const formData = new FormData()

        // 변경된 필드만 추가 (백엔드 필드명에 맞춤)
        if (editForm.value.username !== profile.value.username) {
          formData.append('username', editForm.value.username)
        }

        if (editForm.value.password) {
          formData.append('password1', editForm.value.password)
          formData.append('password2', editForm.value.password)
        }

        formData.append('profile_image', editForm.value.profileImage)

        const response = await authAPI.updateUserProfile(formData)
        console.log('✅ 업데이트 응답:', response)

        // 🔧 프로필 이미지 즉시 업데이트
        if (response.user && response.user.profile_image_url) {
          profile.value.profile_image_url = response.user.profile_image_url
        }
      } else {
        // 이미지가 없으면 JSON으로 전송
        const updateData = {}

        if (editForm.value.username !== profile.value.username) {
          updateData.username = editForm.value.username
        }

        if (editForm.value.password) {
          updateData.password1 = editForm.value.password
          updateData.password2 = editForm.value.password
        }

        console.log('📤 전송할 JSON 데이터:', updateData)
        const response = await authAPI.updateUserProfile(updateData)
        console.log('✅ 업데이트 응답:', response)
      }

      // 성공 시 프로필 다시 로드
      console.log('🔄 프로필 정보 다시 로드...')
      await loadProfile()

      // 폼 초기화
      editForm.value.password = ''
      editForm.value.profileImage = null

      alert('프로필이 성공적으로 수정되었습니다.')
    } catch (err) {
      console.error('프로필 수정 실패:', err)
      alert(err.response?.data?.error || '프로필 수정에 실패했습니다.')
    } finally {
      isUpdating.value = false
    }
  }

  // 이미지 URL을 완전한 URL로 변환하는 함수
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return ''

    // 이미 완전한 URL인 경우
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    // 상대 경로인 경우 베이스 URL 추가
    return `http://localhost:8000${imageUrl}`
  }

  // 회원 탈퇴 모달 열기
  const openDeleteModal = () => {
    showDeleteModal.value = true
    deleteForm.value.password = ''
    deleteError.value = ''
  }

  // 회원 탈퇴 모달 닫기
  const closeDeleteModal = () => {
    showDeleteModal.value = false
    deleteForm.value.password = ''
    deleteError.value = ''
  }

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    try {
      isDeleting.value = true
      deleteError.value = ''

      await authAPI.deleteUserAccount(deleteForm.value.password)

      alert('회원 탈퇴가 완료되었습니다.')

      // 로그아웃 후 홈으로 이동
      await logout()
      router.push({ name: 'Home' })
    } catch (err) {
      console.error('회원 탈퇴 실패:', err)
      deleteError.value =
        err.response?.data?.error || '회원 탈퇴에 실패했습니다.'
    } finally {
      isDeleting.value = false
    }
  }

  // 날짜 포맷팅
  const formatBirthDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  // 날짜 포맷팅 (기존 함수 교체)
  const formatJoinDate = (dateString) => {
    if (!dateString) return '정보 없음'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    } catch (error) {
      return '정보 없음'
    }
  }
  // 좋아요한 영화 목록 로드
  const loadLikedMovies = async () => {
    try {
      isLoadingMovies.value = true
      moviesError.value = ''

      const response = await getUserLikedMovies()
      likedMovies.value = response.liked_movies || []

      console.log('✅ 좋아요한 영화 로드 성공:', likedMovies.value.length)
    } catch (err) {
      console.error('❌ 좋아요한 영화 로드 실패:', err)
      moviesError.value =
        err.response?.data?.error || '좋아요한 영화를 불러오는데 실패했습니다.'
    } finally {
      isLoadingMovies.value = false
    }
  }

  // 사용자 리뷰 목록 로드
  const loadUserReviews = async () => {
    try {
      isLoadingReviews.value = true
      reviewsError.value = ''

      const response = await getUserReviews()
      userReviews.value = response.reviews || []

      console.log('✅ 사용자 리뷰 로드 성공:', userReviews.value.length)
    } catch (err) {
      console.error('❌ 사용자 리뷰 로드 실패:', err)
      reviewsError.value =
        err.response?.data?.error || '리뷰를 불러오는데 실패했습니다.'
    } finally {
      isLoadingReviews.value = false
    }
  }

  // 탭 변경 시 데이터 로드
  const handleTabChange = (tab) => {
    activeTab.value = tab

    // 각 탭에 맞는 데이터 로드
    if (tab === 'liked-movies' && likedMovies.value.length === 0) {
      loadLikedMovies()
    } else if (tab === 'reviews' && userReviews.value.length === 0) {
      loadUserReviews()
    } else if (tab === 'liked-actors' && likedActors.value.length === 0) {
      loadLikedActors()
    } else if (tab === 'liked-directors' && likedDirectors.value.length === 0) {
      loadLikedDirectors()
    } else if (tab === 'my-posts' && userPosts.value.length === 0) {
      loadUserPosts()
    } else if (tab === 'my-comments' && userComments.value.length === 0) {
      loadUserComments()
    } else if (tab === 'liked-posts' && likedPosts.value.length === 0) {
      loadLikedPosts()
    }
  }

  // 영화 상세로 이동
  const goToMovieDetail = (movieId) => {
    router.push({ name: 'MovieDetail', params: { id: movieId } })
  }

  // 별점 표시 함수
  const getStarDisplay = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      if (rating >= starValue) return 'full'
      if (rating >= starValue - 0.5) return 'half'
      return 'empty'
    })
  }

  // 날짜 포맷팅 (상대적 시간)
  const formatRelativeDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1일 전'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}개월 전`
    return `${Math.ceil(diffDays / 365)}년 전`
  }

  // 좋아요한 배우 목록 로드
  const loadLikedActors = async () => {
    try {
      isLoadingActors.value = true
      actorsError.value = ''

      const response = await getUserLikedActors()
      likedActors.value = response.liked_actors || []

      console.log('✅ 좋아요한 배우 로드 성공:', likedActors.value.length)
    } catch (err) {
      console.error('❌ 좋아요한 배우 로드 실패:', err)
      actorsError.value =
        err.response?.data?.error || '좋아요한 배우를 불러오는데 실패했습니다.'
    } finally {
      isLoadingActors.value = false
    }
  }

  // 좋아요한 감독 목록 로드
  const loadLikedDirectors = async () => {
    try {
      isLoadingDirectors.value = true
      directorsError.value = ''

      const response = await getUserLikedDirectors()
      likedDirectors.value = response.liked_directors || []

      console.log('✅ 좋아요한 감독 로드 성공:', likedDirectors.value.length)
    } catch (err) {
      console.error('❌ 좋아요한 감독 로드 실패:', err)
      directorsError.value =
        err.response?.data?.error || '좋아요한 감독을 불러오는데 실패했습니다.'
    } finally {
      isLoadingDirectors.value = false
    }
  }

  // 사용자 게시글 목록 로드
  const loadUserPosts = async () => {
    try {
      isLoadingPosts.value = true
      postsError.value = ''

      const response = await getUserPosts()
      userPosts.value = response.posts || []

      console.log('✅ 사용자 게시글 로드 성공:', userPosts.value.length)
    } catch (err) {
      console.error('❌ 사용자 게시글 로드 실패:', err)
      postsError.value =
        err.response?.data?.error || '작성한 게시글을 불러오는데 실패했습니다.'
    } finally {
      isLoadingPosts.value = false
    }
  }

  // 사용자 댓글 목록 로드
  const loadUserComments = async () => {
    try {
      isLoadingComments.value = true
      commentsError.value = ''

      const response = await getUserComments()
      userComments.value = response.comments || []

      console.log('✅ 사용자 댓글 로드 성공:', userComments.value.length)
    } catch (err) {
      console.error('❌ 사용자 댓글 로드 실패:', err)
      commentsError.value =
        err.response?.data?.error || '작성한 댓글을 불러오는데 실패했습니다.'
    } finally {
      isLoadingComments.value = false
    }
  }

  // 좋아요한 게시글 목록 로드
  const loadLikedPosts = async () => {
    try {
      isLoadingLikedPosts.value = true
      likedPostsError.value = ''

      const response = await getUserLikedPosts()
      likedPosts.value = response.liked_posts || []
    } catch (err) {
      console.error('❌ 좋아요한 게시글 로드 실패:', err)
      likedPostsError.value =
        err.response?.data?.error ||
        '좋아요한 게시글을 불러오는데 실패했습니다.'
    } finally {
      isLoadingLikedPosts.value = false
    }
  }

  // 인물 상세로 이동
  const goToPersonDetail = (personId) => {
    router.push({ name: 'PersonDetail', params: { id: personId } })
  }

  // 게시글 상세로 이동
  const goToPostDetail = (postId) => {
    router.push({ name: 'PostDetail', params: { id: postId } })
  }

  // 컴포넌트 마운트 시 프로필 로드
  onMounted(() => {
    loadProfile()
  })

  // 컴포넌트 언마운트 시 타이머 정리
  import { onUnmounted } from 'vue'

  onUnmounted(() => {
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer)
    }
  })
</script>

<style scoped>
  .profile-view {
    min-height: 100vh;
    background-color: var(--color-background);
  }

  .profile-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
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

  /* 프로필 정보 섹션 */
  .profile-info-section {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }

  .profile-avatar-container {
    position: relative;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--border-radius-full);
    overflow: hidden;
    background-color: var(--color-highlight-background);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .profile-avatar--clickable {
    cursor: pointer;
  }

  .profile-avatar--clickable:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 183, 0, 0.3);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .profile-avatar--clickable:hover .avatar-image {
    filter: brightness(0.7);
  }

  .avatar-placeholder {
    width: 40px;
    height: 40px;
    color: var(--color-inactive-icon);
    transition: all 0.3s ease;
  }

  .profile-avatar--clickable:hover .avatar-placeholder {
    color: var(--color-main);
    transform: scale(1.1);
  }

  /* 아바타 오버레이 */
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
    gap: 4px;
  }

  .profile-avatar--clickable:hover .avatar-overlay {
    opacity: 1;
  }

  .camera-overlay-icon {
    width: 20px;
    height: 20px;
    color: white;
  }

  .overlay-text {
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
  }

  /* 기존 편집 버튼 스타일 유지 */
  .avatar-edit-btn {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius-full);
    background-color: var(--color-main);
    border: 2px solid var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
    z-index: 2;
  }

  .avatar-edit-btn:hover {
    transform: scale(1.1);
  }

  .camera-icon {
    width: 16px;
    height: 16px;
    color: var(--color-background);
  }

  /* 반응형에서 아바타 크기 조정 */
  @media (max-width: 768px) {
    .profile-avatar {
      width: 70px;
      height: 70px;
    }
    .avatar-placeholder {
      width: 35px;
      height: 35px;
    }
    .camera-overlay-icon {
      width: 18px;
      height: 18px;
    }
    .overlay-text {
      font-size: 9px;
    }
  }

  @media (max-width: 480px) {
    .profile-avatar {
      width: 60px;
      height: 60px;
    }
    .avatar-placeholder {
      width: 30px;
      height: 30px;
    }
    .camera-overlay-icon {
      width: 16px;
      height: 16px;
    }
    .overlay-text {
      font-size: 8px;
    }
    .avatar-edit-btn {
      width: 28px;
      height: 28px;
      bottom: -2px;
      right: -2px;
    }
    .camera-icon {
      width: 14px;
      height: 14px;
    }
  }

  .hidden-input {
    display: none;
  }

  .profile-details {
    flex: 1;
  }

  .username {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
  }

  .birth-date,
  .join-date {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin: 4px 0;
  }

  /* 프로필 수정 섹션 */
  .profile-edit-section,
  .delete-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 20px 0;
  }

  .section-title.danger {
    color: var(--color-alert);
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  .form-input {
    width: 100%;
  }

  .username-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .username-input-container .form-input {
    width: 100%;
    min-width: 300px;
  }

  .username-status {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .username-status__checking .spinner {
    width: 16px;
    height: 16px;
    color: var(--color-highlight-text);
    animation: spin 1s linear infinite;
  }

  .username-status__available .check-icon {
    width: 16px;
    height: 16px;
    color: var(--color-success);
  }

  .username-status__unavailable .x-icon {
    width: 16px;
    height: 16px;
    color: var(--color-alert);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .field-error {
    font-size: 12px;
    color: var(--color-alert);
    margin-top: -4px;
  }

  .field-message {
    font-size: 12px;
    margin-top: -4px;
  }

  .field-message.success {
    color: var(--color-success);
  }

  .field-message.error {
    color: var(--color-alert);
  }

  .field-description {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  .update-btn {
    width: 100%;
    margin-top: 8px;
  }

  /* 회원 탈퇴 섹션 */
  .delete-warning {
    font-size: 14px;
    color: var(--color-highlight-text);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .delete-btn {
    width: 100%;
  }

  /* 회원 탈퇴 모달 */
  .delete-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%;
    max-width: 400px;
    margin: 0 auto;
  }

  .delete-modal-content {
    width: 100%;
    max-width: 350px;
    padding: 32px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .delete-modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .warning-icon {
    width: 24px;
    height: 24px;
    color: var(--color-alert);
  }

  .delete-modal-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .delete-modal-body {
    margin-bottom: 24px;
  }

  .delete-confirmation-text {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .password-verification {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .password-input {
    width: 100%;
  }

  .delete-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: var(--color-alert);
    color: white;
    border-radius: var(--border-radius-medium);
    font-size: 14px;
    margin-top: 12px;
  }

  .delete-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .delete-modal-footer button {
    min-width: 80px;
  }

  /* 프로필 탭 네비게이션 */
  .profile-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4열 그리드로 변경 */
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    margin-bottom: 24px;
    padding: 4px;
    gap: 4px;
  }

  .profile-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px; /* 8px → 6px로 줄임 */
    padding: 10px 8px; /* 12px 16px → 10px 8px로 조정 */
    background: none;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    font-size: 13px; /* 14px → 13px로 조정 */
    font-weight: 500;
    color: var(--color-highlight-text);
    transition: all 0.2s ease;
    font-family: 'Pretendard-Regular', sans-serif;
    text-align: center;
    white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  }

  .profile-tab:hover {
    color: var(--color-text);
    background-color: var(--color-highlight-background);
  }

  .profile-tab--active {
    color: var(--color-text);
    background-color: var(--color-main);
  }

  .profile-tab--active .tab-icon {
    color: var(--color-background);
  }

  .tab-icon {
    width: 16px;
    height: 16px;
    color: var(--color-highlight-text);
    transition: color 0.2s;
  }

  .profile-tab--active .tab-icon {
    color: var(--color-background);
  }

  /* 탭 컨텐츠 */
  .tab-content {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 탭 로딩/에러 상태 */
  .tab-loading,
  .tab-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: var(--color-text);
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
  }

  .tab-loading p,
  .tab-error p {
    margin: 16px 0;
    color: var(--color-highlight-text);
  }

  /* 좋아요한 영화 섹션 */
  .liked-movies-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .movie-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .movie-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-main-opacity-50);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .movie-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background-color: var(--color-inactive-icon);
  }

  .movie-info {
    padding: 12px;
  }

  .movie-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .movie-year {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0 0 8px 0;
  }

  .movie-rating {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .star-icon {
    width: 12px;
    height: 12px;
    color: var(--color-main);
  }

  .movie-rating span {
    font-size: 12px;
    color: var(--color-text);
    font-weight: 500;
  }

  /* 내 리뷰 섹션 */
  .user-reviews-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .review-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    padding: 20px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.2s ease;
  }

  .review-card:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .movie-info-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .review-movie-poster {
    width: 50px;
    height: 75px;
    object-fit: cover;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .review-movie-poster:hover {
    transform: scale(1.05);
  }

  .movie-details {
    flex: 1;
    min-width: 0;
  }

  .review-movie-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1.3;
  }

  .review-movie-title:hover {
    color: var(--color-main);
  }

  .review-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stars-display {
    display: flex;
    gap: 2px;
  }

  .star-item {
    font-size: 14px;
    filter: grayscale(100%);
    opacity: 0.3;
  }

  .star-item.half {
    background: linear-gradient(90deg, var(--color-main) 50%, transparent 50%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: none;
    opacity: 1;
  }

  .star-item.full {
    color: var(--color-main);
    filter: none;
    opacity: 1;
  }

  .rating-text {
    font-size: 12px;
    color: var(--color-highlight-text);
    font-weight: 500;
  }

  .review-date {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .review-content {
    margin-top: 12px;
  }

  .review-content p {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  /* 빈 상태 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
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

  /* 이미지 에러 처리 */
  .movie-poster[src=''],
  .movie-poster:not([src]),
  .review-movie-poster[src=''],
  .review-movie-poster:not([src]) {
    background-color: var(--color-inactive-icon);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    font-size: 24px;
  }

  .movie-poster[src='']:after,
  .movie-poster:not([src]):after {
    content: '🎬';
  }

  .review-movie-poster[src='']:after,
  .review-movie-poster:not([src]):after {
    content: '🎬';
    font-size: 16px;
  }

  /* 인물 관련 스타일 */
  .liked-people-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .people-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .person-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .person-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-main-opacity-50);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .person-photo {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background-color: var(--color-inactive-icon);
  }

  .person-info {
    padding: 12px;
  }

  .person-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 4px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .person-role {
    font-size: 12px;
    color: var(--color-highlight-text);
    margin: 0;
  }

  /* 게시글 관련 스타일 */
  .user-posts-section,
  .liked-posts-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .post-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    padding: 20px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .post-card:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .post-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
    flex: 1;
  }

  .post-author {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .post-date {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .post-content {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0 0 16px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .post-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--color-highlight-text);
  }

  .stat-icon {
    width: 14px;
    height: 14px;
    color: var(--color-highlight-text);
  }

  .stat-icon.liked {
    color: var(--color-alert);
  }

  .post-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-left: auto;
  }

  .tag-chip {
    background-color: var(--color-main-opacity-20);
    color: var(--color-main);
    padding: 2px 8px;
    border-radius: var(--border-radius-small);
    font-size: 11px;
    font-weight: 500;
  }

  /* 댓글 관련 스타일 */
  .user-comments-section {
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-large);
    padding: 24px;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .comment-card {
    background-color: var(--color-highlight-background);
    border-radius: var(--border-radius-large);
    padding: 20px;
    border: 1px solid var(--color-inactive-icon);
    transition: all 0.2s ease;
  }

  .comment-card:hover {
    border-color: var(--color-main-opacity-50);
    transform: translateY(-2px);
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 16px;
  }

  .comment-post-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .comment-post-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1.3;
  }

  .comment-post-title:hover {
    color: var(--color-main);
  }

  .comment-type {
    background-color: var(--color-main-opacity-20);
    color: var(--color-main);
    padding: 2px 6px;
    border-radius: var(--border-radius-small);
    font-size: 10px;
    font-weight: 500;
  }

  .comment-date {
    font-size: 12px;
    color: var(--color-highlight-text);
    flex-shrink: 0;
  }

  .comment-content {
    margin-bottom: 12px;
  }

  .comment-content p {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  .comment-stats {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 탭 네비게이션 반응형 개선 */
  @media (max-width: 768px) {
    .profile-container {
      padding: 16px;
      max-width: 100%; /* 모바일에서는 전체 너비 사용 */
    }

    .profile-tabs {
      grid-template-columns: repeat(2, 1fr); /* 모바일에서는 2열 */
      gap: 3px;
    }

    .profile-tab {
      font-size: 12px;
      padding: 8px 6px;
      flex-direction: column; /* 모바일에서는 세로 배치 */
      gap: 4px;
    }

    .tab-icon {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    .profile-container {
      padding: 12px;
    }

    .profile-tabs {
      grid-template-columns: repeat(2, 1fr);
    }

    .profile-tab {
      font-size: 11px;
      padding: 6px 4px;
    }

    .tab-icon {
      width: 12px;
      height: 12px;
    }

    .username-input-container .form-input {
      min-width: 250px;
    }
  }

  /* 이미지 에러 처리 */
  .person-photo[src=''],
  .person-photo:not([src]) {
    background-color: var(--color-inactive-icon);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    font-size: 24px;
  }

  .person-photo[src='']:after,
  .person-photo:not([src]):after {
    content: '👤';
  }
</style>
