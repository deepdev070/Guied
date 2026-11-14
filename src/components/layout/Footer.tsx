"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { useReportMistake } from "@/context/ReportMistakeContext";
import { useConsent } from "@/context/ConsentContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = 2026;
  const { openReportMistake } = useReportMistake();
  const { openConsentManager } = useConsent();

  const popularTasks = [
    { name: "Learner's Licence (LLR)", href: "/driving-licence-learner" },
    { name: "Permanent Driving Licence", href: "/driving-licence-new" },
    { name: "Passport Renewal", href: "/passport-renewal" },
    { name: "All 200+ Guides Directory", href: "/guides" },
  ];

  const states = [
    { name: "Gujarat (ગુજરાત)", href: "/state/gujarat" },
    { name: "Maharashtra (महाराष्ट्र)", href: "/state/maharashtra" },
    { name: "Delhi (NCR)", href: "/state/delhi" },
    { name: "Karnataka (ಕರ್ನಾಟಕ)", href: "/state/karnataka" },
    { name: "Uttar Pradesh (उत्तर प्रदेश)", href: "/state/uttar-pradesh" },
    { name: "Rajasthan (राजस्थान)", href: "/state/rajasthan" },
    { name: "All 36 States & UTs →", href: "/state/gujarat" },
  ];

  const company = [
    { name: "About This Initiative", href: "/about" },
    { name: "Civic Glossary (en/hi/gu)", href: "/glossary" },
    { name: "How We Verify Guides", href: "/how-we-verify" },
    { name: "All 200+ Guides Directory", href: "/guides" },
    { name: "Report a Mistake", href: "/report-mistake", highlight: true },
    { name: "Design System Showcase", href: "/design" },
  ];

  const legal = [
    { name: "Disclaimer & Non-Government Notice", href: "/disclaimer" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "How We Verify Guides", href: "/how-we-verify" },
  ];

  return (
    <footer
      className={cn(
        "border-border bg-surface-alt text-text mt-auto border-t print:hidden",
        className
      )}
    >
      {/* Upper Footer: 4 Columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Popular Tasks */}
          <div>
            <h3 className="text-text mb-4 text-sm font-bold tracking-wider uppercase">
              Popular Paperwork
            </h3>
            <ul className="space-y-2.5 text-sm">
              {popularTasks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-primary focus-visible:ring-primary/40 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: States */}
          <div>
            <h3 className="text-text mb-4 text-sm font-bold tracking-wider uppercase">
              State & UT Portals
            </h3>
            <ul className="space-y-2.5 text-sm">
              {states.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-primary focus-visible:ring-primary/40 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company & Accuracy */}
          <div>
            <h3 className="text-text mb-4 text-sm font-bold tracking-wider uppercase">
              About & Accuracy
            </h3>
            <ul className="space-y-2.5 text-sm">
              {company.map((item) => (
                <li key={item.href}>
                  {item.href === "/report-mistake" ? (
                    <button
                      type="button"
                      onClick={() => openReportMistake()}
                      className="focus-visible:ring-primary/40 text-warning hover:text-warning/80 flex cursor-pointer items-center gap-1.5 rounded-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "focus-visible:ring-primary/40 flex items-center gap-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                        item.highlight
                          ? "text-warning hover:text-warning/80 font-semibold"
                          : "text-muted hover:text-primary"
                      )}
                    >
                      {item.highlight && (
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
                      )}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-border/60 text-muted mt-5 border-t pt-4 text-xs">
              <p>
                Email:{" "}
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.contactEmail}
                </a>
              </p>
              <p className="mt-1">Updates verified weekly against official gazettes & portals.</p>
            </div>
          </div>

          {/* Column 4: Legal & Language */}
          <div>
            <h3 className="text-text mb-4 text-sm font-bold tracking-wider uppercase">
              Legal & Disclaimers
            </h3>
            <ul className="space-y-2.5 text-sm">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted hover:text-primary focus-visible:ring-primary/40 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => openConsentManager()}
                  className="text-muted hover:text-primary focus-visible:ring-primary/40 cursor-pointer rounded-sm text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Privacy choices
                </button>
              </li>
            </ul>

            {/* Language Switcher in Footer (Prompt 97) */}
            <div className="border-border/60 mt-5 border-t pt-4">
              <span className="text-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                Language / ભાષા / भाषा
              </span>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        {/* Civic Non-Government Mandatory Disclaimer Box */}
        <div className="border-warning/40 bg-warning-soft/70 text-warning mt-10 rounded-xl border p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <svg
              className="text-warning mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-xs leading-relaxed sm:text-sm">
              <p className="font-bold">
                Not a government website. Always confirm on the official portal.
              </p>
              <p className="text-warning/90 mt-1">{siteConfig.disclaimer.full}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="border-border text-muted mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>
            © {currentYear} {siteConfig.name}. Built for Indian citizens. Light colours only.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openReportMistake()}
              className="text-warning cursor-pointer font-medium hover:underline"
            >
              Report a mistake
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openConsentManager()}
              className="text-muted hover:text-primary cursor-pointer transition-colors"
            >
              Privacy choices
            </button>
            <span>•</span>
            <a
              href={siteConfig.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Twitter / X
            </a>
            <span>•</span>
            <a
              href={siteConfig.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
