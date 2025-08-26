# 씨네메모리 (Cine Memory)

**당신의 인생을 영화로 되돌아보는 타임캡슐 시네마**

사용자의 생년월일을 기반으로 인생 타임라인과 영화를 연결하는 개인화된 시네마틱 여정을 제공하는 서비스입니다.


## 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [팀](#-팀)

## 프로젝트 소개

씨네메모리는 사용자가 태어난 해부터 현재까지 각 나이별로 그 시기에 개봉한 "인생 영화" 한 편씩을 추천하며, 이를 통해 사용자가 자신의 인생을 영화적 여정으로 재해석할 수 있는 경험을 제공합니다.

![홈페이지](https://i.imgur.com/xWZzpxo.png)

*메인 홈페이지 화면*


### 디자인 컨셉

- **골든 나이트 테마**: 영화관의 따뜻하고 고급스러운 분위기
- **노스탤지어 마케팅**: "당신의 7살 시절, 그 때의 영화" 등 세대별 특집 컨텐츠
- **시네마틱 UX**: 영화적 경험을 살린 인터페이스

## 주요 기능

###  개인화된 영화 타임라인
- 생년월일 기반 나이별 영화 추천
- 인터랙티브 타임라인 UI


### 타임라인 생성 과정

#### 재밌게 본 영화 선택
<img src="https://i.imgur.com/FRWrZjE.png" width="650" alt="온보딩 서베이 1">

*재밌게 본 영화들을 선택합니다.*

#### 숨겨진 취향 분석
<img src="https://i.imgur.com/AxKnShy.png" width="650" alt="온보딩 서베이 2">

*포스터만 보고 재밌어보이는 영화를 고릅니다.*

#### 비선호 장르 제외
<img src="https://i.imgur.com/YCwq9GE.png" width="650" alt="온보딩 서베이 3">

*취향 분석에서 제외할 장르를 선택합니다.*

#### 취향 분석
<img src="https://i.imgur.com/6TFqE0h.png" width="650" alt="온보딩 서베이 4">

*취향 분석 로딩 중*

#### 타임라인 완성
<img src="https://i.imgur.com/eFr4fU2.png" width="650" alt="온보딩 서베이 5">

*나이별로 정리된 나만의 영화 타임라인이 완성됩니다.

###  영화 검색 및 상세 정보
#### 영화 검색
<img src="https://i.imgur.com/y4wOnis.png" width="650" alt="영화 검색 결과">

*TMDB API를 활용한 실시간 영화 검색으로 원하는 영화를 빠르게 찾을 수 있습니다*

#### 영화 상세 정보
<img src="https://i.imgur.com/75OSO0i.png" width="650" alt="영화 기본 정보">

*영화의 포스터, 줄거리, 개봉일, 장르, 평점 등 기본 정보를 한눈에 확인할 수 있습니다*

<img src="https://i.imgur.com/467Mbfs.png" width="650" alt="출연진 및 OTT 정보">

*감독, 주요 출연진 정보와 함께 Netflix, 왓챠 등 OTT 스트리밍 서비스 정보를 제공합니다*

<img src="https://i.imgur.com/467Mbfs.png" width="650" alt="사용자 리뷰 시스템">

*다른 사용자들의 리뷰를 확인하고, 나만의 평점과 리뷰를 남길 수 있습니다*


### 커뮤니티 기능
- 세대별 영화 경험 공유
- 게시글 작성 및 댓글 시스템
- 태그 기반 카테고리 분류
- 실시간 좋아요 및 상호작용

#### 커뮤니티 홈
<img src="https://i.imgur.com/O5u4JQ9.png" width="650" alt="커뮤니티 메인 페이지">

*세대별 영화 경험을 공유하고, 다른 사용자들의 이야기를 확인할 수 있는 커뮤니티 공간입니다*

#### 게시글 작성
<img src="https://i.imgur.com/0G9gWOw.png" width="650" alt="게시글 작성 페이지">

*간편한 에디터로 영화에 대한 생각과 추억을 태그와 함께 자유롭게 작성할 수 있습니다*

#### 게시글 상세 및 소통
<img src="https://i.imgur.com/QgUlnpE.png" width="650" alt="게시글 상세 페이지">

*다른 사용자들과 댓글을 통해 영화에 대한 깊이 있는 대화를 나누고 공감할 수 있습니다*

### 사용자 인증 및 프로필
- JWT 기반 인증 시스템
- 개인 프로필 관리
- 생년월일 기반 개인화 설정

<img src="https://i.imgur.com/s43u0kr.png" width="650" alt="게시글 상세 페이지">


### 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- 터치 친화적 인터페이스

<img src="https://i.imgur.com/gUrKo2Q.png" width="300" alt="반응형 예시">

## 🛠 기술 스택

### Frontend
- **Framework**: Vue.js 3
- **State Management**: Pinia 
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Styling**: CSS3 (Custom Properties)
- **Font**: Pretendard

### Backend
- **Framework**: Django
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **Authentication**: JWT
- **API**: Django REST Framework

### External APIs
- **TMDB API**: 영화 데이터
- **TMDB MCP**: 영화 검색 및 추천

### Design & Tools
- **Design**: Figma
- **Version Control**: Git

## 설치 및 실행

### 사전 요구사항
- Node.js 16+
- Python 3.8+

### Frontend 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-repo/cine-memory-frontend.git
cd cine-memory-frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### Backend 설정

```bash
# 백엔드 프로젝트 클론
git clone https://github.com/your-repo/cine-memory-backend.git
cd cine-memory-backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py migrate

# 개발 서버 실행
python manage.py runserver
```

### 환경 변수 설정

Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_TMDB_API_KEY=your_tmdb_api_key
```

Backend (`.env`)
```env
SECRET_KEY=your_secret_key
TMDB_API_KEY=your_tmdb_api_key
DEBUG=True
```

## 📡 API 문서

### 인증 API
- `POST /api/auth/login/`: 로그인
- `POST /api/auth/signup/`: 회원가입
- `POST /api/auth/logout/`: 로그아웃
- `GET /api/auth/profile/`: 프로필 조회

### 영화 API
- `GET /api/movies/search/`: 영화 검색
- `GET /api/movies/{id}/`: 영화 상세 조회
- `POST /api/movies/{id}/review/`: 리뷰 작성
- `POST /api/movies/{id}/like/`: 좋아요

### 커뮤니티 API
- `GET /api/posts/`: 게시글 목록
- `POST /api/posts/`: 게시글 작성
- `GET /api/posts/{id}/`: 게시글 상세
- `POST /api/posts/{id}/comments/`: 댓글 작성

### 타임라인 API
- `GET /api/timeline/`: 개인 타임라인 조회
- `POST /api/timeline/generate/`: 타임라인 생성

## 👥 팀
- **Frontend Developer**(Me): [이현석](https://github.com/ppower-dev)
- **Backend Developer**: [김서현](https://github.com/se0hyun)
