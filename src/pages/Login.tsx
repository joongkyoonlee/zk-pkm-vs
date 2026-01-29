import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  const onLogin = async () => {
    setMsg("");
    const res = await signInWithPassword(email, password);
    if (!res.ok) {
      setMsg(res.message);
      return;
    }
    location.hash = "#/";
  };

  const onSignup = async () => {
    setMsg("");
    const res = await signUpWithPassword(email, password);
    if (!res.ok) {
      setMsg(res.message);
      return;
    }
    setMsg("회원가입 요청이 처리되었습니다. 이메일 인증이 필요할 수 있습니다.");
  };

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h2>로그인</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />

        {msg ? <div style={{ color: "crimson" }}>{msg}</div> : null}

        <button onClick={onLogin} style={{ padding: 12, fontSize: 16 }}>
          로그인
        </button>
        <button onClick={onSignup} style={{ padding: 12, fontSize: 16 }}>
          회원가입
        </button>
      </div>
    </div>
  );
}
