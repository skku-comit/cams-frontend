import AuthMyStudyLabel from "@/components/AuthMyStudyLabel";
import DashboardCardLink from "@/components/DashboardCardLink";
import { cookies } from "next/headers";
import { logout } from "@/actions/logout";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("cams_auth")?.value === "1";
  return (
    <div className="px-4 py-6 sm:px-6 md:px-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-[minmax(100px,_1fr)] lg:auto-rows-[minmax(160px,_1fr)] md:mt-[5vh] gap-4 md:gap-3 lg:gap-4 max-w-5xl mx-auto">
        {/* My Study first */}
        <DashboardCardLink
          href={isLoggedIn ? "/my-study" : "/login"}
          title={<AuthMyStudyLabel />}
          description={"신청/참여/완료한 스터디"}
          heightClass="h-[20vh] md:h-auto"
          className="md:row-span-2"
        />

        <DashboardCardLink
          href="/studies"
          title={"개설된 스터디"}
          description={"현재 진행 중인 스터디 신청/신규 개설"}
          heightClass="h-[25vh] md:h-auto"
          className="md:row-span-2 md:col-start-2 md:row-start-2"
        />

        <DashboardCardLink
          href="/books"
          title={"동아리방 도서"}
          description={"상시 구비되어 있는 전공 교재/기술 서적 확인"}
          heightClass="h-[15vh] md:h-auto"
        />

        <DashboardCardLink
          href="/profile"
          title={"내 정보 및 설정"}
          description={"개인정보 수정"}
          heightClass="h-[10vh] md:h-auto"
        />
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
