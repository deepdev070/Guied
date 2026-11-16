import fs from "node:fs";
import path from "node:path";
import { db } from "../db.ts";
import { TaskContentSchema, type TaskContent } from "../../types/content.ts";

/**
 * Reads a single task JSON from src/content/tasks/<slug>.json
 */
export function getTaskContent(slug: string): TaskContent | null {
  const filePath = path.join(process.cwd(), "src/content/tasks", `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = TaskContentSchema.safeParse(json);
    if (!parsed.success) {
      console.error(`Task ${slug} failed validation:`, parsed.error.issues);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.error(`Error reading task ${slug}:`, err);
    return null;
  }
}

/**
 * Saves a task definition to disk and creates a ContentRevision record
 */
export async function saveTaskContent(
  taskData: unknown,
  author = "Civic Admin",
  summaryOfChanges = "Updated guide content via Admin Editor",
  options?: { skipDiskWrite?: boolean }
): Promise<{ success: boolean; data?: TaskContent; errors?: string[] }> {
  const parsed = TaskContentSchema.safeParse(taskData);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return { success: false, errors };
  }

  const task = parsed.data;
  const dir = path.join(process.cwd(), "src/content/tasks");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!options?.skipDiskWrite) {
    const filePath = path.join(dir, `${task.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(task, null, 2), "utf-8");
  }

  // Record revision snapshot on filesystem (.revisions/<slug>/)
  try {
    const revDir = path.join(process.cwd(), ".revisions", task.slug);
    if (!fs.existsSync(revDir)) {
      fs.mkdirSync(revDir, { recursive: true });
    }
    const revFiles = fs.readdirSync(revDir).filter((f) => f.endsWith(".json"));
    const revNum = revFiles.length + 1;
    const revId = `rev_${task.slug}_${revNum}_${Date.now()}`;
    const revData = {
      id: revId,
      slug: task.slug,
      revisionNumber: revNum,
      author,
      summaryOfChanges,
      status: task.national?.status || "DRAFT",
      createdAt: new Date().toISOString(),
      payload: task,
    };
    fs.writeFileSync(
      path.join(revDir, `${revNum.toString().padStart(4, "0")}_${revId}.json`),
      JSON.stringify(revData, null, 2),
      "utf-8"
    );
  } catch {
    // Graceful fallback if filesystem error occurs during revision write
  }

  // Attempt database revision logging
  try {
    const dbVariant = await db.taskVariant.findFirst({
      where: { task: { slug: task.slug }, stateId: null },
    });

    if (dbVariant) {
      await db.contentRevision.create({
        data: {
          variantId: dbVariant.id,
          author,
          summaryOfChanges,
          payload: task as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      });
    }
  } catch {
    // Database offline fallback - filesystem save succeeded
  }

  return { success: true, data: task };
}
