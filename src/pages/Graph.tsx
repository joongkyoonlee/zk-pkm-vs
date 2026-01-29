import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Graph() {
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setMsg("");

      if (!supabase) {
        setMsg("Supabase가 초기화되지 않았습니다. 환경변수를 확인하세요.");
        return;
      }

      try {
        // 예시 쿼리: 프로젝트 테이블명에 맞게 바꾸세요.
        const { error } = await supabase.from("documents").select("id").limit(1);
        if (error) {
          setMsg(error.message);
          return;
        }
        setMsg("Graph 페이지 로딩 OK (샘플 쿼리 성공)");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Unknown error");
      }
    };

    run();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Graph</h2>
      <p>{msg || "Loading..."}</p>
    </div>
  );
}
