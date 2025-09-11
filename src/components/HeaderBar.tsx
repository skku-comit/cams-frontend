"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/logout";

function useIsLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try {
      const hasAuth = document.cookie.split(";").some((c) => c.trim().startsWith("cams_auth=1"));
      setLoggedIn(hasAuth);
    } catch {
      setLoggedIn(false);
    }
  }, []);
  return loggedIn;
}

export default function HeaderBar() {
  const pathname = usePathname();
  const isLoggedIn = useIsLoggedIn();
  const showLogout = isLoggedIn && pathname !== "/";

  return (
    <div className="px-5 py-6 h-15 sm:px-6 md:px-8 w-full">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center ml-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo-purple.png" alt="CoMit Logo" width={30} height={12} className="object-contain" />
            <p className="text-base font-semibold text-neutral-800">활동관리시스템</p>
          </Link>
        </div>

        {showLogout && (
          <form action={logout}>
            <button className="glass-button rounded-xl px-4 py-2 text-white">로그아웃</button>
          </form>
        )}
      </div>
    </div>
  );
}
