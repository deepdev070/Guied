import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Prompt 136: Vercel Deployment & Build Automation", () => {
  describe("1. Vercel Configuration (vercel.json)", () => {
    const vercelConfigPath = path.join(rootDir, "vercel.json");

    it("ensures vercel.json exists and is valid JSON", () => {
      assert.ok(fs.existsSync(vercelConfigPath), "vercel.json must exist in root");
      const raw = fs.readFileSync(vercelConfigPath, "utf-8");
      assert.doesNotThrow(() => JSON.parse(raw), "vercel.json must be valid JSON");
    });

    it("configures Next.js framework and vercel build command", () => {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, "utf-8"));
      assert.strictEqual(config.framework, "nextjs");
      assert.strictEqual(config.buildCommand, "npm run vercel-build");
      assert.ok(
        config.installCommand?.includes("--legacy-peer-deps"),
        "installCommand must include --legacy-peer-deps for dependency compatibility"
      );
      assert.strictEqual(config.trailingSlash, false);
    });
  });

  describe("2. Monorepo Build Scripts (package.json)", () => {
    const packageJsonPath = path.join(rootDir, "package.json");

    it("includes vercel-build script chaining prisma generate, migrate deploy and turbo build", () => {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const vercelBuild = pkg.scripts?.["vercel-build"];
      assert.ok(vercelBuild, "package.json must define vercel-build script");
      assert.ok(vercelBuild.includes("prisma generate"), "Must run prisma generate");
      assert.ok(
        vercelBuild.includes("prisma migrate deploy"),
        "Must run prisma migrate deploy on build"
      );
      assert.ok(vercelBuild.includes("turbo run build"), "Must execute turbo run build");
    });

    it("includes standalone db:deploy script for production migrations", () => {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      assert.strictEqual(pkg.scripts?.["db:deploy"], "prisma migrate deploy");
      assert.strictEqual(pkg.scripts?.["postinstall"], "prisma generate");
    });
  });

  describe("3. Deployment Documentation (docs/deployment-vercel.md)", () => {
    const docPath = path.join(rootDir, "docs", "deployment-vercel.md");

    it("ensures docs/deployment-vercel.md exists with all required sections", () => {
      assert.ok(fs.existsSync(docPath), "docs/deployment-vercel.md must exist");
      const content = fs.readFileSync(docPath, "utf-8");

      // Verify essential sections
      assert.ok(content.includes("DATABASE_URL"), "Missing DATABASE_URL documentation");
      assert.ok(content.includes("DIRECT_URL"), "Missing DIRECT_URL documentation");
      assert.ok(
        content.includes("ADMIN_SESSION_SECRET"),
        "Missing ADMIN_SESSION_SECRET documentation"
      );
      assert.ok(
        content.includes("prisma migrate deploy"),
        "Missing prisma migrate deploy documentation"
      );
      assert.ok(content.includes("indiapaperwork.in"), "Missing domain reference");
      assert.ok(content.includes("Preview Deployments"), "Missing Preview Deployments section");
      assert.ok(content.includes("/health"), "Missing health check verification");
    });
  });
});
