import { useState, useEffect } from "react";
import { pb } from "./lib/pocketbase";
import Auth from "./components/Auth";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [collections, setCollections] = useState<any[]>([]);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      if (pb.authStore.isValid) {
        setUser(pb.authStore.model);
        setIsAuthenticated(true);
        loadCollections();
      }
    };

    checkAuth();

    // authStore 변경 감지
    pb.authStore.onChange(() => {
      checkAuth();
    });
  }, []);

  const loadCollections = async () => {
    try {
      const result = await pb.collections.getFullList();
      setCollections(result);
      setMessage(`컬렉션 ${result.length}개 발견`);
    } catch (error) {
      console.error("에러 발생:", error);
      setMessage("컬렉션 조회 실패");
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    setUser(null);
    setCollections([]);
    setMessage("로그아웃되었습니다.");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setUser(pb.authStore.model);
    loadCollections();
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>PocketBase 프로젝트</h1>
          <Auth onAuthSuccess={handleAuthSuccess} />
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>PocketBase 프로젝트</h1>
        <div style={{ marginBottom: "20px" }}>
          <p>환영합니다, {user?.email}님!</p>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
        {message && <p className="message">{message}</p>}
        {collections.length > 0 && (
          <div
            style={{ marginTop: "20px", textAlign: "left", maxWidth: "600px" }}
          >
            <h3>컬렉션 목록:</h3>
            <ul>
              {collections.map((col) => (
                <li key={col.id}>
                  <strong>{col.name}</strong> ({col.type})
                  {col.system && (
                    <span style={{ color: "#999" }}> (시스템)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
