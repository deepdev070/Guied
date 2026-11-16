"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Edit,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  RotateCcw,
  Upload,
  User,
  Calendar,
} from "lucide-react";
import type { AuditLogEntry } from "../../../lib/admin/audit.ts";

interface AuditLogViewerProps {
  initialLogs: AuditLogEntry[];
  availableGuides: { slug: string; name: string }[];
}

export function AuditLogViewer({ initialLogs, availableGuides }: AuditLogViewerProps) {
  const [logs] = useState<AuditLogEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [guideFilter, setGuideFilter] = useState("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== "all" && log.action.toLowerCase() !== actionFilter.toLowerCase()) {
      return false;
    }
    if (guideFilter !== "all" && log.targetSlug !== guideFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${log.action} ${log.actor} ${log.targetSlug || ""} ${JSON.stringify(
        log.details || {}
      )} ${JSON.stringify(log.before || {})} ${JSON.stringify(log.after || {})}`.toLowerCase();
      if (!matchText.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "VERIFY_GUIDE":
        return {
          label: "Guide Verified",
          icon: CheckCircle2,
          className: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
        };
      case "UPDATE_GUIDE":
        return {
          label: "Guide Updated",
          icon: Edit,
          className: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]",
        };
      case "RESOLVE_REPORT":
        return {
          label: "Report Resolved",
          icon: AlertTriangle,
          className: "bg-[#FEFCE8] text-[#854D0E] border-[#FDE047]",
        };
      case "RESTORE_REVISION":
        return {
          label: "Revision Restored",
          icon: RotateCcw,
          className: "bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]",
        };
      case "IMPORT_GUIDES":
        return {
          label: "Guides Imported",
          icon: Upload,
          className: "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]",
        };
      default:
        return {
          label: action,
          icon: History,
          className: "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]",
        };
    }
  };

  const handleDownloadLogs = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `civic-admin-audit-log-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Audit Log & Editorial Trail
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Tamper-evident record of all administrative actions (who, what, when, before/after).
            Required for statutory transparency and verification accountability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadLogs}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] shadow-xs transition-colors hover:bg-[#F3F4F6]"
        >
          <Download className="h-3.5 w-3.5 text-[#6B7280]" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search audit log by actor, guide, action, or changed values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] bg-[#FAFAFA] py-2 pr-3 pl-9 text-xs text-[#111827] focus:border-[#003366] focus:bg-white focus:ring-1 focus:ring-[#003366] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#6B7280]" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="VERIFY_GUIDE">Guide Verified</option>
                <option value="UPDATE_GUIDE">Guide Updated</option>
                <option value="RESOLVE_REPORT">Report Resolved</option>
                <option value="RESTORE_REVISION">Revision Restored</option>
                <option value="IMPORT_GUIDES">Guides Imported</option>
              </select>
            </div>

            {/* Guide filter */}
            <select
              value={guideFilter}
              onChange={(e) => setGuideFilter(e.target.value)}
              className="rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
            >
              <option value="all">All Guides</option>
              {availableGuides.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-[#6B7280]">
          <span>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> audit
            entries
          </span>
          {(searchQuery || actionFilter !== "all" || guideFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActionFilter("all");
                setGuideFilter("all");
              }}
              className="font-semibold text-[#003366] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Entries Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp (When)</th>
                <th className="px-4 py-3 font-semibold">Actor (Who)</th>
                <th className="px-4 py-3 font-semibold">Action (What)</th>
                <th className="px-4 py-3 font-semibold">Target Entity</th>
                <th className="px-4 py-3 font-semibold">Details / Summary</th>
                <th className="px-4 py-3 text-right font-semibold">Before / After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#6B7280]">
                    No audit log records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => {
                  const isExpanded = expandedLogId === entry.id;
                  const badge = getActionBadge(entry.action);
                  const BadgeIcon = badge.icon;
                  const hasBeforeAfter = Boolean(entry.before) || Boolean(entry.after);

                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="transition-colors hover:bg-[#F9FAFB]">
                        {/* Timestamp */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-[#4B5563]">
                          <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                            <Calendar className="h-3 w-3 text-[#9CA3AF]" />
                            {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="pl-4.5 text-[11px] text-[#6B7280]">
                            {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Actor (Who) */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-semibold text-[#111827]">
                            <User className="h-3 w-3 text-[#6B7280]" />
                            {entry.actor}
                          </span>
                        </td>

                        {/* Action (What) */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                          >
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </td>

                        {/* Target Entity */}
                        <td className="px-4 py-3.5">
                          {entry.targetSlug ? (
                            <Link
                              href={`/admin/guides/${entry.targetSlug}`}
                              className="font-mono text-xs font-semibold text-[#003366] hover:underline"
                            >
                              {entry.targetSlug}
                            </Link>
                          ) : (
                            <span className="text-[#9CA3AF]">—</span>
                          )}
                        </td>

                        {/* Details / Summary */}
                        <td className="max-w-xs truncate px-4 py-3.5 text-[#4B5563]">
                          {entry.details?.notes ? (
                            String(entry.details.notes)
                          ) : entry.details?.summaryOfChanges ? (
                            String(entry.details.summaryOfChanges)
                          ) : entry.details?.sourceUrl ? (
                            <span>Verified URL: {String(entry.details.sourceUrl)}</span>
                          ) : (
                            <span className="text-[#6B7280]">
                              {JSON.stringify(entry.details || {})}
                            </span>
                          )}
                        </td>

                        {/* Before / After toggle button */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {hasBeforeAfter ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(entry.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-[11px] font-semibold text-[#374151] shadow-2xs transition-colors hover:bg-[#F3F4F6]"
                            >
                              <span>{isExpanded ? "Hide Diff" : "View Diff"}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#9CA3AF]">No state change</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Before/After Snapshot Row */}
                      {isExpanded && hasBeforeAfter && (
                        <tr className="bg-[#F8FAFC]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-3 rounded-lg border border-[#E2E8F0] bg-white p-4">
                              <h4 className="text-xs font-bold tracking-wider text-[#111827] uppercase">
                                Before / After State Snapshot
                              </h4>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* BEFORE */}
                                <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
                                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#991B1B] uppercase">
                                    <span>Before Action</span>
                                  </div>
                                  <pre className="overflow-x-auto font-mono text-[11px] whitespace-pre-wrap text-[#7F1D1D]">
                                    {entry.before
                                      ? JSON.stringify(entry.before, null, 2)
                                      : "None (New entity creation)"}
                                  </pre>
                                </div>

                                {/* AFTER */}
                                <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
                                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#166534] uppercase">
                                    <span>After Action</span>
                                    <ArrowRight className="h-3 w-3 text-[#16A34A]" />
                                  </div>
                                  <pre className="overflow-x-auto font-mono text-[11px] whitespace-pre-wrap text-[#14532D]">
                                    {entry.after
                                      ? JSON.stringify(entry.after, null, 2)
                                      : "None (Deleted entity)"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
