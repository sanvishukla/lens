"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Summary" },
  { slug: "screen-reader", label: "Listen" },
  { slug: "vision", label: "See" },
  { slug: "keyboard", label: "Tab" },
  { slug: "targets", label: "Tap" },
  { slug: "fixes", label: "Mend" },
];

export function ReportNav({ reportId }: { reportId: string }) {
  const pathname = usePathname();
  const base = `/r/${reportId}`;

  return (
    <nav aria-label="Report sections" className="report-nav">
      <ul>
        {TABS.map((tab) => {
          const href = tab.slug ? `${base}/${tab.slug}` : base;
          return (
            <li key={tab.slug}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
