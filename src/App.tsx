import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { SUPABASE_ENV_OK } from "@/lib/supabase";
import "@/styles/globals.css";

// 아래 3개 import는 선생님 프로젝트 경로/이름에 맞게 조정하세요.
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Graph from "@/pages/Graph";

export default function App() {
  if (!SUPABASE_ENV_OK) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        <h2>Supabase 환경변수가 설정되지 않았습니다.</h2>
        <p style={{ lineHeight: 1.6 }}>
          GitHub Actions 빌드 시점에 아래 값이 주입되어야 합니다.
          <br />
          - VITE_SUPABASE_URL
          <br />
          - VITE_SUPABASE_ANON_KEY
        </p>
        <p style={{ lineHeight: 1.6 }}>
          GitHub → Settings → Secrets and variables → Actions 에서
          <br />
          Variables: VITE_SUPABASE_URL
          <br />
          Secrets: VITE_SUPABASE_ANON_KEY
        </p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
