import Link from "next/link";
import React from "react";

interface DashboardCardLinkProps {
  href: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  heightClass?: string;
}

export default function DashboardCardLink({ href, title, description, heightClass }: DashboardCardLinkProps) {
  const computedHeightClass = heightClass ?? "h-[20vh]";
  return (
    <Link
      href={href}
      className={`rounded-2xl p-5 active:scale-[0.98] transition transform duration-150 border hover:shadow-[0_0_0_2px_rgba(138,43,226,0.5)] ${computedHeightClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-neutral-900 text-lg">{title}</span>
        <span className="text-neutral-700">→</span>
      </div>
      {description ? <div className="mt-2 text-neutral-700 text-sm">{description}</div> : null}
    </Link>
  );
}
