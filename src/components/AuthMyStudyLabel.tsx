"use client";
import { useEffect, useMemo, useState } from "react";

function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    try {
      // 간단한 플래그 쿠키 읽기
      const hasAuth = document.cookie.split(";").some((c) => c.trim().startsWith("cams_auth="));
      setIsLoggedIn(hasAuth);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);
  return isLoggedIn;
}

export default function AuthMyStudyLabel() {
  const isLoggedIn = useIsLoggedIn();
  const label = useMemo(() => (isLoggedIn ? "내 활동" : "로그인"), [isLoggedIn]);
  return <>{label}</>;
}
