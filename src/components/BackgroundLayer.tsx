"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BackgroundLayer() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";
  const isHomePage = pathname === "/";
  const isCreateStudyPage = pathname === "/studies/create";

  if (isSignupPage) {
    return <div className="absolute inset-0 pointer-events-none bg-neutral-200" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="relative size-full lg:scale-100 max-w-105 z-0 mx-auto opacity-50">
        <Image
          src="/bg2.png"
          alt="bg"
          fill
          className="object-contain"
          style={{
            ...(isHomePage ? {} : { filter: "saturate(0.6)" }),
            ...(isCreateStudyPage ? { opacity: 0.45 } : {}),
          }}
        />
      </div>
    </div>
  );
}
