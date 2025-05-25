// src/utils/dateUtils.js
export const isContentEdited = (createdAt, updatedAt, thresholdSeconds = 5) => {
  if (!createdAt || !updatedAt) {
    return false
  }

  try {
    const createdTime = new Date(createdAt).getTime()
    const updatedTime = new Date(updatedAt).getTime()

    // 지정된 임계값(기본 5초) 이상 차이가 날 때만 수정됨으로 표시
    const thresholdMs = thresholdSeconds * 1000
    return Math.abs(updatedTime - createdTime) > thresholdMs
  } catch (error) {
    console.error('날짜 비교 중 오류:', error)
    return false
  }
}

export const formatTimeAgo = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}시간 전`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      if (days < 30) {
        return `${days}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    }
  } catch (error) {
    console.error('시간 포맷팅 중 오류:', error)
    return '알 수 없음'
  }
}
