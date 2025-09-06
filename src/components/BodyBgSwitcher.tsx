"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BodyBgSwitcher() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    if (isSignupPage) {
      body.classList.remove("bg-neutral-300");
      body.classList.add("bg-neutral-200");
    } else {
      body.classList.remove("bg-neutral-200");
      body.classList.add("bg-neutral-300");
    }

    return () => {
      // Ensure body class is restored when component unmounts or route changes
      body.classList.remove("bg-neutral-200");
      body.classList.add("bg-neutral-300");
    };
  }, [isSignupPage]);

  return null;
}
