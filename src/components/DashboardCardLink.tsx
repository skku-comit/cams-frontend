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
      className={`glass-card active:scale-[0.98] transition transform duration-150 border ${computedHeightClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-neutral-800 text-lg font-medium">{title}</span>
        <span className="text-neutral-800">→</span>
      </div>
      {description ? <div className="mt-2 text-neutral-800 text-sm">{description}</div> : null}
    </Link>
  );
}
