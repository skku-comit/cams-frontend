"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  studentId: z.string().regex(/^\d{10}$/, { message: "학번은 숫자 10자리여야 합니다" }),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

export async function submitLogin(prevState, formData) {
  let nextPath = "/";
  try {
    const raw = {
      studentId: formData.get("studentId") ?? "",
      password: formData.get("password") ?? "",
      next: formData.get("next") ?? "",
    };

    const validated = loginSchema.safeParse(raw);
    if (!validated.success) {
      const errors = validated.error.issues.reduce((acc, issue) => {
        const key = issue.path.join(".");
        if (typeof key === "string") acc[key] = issue.message;
        return acc;
      }, {});
      return { success: false, message: "입력한 정보를 확인해주세요.", errors };
    }

    const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
    const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");
    if (!API_BASE_URL) {
      console.error("[로그인] API base URL 미설정: NEXT_PUBLIC_BACKEND_API_URL");
      return { success: false, message: "서버 설정 오류: API 주소 미설정", errors: {} };
    }

    const endpoint = `${API_BASE_URL}/auth/signin`;
    const payload = {
      studentId: validated.data.studentId,
      password: validated.data.password,
    };

    console.log("[로그인] API 요청:", { endpoint, payload });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    console.log("[로그인] API 응답 상태:", res.status, res.statusText);

    if (!res.ok) {
      let msg = "로그인에 실패했습니다.";
      try {
        const data = await res.json();
        console.log("[로그인] API 에러 응답:", data);
        if (data?.message) msg = data.message;
      } catch (e) {
        console.log("[로그인] 응답 파싱 실패:", e);
      }
      return { success: false, message: msg, errors: {} };
    }

    let body = null;
    try {
      body = await res.json();
      console.log("[로그인] API 성공 응답:", body);
    } catch (e) {
      console.log("[로그인] 성공 응답 파싱 실패:", e);
    }

    // 쿠키 설정 (간단한 로그인 플래그)
    const cookieStore = await cookies();
    try {
      // 토큰이 있으면 저장, 없으면 플래그만 저장
      if (body?.accessToken) {
        cookieStore.set("cams_token", body.accessToken, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      }
      cookieStore.set("cams_auth", "1", { path: "/", maxAge: 60 * 60 * 24 * 7 });
    } catch (e) {
      console.log("[로그인] 쿠키 설정 실패:", e);
    }

    // 리다이렉트 대상
    nextPath = typeof raw.next === "string" ? String(raw.next) : "/";
    if (!nextPath || typeof nextPath !== "string" || !nextPath.startsWith("/")) {
      nextPath = "/";
    }
  } catch (error) {
    console.error("[로그인] 예외 발생:", error);
    return { success: false, message: "알 수 없는 오류가 발생했습니다.", errors: {} };
  }
  // redirect는 예외를 던지므로 try/catch 밖에서 호출
  redirect(nextPath);
}
