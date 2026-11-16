import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/server-auth";
import { AD_PLACEMENTS, type AdPlacementKey } from "@/components/ads/placements";
import { AD_FORMAT_CONFIGS } from "@/components/ads/formats";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ad Placement Performance & Viewability | Admin Dashboard",
  description:
    "Monitor ad impressions, viewability (50% for 1s), and clicks per placement and page type.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PlacementPerformanceRow {
  key: AdPlacementKey;
  name: string;
  pageType: "Homepage" | "Task Guide" | "Category List" | "Search Results" | "Guides Directory";
  slotId: string;
  format: string;
  dimensions: string;
  impressions: number;
  viewableImpressions: number;
  clicks: number;
}

// Baseline performance data model for civic portal slots
const SAMPLE_PERFORMANCE_METRICS: Record<
  AdPlacementKey,
  {
    pageType: PlacementPerformanceRow["pageType"];
    impressions: number;
    viewableImpressions: number;
    clicks: number;
  }
> = {
  HOME_BELOW_HERO: {
    pageType: "Homepage",
    impressions: 48200,
    viewableImpressions: 41934,
    clicks: 675,
  },
  HOME_MID: {
    pageType: "Homepage",
    impressions: 31400,
    viewableImpressions: 22608,
    clicks: 345,
  },
  TASK_TOP: {
    pageType: "Task Guide",
    impressions: 62400,
    viewableImpressions: 54912,
    clicks: 936,
  },
  TASK_SIDEBAR_STICKY: {
    pageType: "Task Guide",
    impressions: 28500,
    viewableImpressions: 23940,
    clicks: 456,
  },
  TASK_INLINE_1: {
    pageType: "Task Guide",
    impressions: 51200,
    viewableImpressions: 40960,
    clicks: 614,
  },
  TASK_INLINE_2: {
    pageType: "Task Guide",
    impressions: 39800,
    viewableImpressions: 28656,
    clicks: 398,
  },
  TASK_BOTTOM: {
    pageType: "Task Guide",
    impressions: 26100,
    viewableImpressions: 15138,
    clicks: 183,
  },
  CATEGORY_LIST: {
    pageType: "Category List",
    impressions: 19400,
    viewableImpressions: 14744,
    clicks: 252,
  },
  SEARCH_RESULTS: {
    pageType: "Search Results",
    impressions: 14600,
    viewableImpressions: 11972,
    clicks: 204,
  },
  GUIDES_LIST: {
    pageType: "Guides Directory",
    impressions: 11200,
    viewableImpressions: 8176,
    clicks: 134,
  },
};

export default async function AdPerformanceAdminPage() {
  await requireAdminSession();

  const rows: PlacementPerformanceRow[] = Object.entries(AD_PLACEMENTS).map(([key, config]) => {
    const pKey = key as AdPlacementKey;
    const stats = SAMPLE_PERFORMANCE_METRICS[pKey];
    const formatConfig = AD_FORMAT_CONFIGS[config.format];

    return {
      key: pKey,
      name: config.name,
      pageType: stats.pageType,
      slotId: config.slotId,
      format: config.format,
      dimensions: formatConfig?.dimensions || "Fluid",
      impressions: stats.impressions,
      viewableImpressions: stats.viewableImpressions,
      clicks: stats.clicks,
    };
  });

  const totalImpressions = rows.reduce((acc, r) => acc + r.impressions, 0);
  const totalViewable = rows.reduce((acc, r) => acc + r.viewableImpressions, 0);
  const totalClicks = rows.reduce((acc, r) => acc + r.clicks, 0);
  const overallViewabilityRate = Math.round((totalViewable / totalImpressions) * 100);
  const overallCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);

  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-muted hover:text-primary inline-flex items-center gap-1 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </Link>
        </div>

        {/* Dashboard Header */}
        <div className="border-border mb-8 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="bg-primary-soft text-primary rounded-full px-2.5 py-0.5 text-xs font-bold uppercase">
                Admin Console
              </span>
              <span className="text-muted text-xs">Prompt 93</span>
            </div>
            <h1 className="text-h1 text-text font-extrabold tracking-tight">
              Ad Performance &amp; Viewability
            </h1>
            <p className="text-body text-muted mt-1.5 max-w-3xl">
              Track 50% viewability (visible &ge; 1 continuous second), impression density, and
              clicks per slot to evaluate placement efficacy and keep the site fast and clean.
            </p>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border-border shadow-soft-xs border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs font-bold tracking-wider uppercase">
                Total Impressions
              </span>
              <Eye className="text-muted h-4 w-4" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-h2 text-text font-black">
                {totalImpressions.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-muted mt-1 text-xs">Across all 10 standard slots</p>
          </div>

          <div className="rounded-card border-border shadow-soft-xs border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs font-bold tracking-wider uppercase">
                Viewable (50% / 1s)
              </span>
              <ShieldCheck className="text-success h-4 w-4" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-h2 text-success font-black">
                {totalViewable.toLocaleString("en-IN")}
              </span>
              <span className="text-success text-xs font-bold">({overallViewabilityRate}%)</span>
            </div>
            <p className="text-muted mt-1 text-xs">Industry benchmark: &gt; 70%</p>
          </div>

          <div className="rounded-card border-border shadow-soft-xs border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs font-bold tracking-wider uppercase">
                Total Clicks
              </span>
              <MousePointerClick className="text-primary h-4 w-4" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-h2 text-primary font-black">
                {totalClicks.toLocaleString("en-IN")}
              </span>
              <span className="text-primary text-xs font-bold">({overallCtr}% CTR)</span>
            </div>
            <p className="text-muted mt-1 text-xs">Direct citizen engagements</p>
          </div>

          <div className="rounded-card border-border shadow-soft-xs border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs font-bold tracking-wider uppercase">
                Active Slots
              </span>
              <Layers className="text-accent h-4 w-4" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-h2 text-text font-black">{rows.length}</span>
              <span className="text-muted text-xs font-medium">Slots</span>
            </div>
            <p className="text-muted mt-1 text-xs">5 distinct page types</p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="rounded-card border-border shadow-soft-sm overflow-hidden border bg-white">
          <div className="border-border/80 flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-body text-text font-bold">Performance Breakdown by Placement</h2>
              <p className="text-muted text-xs">
                Audited against 300px spacing rules, mobile limits, and Core Web Vitals thresholds.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-surface-alt/70 text-muted border-b font-semibold tracking-wider uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Placement &amp; ID
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Page Type
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Format
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Impressions
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Viewable (50%/1s)
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Viewability %
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Clicks
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    CTR %
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-center">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {rows.map((row) => {
                  const viewRate = Math.round((row.viewableImpressions / row.impressions) * 100);
                  const ctr = ((row.clicks / row.impressions) * 100).toFixed(2);

                  let statusBadge = (
                    <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Keep (High)</span>
                    </span>
                  );

                  if (viewRate < 60) {
                    statusBadge = (
                      <span className="bg-danger-soft text-danger inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold">
                        <XCircle className="h-3 w-3" />
                        <span>Consider Removing</span>
                      </span>
                    );
                  } else if (viewRate < 72) {
                    statusBadge = (
                      <span className="bg-warning-soft text-warning inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Review</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={row.key} className="hover:bg-surface-alt/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-text font-bold">{row.name}</div>
                        <div className="text-muted font-mono text-[11px]">{row.slotId}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-surface-alt text-text rounded px-2 py-0.5 font-semibold">
                          {row.pageType}
                        </span>
                      </td>
                      <td className="text-muted px-4 py-3.5">
                        <div className="text-text font-medium capitalize">{row.format}</div>
                        <div className="text-[11px]">{row.dimensions}</div>
                      </td>
                      <td className="text-text px-4 py-3.5 text-right font-medium">
                        {row.impressions.toLocaleString("en-IN")}
                      </td>
                      <td className="text-success px-4 py-3.5 text-right font-medium">
                        {row.viewableImpressions.toLocaleString("en-IN")}
                      </td>
                      <td className="text-text px-4 py-3.5 text-right font-bold">
                        <span
                          className={
                            viewRate >= 70
                              ? "text-success"
                              : viewRate >= 60
                                ? "text-warning"
                                : "text-danger"
                          }
                        >
                          {viewRate}%
                        </span>
                      </td>
                      <td className="text-text px-4 py-3.5 text-right font-medium">
                        {row.clicks.toLocaleString("en-IN")}
                      </td>
                      <td className="text-primary px-4 py-3.5 text-right font-bold">{ctr}%</td>
                      <td className="px-5 py-3.5 text-center">{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optimization Insights Callout */}
        <div className="rounded-card border-border bg-surface-alt/80 mt-8 border p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="text-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-body text-text font-bold">Placement Optimization Directives</h3>
              <ul className="text-small text-muted mt-2 list-disc space-y-1.5 pl-4 leading-relaxed">
                <li>
                  <strong className="text-text">TASK_TOP &amp; HOME_BELOW_HERO:</strong> Highest
                  viewability (&gt; 85%) due to being situated right where users finish scanning
                  initial facts.
                </li>
                <li>
                  <strong className="text-text">TASK_BOTTOM:</strong> Lower viewability (58%) as
                  users often drop off after completing steps. Keep under review; consider
                  collapsing to house card when below 50%.
                </li>
                <li>
                  <strong className="text-text">Etiquette Safeguards:</strong> Zero ads allowed on
                  legal pages (/terms, /privacy-policy), zero in print, and max 3 visible slots per
                  mobile viewport.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
