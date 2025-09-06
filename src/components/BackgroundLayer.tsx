"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BackgroundLayer() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";

  if (isSignupPage) {
    return <div className="absolute inset-0 pointer-events-none bg-neutral-200" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="relative size-full max-w-105 z-0 mx-auto">
        <Image src="/bg2.png" alt="bg" fill className="object-contain" />
      </div>
    </div>
  );
}
