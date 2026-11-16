import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  MessageSquareWarning,
  ThumbsUp,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Database,
  ShieldCheck,
  Layers,
  History,
} from "lucide-react";
import { requireAdminSession } from "@/lib/admin/server-auth";
import { getAdminDashboardMetrics, getTopViewedGuides } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | India Paperwork Guide",
  description: "Civic paperwork guide editorial overview and verification metrics.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [metrics, topGuides] = await Promise.all([
    getAdminDashboardMetrics(),
    getTopViewedGuides(10),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Editorial & Verification Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Real-time status of civic guides, government verification freshness, and citizen
            feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/import-export"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] shadow-2xs transition-colors hover:bg-[#F9FAFB]"
          >
            <Database className="h-3.5 w-3.5 text-[#6B7280]" />
            <span>Import / Export</span>
          </Link>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] shadow-2xs transition-colors hover:bg-[#F9FAFB]"
          >
            <History className="h-3.5 w-3.5 text-[#6B7280]" />
            <span>Audit Log</span>
          </Link>
          <Link
            href="/admin/guides/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#002244]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Guide</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Guides */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div>
            <div className="mb-2 flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold tracking-wider uppercase">Total Guides</span>
              <FileText className="h-4 w-4 text-[#003366]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">{metrics.totalGuides}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#4B5563]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#137333]" />
              <span>Catalog & Seeded Tasks</span>
            </div>
          </div>
          <Link
            href="/admin/guides"
            className="mt-4 inline-flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>Manage All Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Published / Draft / Review Breakdown */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div>
            <div className="mb-2 flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Workflow Status
              </span>
              <Layers className="h-4 w-4 text-[#003366]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {metrics.publishedCount}{" "}
              <span className="text-xs font-medium text-[#6B7280]">live</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="rounded bg-[#E6F4EA] px-1.5 py-0.5 font-semibold text-[#137333]">
                {metrics.publishedCount} Pub
              </span>
              <span className="rounded bg-[#FEF7E0] px-1.5 py-0.5 font-semibold text-[#B06000]">
                {metrics.reviewCount} Review
              </span>
              <span className="rounded bg-[#F1F3F4] px-1.5 py-0.5 font-semibold text-[#5F6368]">
                {metrics.draftCount} Draft
              </span>
            </div>
          </div>
          <Link
            href="/admin/guides"
            className="mt-4 inline-flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>Filter by Workflow</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stale Items (Over 90 Days) */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div>
            <div className="mb-2 flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Stale (&gt;90 Days)
              </span>
              {metrics.staleCount > 0 ? (
                <AlertTriangle className="h-4 w-4 text-[#C5221F]" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#137333]" />
              )}
            </div>
            <div
              className={`text-2xl font-bold ${metrics.staleCount > 0 ? "text-[#C5221F]" : "text-[#137333]"}`}
            >
              {metrics.staleCount}
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              {metrics.staleCount > 0
                ? "Guides requiring official site check"
                : "All guides verified within 90 days"}
            </p>
          </div>
          <Link
            href="/admin/guides?filter=stale"
            className="mt-4 inline-flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>Review Stale Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Open Error Reports */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div>
            <div className="mb-2 flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold tracking-wider uppercase">Error Reports</span>
              <MessageSquareWarning className="h-4 w-4 text-[#B06000]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">{metrics.openErrorReportsCount}</div>
            <p className="mt-2 text-xs text-[#6B7280]">Unresolved citizen mistake reports</p>
          </div>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>Open Reports Inbox</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Helpful Feedback Score */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div>
            <div className="mb-2 flex items-center justify-between text-[#6B7280]">
              <span className="text-xs font-semibold tracking-wider uppercase">Helpful Score</span>
              <ThumbsUp className="h-4 w-4 text-[#137333]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">{metrics.helpfulFeedbackScore}%</div>
            <p className="mt-2 text-xs text-[#6B7280]">
              Based on {metrics.totalFeedbackCount > 0 ? metrics.totalFeedbackCount : "active"}{" "}
              citizen ratings
            </p>
          </div>
          <Link
            href="/admin/reports?tab=feedback"
            className="mt-4 inline-flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>Feedback Analysis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Database Backup & Verification Alert Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#B3D4F5] bg-[#EBF3FB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-lg bg-[#003366] p-2 text-white">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#003366]">
              Database Integrity & Backup Reminder
            </h2>
            <p className="mt-0.5 text-xs text-[#374151]">
              Statutory civic regulations require weekly snapshot exports of all live guides and
              audit trails.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/import-export"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#B3D4F5] bg-white px-3 py-1.5 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#F3F8FD]"
          >
            <span>Export Backup (JSON/CSV)</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 10 Most Viewed Guides Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Top 10 Most Viewed Civic Guides</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Ranked by citizen query frequency, view traffic, and editorial status.
            </p>
          </div>
          <Link
            href="/admin/guides"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#003366] hover:underline"
          >
            <span>View All Guides</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] font-semibold tracking-wider text-[#4B5563] uppercase">
              <tr>
                <th scope="col" className="w-12 px-4 py-3 text-center">
                  #
                </th>
                <th scope="col" className="px-4 py-3">
                  Guide & Slug
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Last Verified
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  30-Day Views
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Helpful
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {topGuides.map((guide, idx) => (
                <tr key={guide.slug} className="transition-colors hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 text-center font-bold text-[#9CA3AF]">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-[#111827] hover:text-[#003366]">
                      <Link href={`/admin/guides/${guide.slug}`}>{guide.name}</Link>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[#6B7280]">/{guide.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
                      {guide.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        guide.status === "PUBLISHED"
                          ? "bg-[#E6F4EA] text-[#137333]"
                          : guide.status === "REVIEW"
                            ? "bg-[#FEF7E0] text-[#B06000]"
                            : "bg-[#F1F3F4] text-[#5F6368]"
                      }`}
                    >
                      {guide.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {guide.isStale ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#C5221F]">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{guide.daysSinceVerified}d ago (Stale)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#137333]">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{guide.daysSinceVerified}d ago</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#111827]">
                    {guide.views.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#137333]">
                    {guide.helpfulScore}%
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/guides/${guide.slug}`}
                        className="rounded bg-[#EBF3FB] px-2.5 py-1 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#D6E7FA]"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${guide.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                        title="View public page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
