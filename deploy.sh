#!/bin/bash

set -e

# BuildKit 활성화로 캐시 기반 빌드 가속
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 색상 출력
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 환경 변수
HEALTH_CHECK_URL="http://localhost:8890/"
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_INTERVAL=5

# 헬스체크 수행
health_check() {
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))
    local attempt=0

    echo -e "${YELLOW}헬스체크 시작...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}헬스체크 성공!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -e "${YELLOW}헬스체크 시도 ${attempt}/${max_attempts}...${NC}"
        sleep $HEALTH_CHECK_INTERVAL
    done

    echo -e "${RED}헬스체크 실패!${NC}"
    return 1
}

# 메인 배포 로직
main() {
    echo -e "${GREEN}=== 배포 시작 ===${NC}"
    
    # 프로덕션 네트워크 확인 및 생성
    if ! docker network inspect prod-network > /dev/null 2>&1; then
        echo -e "${YELLOW}프로덕션 네트워크 생성 중...${NC}"
        docker network create prod-network
    else
        echo -e "${GREEN}프로덕션 네트워크 확인됨${NC}"
    fi
    
    # 작업 디렉토리 이동
    cd "$SCRIPT_DIR"
    
    # pb_data 디렉토리 생성 (없으면 마운트 실패)
    if [ ! -d "pocketbase/pb_data" ]; then
        echo -e "${YELLOW}pocketbase/pb_data 디렉토리 생성 중...${NC}"
        mkdir -p pocketbase/pb_data
        chmod 755 pocketbase/pb_data
    fi
    
    # PocketBase 빌드 및 시작 (프론트엔드 포함)
    echo -e "${YELLOW}PocketBase 빌드 중... (프론트엔드 포함)${NC}"
    docker-compose -f docker-compose.prod.yml build pocketbase
    
    echo -e "${YELLOW}PocketBase 컨테이너 시작 중...${NC}"
    docker-compose -f docker-compose.prod.yml up -d pocketbase
    
    # 컨테이너 시작 대기
    echo -e "${YELLOW}컨테이너 시작 대기 중...${NC}"
    sleep 10
    
    # 헬스체크
    if ! health_check; then
        echo -e "${RED}배포 실패: 헬스체크 실패${NC}"
        echo -e "${YELLOW}컨테이너 로그 확인:${NC}"
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
    
    echo -e "${GREEN}=== 배포 완료 ===${NC}"
    echo -e "${GREEN}컨테이너 상태:${NC}"
    docker-compose -f docker-compose.prod.yml ps
}

main
