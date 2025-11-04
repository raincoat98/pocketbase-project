# 프론트엔드 빌드 단계
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit
COPY frontend .
ENV NODE_ENV=production
RUN npm run build

# PocketBase 이미지
FROM alpine:latest

ARG PB_VERSION=0.31.0

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    openssh

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# 프론트엔드 빌드 결과물을 pb_public에 복사
COPY --from=frontend-build /app/dist /pb/pb_public

# PocketBase 데이터 디렉토리
VOLUME ["/pb/pb_data"]

# 작업 디렉토리
WORKDIR /pb

# 포트 노출
EXPOSE 8890

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8890"]
