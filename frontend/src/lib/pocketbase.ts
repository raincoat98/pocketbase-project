import PocketBase from "pocketbase";

// PocketBase 클라이언트 초기화
// 환경 변수 VITE_API_URL을 사용 (.env.development 또는 .env.production)
// PocketBase SDK는 자동으로 /api 경로를 추가하므로 base URL만 설정
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // 환경 변수가 설정되어 있으면 사용
  if (apiUrl && apiUrl.trim() !== "") {
    // 프로덕션: 상대 경로 (/api)인 경우 window.location.origin 사용
    if (apiUrl.startsWith("/")) {
      return window.location.origin;
    }
    // 절대 URL인 경우 그대로 사용 (개발 환경: http://localhost:8890)
    return apiUrl;
  }

  // 환경 변수가 없으면 기본값 사용
  if (import.meta.env.DEV) {
    // 개발 환경 기본값
    return "http://localhost:8890";
  }

  // 프로덕션 기본값
  return window.location.origin;
};

export const pb = new PocketBase(getApiUrl());
