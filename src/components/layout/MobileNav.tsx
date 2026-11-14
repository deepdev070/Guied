"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: string;
  onSelectState: (state: string) => void;
  navLinks: { name: string; href: string }[];
}

export function MobileNav({
  isOpen,
  onClose,
  currentState,
  onSelectState,
  navLinks,
}: MobileNavProps) {
  const drawerRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
    returnFocus: true,
  });

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Dimmed backdrop */}
      <div
        className="bg-text/40 fixed inset-0 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in drawer */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
        {/* Drawer header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <span className="bg-accent h-3 w-3 rounded-full" aria-hidden="true" />
            <span className="text-text text-base font-bold">{siteConfig.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-surface hover:text-text focus-visible:ring-primary/40 flex h-11 w-11 items-center justify-center rounded-lg focus-visible:ring-3 focus-visible:outline-none"
            aria-label="Close navigation menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {/* Quick State & Language pickers */}
          <div className="border-border bg-surface space-y-4 rounded-xl border p-4">
            <div>
              <label
                htmlFor="mobile-state-select"
                className="text-muted mb-1.5 block text-xs font-semibold tracking-wider uppercase"
              >
                Selected State / UT
              </label>
              <select
                id="mobile-state-select"
                value={currentState}
                onChange={(e) => onSelectState(e.target.value)}
                className="border-border text-text focus-visible:ring-primary/40 w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
              >
                <option value="Gujarat">Gujarat (ગુજરાત)</option>
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Delhi">Delhi (NCR)</option>
                <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                <option value="All India">All India / Central</option>
              </select>
            </div>

            <div>
              <span className="text-muted mb-1.5 block text-xs font-semibold tracking-wider uppercase">
                Language / ભાષા / भाषा
              </span>
              <LanguageSwitcher variant="mobile" />
            </div>
          </div>

          {/* Large Navigation Links */}
          <nav aria-label="Mobile primary navigation" className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-text hover:bg-surface-alt hover:text-primary active:bg-primary-soft focus-visible:ring-primary/40 flex min-h-[50px] items-center rounded-xl px-4 text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="border-border/80 border-t pt-2">
            <Link
              href="/report-mistake"
              onClick={onClose}
              className="text-muted hover:text-primary flex min-h-[44px] items-center gap-2 px-4 text-sm font-medium transition-colors"
            >
              <svg
                className="text-warning h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Report a mistake or outdated rule
            </Link>
          </div>
        </div>

        {/* Drawer footer disclaimer */}
        <div className="border-border bg-surface text-muted border-t px-4 py-3 text-xs">
          Not a government website. Free citizen civic guide.
        </div>
      </div>
    </div>
  );
}
