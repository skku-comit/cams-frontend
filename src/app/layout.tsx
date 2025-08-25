import type { Metadata } from "next";
import HeaderBar from "@/components/HeaderBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAMS | Coding Club",
  description: "대학교 코딩 동아리 스터디 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-dvh relative suppress-hydration-warnings">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="orb orb-a w-[45vw] h-[45vw] left-[-10vw] top-[-10vw]"
            style={{ background: "radial-gradient(closest-side, rgba(138,43,226,0.6), rgba(138,43,226,0))" }}
          />
          <div
            className="orb orb-b w-[35vw] h-[35vw] right-[-10vw] top-[10vh]"
            style={{ background: "radial-gradient(closest-side, rgba(230,230,250,0.5), rgba(230,230,250,0))" }}
          />
          <div
            className="orb orb-a w-[55vw] h-[55vw] left-[20vw] bottom-[-15vw]"
            style={{ background: "radial-gradient(closest-side, rgba(138,43,226,0.35), rgba(138,43,226,0))" }}
          />
        </div>
        {/* Global header with CAMS logo */}
        <header className="relative">
          <HeaderBar />
        </header>
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
