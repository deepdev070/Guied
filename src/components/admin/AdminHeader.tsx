"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  BarChart3,
  History,
  ArrowDownUp,
  ExternalLink,
  User,
} from "lucide-react";
import { AdminLogoutButton } from "./AdminLogoutButton";

interface AdminHeaderProps {
  username: string;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/guides", label: "Guides", icon: FileText, exact: false },
  { href: "/admin/import-export", label: "Import / Export", icon: ArrowDownUp, exact: false },
  { href: "/admin/reports", label: "Error Reports", icon: AlertCircle, exact: false },
  { href: "/admin/ads", label: "Ad Viewability", icon: BarChart3, exact: false },
  { href: "/admin/audit", label: "Audit Log", icon: History, exact: false },
];

export function AdminHeader({ username }: AdminHeaderProps) {
  const pathname = usePathname();
  const [openReportsCount, setOpenReportsCount] = React.useState<number>(0);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/reports/count");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.openCount === "number") {
            setOpenReportsCount(data.openCount);
          }
        }
      } catch {
        // Fallback silently
      }
    }
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand & Badge */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 font-bold text-[#003366] transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366] text-sm font-bold text-white shadow-xs">
                IPG
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-tight font-bold text-[#111827]">
                  Civic Portal Admin
                </span>
                <span className="text-[11px] leading-tight font-normal text-[#6B7280]">
                  Editorial & Verification Panel
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Admin Navigation">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(item.href, item.exact);
                const Icon = item.icon;
                const isReports = item.label === "Error Reports";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#EBF3FB] font-semibold text-[#003366]"
                        : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {isReports && openReportsCount > 0 && (
                      <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white shadow-xs">
                        {openReportsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-[#4B5563] transition-colors hover:bg-[#F3F4F6] hover:text-[#003366] sm:inline-flex"
              title="Open public portal in new tab"
            >
              <span>Public Portal</span>
              <ExternalLink className="h-3 w-3 text-[#9CA3AF]" />
            </Link>

            <div className="hidden h-4 w-px bg-[#E5E7EB] sm:block" />

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#374151] sm:inline-flex">
                <User className="h-3 w-3 text-[#6B7280]" />
                <span className="max-w-[120px] truncate">{username}</span>
              </span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex scrollbar-none gap-1 overflow-x-auto border-t border-[#F3F4F6] py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            const isReports = item.label === "Error Reports";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                  active
                    ? "bg-[#EBF3FB] font-semibold text-[#003366]"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
                {isReports && openReportsCount > 0 && (
                  <span className="ml-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white shadow-xs">
                    {openReportsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
