import AuthMyStudyLabel from "@/components/AuthMyStudyLabel";
import DashboardCardLink from "@/components/DashboardCardLink";
import { cookies } from "next/headers";
import { logout } from "@/actions/logout";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("cams_auth")?.value === "1";
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 gap-4">
        {/* My Study first */}
        <DashboardCardLink
          href={isLoggedIn ? "/my-study" : "/login"}
          title={<AuthMyStudyLabel />}
          description={"신청/참여/완료한 스터디"}
          heightClass="h-[20vh]"
        />

        <DashboardCardLink
          href="/studies"
          title={"개설된 스터디"}
          description={"현재 진행 중인 스터디를 둘러보세요"}
          heightClass="h-[25vh]"
        />

        <DashboardCardLink
          href="/books"
          title={"동아리방 도서"}
          description={"대여 가능한 책을 확인하세요"}
          heightClass="h-[15vh]"
        />

        <DashboardCardLink href="/profile" title={"내 정보 및 설정"} heightClass="h-[10vh]" />
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
