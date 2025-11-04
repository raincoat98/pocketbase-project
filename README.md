# PocketBase 프로젝트

이 프로젝트는 프론트엔드와 PocketBase 백엔드를 포함한 전체 스택 웹 애플리케이션입니다. 프로덕션 환경에서는 PocketBase 하나의 인스턴스로 프론트엔드(정적 파일)와 API를 모두 서빙합니다.

## 프로젝트 구조

```
.
├── frontend/          # 프론트엔드 애플리케이션
├── pocketbase/        # PocketBase 설정 및 데이터 디렉토리
├── nginx/            # Nginx 설정 파일
├── docker-compose.yml        # 개발 환경 Docker Compose 설정
├── docker-compose.prod.yml   # 프로덕션 환경 Docker Compose 설정
└── deploy.sh         # 배포 스크립트
```

## 시작하기

### 필수 요구사항

- Docker
- Docker Compose

### 개발 환경 실행

1. 저장소를 클론합니다:

```bash
git clone [repository-url]
cd pocketbase-project
```

2. (선택사항) 프론트엔드 환경 변수 설정:

```bash
cd frontend
# .env 파일 생성 (선택사항 - 기본값 사용 가능)
echo "VITE_API_URL=http://localhost:8890" > .env
cd ..
```

3. 개발 환경을 시작합니다:

```bash
docker-compose up
```

이 명령어는 다음 서비스들을 시작합니다:

- 프론트엔드 (포트: 4701)
- PocketBase (포트: 8890)
- Nginx (포트: 8890)

### 프로덕션 환경 실행

프로덕션 환경을 시작하려면:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

프로덕션 환경에서는 PocketBase 하나의 인스턴스로 프론트엔드와 API를 모두 서빙합니다. 프론트엔드 빌드 결과물은 PocketBase의 `pb_public` 디렉토리에 포함됩니다.

## 접근 방법

### 개발 환경

- 프론트엔드: http://localhost:4701
- PocketBase: http://localhost:8890
- Nginx 프록시: http://localhost:8890

### 프로덕션 환경

- 웹 애플리케이션: http://localhost:8890 (프론트엔드 + API)
- API 엔드포인트: http://localhost:8890/api/
- PocketBase 관리자: http://localhost:8890/\_/

## 배포

프로덕션 환경 배포:

```bash
./deploy.sh
```

## 기술 스택

- 프론트엔드: React + Vite
- 백엔드: PocketBase (SQLite 기반 백엔드)
- 정적 파일 서빙: PocketBase pb_public 디렉토리
- 컨테이너화: Docker

### 프로덕션 아키텍처

- 단일 PocketBase 인스턴스로 프론트엔드와 API 모두 서빙
- 프론트엔드 빌드 결과물은 Docker 이미지 빌드 시 `/pb/pb_public`에 포함
- PocketBase는 `pb_public` 폴더의 정적 파일을 자동으로 웹 호스팅
- 개발 환경에서는 Nginx를 사용하여 프론트엔드와 PocketBase를 프록시

### PocketBase 관리

**최초 관리자 계정 생성:**
프로덕션 환경에서 PocketBase에 처음 접속하면 `http://localhost:8890/_/`에서 관리자 계정을 생성할 수 있습니다.

**관리자 대시보드:**

- 웹 기반 관리 대시보드 제공
- 데이터베이스 컬렉션 관리
- 사용자 인증 관리
- API 설정 및 문서 확인

**사용자 가입 및 로그인:**

- 프론트엔드에서 직접 회원가입 가능
- PocketBase는 기본적으로 `users` 컬렉션을 제공
- 이메일/비밀번호 기반 인증 지원
- 로그인 후 인증 토큰이 자동으로 저장되어 API 요청에 사용

**데이터베이스 초기화:**
`pb_data` 폴더를 삭제하면 PocketBase 데이터베이스가 초기화됩니다. (주의: 모든 데이터가 삭제됩니다)

### 환경 변수

프론트엔드에서 PocketBase API URL을 설정하려면 환경 변수를 사용할 수 있습니다:

- `VITE_API_URL`: PocketBase API URL
  - 개발 환경 기본값: `http://localhost:8890`
  - 프로덕션 기본값: `/api` (같은 도메인 사용)

프로덕션 배포 시 GitHub Secrets의 `FRONTEND_ENV`에 다음을 포함하세요:

```
VITE_API_URL=/api
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
