"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useUserState } from "@/context/StatePreferenceContext";
import { StateSelectModal } from "./StateSelectModal";
import { MobileNav } from "./MobileNav";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

export interface HeaderProps {
  /**
   * If true, displays the reserved space above header for the optional top banner ad.
   * Fixed height ensures zero Cumulative Layout Shift (CLS).
   */
  showTopAd?: boolean;
  className?: string;
}

export function Header({ showTopAd = false, className }: HeaderProps) {
  const { stateData, setSelectedState } = useUserState();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [stateModalOpen, setStateModalOpen] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState<string>(siteConfig.defaultLocale);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const navLinks = [
    { name: "My Checklists", href: "/my-checklists" },
    { name: "Glossary", href: "/glossary" },
    { name: "State Hub", href: "/state/gujarat" },
    { name: "Guides", href: "/guides" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      {/* 1. Reserved Space Above Header for Optional Top Banner Ad (Zero Layout Shift) */}
      {showTopAd && (
        <aside
          aria-label="Advertisement Banner"
          className="border-border bg-surface w-full overflow-hidden border-b text-center transition-all duration-200 print:hidden"
        >
          <div className="mx-auto flex h-[50px] max-w-5xl items-center justify-center px-4 sm:h-[90px]">
            <div className="flex flex-col items-center justify-center">
              <span className="text-muted/70 mb-0.5 text-[10px] font-semibold tracking-widest uppercase">
                ADVERTISEMENT
              </span>
              <div className="border-border text-muted flex h-[32px] w-full min-w-[280px] items-center justify-center rounded border border-dashed bg-white/70 text-xs sm:h-[60px] sm:min-w-[728px]">
                Reserved Top Banner Ad Slot (728x90 / 320x50)
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Sticky White Header */}
      <header
        className={cn(
          "border-border sticky top-0 z-40 w-full border-b bg-white/95 shadow-xs backdrop-blur-md transition-shadow print:hidden",
          className
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Left: Brand Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="focus-visible:ring-primary/40 flex min-h-[44px] items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              <span className="bg-primary flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-white shadow-xs">
                IP
              </span>
              <div className="flex flex-col">
                <span className="text-text text-base leading-tight font-bold tracking-tight sm:text-lg">
                  {siteConfig.name}
                </span>
                <span className="text-muted hidden text-[11px] font-medium sm:inline-block">
                  Official paperwork & direct links
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Accessible Search Combobox (Desktop / Tablet) */}
          <div className="hidden max-w-md flex-1 md:block">
            <SearchAutocomplete
              id="header-search-desktop"
              selectedState={stateData?.slug}
              variant="header"
            />
          </div>

          {/* Right Navigation & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle Icon */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-expanded={mobileSearchOpen}
              aria-label="Toggle search input"
              className="rounded-input text-muted hover:bg-surface hover:text-text focus-visible:ring-primary/40 flex h-10 w-10 items-center justify-center focus-visible:ring-3 focus-visible:outline-none md:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Desktop Navigation Links */}
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text hover:bg-surface-alt hover:text-primary focus-visible:ring-primary/40 flex min-h-[40px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="bg-border hidden h-5 w-[1px] lg:block" aria-hidden="true" />

            {/* State Selector Chip (Desktop & Mobile) - Opens StateSelectModal with memory */}
            <button
              type="button"
              onClick={() => setStateModalOpen(true)}
              className="rounded-chip border-border bg-surface text-text hover:border-primary hover:bg-surface-alt focus-visible:ring-primary/40 flex min-h-[40px] items-center gap-1.5 border px-3 py-1 text-xs font-semibold shadow-xs transition-colors focus-visible:ring-3 focus-visible:outline-none"
              aria-haspopup="dialog"
              aria-label={`Selected state: ${stateData?.name || "Gujarat"}. Click to change state.`}
            >
              <span className="text-primary font-bold">📍</span>
              <span>{stateData?.name || "Gujarat"}</span>
              <svg
                className="text-muted h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Language Switcher Dropdown (Desktop) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className="rounded-chip border-border bg-surface text-text hover:border-primary hover:bg-surface-alt focus-visible:ring-primary/40 flex min-h-[40px] items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors focus-visible:ring-3 focus-visible:outline-none"
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
              >
                <span className="text-muted text-xs font-bold">文A</span>
                <span className="uppercase">{currentLocale}</span>
                <svg
                  className={cn(
                    "text-muted h-3 w-3 transition-transform",
                    langDropdownOpen && "rotate-180"
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="listbox"
                    className="border-border absolute right-0 z-50 mt-2 w-36 rounded-xl border bg-white py-1.5 shadow-md"
                  >
                    {siteConfig.supportedLocales.map((loc) => (
                      <button
                        key={loc.code}
                        type="button"
                        role="option"
                        aria-selected={currentLocale === loc.code}
                        onClick={() => {
                          setCurrentLocale(loc.code);
                          setLangDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-medium transition-colors",
                          currentLocale === loc.code
                            ? "bg-primary-soft text-primary font-semibold"
                            : "text-text hover:bg-surface"
                        )}
                      >
                        <span>{loc.nativeLabel}</span>
                        {currentLocale === loc.code && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-input text-muted hover:bg-surface hover:text-text focus-visible:ring-primary/40 flex h-10 w-10 items-center justify-center focus-visible:ring-3 focus-visible:outline-none lg:hidden"
              aria-label="Open mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        {mobileSearchOpen && (
          <div className="border-border border-t bg-white px-4 py-2.5 md:hidden">
            <SearchAutocomplete
              id="header-search-mobile"
              autoFocus
              selectedState={stateData?.slug}
              onSelect={() => setMobileSearchOpen(false)}
              variant="header"
            />
          </div>
        )}
      </header>

      {/* 3. Mobile Slide-in Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentState={stateData?.name || "Gujarat"}
        onSelectState={(st) => setSelectedState(st)}
        currentLocale={currentLocale}
        onSelectLocale={(loc) => setCurrentLocale(loc)}
        navLinks={navLinks}
      />

      {/* 4. State Selection Modal with search-as-you-type and cookie/localStorage memory */}
      <StateSelectModal isOpen={stateModalOpen} onClose={() => setStateModalOpen(false)} />
    </>
  );
}
