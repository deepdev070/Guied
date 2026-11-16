import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  TaskContentSchema,
  TaskVariantSchema,
  FeeSchema,
  DocumentRequirementSchema,
} from "@civic/types";
import { getFreshnessInfo, isFresh, evaluate } from "@civic/utils";

describe("Prompt 116: Monorepo Setup (Turborepo + npm Workspaces)", () => {
  const rootPkgPath = path.join(process.cwd(), "package.json");
  const turboPath = path.join(process.cwd(), "turbo.json");
  const typesPkgPath = path.join(process.cwd(), "packages", "types", "package.json");
  const utilsPkgPath = path.join(process.cwd(), "packages", "utils", "package.json");
  const mobilePkgPath = path.join(process.cwd(), "apps", "mobile", "package.json");
  const mobileAppJsonPath = path.join(process.cwd(), "apps", "mobile", "app.json");
  const webPkgPath = path.join(process.cwd(), "apps", "web", "package.json");
  const docPath = path.join(process.cwd(), "docs", "monorepo.md");

  test("1. Root package.json configures npm workspaces and packageManager", () => {
    assert.ok(fs.existsSync(rootPkgPath), "Root package.json must exist");
    const pkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"));
    assert.ok(Array.isArray(pkg.workspaces), "workspaces must be configured as an array");
    assert.ok(pkg.workspaces.includes("apps/*"), "workspaces must include apps/*");
    assert.ok(pkg.workspaces.includes("packages/*"), "workspaces must include packages/*");
    assert.ok(pkg.packageManager, "packageManager must be declared for Turborepo");
  });

  test("2. turbo.json is present and defines task pipeline", () => {
    assert.ok(fs.existsSync(turboPath), "turbo.json must exist");
    const turbo = JSON.parse(fs.readFileSync(turboPath, "utf-8"));
    assert.ok(turbo.tasks, "turbo.json must define tasks");
    assert.ok(turbo.tasks.build, "build task must be configured");
    assert.ok(turbo.tasks.typecheck, "typecheck task must be configured");
  });

  test("3. @civic/types package exists and exports core schemas and types", () => {
    assert.ok(fs.existsSync(typesPkgPath), "packages/types/package.json must exist");
    const pkg = JSON.parse(fs.readFileSync(typesPkgPath, "utf-8"));
    assert.equal(pkg.name, "@civic/types");

    // Verify imported schemas from packages/types
    assert.ok(TaskContentSchema, "TaskContentSchema must be exported");
    assert.ok(TaskVariantSchema, "TaskVariantSchema must be exported");
    assert.ok(FeeSchema, "FeeSchema must be exported");
    assert.ok(DocumentRequirementSchema, "DocumentRequirementSchema must be exported");
  });

  test("4. @civic/utils package exists and exports freshness and rule evaluator", () => {
    assert.ok(fs.existsSync(utilsPkgPath), "packages/utils/package.json must exist");
    const pkg = JSON.parse(fs.readFileSync(utilsPkgPath, "utf-8"));
    assert.equal(pkg.name, "@civic/utils");

    // Verify imported functions from packages/utils
    assert.ok(typeof getFreshnessInfo === "function", "getFreshnessInfo must be exported");
    assert.ok(typeof isFresh === "function", "isFresh must be exported");
    assert.ok(typeof evaluate === "function", "evaluate must be exported");

    // Test freshness logic
    const freshResult = getFreshnessInfo(new Date().toISOString());
    assert.equal(freshResult.status, "fresh");

    // Test rule evaluator logic
    assert.equal(evaluate({ age: { gte: 18 } }, { age: 20 }), true);
    assert.equal(evaluate({ age: { gte: 18 } }, { age: 16 }), false);
  });

  test("5. apps/mobile exists with light-only UI Expo config", () => {
    assert.ok(fs.existsSync(mobilePkgPath), "apps/mobile/package.json must exist");
    assert.ok(fs.existsSync(mobileAppJsonPath), "apps/mobile/app.json must exist");

    const appJson = JSON.parse(fs.readFileSync(mobileAppJsonPath, "utf-8"));
    assert.equal(appJson.expo.userInterfaceStyle, "light", "Mobile app must enforce light-only UI");
  });

  test("6. apps/web exists and declares dependencies on shared packages", () => {
    assert.ok(fs.existsSync(webPkgPath), "apps/web/package.json must exist");
    const webPkg = JSON.parse(fs.readFileSync(webPkgPath, "utf-8"));
    assert.equal(webPkg.name, "@civic/web");
    assert.ok(webPkg.dependencies["@civic/types"], "web must depend on @civic/types");
    assert.ok(webPkg.dependencies["@civic/utils"], "web must depend on @civic/utils");
  });

  test("7. Website backward compatibility re-exports shared code", () => {
    const contentTypesPath = path.join(process.cwd(), "src", "types", "content.ts");
    const freshnessPath = path.join(process.cwd(), "src", "lib", "freshness.ts");
    const ruleEvalPath = path.join(process.cwd(), "src", "lib", "rule-evaluator.ts");

    const contentTypesCode = fs.readFileSync(contentTypesPath, "utf-8");
    assert.match(
      contentTypesCode,
      /@civic\/types/,
      "src/types/content.ts must re-export from @civic/types"
    );

    const freshnessCode = fs.readFileSync(freshnessPath, "utf-8");
    assert.match(
      freshnessCode,
      /@civic\/utils/,
      "src/lib/freshness.ts must re-export from @civic/utils"
    );

    const ruleEvalCode = fs.readFileSync(ruleEvalPath, "utf-8");
    assert.match(
      ruleEvalCode,
      /@civic\/utils/,
      "src/lib/rule-evaluator.ts must re-export from @civic/utils"
    );
  });

  test("8. Monorepo documentation explains layout and architecture", () => {
    assert.ok(fs.existsSync(docPath), "docs/monorepo.md must exist");
    const doc = fs.readFileSync(docPath, "utf-8");
    assert.match(doc, /Turborepo/i);
    assert.match(doc, /npm workspaces/i);
    assert.match(doc, /apps\/web/);
    assert.match(doc, /apps\/mobile/);
    assert.match(doc, /packages\/types/);
    assert.match(doc, /packages\/utils/);
  });
});
