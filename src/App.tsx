import { HashRouter, Routes, Route } from "react-router-dom";
import { SUPABASE_ENV_OK } from "@/lib/supabase";
import "@/styles/globals.css";

// 아래는 예시입니다. 선생님 프로젝트에 맞는 페이지 컴포넌트로 바꾸세요.
// import Home from "@/pages/Home";
// import Login from "@/pages/Login";
// import Graph from "@/pages/Graph";

export default function App() {
  if (!SUPABASE_ENV_OK) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Supabase 환경변수가 설정되지 않았습니다.</h2>
        <p>
          GitHub Actions workflow에서 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를
          빌드 env로 주입해야 합니다.
        </p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* 선생님 프로젝트 라우트로 교체 */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/graph" element={<Graph />} /> */}
      </Routes>
    </HashRouter>
  );
}
