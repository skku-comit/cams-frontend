import type { Metadata } from "next";
import HeaderBar from "@/components/HeaderBar";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "코밋 활동관리시스템",
  description: "코밋 활동관리시스템 CAMS",
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
        {/* Hidden SVG filter for frosted/liquid glass effect */}
        <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
          <filter id="frosted" primitiveUnits="objectBoundingBox">
            {/* Slight blur of backdrop content */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            {/* Procedural noise for liquid displacement */}
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.015" numOctaves={2} seed={2} result="noise" />
            {/* Displace the blurred backdrop with noise to simulate liquid glass */}
            <feDisplacementMap in="blur" in2="noise" scale={8} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {/* Mobile-only background image filling the page */}
        <div className="absolute inset-0 pointer-events-none bg-[#d9d9db]">
          <div className="relative w-full h-full max-w-105 z-0 mx-auto">
            <Image src="/bg1.png" alt="bg" fill className="object-cover" />
          </div>
        </div>
        <header className="relative">
          <HeaderBar />
        </header>
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
