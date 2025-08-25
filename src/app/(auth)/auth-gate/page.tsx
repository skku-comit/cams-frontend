"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthGatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/";

  useEffect(() => {
    try {
      alert("로그인이 필요한 페이지입니다. 로그인 후 이용해주세요.");
    } catch {}
    router.replace(`/login?from=${encodeURIComponent(from)}`);
  }, [from, router]);

  return null;
}
