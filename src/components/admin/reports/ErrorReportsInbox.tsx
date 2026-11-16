"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Mail,
  ExternalLink,
  Edit,
  FileText,
  DollarSign,
  Link2,
  HelpCircle,
  Send,
  Building,
  RefreshCw,
} from "lucide-react";
import type { ErrorReportItem, ReportStatus } from "../../../lib/admin/reports.ts";
import type { TaskContent } from "../../../types/content.ts";

interface ErrorReportsInboxProps {
  initialReports: ErrorReportItem[];
  availableGuides: { slug: string; name: string }[];
}

export function ErrorReportsInbox({ initialReports, availableGuides }: ErrorReportsInboxProps) {
  const [reports, setReports] = useState<ErrorReportItem[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialReports[0]?.id || null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [guideFilter, setGuideFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  const handleReportUpdated = (updated: ErrorReportItem) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    if (statusFilter !== "all" && report.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (guideFilter !== "all" && report.taskSlug !== guideFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${report.description} ${report.proposedCorrection || ""} ${
        report.reporterEmail || ""
      } ${report.taskSlug || ""}`.toLowerCase();
      if (!matchText.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Status counts
  const counts = {
    all: reports.length,
    new: reports.filter((r) => r.status === "NEW").length,
    needToVerify: reports.filter((r) => r.status === "NEED_TO_VERIFY").length,
    fixed: reports.filter((r) => r.status === "FIXED").length,
    notAnIssue: reports.filter((r) => r.status === "NOT_AN_ISSUE").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            User Error Reports Inbox
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Review, verify, and resolve issues reported by citizens. Filter by guide and status,
            compare against live guide content, and update reporters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/report-mistake"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] shadow-xs hover:bg-[#F3F4F6]"
          >
            <span>Public Report Form</span>
            <ExternalLink className="h-3 w-3 text-[#6B7280]" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Reports", count: counts.all },
              { id: "new", label: "New", count: counts.new },
              { id: "need_to_verify", label: "Need to Verify", count: counts.needToVerify },
              { id: "fixed", label: "Fixed", count: counts.fixed },
              { id: "not_an_issue", label: "Not an Issue", count: counts.notAnIssue },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#003366] text-white shadow-xs"
                      : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#111827]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                      active
                        ? "bg-white/20 font-bold text-white"
                        : "border border-[#E5E7EB] bg-white text-[#4B5563]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Guide Dropdown and Search */}
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <div className="flex w-full items-center gap-1.5 sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-[#6B7280]" />
              <select
                value={guideFilter}
                onChange={(e) => setGuideFilter(e.target.value)}
                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none sm:w-48"
              >
                <option value="all">All Guides</option>
                {availableGuides.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#D1D5DB] bg-white py-1.5 pr-3 pl-8 text-xs text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Split Inbox Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Reports List (5 Cols) */}
        <div className="flex h-[750px] flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
            <span className="text-xs font-bold text-[#111827]">
              Citizen Submissions ({filteredReports.length})
            </span>
            <span className="text-[11px] text-[#6B7280]">Click a report to inspect</span>
          </div>

          <div className="flex-1 divide-y divide-[#E5E7EB] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                No reports match your selected filters.
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = report.id === selectedReportId;
                const issue = getIssueBadge(report.issueType);
                const status = getStatusBadge(report.status);
                const IssueIcon = issue.icon;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full p-4 text-left transition-colors ${
                      isSelected
                        ? "border-l-4 border-l-[#003366] bg-[#EFF6FF]"
                        : "border-l-4 border-l-transparent hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${issue.className}`}
                      >
                        <IssueIcon className="h-3 w-3" />
                        {issue.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-2 line-clamp-1 text-xs font-semibold text-[#111827]">
                      {report.taskSlug ? report.taskSlug : "General Guide Feedback"}
                      {report.stateCode ? ` (${report.stateCode.toUpperCase()})` : ""}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs text-[#4B5563]">{report.description}</p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span className="max-w-[150px] truncate">
                        {report.reporterEmail || "Anonymous citizen"}
                      </span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Guide Comparison (7 Cols) */}
        <div className="flex h-[750px] flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs lg:col-span-7">
          {selectedReport ? (
            <ReportDetailView
              key={selectedReport.id}
              report={selectedReport}
              onReportUpdated={handleReportUpdated}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#6B7280]">
              Select a report from the left pane to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   REPORT DETAIL & GUIDE COMPARISON VIEW (ISOLATED COMPONENT)
   ========================================================================= */

interface ReportDetailViewProps {
  report: ErrorReportItem;
  onReportUpdated: (updated: ErrorReportItem) => void;
}

function ReportDetailView({ report, onReportUpdated }: ReportDetailViewProps) {
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || "");
  const [emailNote, setEmailNote] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "guide">("details");
  const [isUpdating, setIsUpdating] = useState(false);
  const [guideData, setGuideData] = useState<TaskContent | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(Boolean(report.taskSlug));

  useEffect(() => {
    let active = true;
    if (report.taskSlug) {
      fetch(`/api/admin/guides/${report.taskSlug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.data) {
            setGuideData(data.data);
          }
        })
        .catch(() => {
          if (active) setGuideData(null);
        })
        .finally(() => {
          if (active) setLoadingGuide(false);
        });
    }
    return () => {
      active = false;
    };
  }, [report.taskSlug]);

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onReportUpdated(data.report);
      }
    } catch (err) {
      console.error("Failed to update report status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const issue = getIssueBadge(report.issueType);
  const status = getStatusBadge(report.status);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${issue.className}`}
          >
            {issue.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* View switcher: Report Details vs View Next to Guide */}
        <div className="flex rounded-lg border border-[#D1D5DB] bg-[#F3F4F6] p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`rounded-md px-3 py-1 transition-colors ${
              activeTab === "details"
                ? "bg-white font-bold text-[#111827] shadow-xs"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            Report & Actions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`rounded-md px-3 py-1 transition-colors ${
              activeTab === "guide"
                ? "bg-white font-bold text-[#111827] shadow-xs"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            View Next to Guide
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 space-y-6 p-6">
        {activeTab === "details" ? (
          <>
            {/* Report Information Card */}
            <div className="space-y-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Citizen Description
                </span>
                <p className="mt-1 text-sm leading-relaxed font-medium whitespace-pre-wrap text-[#111827]">
                  {report.description}
                </p>
              </div>

              {report.proposedCorrection && (
                <div className="rounded-lg border border-[#B3D4F5] bg-[#EBF3FB] p-3 text-xs text-[#003366]">
                  <strong className="block font-semibold">Citizen Proposed Correction:</strong>
                  <p className="mt-0.5 whitespace-pre-wrap">{report.proposedCorrection}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 border-t border-[#E5E7EB] pt-2 text-xs sm:grid-cols-2">
                <div>
                  <span className="text-[#6B7280]">Target Guide:</span>{" "}
                  <strong className="text-[#111827]">
                    {report.taskSlug || "General Feedback"}
                  </strong>
                  {report.taskSlug && (
                    <Link
                      href={`/admin/guides/${report.taskSlug}`}
                      target="_blank"
                      className="ml-2 inline-flex items-center text-[#003366] hover:underline"
                    >
                      <Edit className="mr-0.5 inline h-3 w-3" /> Open Editor
                    </Link>
                  )}
                </div>

                <div>
                  <span className="text-[#6B7280]">Reporter:</span>{" "}
                  <strong className="text-[#111827]">{report.reporterEmail || "Anonymous"}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons: Fixed / Not an issue / Need to verify */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827]">Update Workflow Status</h3>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4B5563]">
                  Editorial Resolution Notes:
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified with Parivahan circular; updated fee in national guide..."
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("FIXED")}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#15803D] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Fixed
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusUpdate("NEED_TO_VERIFY")}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D97706] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#B45309] disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  Need to Verify
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusUpdate("NOT_AN_ISSUE")}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-bold text-[#374151] shadow-xs transition-colors hover:bg-[#F3F4F6] disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 text-[#6B7280]" />
                  Not an Issue
                </button>
              </div>
            </div>

            {/* Email Reporter Section */}
            <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#003366]" />
                  <h3 className="text-sm font-bold text-[#111827]">Email Reporter</h3>
                </div>
                {report.reporterEmail ? (
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                    Email Verified
                  </span>
                ) : (
                  <span className="text-xs text-[#6B7280]">No email provided</span>
                )}
              </div>

              {report.reporterEmail ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#6B7280]">
                    Send a resolution acknowledgement to <strong>{report.reporterEmail}</strong>.
                  </p>

                  <textarea
                    rows={3}
                    value={emailNote}
                    onChange={(e) => setEmailNote(e.target.value)}
                    placeholder="Add optional custom note to include in email..."
                    className="w-full rounded-lg border border-[#D1D5DB] p-2.5 text-xs text-[#111827] focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none"
                  />

                  <div className="flex justify-end">
                    <a
                      href={`mailto:${encodeURIComponent(
                        report.reporterEmail
                      )}?subject=${encodeURIComponent(
                        `Update on your feedback: ${report.taskSlug || "Civic Guide"}`
                      )}&body=${encodeURIComponent(
                        `Dear Citizen,\n\nThank you for reporting an issue on India Paperwork Guide.\n\nStatus: ${report.status}\n${
                          emailNote ? `Note: ${emailNote}\n\n` : ""
                        }Sincerely,\nCivic Paperwork Editorial Team`
                      )}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1E40AF]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Open Email Client
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">
                  This citizen chose not to provide their email address. Resolutions are reflected
                  publicly in the guide changelog.
                </p>
              )}
            </div>
          </>
        ) : (
          /* VIEW NEXT TO GUIDE */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Live Guide Content Comparison</h3>
                <p className="text-xs text-[#6B7280]">
                  Inspect what the citizen saw when submitting this report.
                </p>
              </div>
              {report.taskSlug && (
                <Link
                  href={`/${report.taskSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#003366] hover:underline"
                >
                  View Public Page <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            {loadingGuide ? (
              <div className="py-12 text-center text-xs text-[#6B7280]">
                <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-[#003366]" />
                Loading guide content...
              </div>
            ) : guideData ? (
              <div className="space-y-5 text-xs">
                {/* Title & Summary */}
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <h4 className="text-sm font-bold text-[#111827]">{guideData.national?.title}</h4>
                  <p className="mt-1 text-[#4B5563]">{guideData.national?.summary}</p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[#6B7280]">
                    <span>
                      Verified:{" "}
                      <strong>
                        {guideData.national?.lastVerifiedAt
                          ? String(guideData.national.lastVerifiedAt).slice(0, 10)
                          : "N/A"}
                      </strong>
                    </span>
                    <span>
                      Estimated Time: <strong>{guideData.national?.estimatedTime}</strong>
                    </span>
                  </div>
                </div>

                {/* Statutory Fees Checklist */}
                <div>
                  <h5 className="mb-2 flex items-center gap-1.5 font-bold text-[#111827]">
                    <DollarSign className="h-3.5 w-3.5 text-[#16A34A]" />
                    Current Fees Breakdown:
                  </h5>
                  <div className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB]">
                    {(guideData.national?.fees || []).map((fee, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2.5">
                        <span className="font-medium text-[#111827]">{fee.label}</span>
                        <span className="font-bold text-[#166534]">₹{fee.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Requirements Checklist */}
                <div>
                  <h5 className="mb-2 flex items-center gap-1.5 font-bold text-[#111827]">
                    <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                    Document Requirements:
                  </h5>
                  <ul className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-white">
                    {(guideData.national?.documentRequirements || []).map((doc, idx) => (
                      <li key={idx} className="p-2.5">
                        <div className="font-semibold text-[#111827]">{doc.name}</div>
                        <div className="text-[11px] text-[#6B7280]">{doc.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Official Links */}
                <div>
                  <h5 className="mb-2 flex items-center gap-1.5 font-bold text-[#111827]">
                    <Building className="h-3.5 w-3.5 text-[#003366]" />
                    Official Government Portals:
                  </h5>
                  <div className="space-y-1.5">
                    {(guideData.national?.officialLinks || []).map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-2.5 text-[#003366] hover:bg-[#F9FAFB]"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                No task content found for slug: {report.taskSlug}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getIssueBadge(type: string) {
  switch (type) {
    case "outdated_fee":
      return {
        label: "Outdated Fee",
        icon: DollarSign,
        className: "bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]",
      };
    case "wrong_document":
      return {
        label: "Wrong Document",
        icon: FileText,
        className: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]",
      };
    case "broken_link":
      return {
        label: "Broken Link",
        icon: Link2,
        className: "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]",
      };
    case "procedure_changed":
      return {
        label: "Procedure Changed",
        icon: RefreshCw,
        className: "bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]",
      };
    default:
      return {
        label: "General Mistake",
        icon: HelpCircle,
        className: "bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]",
      };
  }
}

function getStatusBadge(status: ReportStatus) {
  switch (status) {
    case "NEW":
      return {
        label: "New",
        icon: AlertCircle,
        className: "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]",
      };
    case "NEED_TO_VERIFY":
      return {
        label: "Need to Verify",
        icon: Clock,
        className: "bg-[#FEFCE8] text-[#854D0E] border-[#FDE047]",
      };
    case "FIXED":
      return {
        label: "Fixed",
        icon: CheckCircle2,
        className: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]",
      };
    case "NOT_AN_ISSUE":
      return {
        label: "Not an Issue",
        icon: XCircle,
        className: "bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]",
      };
  }
}
