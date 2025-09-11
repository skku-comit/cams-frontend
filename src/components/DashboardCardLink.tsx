import Link from "next/link";
import React from "react";

interface DashboardCardLinkProps {
  href: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  heightClass?: string;
  className?: string;
}

export default function DashboardCardLink({
  href,
  title,
  description,
  heightClass,
  className,
}: DashboardCardLinkProps) {
  const computedHeightClass = heightClass ?? "h-[20vh]";
  return (
    <Link
      href={href}
      className={`glass-card active:scale-[0.98] transition transform duration-150 border lg:!p-6 ${computedHeightClass} ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-neutral-800 text-lg lg:text-xl font-medium">{title}</span>
        <span className="text-neutral-800 lg:text-lg font-semibold">→</span>
      </div>
      {description ? <div className="mt-2 text-neutral-800 font-medium text-sm lg:text-base">{description}</div> : null}
    </Link>
  );
}
