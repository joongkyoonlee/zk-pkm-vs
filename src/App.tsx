import { SUPABASE_ENV_OK } from "@/lib/supabase";

if (!SUPABASE_ENV_OK) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Supabase 환경변수가 설정되지 않았습니다.</h2>
      <p>GitHub Actions workflow에서 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 빌드 env로 주입해야 합니다.</p>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Graph from '@/pages/Graph'
import Settings from '@/pages/Settings'
import NotionCallback from '@/pages/NotionCallback'
import AISearch from '@/pages/AISearch'
import Login from '@/pages/Login'
import '@/styles/globals.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/notion-callback" element={<NotionCallback />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-search" element={<AISearch />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
