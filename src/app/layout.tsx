import type { Metadata } from "next";
import HeaderBar from "@/components/HeaderBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAMS | 코밋 활동관리시스템",
  description: "코밋 활동 관리 시스템",
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased h-dvh suppress-hydration-warnings">
        <header className="relative">
          <HeaderBar />
        </header>
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
