import fs from "node:fs";
import path from "node:path";
import { CATEGORIES_SEED_DATA } from "../../../prisma/data/categories.ts";
import { STATES_SEED_DATA } from "../../../prisma/data/states.ts";
import { TaskContentSchema, type TaskContent } from "../../types/content.ts";
import { loadAllTaskFiles } from "../queries.ts";
import { saveTaskContent } from "./task-storage.ts";
import { recordAuditLog } from "./audit.ts";

export interface DryRunItem {
  slug: string;
  name: string;
  categorySlug: string;
  action: "create" | "update" | "reject";
  status: "PUBLISHED" | "DRAFT" | "REVIEW" | "ARCHIVED";
  errors: string[];
  warnings: string[];
  guide?: TaskContent;
}

export interface DryRunResult {
  total: number;
  toCreate: number;
  toUpdate: number;
  rejected: number;
  items: DryRunItem[];
}

export interface ExportBundle {
  version: number;
  exportedAt: string;
  totalGuides: number;
  guides: TaskContent[];
}

export interface ImportExecutionResult {
  success: boolean;
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  rejectedCount: number;
  errors: string[];
}

/* =========================================================================
   CSV UTILITIES (RFC 4180 COMPLIANT)
   ========================================================================= */

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function parseCsvRows(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = "";
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentToken);
      currentToken = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n
      }
      currentRow.push(currentToken);
      currentToken = "";
      if (currentRow.length > 0 && currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken);
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/* =========================================================================
   EXPORT LOGIC
   ========================================================================= */

export function exportGuidesAsJson(): string {
  const guides = loadAllTaskFiles();
  const bundle: ExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    totalGuides: guides.length,
    guides,
  };
  return JSON.stringify(bundle, null, 2);
}

export function exportGuidesAsCsv(): string {
  const guides = loadAllTaskFiles();
  const headers = [
    "slug",
    "name",
    "categorySlug",
    "description",
    "status",
    "nationalTitle",
    "nationalSummary",
    "nationalEstimatedTime",
    "nationalFeeSummary",
    "nationalSourceUrl",
    "nationalLastVerifiedAt",
    "nationalVerifiedBy",
    "documentsCount",
    "stepsCount",
    "feesCount",
    "faqsCount",
    "mistakesCount",
    "stateVariants",
    "contentJson",
  ];

  const lines = [headers.join(",")];

  for (const g of guides) {
    const nat = g.national || ({} as Partial<TaskContent["national"]>);
    const stateCodes = Object.keys(g.states || {}).join(";");
    const feeSum = (nat.fees || []).map((f) => `${f.label}: ₹${f.amount}`).join("; ");

    const row = [
      escapeCsvField(g.slug),
      escapeCsvField(g.name),
      escapeCsvField(g.categorySlug),
      escapeCsvField(g.description || ""),
      escapeCsvField(nat.status || "DRAFT"),
      escapeCsvField(nat.title || ""),
      escapeCsvField(nat.summary || ""),
      escapeCsvField(nat.estimatedTime || ""),
      escapeCsvField(feeSum),
      escapeCsvField(nat.sourceUrl || ""),
      escapeCsvField(nat.lastVerifiedAt || ""),
      escapeCsvField(nat.verifiedBy || ""),
      escapeCsvField(nat.documentRequirements?.length || 0),
      escapeCsvField(nat.steps?.length || 0),
      escapeCsvField(nat.fees?.length || 0),
      escapeCsvField(nat.faqItems?.length || 0),
      escapeCsvField(nat.rejectionReasons?.length || 0),
      escapeCsvField(stateCodes),
      escapeCsvField(JSON.stringify(g)),
    ];

    lines.push(row.join(","));
  }

  return lines.join("\n");
}

/* =========================================================================
   PARSE INPUT HELPERS
   ========================================================================= */

export function parseGuidesFromJson(jsonString: string): unknown[] {
  const parsed = JSON.parse(jsonString);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === "object") {
    if (Array.isArray((parsed as { guides?: unknown[] }).guides)) {
      return (parsed as { guides: unknown[] }).guides;
    }
    // Single guide object
    if ("slug" in parsed) {
      return [parsed];
    }
  }
  throw new Error(
    "Invalid JSON structure. Expected an array of guides or an object containing a 'guides' array."
  );
}

export function parseGuidesFromCsv(csvString: string): unknown[] {
  const rows = parseCsvRows(csvString);
  if (rows.length < 2) {
    return [];
  }

  const rawHeaders = rows[0]!;
  const headerIndices = new Map<string, number>();
  rawHeaders.forEach((h, idx) => headerIndices.set(h.trim().toLowerCase(), idx));

  const contentJsonIdx = headerIndices.get("contentjson");
  const slugIdx = headerIndices.get("slug");
  const nameIdx = headerIndices.get("name");
  const catIdx = headerIndices.get("categoryslug");
  const descIdx = headerIndices.get("description");
  const titleIdx = headerIndices.get("nationaltitle");
  const summaryIdx = headerIndices.get("nationalsummary");
  const sourceIdx = headerIndices.get("nationalsourceurl");
  const verifiedIdx = headerIndices.get("nationallastverifiedat");
  const statusIdx = headerIndices.get("status");

  const results: unknown[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!;

    // 1. If full contentJson is provided in CSV, use that
    if (contentJsonIdx !== undefined && row[contentJsonIdx]?.trim()) {
      try {
        const parsed = JSON.parse(row[contentJsonIdx]!.trim());
        results.push(parsed);
        continue;
      } catch {
        // Fall back to columnar parsing if contentJson fails to parse
      }
    }

    // 2. Columnar reconstruction
    const slug = slugIdx !== undefined ? row[slugIdx]?.trim() : undefined;
    const name = nameIdx !== undefined ? row[nameIdx]?.trim() : undefined;
    const categorySlug = catIdx !== undefined ? row[catIdx]?.trim() : undefined;
    const description = descIdx !== undefined ? row[descIdx]?.trim() : undefined;
    const nationalTitle = titleIdx !== undefined ? row[titleIdx]?.trim() : name;
    const summary =
      summaryIdx !== undefined
        ? row[summaryIdx]?.trim()
        : "Complete step-by-step instructions and verified document checklist for applicants.";
    const sourceUrl = sourceIdx !== undefined ? row[sourceIdx]?.trim() : undefined;
    const lastVerified =
      verifiedIdx !== undefined && row[verifiedIdx]?.trim()
        ? row[verifiedIdx]?.trim()
        : new Date().toISOString();
    const status = statusIdx !== undefined ? row[statusIdx]?.trim() : "DRAFT";

    if (!slug) continue;

    results.push({
      slug,
      name: name || slug,
      categorySlug: categorySlug || "identity",
      description: description || name || slug,
      national: {
        title: nationalTitle || name || slug,
        summary:
          summary || "Complete official application guidance and verified paperwork checklist.",
        estimatedTime: "15-30 days",
        difficulty: "medium",
        sourceUrl: sourceUrl || "https://india.gov.in",
        lastVerifiedAt: lastVerified,
        verifiedBy: "Civic Editorial Team",
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        documentRequirements: [
          {
            id: "doc-id-proof",
            name: "Identity Proof",
            description: "Aadhaar Card, Voter ID, or Passport",
            requirementType: "required",
            displayOrder: 1,
          },
          {
            id: "doc-addr-proof",
            name: "Address Proof",
            description: "Electricity bill, ration card, or domicile certificate",
            requirementType: "required",
            displayOrder: 2,
          },
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Visit official portal and fill application",
            description:
              "Navigate to the official government portal and complete all required application details accurately.",
            where: "Official Portal",
            estimatedTime: "20 minutes",
            status: "PUBLISHED",
          },
        ],
        fees: [
          {
            label: "Statutory Application Fee",
            amount: 50,
            currency: "INR",
            paymentMode: "online",
          },
        ],
        faqs: [],
        rejectionReasons: [],
        officialLinks: [
          {
            label: "Official Government Portal",
            url: sourceUrl || "https://india.gov.in",
            isGovDomain: true,
          },
        ],
      },
      states: {},
    });
  }

  return results;
}

/* =========================================================================
   DRY-RUN VALIDATION (SAME VALIDATORS AS SEED SCRIPT)
   ========================================================================= */

export function dryRunImport(rawItems: unknown[]): DryRunResult {
  const validCategorySlugs = new Set(CATEGORIES_SEED_DATA.map((c) => c.slug));
  const validStateCodes = new Set(STATES_SEED_DATA.map((s) => s.code.toLowerCase()));
  const tasksDir = path.join(process.cwd(), "src/content/tasks");

  const items: DryRunItem[] = [];
  let toCreate = 0;
  let toUpdate = 0;
  let rejected = 0;

  for (const raw of rawItems) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Zod Schema Validation
    const validation = TaskContentSchema.safeParse(raw);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        errors.push(`[${issue.path.join(".")}] ${issue.message}`);
      }
      const fallbackSlug =
        typeof raw === "object" && raw !== null && "slug" in raw
          ? String((raw as { slug: unknown }).slug)
          : "unknown-guide";
      const fallbackName =
        typeof raw === "object" && raw !== null && "name" in raw
          ? String((raw as { name: unknown }).name)
          : fallbackSlug;
      const fallbackCat =
        typeof raw === "object" && raw !== null && "categorySlug" in raw
          ? String((raw as { categorySlug: unknown }).categorySlug)
          : "unknown";

      rejected++;
      items.push({
        slug: fallbackSlug,
        name: fallbackName,
        categorySlug: fallbackCat,
        action: "reject",
        status: "DRAFT",
        errors,
        warnings,
      });
      continue;
    }

    const task = validation.data;

    // 2. Seed Validator: Unknown Category Check
    if (!validCategorySlugs.has(task.categorySlug)) {
      errors.push(
        `Unknown categorySlug "${task.categorySlug}". Known categories: ${Array.from(
          validCategorySlugs
        ).join(", ")}`
      );
    }

    // 3. Seed Validator: State Codes Check
    if (task.states) {
      for (const stCode of Object.keys(task.states)) {
        if (!validStateCodes.has(stCode.toLowerCase())) {
          errors.push(`Unknown state code "${stCode}" in state specific overrides.`);
        }
      }
    }

    // 4. Quality & Completeness Checks
    const nat = task.national;
    if (nat.status === "PUBLISHED") {
      if ((nat.documentRequirements?.length || 0) < 5) {
        warnings.push(
          `Thin content warning: Guide has only ${nat.documentRequirements?.length || 0} document(s) (5 recommended for publishing gate).`
        );
      }
      if ((nat.steps?.length || 0) < 5) {
        warnings.push(
          `Thin content warning: Guide has only ${nat.steps?.length || 0} step(s) (5 recommended for publishing gate).`
        );
      }
      if (!nat.sourceUrl && (!nat.officialLinks || nat.officialLinks.length === 0)) {
        warnings.push("Missing official portal link for published national guide.");
      }
    }

    // 5. Existing Task Check
    const existingFilePath = path.join(tasksDir, `${task.slug}.json`);
    const exists = fs.existsSync(existingFilePath);

    if (errors.length > 0) {
      rejected++;
      items.push({
        slug: task.slug,
        name: task.name,
        categorySlug: task.categorySlug,
        action: "reject",
        status: nat.status || "DRAFT",
        errors,
        warnings,
        guide: task,
      });
    } else if (exists) {
      toUpdate++;
      items.push({
        slug: task.slug,
        name: task.name,
        categorySlug: task.categorySlug,
        action: "update",
        status: nat.status || "DRAFT",
        errors: [],
        warnings,
        guide: task,
      });
    } else {
      toCreate++;
      items.push({
        slug: task.slug,
        name: task.name,
        categorySlug: task.categorySlug,
        action: "create",
        status: nat.status || "DRAFT",
        errors: [],
        warnings,
        guide: task,
      });
    }
  }

  return {
    total: rawItems.length,
    toCreate,
    toUpdate,
    rejected,
    items,
  };
}

/* =========================================================================
   IMPORT EXECUTION
   ========================================================================= */

export async function executeImport(
  guides: TaskContent[],
  author = "Civic Admin"
): Promise<ImportExecutionResult> {
  const result: ImportExecutionResult = {
    success: true,
    totalProcessed: guides.length,
    createdCount: 0,
    updatedCount: 0,
    rejectedCount: 0,
    errors: [],
  };

  const tasksDir = path.join(process.cwd(), "src/content/tasks");

  for (const guide of guides) {
    const existing = fs.existsSync(path.join(tasksDir, `${guide.slug}.json`));
    const saveRes = await saveTaskContent(
      guide,
      author,
      `Bulk guide import (${existing ? "updated" : "created"})`
    );

    if (!saveRes.success) {
      result.rejectedCount++;
      result.errors.push(`Failed to save guide ${guide.slug}: ${saveRes.errors?.join("; ")}`);
      continue;
    }

    if (existing) {
      result.updatedCount++;
    } else {
      result.createdCount++;
    }

    // Log admin audit event
    await recordAuditLog({
      action: "IMPORT_GUIDES",
      actor: author,
      targetSlug: guide.slug,
      details: {
        action: existing ? "update" : "create",
        categorySlug: guide.categorySlug,
        nationalTitle: guide.national?.title,
      },
    });
  }

  if (result.rejectedCount > 0 && result.createdCount === 0 && result.updatedCount === 0) {
    result.success = false;
  }

  return result;
}
