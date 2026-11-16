import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  PlusCircle,
  Search,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { requireAdminSession } from "@/lib/admin/server-auth";
import { getTopViewedGuides } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Manage Guides | Admin | India Paperwork Guide",
  robots: { index: false, follow: false },
};

export default async function AdminGuidesListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const activeFilter = params.filter || "all";
  const query = (params.q || "").toLowerCase().trim();

  const allGuides = await getTopViewedGuides(50);

  const filteredGuides = allGuides.filter((g) => {
    // Search query filter
    if (query && !g.name.toLowerCase().includes(query) && !g.slug.includes(query)) {
      return false;
    }
    // Status/Stale filter
    if (activeFilter === "published") return g.status === "PUBLISHED";
    if (activeFilter === "review") return g.status === "REVIEW";
    if (activeFilter === "draft") return g.status === "DRAFT";
    if (activeFilter === "stale") return g.isStale;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-[#6B7280]">
            <Link href="/admin" className="inline-flex items-center gap-1 hover:text-[#003366]">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Civic Guides Directory</h1>
          <p className="mt-0.5 text-xs text-[#4B5563]">
            Create, edit, review, and verify statutory paperwork guides.
          </p>
        </div>

        <Link
          href="/admin/guides/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#002244]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Guide</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "All Guides" },
            { id: "published", label: "Published" },
            { id: "review", label: "In Review" },
            { id: "draft", label: "Drafts" },
            { id: "stale", label: "Stale (>90d)" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.id === "all" ? "/admin/guides" : `/admin/guides?filter=${tab.id}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#003366] font-semibold text-white"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/admin/guides" className="relative sm:w-64">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search guides..."
            className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] py-1.5 pr-3 pl-9 text-xs focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
          />
          {activeFilter !== "all" && <input type="hidden" name="filter" value={activeFilter} />}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] font-semibold tracking-wider text-[#4B5563] uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Title & Slug
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
                <th scope="col" className="px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredGuides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#6B7280]">
                    No guides match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredGuides.map((guide) => (
                  <tr key={guide.slug} className="transition-colors hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-[#111827]">
                        <Link href={`/admin/guides/${guide.slug}`} className="hover:text-[#003366]">
                          {guide.name}
                        </Link>
                      </div>
                      <div className="font-mono text-[11px] text-[#6B7280]">/{guide.slug}</div>
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
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{guide.daysSinceVerified}d ago (Stale)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#137333]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{guide.daysSinceVerified}d ago</span>
                        </span>
                      )}
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
                          title="Open public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
