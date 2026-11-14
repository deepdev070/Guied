import React from "react";
import type { OfficialLink } from "@/types/content";
import { Callout } from "@/components/ui/Callout";
import { ExternalLink, Globe, FileText, Calendar, Search, PhoneCall } from "lucide-react";

export interface OfficialLinksSectionProps {
  links: OfficialLink[];
}

/**
 * Helper to extract domain name (e.g. "parivahan.gov.in") from URL
 */
function extractDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch {
    return urlString;
  }
}

/**
 * Helper to pick appropriate icon for government service links
 */
function getLinkIcon(label: string, url: string) {
  const lower = `${label} ${url}`.toLowerCase();
  if (lower.includes("appointment") || lower.includes("slot")) return Calendar;
  if (lower.includes("form") || lower.includes("download") || lower.includes("pdf"))
    return FileText;
  if (lower.includes("track") || lower.includes("status")) return Search;
  if (lower.includes("help") || lower.includes("contact") || lower.includes("support"))
    return PhoneCall;
  return Globe;
}

/**
 * OfficialLinks: Large action buttons with "Official" badge and verified .gov.in domain.
 * Includes security Callout against look-alike duplicate phishing websites.
 */
export function OfficialLinksSection({ links }: OfficialLinksSectionProps) {
  if (!links || links.length === 0) return null;

  return (
    <section
      id="official-links"
      aria-labelledby="official-links-heading"
      className="my-12 scroll-mt-28"
    >
      <div className="border-border/80 mb-6 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-baseline">
        <div>
          <h2 id="official-links-heading" className="text-h2 text-text font-bold tracking-tight">
            Official Portals & Direct Links
          </h2>
          <p className="text-small text-muted mt-1">
            Always verify that you are on an authentic government server before submitting personal
            details.
          </p>
        </div>

        <span className="bg-success-soft text-success border-success/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span>{links.length} Official Links</span>
        </span>
      </div>

      {/* Security Warning Callout about look-alike fake websites */}
      <Callout variant="warning" title="Beware of look-alike fraudulent websites" className="mb-6">
        Dozens of fake commercial websites copy government logos and charge unauthorized
        &ldquo;processing fees&rdquo;. Authentic Indian government portals always end with{" "}
        <strong className="text-text font-bold">.gov.in</strong> or{" "}
        <strong className="text-text font-bold">.nic.in</strong> in your browser URL bar. Never pay
        via private QR codes.
      </Callout>

      {/* Large Action Buttons Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const domain = extractDomain(link.url);
          const Icon = getLinkIcon(link.label, link.url);

          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all focus-visible:ring-3 focus-visible:outline-none"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  {/* Official Badge */}
                  <span className="bg-success-soft text-success border-success/30 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                    <span>Official Portal</span>
                    <span aria-hidden="true">✓</span>
                  </span>

                  <span className="text-muted/70 flex items-center gap-1 font-mono text-xs">
                    <span>{domain}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-primary-soft text-primary group-hover:bg-primary mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="text-body text-text group-hover:text-primary font-bold transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-small text-muted mt-1 leading-snug">
                      {link.portalName || link.department || "Government service portal"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-primary font-semibold group-hover:underline">
                  Open official website
                </span>
                <ExternalLink
                  className="text-muted group-hover:text-primary h-4 w-4 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
