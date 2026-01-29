import { Link } from "react-router-dom";
import { getCurrentUser, signOut } from "@/lib/auth";

export default function Home() {
  const onSignOut = async () => {
    const res = await signOut();
    if (!res.ok) alert(res.message);
    location.hash = "#/login";
  };

  const onCheck = async () => {
    const res = await getCurrentUser();
    if (!res.ok) {
      alert(res.message);
      return;
    }
    alert(res.user ? `로그인 상태: ${res.user.email}` : "로그인 되어있지 않습니다.");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>ZK Assistant</h1>
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/login">로그인</Link>
        <Link to="/graph">그래프</Link>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button onClick={onCheck}>로그인 상태 확인</button>
        <button onClick={onSignOut}>로그아웃</button>
      </div>
    </div>
  );
}
