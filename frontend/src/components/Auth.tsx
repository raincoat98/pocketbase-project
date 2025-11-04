import { useState } from "react";
import { pb } from "../lib/pocketbase";

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // 로그인
        await pb.collection("users").authWithPassword(email, password);
        setMessage("로그인 성공!");
        onAuthSuccess();
      } else {
        // 회원가입
        if (password !== passwordConfirm) {
          setMessage("비밀번호가 일치하지 않습니다.");
          return;
        }

        // PocketBase 회원가입
        // PocketBase는 자동으로 이메일 검증 및 비밀번호 해싱 처리
        const data = {
          email: email,
          password: password,
          passwordConfirm: passwordConfirm,
        };

        // 회원가입 (이메일 인증이 필요하지 않은 경우 자동 로그인)
        await pb.collection("users").create(data);
        setMessage("회원가입 성공! 이제 로그인할 수 있습니다.");
        setIsLogin(true);
        setPassword("");
        setPasswordConfirm("");
      }
    } catch (error: any) {
      console.error("에러 발생:", error);
      
      // PocketBase 에러 메시지 추출
      let errorMessage = "오류가 발생했습니다.";
      
      // PocketBase ClientResponseError 처리
      if (error?.response) {
        const response = error.response;
        
        // 기본 메시지
        if (response.message) {
          errorMessage = response.message;
        }
        
        // 필드별 검증 에러 메시지
        if (response.data) {
          const fieldErrors: string[] = [];
          Object.entries(response.data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              fieldErrors.push(`${field}: ${messages.join(", ")}`);
            } else if (messages) {
              fieldErrors.push(`${field}: ${String(messages)}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(" | ");
          }
        }
        
        // 상태 코드 기반 메시지
        if (response.status === 400) {
          errorMessage = errorMessage || "잘못된 요청입니다.";
        } else if (response.status === 403) {
          errorMessage = errorMessage || "접근 권한이 없습니다.";
        } else if (response.status === 404) {
          errorMessage = errorMessage || "리소스를 찾을 수 없습니다.";
        } else if (response.status >= 500) {
          errorMessage = errorMessage || "서버 오류가 발생했습니다.";
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // 디버깅을 위해 콘솔에 전체 에러 출력
      console.error("전체 에러 객체:", error);
      
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>{isLogin ? "로그인" : "회원가입"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>
            이메일:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>
            비밀번호:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </label>
        </div>
        {!isLogin && (
          <div style={{ marginBottom: "15px" }}>
            <label>
              비밀번호 확인:
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "15px",
            color: message.includes("성공") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
            setPassword("");
            setPasswordConfirm("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isLogin ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}
