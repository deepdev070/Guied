"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TaskNavTabsProps {
  hasMistakes?: boolean;
  hasFaqs?: boolean;
}

export function TaskNavTabs({ hasMistakes = true, hasFaqs = true }: TaskNavTabsProps) {
  const [activeTab, setActiveTab] = useState("documents");

  const navItems = React.useMemo(
    () => [
      { id: "documents", label: "Documents" },
      { id: "steps", label: "Steps" },
      { id: "fees", label: "Fees" },
      ...(hasMistakes ? [{ id: "mistakes", label: "Mistakes" }] : []),
      ...(hasFaqs ? [{ id: "faqs", label: "FAQs" }] : []),
      { id: "official-links", label: "Official Links" },
    ],
    [hasMistakes, hasFaqs]
  );

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [navItems]);

  return (
    <nav
      aria-label="Task section navigation"
      className="border-border sticky top-[65px] z-30 -mx-4 border-y bg-white/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
    >
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleTabClick(e, item.id)}
              className={cn(
                "rounded-chip shrink-0 px-3.5 py-1.5 text-xs font-semibold transition-colors select-none",
                isActive
                  ? "bg-primary shadow-soft-xs text-white"
                  : "text-muted hover:bg-surface-alt hover:text-text"
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
