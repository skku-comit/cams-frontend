"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  try {
    cookieStore.delete("cams_token");
    cookieStore.delete("cams_auth");
  } catch (e) {
    console.log("[로그아웃] 쿠키 삭제 실패:", e);
  }
  redirect("/");
}
