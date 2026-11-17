import fs from "node:fs";
import path from "node:path";
import { db } from "../db.ts";
import { recordAuditLog } from "./audit.ts";

export type ReportStatus = "NEW" | "NEED_TO_VERIFY" | "FIXED" | "NOT_AN_ISSUE";

export type ReportIssueType =
  "outdated_fee" | "wrong_document" | "broken_link" | "procedure_changed" | "other";

export interface ErrorReportItem {
  id: string;
  taskSlug: string | null;
  stateCode: string | null;
  reporterEmail: string | null;
  issueType: ReportIssueType | string;
  description: string;
  proposedCorrection: string | null;
  status: ReportStatus;
  adminNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const REPORTS_DIR = path.join(process.cwd(), ".reports");
const REPORTS_FILE = path.join(REPORTS_DIR, "error-reports.json");

function ensureReportsFile(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_FILE)) {
    // Initial realistic citizen error reports for testing and editorial review
    const initialSeed: ErrorReportItem[] = [
      {
        id: "rep_llr_fee_01",
        taskSlug: "driving-licence-learner",
        stateCode: "gj",
        reporterEmail: "citizen.rajesh@gmail.com",
        issueType: "outdated_fee",
        description:
          "The Sarathi portal online payment gateway recently added a ₹50 service fee for contactless slot booking in Gujarat.",
        proposedCorrection: "Update total fee from ₹200 to ₹250 for Gujarat online applications.",
        status: "NEW",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "rep_passport_doc_02",
        taskSlug: "passport-renewal",
        stateCode: null,
        reporterEmail: "priya.sharma92@outlook.com",
        issueType: "wrong_document",
        description:
          "Under the new Passport Seva rules, self-attested copies of the first two and last two pages of the old passport are mandatory.",
        proposedCorrection:
          "Add old passport copy under mandatory document requirements checklist.",
        status: "NEED_TO_VERIFY",
        adminNotes: "Checking with regional passport office portal circular dated Jan 2026.",
        resolvedBy: "Editorial Team",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "rep_dl_link_03",
        taskSlug: "driving-licence-new",
        stateCode: "gj",
        reporterEmail: null,
        issueType: "broken_link",
        description:
          "The appointment booking link on the Gujarat transport page timed out when opening from mobile.",
        proposedCorrection:
          "Verify whether https://cot.gujarat.gov.in is the direct regional portal.",
        status: "NEW",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "rep_dl_resolved_04",
        taskSlug: "driving-licence-learner",
        stateCode: null,
        reporterEmail: "sunil.k@yahoo.in",
        issueType: "procedure_changed",
        description:
          "Aadhaar authentication OTP method was updated to UIDAI FaceRD in several test centres.",
        proposedCorrection: "Added note about FaceRD alternative for mobile e-KYC.",
        status: "FIXED",
        adminNotes: "Added Aadhaar e-KYC Tip callout to step 1.",
        resolvedBy: "Civic Admin",
        resolvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(initialSeed, null, 2), "utf-8");
  }
}

export function readDiskReports(): ErrorReportItem[] {
  ensureReportsFile();
  try {
    const raw = fs.readFileSync(REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeDiskReports(reports: ErrorReportItem[]): void {
  ensureReportsFile();
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
}

export function getErrorReportStats(): {
  total: number;
  open: number;
  resolved: number;
  inReview: number;
} {
  const reports = readDiskReports();
  let open = 0;
  let resolved = 0;
  let inReview = 0;
  for (const r of reports) {
    if (r.status === "FIXED" || r.status === "NOT_AN_ISSUE") resolved++;
    else if (r.status === "NEED_TO_VERIFY") inReview++;
    else open++;
  }
  return { total: reports.length, open, resolved, inReview };
}

/**
 * Creates or appends an error report (called by /api/report-mistake)
 */
export async function createErrorReport(data: {
  taskSlug?: string | null;
  stateCode?: string | null;
  reporterEmail?: string | null;
  issueType: string;
  description: string;
  proposedCorrection?: string | null;
}): Promise<ErrorReportItem> {
  const newReport: ErrorReportItem = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    taskSlug: data.taskSlug || null,
    stateCode: data.stateCode || null,
    reporterEmail: data.reporterEmail || null,
    issueType: data.issueType,
    description: data.description.trim(),
    proposedCorrection: data.proposedCorrection?.trim() || null,
    status: "NEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Write to filesystem
  const disk = readDiskReports();
  disk.unshift(newReport);
  writeDiskReports(disk);

  // 2. Write to database if available
  try {
    await db.errorReport.create({
      data: {
        id: newReport.id,
        taskSlug: newReport.taskSlug,
        stateCode: newReport.stateCode,
        reporterEmail: newReport.reporterEmail,
        issueType: newReport.issueType,
        description: newReport.description,
        proposedCorrection: newReport.proposedCorrection,
        status: newReport.status,
      },
    });
  } catch {
    // Database offline fallback
  }

  return newReport;
}

/**
 * Lists error reports with optional filtering by guide, status, and search query
 */
export async function listErrorReports(filters?: {
  taskSlug?: string;
  status?: string;
  search?: string;
}): Promise<ErrorReportItem[]> {
  let reports: ErrorReportItem[] = [];

  // Try DB first
  try {
    const dbReports = await db.errorReport.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (dbReports && dbReports.length > 0) {
      reports = dbReports.map((r) => ({
        id: r.id,
        taskSlug: r.taskSlug,
        stateCode: r.stateCode,
        reporterEmail: r.reporterEmail,
        issueType: r.issueType,
        description: r.description,
        proposedCorrection: r.proposedCorrection,
        status: (r.status as ReportStatus) || "NEW",
        resolvedBy: r.resolvedBy,
        resolvedAt: r.resolvedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Fallback to filesystem
  }

  if (reports.length === 0) {
    reports = readDiskReports();
  }

  // Apply filters
  if (filters?.taskSlug && filters.taskSlug !== "all") {
    reports = reports.filter((r) => r.taskSlug === filters.taskSlug);
  }

  if (filters?.status && filters.status !== "all") {
    reports = reports.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    reports = reports.filter(
      (r) =>
        r.description.toLowerCase().includes(q) ||
        r.proposedCorrection?.toLowerCase().includes(q) ||
        r.reporterEmail?.toLowerCase().includes(q) ||
        r.taskSlug?.toLowerCase().includes(q)
    );
  }

  return reports;
}

/**
 * Retrieves a single report by ID
 */
export async function getErrorReportById(id: string): Promise<ErrorReportItem | null> {
  const all = readDiskReports();
  const match = all.find((r) => r.id === id);
  if (match) return match;

  try {
    const dbReport = await db.errorReport.findUnique({ where: { id } });
    if (dbReport) {
      return {
        id: dbReport.id,
        taskSlug: dbReport.taskSlug,
        stateCode: dbReport.stateCode,
        reporterEmail: dbReport.reporterEmail,
        issueType: dbReport.issueType,
        description: dbReport.description,
        proposedCorrection: dbReport.proposedCorrection,
        status: (dbReport.status as ReportStatus) || "NEW",
        resolvedBy: dbReport.resolvedBy,
        resolvedAt: dbReport.resolvedAt?.toISOString() || null,
        createdAt: dbReport.createdAt.toISOString(),
        updatedAt: dbReport.updatedAt.toISOString(),
      };
    }
  } catch {
    // DB offline fallback
  }

  return null;
}

/**
 * Updates a report's status and records an audit log event
 */
export async function updateErrorReportStatus(
  id: string,
  update: {
    status: ReportStatus;
    adminNotes?: string | null;
    resolvedBy?: string;
  }
): Promise<ErrorReportItem> {
  const disk = readDiskReports();
  const idx = disk.findIndex((r) => r.id === id);

  const now = new Date().toISOString();
  let updatedItem: ErrorReportItem;

  if (idx !== -1) {
    const existing = disk[idx]!;
    updatedItem = {
      ...existing,
      status: update.status,
      adminNotes: update.adminNotes !== undefined ? update.adminNotes : existing.adminNotes,
      resolvedBy: update.resolvedBy || existing.resolvedBy || "Civic Admin",
      resolvedAt: update.status === "FIXED" || update.status === "NOT_AN_ISSUE" ? now : null,
      updatedAt: now,
    };
    disk[idx] = updatedItem;
    writeDiskReports(disk);
  } else {
    updatedItem = {
      id,
      taskSlug: null,
      stateCode: null,
      reporterEmail: null,
      issueType: "other",
      description: "Report updated",
      proposedCorrection: null,
      status: update.status,
      adminNotes: update.adminNotes || null,
      resolvedBy: update.resolvedBy || "Civic Admin",
      resolvedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    disk.push(updatedItem);
    writeDiskReports(disk);
  }

  // Update in DB if available
  try {
    await db.errorReport.update({
      where: { id },
      data: {
        status: update.status,
        resolvedBy: updatedItem.resolvedBy,
        resolvedAt: updatedItem.resolvedAt ? new Date(updatedItem.resolvedAt) : null,
      },
    });
  } catch {
    // DB offline fallback
  }

  // Record audit log
  await recordAuditLog({
    action: "RESOLVE_REPORT",
    actor: update.resolvedBy || "Civic Admin",
    targetSlug: updatedItem.taskSlug,
    targetType: "error_report",
    details: {
      reportId: id,
      newStatus: update.status,
      issueType: updatedItem.issueType,
      adminNotes: update.adminNotes,
    },
  });

  return updatedItem;
}

/**
 * Counts open reports (status is NEW or NEED_TO_VERIFY)
 */
export async function countOpenErrorReports(): Promise<number> {
  try {
    const dbCount = await db.errorReport.count({
      where: { status: { in: ["NEW", "NEED_TO_VERIFY"] } },
    });
    if (dbCount > 0) return dbCount;
  } catch {
    // DB offline fallback
  }

  const reports = readDiskReports();
  return reports.filter((r) => r.status === "NEW" || r.status === "NEED_TO_VERIFY").length;
}

/**
 * Generates an email response template and mailto link for replying to the citizen reporter
 */
export function prepareEmailReply(
  report: ErrorReportItem,
  customNote?: string
): {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
} {
  const to = report.reporterEmail || "";
  const guideName = report.taskSlug
    ? report.taskSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Civic Paperwork Guide";

  const subject = `Update on your feedback: ${guideName}`;

  let statusText = "investigating your feedback";
  if (report.status === "FIXED") {
    statusText = "resolved the issue you reported and updated the official guide";
  } else if (report.status === "NOT_AN_ISSUE") {
    statusText = "reviewed the official regulations regarding your submission";
  } else if (report.status === "NEED_TO_VERIFY") {
    statusText = "currently cross-verifying your report against the state portal";
  }

  const body = `Dear Citizen,

Thank you for reporting an issue regarding the "${guideName}" on India Paperwork Guide.

We have ${statusText}.

${customNote ? `Editorial Note: ${customNote}\n\n` : ""}Report Details:
- Issue Type: ${report.issueType}
- Description: ${report.description}
${report.proposedCorrection ? `- Proposed Correction: ${report.proposedCorrection}\n` : ""}
Your contribution helps ensure that all citizens have access to 100% verified government paperwork guidance.

Sincerely,
Civic Paperwork Editorial Team
India Paperwork Guide (https://india.gov.in)`;

  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { to, subject, body, mailtoUrl };
}
