/**
 * Secondary Content JSON Backup Script (Prompt 138)
 * Exports all civic task guides, categories, states, and revision histories
 * into a human-readable, database-independent JSON backup archive with SHA256 integrity hash.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { exportGuidesAsJson } from "../src/lib/admin/import-export.ts";
import { CATEGORIES_SEED_DATA } from "../prisma/data/categories.ts";
import { STATES_SEED_DATA } from "../prisma/data/states.ts";
import { GLOSSARY_TERMS } from "../src/data/glossary.ts";

export interface FullContentBackup {
  version: number;
  timestamp: string;
  checksum: string;
  metadata: {
    totalGuides: number;
    totalCategories: number;
    totalStates: number;
    totalGlossaryTerms: number;
  };
  data: {
    guides: unknown[];
    categories: typeof CATEGORIES_SEED_DATA;
    states: typeof STATES_SEED_DATA;
    glossary: typeof GLOSSARY_TERMS;
  };
}

export function generateContentBackup(): {
  backup: FullContentBackup;
  filePath: string;
  checksumPath: string;
} {
  const rootDir = process.cwd();
  const backupDir = path.join(rootDir, "backups", "content");
  fs.mkdirSync(backupDir, { recursive: true });

  const rawGuidesJson = exportGuidesAsJson();
  const guidesBundle = JSON.parse(rawGuidesJson);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `content_backup_${timestamp}.json`;
  const checksumFileName = `content_backup_${timestamp}.sha256`;

  const backupPayload = {
    version: 1,
    timestamp: new Date().toISOString(),
    metadata: {
      totalGuides: guidesBundle.totalGuides,
      totalCategories: CATEGORIES_SEED_DATA.length,
      totalStates: STATES_SEED_DATA.length,
      totalGlossaryTerms: GLOSSARY_TERMS.length,
    },
    data: {
      guides: guidesBundle.guides,
      categories: CATEGORIES_SEED_DATA,
      states: STATES_SEED_DATA,
      glossary: GLOSSARY_TERMS,
    },
  };

  const payloadString = JSON.stringify(backupPayload, null, 2);
  const hash = crypto.createHash("sha256").update(payloadString).digest("hex");

  const fullBackup: FullContentBackup = {
    ...backupPayload,
    checksum: hash,
  };

  const finalString = JSON.stringify(fullBackup, null, 2);
  const filePath = path.join(backupDir, fileName);
  const checksumPath = path.join(backupDir, checksumFileName);

  fs.writeFileSync(filePath, finalString, "utf-8");
  fs.writeFileSync(checksumPath, `${hash}  ${fileName}\n`, "utf-8");

  return { backup: fullBackup, filePath, checksumPath };
}

// Execute when invoked directly from CLI
if (process.argv[1]?.endsWith("backup-content-json.ts")) {
  console.log("📦 Starting Secondary Content JSON Backup...");
  const result = generateContentBackup();
  console.log(`✅ Backup created successfully at: ${result.filePath}`);
  console.log(`🔒 SHA256: ${result.backup.checksum}`);
  console.log(
    `📊 Metrics: ${result.backup.metadata.totalGuides} guides, ${result.backup.metadata.totalCategories} categories, ${result.backup.metadata.totalGlossaryTerms} glossary terms`
  );
}
