import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/my-study", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.get("cams_auth")?.value === "1";

  // 로그인한 사용자가 로그인/회원가입 접근 시 홈으로
  if (hasAuth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 보호 라우트 접근 시 인증 필요 처리
  const requiresAuth = protectedRoutes.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return NextResponse.next();
  if (hasAuth) return NextResponse.next();

  // 보호 라우트 진입 시점에 alert를 띄우기 위해 게이트 페이지로 rewrite
  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = "/auth-gate";
  gateUrl.searchParams.set("from", pathname);
  return NextResponse.rewrite(gateUrl);
}

export const config = {
  matcher: ["/my-study/:path*", "/profile/:path*", "/login", "/signup"],
};
