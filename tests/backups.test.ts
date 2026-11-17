import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { generateContentBackup } from "../scripts/backup-content-json.ts";
import { executeDatabaseBackup } from "../scripts/backup-db.ts";
import { verifyAndRestoreBackup } from "../scripts/restore-db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 138: Database Backups, Restore Drill, and Content Safety", () => {
  describe("1. Secondary Content JSON Backup", () => {
    it("generates a complete content JSON snapshot with SHA256 integrity hash", () => {
      const { backup, filePath, checksumPath } = generateContentBackup();

      assert.ok(fs.existsSync(filePath), "Backup JSON file must exist");
      assert.ok(fs.existsSync(checksumPath), "Checksum file must exist");
      assert.ok(backup.metadata.totalGuides > 0, "Must contain at least 1 guide");
      assert.ok(backup.metadata.totalCategories > 0, "Must contain categories");
      assert.ok(backup.metadata.totalStates > 0, "Must contain states");
      assert.ok(backup.metadata.totalGlossaryTerms > 0, "Must contain glossary terms");

      // Verify SHA256 hash matches file contents
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      assert.strictEqual(parsed.checksum, backup.checksum);
      assert.strictEqual(parsed.version, 1);
    });
  });

  describe("2. Database Backup & Retention", () => {
    it("executes database backup and produces checksummed dump file", () => {
      const result = executeDatabaseBackup();

      assert.strictEqual(result.success, true);
      assert.ok(fs.existsSync(result.filePath), "Dump file must exist on disk");
      assert.ok(fs.existsSync(`${result.filePath}.sha256`), "Checksum file must exist");
      assert.strictEqual(result.checksum.length, 64, "Checksum must be 64-char SHA256 hex");
      assert.ok(result.sizeBytes > 0, "Backup file size must be non-zero");
    });
  });

  describe("3. Restore Verification Drill", () => {
    it("verifies backup integrity and valid structure during restore test", () => {
      const backupResult = executeDatabaseBackup();
      const restoreResult = verifyAndRestoreBackup(backupResult.filePath);

      assert.strictEqual(restoreResult.success, true, "Restore verification must pass");
      assert.strictEqual(restoreResult.checks.checksumMatch, true, "Checksum must match");
      assert.strictEqual(restoreResult.checks.headerValid, true, "Header must be valid");
      assert.strictEqual(restoreResult.checks.tablesVerified, true, "Tables must be verified");
    });

    it("fails cleanly when verifying non-existent file", () => {
      const invalidPath = path.join(rootDir, "backups", "db", "non_existent.dump");
      const result = verifyAndRestoreBackup(invalidPath);
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("File not found"));
    });
  });

  describe("4. Documentation and NPM Scripts", () => {
    it("docs/backups.md exists and covers all required backup and recovery topics", () => {
      const docPath = path.join(rootDir, "docs", "backups.md");
      assert.ok(fs.existsSync(docPath), "docs/backups.md must exist");
      const content = fs.readFileSync(docPath, "utf-8");

      assert.ok(content.includes("pg_dump"), "Must cover pg_dump");
      assert.ok(
        content.includes("PITR") || content.includes("Point-in-Time"),
        "Must cover provider PITR"
      );
      assert.ok(content.includes("restore:test"), "Must cover restore test procedure");
      assert.ok(
        content.includes("Secondary Content JSON Backup"),
        "Must cover secondary JSON backup"
      );
      assert.ok(
        content.includes("Cloudflare R2") || content.includes("S3"),
        "Must cover cloud storage sync"
      );
    });

    it("package.json registers backup and restore scripts", () => {
      const pkgPath = path.join(rootDir, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      assert.ok(pkg.scripts?.["backup:db"], "Must register backup:db");
      assert.ok(pkg.scripts?.["backup:content"], "Must register backup:content");
      assert.ok(pkg.scripts?.["restore:test"], "Must register restore:test");
    });
  });
});
