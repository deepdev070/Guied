"use client";

import React from "react";
import { Phone, MapPin, Scale, Calculator, Keyboard, FileText, CheckCircle2 } from "lucide-react";
import type { SponsoredProviderData } from "@/data/sponsored-providers";
import { analytics } from "@/lib/analytics";

export interface SponsoredProviderCardProps {
  provider: SponsoredProviderData;
  className?: string;
}

const CATEGORY_LABELS: Record<
  SponsoredProviderData["category"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  notary: { label: "Notary Public", icon: Scale },
  ca: { label: "Chartered Accountant", icon: Calculator },
  typing_centre: { label: "Typing & Online Kendra", icon: Keyboard },
  legal_writer: { label: "Document Writer", icon: FileText },
};

export function SponsoredProviderCard({ provider, className = "" }: SponsoredProviderCardProps) {
  const meta = CATEGORY_LABELS[provider.category] || CATEGORY_LABELS.notary;
  const CategoryIcon = meta.icon;

  const handlePhoneClick = () => {
    analytics.providerPhoneClick(provider.id, provider.name, provider.city, provider.category);
  };

  return (
    <article
      aria-label={`Sponsored listing: ${provider.name}`}
      className={`rounded-card border-border shadow-soft-xs hover:border-primary/40 hover:shadow-soft-md flex flex-col justify-between border bg-white p-5 transition-all ${className}`}
    >
      <div>
        {/* Top Badges: Category & Mandatory SPONSORED Label */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-muted flex items-center gap-1.5 text-xs font-semibold">
            <CategoryIcon className="text-primary h-4 w-4" aria-hidden="true" />
            <span>{meta.label}</span>
          </div>

          <span
            className="border-warning/30 bg-accent-soft text-warning rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
            aria-label="Sponsored advertisement"
          >
            Sponsored
          </span>
        </div>

        {/* Provider Title & City */}
        <h3 className="text-body text-text font-bold">{provider.name}</h3>

        <div className="text-muted mt-1.5 flex items-center gap-1 text-xs">
          <MapPin className="text-muted/70 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="text-text font-medium">{provider.city}</span>
          {provider.address && (
            <span className="text-muted/80 truncate"> • {provider.address}</span>
          )}
        </div>

        {/* Key Services Offered */}
        <div className="border-border/60 mt-4 border-t pt-3">
          <span className="text-muted text-[11px] font-semibold tracking-wider uppercase">
            Services Available:
          </span>
          <ul className="text-text mt-1.5 space-y-1 text-xs">
            {provider.services.map((service) => (
              <li key={service} className="flex items-center gap-1.5">
                <CheckCircle2 className="text-success h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action: Verified Direct Phone Contact */}
      <div className="border-border/60 mt-5 border-t pt-3.5">
        <a
          href={`tel:${provider.phone.replace(/\s+/g, "")}`}
          onClick={handlePhoneClick}
          className="rounded-input bg-primary hover:bg-primary-hover focus-visible:ring-primary/40 shadow-soft-xs flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Call: {provider.phone}</span>
        </a>
      </div>
    </article>
  );
}
