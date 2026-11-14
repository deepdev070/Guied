"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StateRequestForm } from "./StateRequestForm";
import { SponsoredProviderCard } from "@/components/ads/SponsoredProviderCard";
import type { StateSeedData } from "../../../prisma/data/states";
import type { TaskSummary } from "@/lib/queries";
import type { SponsoredProviderData } from "@/data/sponsored-providers";
import {
  Building2,
  ExternalLink,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export interface StatePageViewProps {
  state: StateSeedData;
  specificTasks: TaskSummary[];
  generalTasks: TaskSummary[];
  sponsoredProviders?: SponsoredProviderData[];
}

export function StatePageView({
  state,
  specificTasks,
  generalTasks,
  sponsoredProviders = [],
}: StatePageViewProps) {
  const currentYear = 2026;
  const hasLittleContent = specificTasks.length === 0;

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "States", href: "/#browse-by-category-heading" },
    { name: state.name },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* 2. State Hero Banner */}
      <div className="rounded-card border-border to-surface-alt/70 mb-8 border bg-gradient-to-br from-white via-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-muted text-xs font-bold tracking-wider uppercase">
                State & Union Territory Guide
              </span>
              <span className="bg-border h-1 w-1 rounded-full" />
              <span className="text-muted text-xs font-semibold">Code: {state.code}</span>
              {state.launchState && (
                <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                  LAUNCH STATE
                </span>
              )}
            </div>

            <h1 className="text-h1 text-text font-bold tracking-tight">
              {state.name} Government Paperwork Guides ({currentYear})
            </h1>

            {state.nativeName && (
              <p className="text-h3 text-muted mt-1 font-medium">{state.nativeName}</p>
            )}

            <p className="text-body text-muted mt-2 max-w-2xl leading-relaxed">
              Official document checklists, statutory fees, and verified portal procedures for
              citizen services across {state.name}.
            </p>
          </div>
        </div>

        {/* State Main Portals & Key Offices Grid */}
        <div className="border-border/80 mt-8 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
          {/* Main Portal */}
          <div className="rounded-card border-border bg-background shadow-soft-xs flex flex-col justify-between border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary-soft text-primary mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  State Civic Portal
                </span>
                <h3 className="text-body text-text font-bold">
                  {state.portalName || `${state.name} State Services Portal`}
                </h3>
                <p className="text-small text-muted mt-0.5">
                  Official online gateway for state citizen services, certificates, and revenue
                  paperwork.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-2">
              {state.portalUrl ? (
                <a
                  href={state.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-xs font-bold"
                >
                  <span>Visit {state.portalName}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span className="text-muted text-xs font-medium">
                  Official URL verification in progress
                </span>
              )}
            </div>
          </div>

          {/* Key Offices */}
          <div className="rounded-card border-border bg-background shadow-soft-xs flex flex-col justify-between border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-accent-soft text-warning mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Key Counter Offices
                </span>
                <h3 className="text-body text-text font-bold">Regional District Centers</h3>
                <ul className="text-small text-muted mt-1 list-disc space-y-0.5 pl-4 leading-relaxed">
                  <li>Regional Transport Office (RTO)</li>
                  <li>Jan Seva Kendra / District e-Seva Centers</li>
                  <li>Sub-Divisional Magistrate (SDM) / Taluka Office</li>
                </ul>
              </div>
            </div>

            <div className="text-muted mt-4 pt-2 text-xs">
              <span>Operating hours: Mon – Fri, 10:30 AM – 5:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. State-Specific Content or "Coming Soon - Tell us what you need" */}
      {hasLittleContent ? (
        <div className="rounded-card border-border bg-surface-alt/60 my-6 border p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="text-primary h-5 w-5" aria-hidden="true" />
            <h2 className="text-h2 text-text font-bold">
              Coming soon &mdash; Tell us what you need for {state.name}
            </h2>
          </div>
          <p className="text-body text-muted mb-6 leading-relaxed">
            We are actively researching and verifying local counter procedures, statutory fees, and
            circulars for <strong>{state.name}</strong>. Let us know which guide you need first and
            our team will expedite it.
          </p>

          <StateRequestForm stateName={state.name} />
        </div>
      ) : (
        <section aria-labelledby="state-verified-heading" className="my-8">
          <div className="border-border/80 mb-6 flex items-center justify-between border-b pb-3">
            <div>
              <h2
                id="state-verified-heading"
                className="text-h2 text-text font-bold tracking-tight"
              >
                Verified Guides with {state.name} Rules
              </h2>
              <p className="text-small text-muted mt-1">
                Localized counter procedures, local gazette fees, and automated track guidelines for{" "}
                {state.name}.
              </p>
            </div>

            <span className="bg-success-soft text-success border-success/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{specificTasks.length} State Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specificTasks.map((task) => (
              <Link
                key={task.slug}
                href={`/${task.slug}/${state.slug}`}
                className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all focus-visible:ring-3 focus-visible:outline-none"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="bg-primary-soft text-primary border-primary/20 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {task.categoryName}
                    </span>
                    <span className="bg-success-soft text-success rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {state.name} Verified ✓
                    </span>
                  </div>

                  <h3 className="text-body text-text group-hover:text-primary font-bold transition-colors">
                    {task.name}
                  </h3>

                  <p className="text-small text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{task.estimatedTime}</span>
                  </span>

                  <span className="text-text flex items-center gap-1 font-bold">
                    <IndianRupee className="text-success h-3.5 w-3.5" aria-hidden="true" />
                    <span>{task.cost}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Common All-India Services in this State */}
      <section
        aria-labelledby="central-services-heading"
        className="border-border my-10 border-t pt-8"
      >
        <div className="border-border/80 mb-6 border-b pb-3">
          <h2 id="central-services-heading" className="text-h2 text-text font-bold tracking-tight">
            Central & National Paperwork Available in {state.name}
          </h2>
          <p className="text-small text-muted mt-1">
            Standard all-India public services valid at regional Passport Seva Kendras, Aadhaar Seva
            Kendras, and UTIITSL / NSDL facilitation centers across {state.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generalTasks.map((task) => (
            <Link
              key={task.slug}
              href={`/${task.slug}/${state.slug}`}
              className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md group focus-visible:ring-primary/40 flex flex-col justify-between border p-5 transition-all focus-visible:ring-3 focus-visible:outline-none"
            >
              <div>
                <div className="mb-3">
                  <span className="bg-surface-alt text-muted border-border rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {task.categoryName}
                  </span>
                </div>

                <h3 className="text-body text-text group-hover:text-primary font-bold transition-colors">
                  {task.name}
                </h3>

                <p className="text-small text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{task.estimatedTime}</span>
                </span>

                <span className="text-text flex items-center gap-1 font-bold">
                  <IndianRupee className="text-success h-3.5 w-3.5" aria-hidden="true" />
                  <span>{task.cost}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Sponsored Local Providers (Prompt 92) */}
      {sponsoredProviders && sponsoredProviders.length > 0 && (
        <section
          aria-labelledby="sponsored-providers-heading"
          className="border-border my-10 border-t pt-8"
        >
          <div className="border-border/80 mb-6 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="sponsored-providers-heading"
                  className="text-h2 text-text font-bold tracking-tight"
                >
                  Local Document Assistance in {state.name}
                </h2>
                <span className="border-warning/30 bg-accent-soft text-warning rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  Sponsored
                </span>
              </div>
              <p className="text-small text-muted mt-1">
                Verified local notaries, legal document writers, and typing facilitation centers in{" "}
                {state.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsoredProviders.slice(0, 3).map((provider) => (
              <SponsoredProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
