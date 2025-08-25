import Link from "next/link";
import AuthMyStudyLabel from "@/components/AuthMyStudyLabel";
import { cookies } from "next/headers";
import { logout } from "@/actions/logout";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("cams_auth")?.value === "1";
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 gap-4">
        {/* My Study first */}
        <Link
          href={isLoggedIn ? "/my-study" : "/login"}
          className="glass-card rounded-2xl p-5 active:scale-[0.98] transition transform duration-150 border hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] h-[20vh]"
        >
          <div className="flex items-center justify-between">
            <span className="text-neutral-900 text-lg">
              <AuthMyStudyLabel />
            </span>
            <span className="text-neutral-700">→</span>
          </div>
          <div className="mt-2 text-neutral-700 text-sm">신청/참여/완료한 스터디</div>
        </Link>

        <Link
          href="/studies"
          className="glass-card rounded-2xl p-5 active:scale-[0.98] transition transform duration-150 border hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] h-[25vh]"
        >
          <div className="flex items-center justify-between">
            <span className="text-neutral-900 text-lg">개설된 스터디</span>
            <span className="text-neutral-700">→</span>
          </div>
          <div className="mt-2 text-neutral-700 text-sm">현재 진행 중인 스터디를 둘러보세요</div>
        </Link>

        <Link
          href="/books"
          className="glass-card rounded-2xl p-5 active:scale-[0.98] transition transform duration-150 border hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] h-[15vh]"
        >
          <div className="flex items-center justify-between">
            <span className="text-neutral-900 text-lg">동아리방 도서</span>
            <span className="text-neutral-700">→</span>
          </div>
          <div className="mt-2 text-neutral-700 text-sm">대여 가능한 책을 확인하세요</div>
        </Link>

        <Link
          href="/profile"
          className="glass-card rounded-2xl p-5 active:scale-[0.98] transition transform duration-150 border hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] h-[10vh]"
        >
          <div className="flex items-center justify-between">
            <span className="text-neutral-900 text-lg">내 정보 및 설정</span>
            <span className="text-neutral-700">→</span>
          </div>
        </Link>
        {isLoggedIn && (
          <form action={logout} className="flex justify-end">
            <button className="mt-2 glass-button rounded-xl px-4 py-2 text-white active:scale-[0.98]" type="submit">
              로그아웃
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
