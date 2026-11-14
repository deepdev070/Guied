import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getAllTaskStatePairs, loadAllTaskFiles } from "../src/lib/queries.ts";
import { parseRevalidatePayload, validateRevalidateToken } from "../src/lib/revalidate.ts";

describe("Prompt 76: Static Generation & On-Demand ISR", () => {
  const SECRET = "paperwork-revalidate-secret-token-2026";

  describe("Token Authentication & Security", () => {
    it("accepts valid token matching configured secret", () => {
      assert.equal(validateRevalidateToken(SECRET, SECRET), true);
    });

    it("accepts valid Authorization Bearer header format", () => {
      assert.equal(validateRevalidateToken(`Bearer ${SECRET}`, SECRET), true);
      assert.equal(validateRevalidateToken(`bearer ${SECRET} `, SECRET), true);
    });

    it("rejects invalid, truncated or incorrect tokens", () => {
      assert.equal(validateRevalidateToken("wrong-token", SECRET), false);
      assert.equal(validateRevalidateToken("", SECRET), false);
      assert.equal(validateRevalidateToken(null, SECRET), false);
      assert.equal(validateRevalidateToken(undefined, SECRET), false);
    });

    it("rejects token when server secret is unconfigured or empty", () => {
      assert.equal(validateRevalidateToken(SECRET, ""), false);
    });
  });

  describe("Revalidation Payload Validation", () => {
    it("accepts valid path with leading slash", () => {
      const res = parseRevalidatePayload({ path: "/passport-renewal" });
      assert.equal(res.valid, true);
      assert.equal(res.path, "/passport-renewal");
      assert.equal(res.tag, undefined);
    });

    it("accepts valid state-specific path with leading slash", () => {
      const res = parseRevalidatePayload({ path: "/driving-licence-learner/gujarat" });
      assert.equal(res.valid, true);
      assert.equal(res.path, "/driving-licence-learner/gujarat");
    });

    it("accepts valid cache tag", () => {
      const res = parseRevalidatePayload({ tag: "task-passport-renewal" });
      assert.equal(res.valid, true);
      assert.equal(res.tag, "task-passport-renewal");
      assert.equal(res.path, undefined);
    });

    it("accepts both path and tag together", () => {
      const res = parseRevalidatePayload({
        path: "/passport-renewal",
        tag: "passport",
      });
      assert.equal(res.valid, true);
      assert.equal(res.path, "/passport-renewal");
      assert.equal(res.tag, "passport");
    });

    it("rejects path without leading slash", () => {
      const res = parseRevalidatePayload({ path: "passport-renewal" });
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes("leading forward slash"));
    });

    it("rejects empty payload when neither path nor tag is provided", () => {
      const res = parseRevalidatePayload({});
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes("At least one of 'path' or 'tag'"));
    });
  });

  describe("Static Generation & ISR 86,400s Configuration", () => {
    it("verifies revalidate = 86400 (24h) is exported in [task]/page.tsx", () => {
      const filePath = path.join(process.cwd(), "src/app/[task]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("export const revalidate = 86400;"),
        "Task page must export revalidate = 86400"
      );
    });

    it("verifies revalidate = 86400 (24h) is exported in [task]/[state]/page.tsx", () => {
      const filePath = path.join(process.cwd(), "src/app/[task]/[state]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("export const revalidate = 86400;"),
        "Task+State page must export revalidate = 86400"
      );
    });

    it("verifies generateStaticParams in [task]/page.tsx covers published tasks", () => {
      const filePath = path.join(process.cwd(), "src/app/[task]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("export async function generateStaticParams"),
        "Task page must export generateStaticParams"
      );

      const allTasks = loadAllTaskFiles();
      const taskSlugs = allTasks.map((t) => t.slug);
      assert.ok(taskSlugs.includes("passport-renewal"));
      assert.ok(taskSlugs.includes("driving-licence-learner"));
      assert.ok(taskSlugs.includes("driving-licence-new"));
    });

    it("verifies generateStaticParams in [task]/[state]/page.tsx covers all 36 states", async () => {
      const filePath = path.join(process.cwd(), "src/app/[task]/[state]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(
        content.includes("export async function generateStaticParams"),
        "Task+State page must export generateStaticParams"
      );

      const pairs = await getAllTaskStatePairs();
      assert.equal(
        pairs.length,
        108,
        "Should generate 108 static paths (3 tasks * 36 Indian states/UTs)"
      );

      const gujaratLearner = pairs.find(
        (p) => p.task === "driving-licence-learner" && p.state === "gujarat"
      );
      assert.ok(gujaratLearner, "Must generate static path for Gujarat DL Learner");

      const maharashtraPassport = pairs.find(
        (p) => p.task === "passport-renewal" && p.state === "maharashtra"
      );
      assert.ok(maharashtraPassport, "Must generate static path for Maharashtra Passport");
    });

    it("verifies /api/revalidate route handler exists with GET and POST handlers", () => {
      const routePath = path.join(process.cwd(), "src/app/api/revalidate/route.ts");
      assert.ok(fs.existsSync(routePath), "Route file src/app/api/revalidate/route.ts must exist");
      const content = fs.readFileSync(routePath, "utf-8");
      assert.ok(content.includes("export async function POST"));
      assert.ok(content.includes("export async function GET"));
      assert.ok(content.includes("revalidatePath"));
      assert.ok(content.includes("revalidateTag"));
    });
  });
});
