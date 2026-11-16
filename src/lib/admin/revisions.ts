import fs from "node:fs";
import path from "node:path";
import { db } from "../db.ts";
import type { TaskContent } from "../../types/content.ts";
import { saveTaskContent } from "./task-storage.ts";

export interface StoredRevision {
  id: string;
  slug: string;
  revisionNumber: number;
  author: string;
  summaryOfChanges: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  payload: TaskContent;
}

const REVISIONS_DIR = path.join(process.cwd(), ".revisions");

function getRevisionsFolder(slug: string): string {
  const folder = path.join(REVISIONS_DIR, slug);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
}

/**
 * Creates and records a new revision snapshot on disk and in database
 */
export async function recordRevision(
  slug: string,
  task: TaskContent,
  author = "Admin",
  summaryOfChanges = "Updated guide content"
): Promise<StoredRevision> {
  const folder = getRevisionsFolder(slug);
  const existing = await listRevisions(slug);
  const revisionNumber = existing.length + 1;
  const timestamp = new Date().toISOString();
  const id = `rev_${slug}_${revisionNumber}_${Date.now()}`;

  const revision: StoredRevision = {
    id,
    slug,
    revisionNumber,
    author,
    summaryOfChanges,
    status: task.national?.status || "DRAFT",
    createdAt: timestamp,
    payload: task,
  };

  // 1. Write filesystem snapshot
  const filePath = path.join(folder, `${revisionNumber.toString().padStart(4, "0")}_${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(revision, null, 2), "utf-8");

  // 2. Attempt database record if available
  try {
    const dbVariant = await db.taskVariant.findFirst({
      where: { task: { slug }, stateId: null },
    });
    if (dbVariant) {
      await db.contentRevision.create({
        data: {
          variantId: dbVariant.id,
          revisionNumber,
          author,
          summaryOfChanges,
          payload: task as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      });
    }
  } catch {
    // Database offline fallback - filesystem record is durable
  }

  return revision;
}

/**
 * Returns a list of all revisions for a guide, sorted newest first
 */
export async function listRevisions(slug: string): Promise<Omit<StoredRevision, "payload">[]> {
  const folder = path.join(REVISIONS_DIR, slug);
  if (!fs.existsSync(folder)) {
    return [];
  }

  try {
    const files = fs.readdirSync(folder).filter((f) => f.endsWith(".json"));
    const summaries: Omit<StoredRevision, "payload">[] = [];

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(folder, file), "utf-8");
        const parsed = JSON.parse(raw) as StoredRevision;
        summaries.push({
          id: parsed.id,
          slug: parsed.slug,
          revisionNumber: parsed.revisionNumber,
          author: parsed.author,
          summaryOfChanges: parsed.summaryOfChanges,
          status: parsed.status,
          createdAt: parsed.createdAt,
        });
      } catch {
        // Skip malformed revision file
      }
    }

    return summaries.sort((a, b) => b.revisionNumber - a.revisionNumber);
  } catch {
    return [];
  }
}

/**
 * Retrieves a specific revision including full JSON payload
 */
export async function getRevisionById(
  slug: string,
  revisionId: string
): Promise<StoredRevision | null> {
  const folder = path.join(REVISIONS_DIR, slug);
  if (!fs.existsSync(folder)) return null;

  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    if (file.includes(revisionId)) {
      try {
        const raw = fs.readFileSync(path.join(folder, file), "utf-8");
        return JSON.parse(raw) as StoredRevision;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Restores a past revision as the active version of a guide
 */
export async function restoreRevision(
  slug: string,
  revisionId: string,
  author = "Admin",
  options?: { skipDiskWrite?: boolean }
): Promise<{ success: boolean; restoredRevision?: StoredRevision; error?: string }> {
  const revision = await getRevisionById(slug, revisionId);
  if (!revision) {
    return { success: false, error: `Revision ${revisionId} not found` };
  }

  // Save the payload as active content (this automatically records the new restore revision snapshot)
  const saveResult = await saveTaskContent(
    revision.payload,
    author,
    `Restored from revision #${revision.revisionNumber}`,
    options
  );

  if (!saveResult.success) {
    return { success: false, error: "Failed to save restored content to disk" };
  }

  const revisions = await listRevisions(slug);
  const latestRev = revisions[0] ? await getRevisionById(slug, revisions[0].id) : null;

  return { success: true, restoredRevision: latestRev || revision };
}
