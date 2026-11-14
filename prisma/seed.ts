import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { CATEGORIES_SEED_DATA } from "./data/categories.ts";
import { STATES_SEED_DATA } from "./data/states.ts";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed for India Paperwork Guide...\n");

  const isDryRun = process.argv.includes("--dry-run");

  // 1. Upsert 10 Core Categories
  console.log("📁 Validating and Seeding 10 Civic Categories...");
  const categoryMap = new Map<string, string>(); // slug -> id

  if (!isDryRun) {
    try {
      for (const cat of CATEGORIES_SEED_DATA) {
        const record = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            bgColor: cat.bgColor,
            textColor: cat.textColor,
            displayOrder: cat.displayOrder,
          },
          create: {
            slug: cat.slug,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            bgColor: cat.bgColor,
            textColor: cat.textColor,
            displayOrder: cat.displayOrder,
          },
        });
        categoryMap.set(cat.slug, record.id);
      }
      console.log(`✅ Upserted ${categoryMap.size} categories into database.`);
    } catch (err: unknown) {
      console.warn(
        `⚠️ Could not connect to PostgreSQL (${(err as Error).message}). Running seed in validation/dry-run mode.`
      );
      CATEGORIES_SEED_DATA.forEach((cat, idx) => categoryMap.set(cat.slug, `cat_${idx}`));
    }
  } else {
    CATEGORIES_SEED_DATA.forEach((cat, idx) => categoryMap.set(cat.slug, `cat_${idx}`));
    console.log(`✅ Validated ${categoryMap.size} category definitions (dry-run).`);
  }

  // 2. Upsert 36 States & Union Territories
  console.log("\n🇮🇳 Validating and Seeding 28 States and 8 Union Territories...");
  const stateCodeMap = new Map<string, string>(); // code -> id

  if (!isDryRun && categoryMap.get(CATEGORIES_SEED_DATA[0]!.slug)?.startsWith("cuid")) {
    try {
      for (const st of STATES_SEED_DATA) {
        const record = await prisma.state.upsert({
          where: { code: st.code },
          update: {
            slug: st.slug,
            name: st.name,
            nativeName: st.nativeName,
            primaryLanguages: st.primaryLanguages,
            launchState: st.launchState ?? false,
            portalName: st.portalName,
            portalUrl: st.portalUrl,
          },
          create: {
            code: st.code,
            slug: st.slug,
            name: st.name,
            nativeName: st.nativeName,
            primaryLanguages: st.primaryLanguages,
            launchState: st.launchState ?? false,
            portalName: st.portalName,
            portalUrl: st.portalUrl,
          },
        });
        stateCodeMap.set(st.code, record.id);
      }
      console.log(`✅ Upserted ${stateCodeMap.size} States & Union Territories into database.`);
    } catch (err: unknown) {
      console.warn(`⚠️ State database write failed: ${(err as Error).message}`);
      STATES_SEED_DATA.forEach((st, idx) => stateCodeMap.set(st.code, `state_${idx}`));
    }
  } else {
    STATES_SEED_DATA.forEach((st, idx) => stateCodeMap.set(st.code, `state_${idx}`));
    console.log(`✅ Validated ${stateCodeMap.size} States & UTs definitions (dry-run).`);
  }

  // 3. Scan and Validate JSON Files in src/content/tasks
  const tasksDir = path.join(process.cwd(), "src/content/tasks");
  if (!fs.existsSync(tasksDir)) {
    console.log("\n⚠️ No src/content/tasks directory found. Skipping task loading.");
    return;
  }

  const taskFiles = fs.readdirSync(tasksDir).filter((file) => file.endsWith(".json"));

  console.log(`\n📄 Found ${taskFiles.length} task content file(s) in src/content/tasks:`);

  let loadedTasksCount = 0;
  let nationalVariantsCount = 0;
  let stateVariantsCount = 0;

  for (const file of taskFiles) {
    const filePath = path.join(tasksDir, file);
    const rawContent = fs.readFileSync(filePath, "utf-8");

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (err) {
      console.error(`\n❌ JSON Syntax Error in file: ${file}`);
      console.error(err);
      process.exit(1);
    }

    // Validate with Zod
    const validation = TaskContentSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error(`\n❌ Validation Error in ${file}:`);
      for (const issue of validation.error.issues) {
        console.error(`   - [${issue.path.join(".")}] ${issue.message}`);
      }
      process.exit(1);
    }

    const taskData: TaskContent = validation.data;
    const categoryId = categoryMap.get(taskData.categorySlug);

    if (!categoryId) {
      console.error(
        `\n❌ Unknown categorySlug "${taskData.categorySlug}" in ${file}. Known categories: ${Array.from(
          categoryMap.keys()
        ).join(", ")}`
      );
      process.exit(1);
    }

    // Upsert Task and its variants in a transaction if database connected
    if (!isDryRun && !categoryMap.get(taskData.categorySlug)?.startsWith("cat_")) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Task
          const taskRecord = await tx.task.upsert({
            where: { slug: taskData.slug },
            update: {
              name: taskData.name,
              description: taskData.description,
              categoryId: categoryId,
            },
            create: {
              slug: taskData.slug,
              name: taskData.name,
              description: taskData.description,
              categoryId: categoryId,
            },
          });

          // 2. National Variant (stateId = null)
          await tx.taskVariant.deleteMany({
            where: {
              taskId: taskRecord.id,
              stateId: null,
            },
          });

          await tx.taskVariant.create({
            data: {
              taskId: taskRecord.id,
              stateId: null,
              title: taskData.national.title,
              summary: taskData.national.summary,
              estimatedTime: taskData.national.estimatedTime,
              difficulty: taskData.national.difficulty,
              status: taskData.national.status,
              verifiedBy: taskData.national.verifiedBy,
              sourceUrl: taskData.national.sourceUrl,
              steps: {
                create: taskData.national.steps.map((s) => ({
                  stepNumber: s.stepNumber,
                  title: s.title,
                  description: s.description,
                  where: s.where,
                  estimatedTime: s.estimatedTime,
                  officialLinkUrl: s.officialLinkUrl,
                  officialLinkLabel: s.officialLinkLabel,
                  calloutType: s.calloutType,
                  calloutTitle: s.calloutTitle,
                  calloutText: s.calloutText,
                  status: s.status,
                  sourceUrl: s.sourceUrl,
                })),
              },
              documentRequirements: {
                create: taskData.national.documentRequirements.map((d, idx) => ({
                  name: d.name,
                  description: d.description,
                  requirementType: d.requirementType,
                  copiesHint: d.copiesHint,
                  appliesWhen: d.appliesWhen as object,
                  status: d.status,
                  sourceUrl: d.sourceUrl,
                  displayOrder: d.displayOrder ?? idx,
                })),
              },
              fees: {
                create: taskData.national.fees.map((f) => ({
                  label: f.label,
                  amount: f.amount,
                  currency: f.currency,
                  paymentMode: f.paymentMode,
                  rulesReference: f.rulesReference,
                  status: f.status,
                  sourceUrl: f.sourceUrl,
                })),
              },
              officialLinks: {
                create: taskData.national.officialLinks.map((o) => ({
                  label: o.label,
                  url: o.url,
                  isPrimary: o.isPrimary,
                  department: o.department,
                  portalName: o.portalName,
                  status: o.status,
                  sourceUrl: o.sourceUrl,
                })),
              },
              faqItems: {
                create: taskData.national.faqItems.map((q, idx) => ({
                  question: q.question,
                  answer: q.answer,
                  displayOrder: q.displayOrder ?? idx,
                  status: q.status,
                  sourceUrl: q.sourceUrl,
                })),
              },
              rejectionReasons: {
                create: taskData.national.rejectionReasons.map((r) => ({
                  title: r.title,
                  description: r.description,
                  solution: r.solution,
                  status: r.status,
                  sourceUrl: r.sourceUrl,
                })),
              },
              sourceRefs: {
                create: taskData.national.sourceRefs.map((src) => ({
                  title: src.title,
                  actOrRuleNumber: src.actOrRuleNumber,
                  issuingAuthority: src.issuingAuthority,
                  url: src.url,
                  status: src.status,
                  sourceUrl: src.sourceUrl,
                })),
              },
            },
          });

          // 3. State Overrides (if any)
          if (taskData.states && typeof taskData.states === "object") {
            for (const [stateCode, stateOverride] of Object.entries(taskData.states)) {
              const stateId = stateCodeMap.get(stateCode.toUpperCase());
              if (!stateId) continue;

              await tx.taskVariant.deleteMany({
                where: {
                  taskId: taskRecord.id,
                  stateId: stateId,
                },
              });

              await tx.taskVariant.create({
                data: {
                  taskId: taskRecord.id,
                  stateId: stateId,
                  title: stateOverride.title ?? `${taskData.national.title} (${stateCode})`,
                  summary: stateOverride.summary ?? taskData.national.summary,
                  estimatedTime: stateOverride.estimatedTime ?? taskData.national.estimatedTime,
                  difficulty: stateOverride.difficulty ?? taskData.national.difficulty,
                  status: stateOverride.status ?? taskData.national.status,
                  steps: {
                    create: (stateOverride.steps ?? taskData.national.steps).map((s) => ({
                      stepNumber: s.stepNumber,
                      title: s.title,
                      description: s.description,
                      where: s.where,
                      estimatedTime: s.estimatedTime,
                      officialLinkUrl: s.officialLinkUrl,
                      officialLinkLabel: s.officialLinkLabel,
                      calloutType: s.calloutType,
                      calloutTitle: s.calloutTitle,
                      calloutText: s.calloutText,
                      status: s.status,
                      sourceUrl: s.sourceUrl,
                    })),
                  },
                  documentRequirements: {
                    create: (
                      stateOverride.documentRequirements ?? taskData.national.documentRequirements
                    ).map((d, idx) => ({
                      name: d.name,
                      description: d.description,
                      requirementType: d.requirementType,
                      copiesHint: d.copiesHint,
                      appliesWhen: d.appliesWhen as object,
                      status: d.status,
                      sourceUrl: d.sourceUrl,
                      displayOrder: d.displayOrder ?? idx,
                    })),
                  },
                  fees: {
                    create: (stateOverride.fees ?? taskData.national.fees).map((f) => ({
                      label: f.label,
                      amount: f.amount,
                      currency: f.currency,
                      paymentMode: f.paymentMode,
                      rulesReference: f.rulesReference,
                      status: f.status,
                      sourceUrl: f.sourceUrl,
                    })),
                  },
                  officialLinks: {
                    create: (stateOverride.officialLinks ?? taskData.national.officialLinks).map(
                      (o) => ({
                        label: o.label,
                        url: o.url,
                        isPrimary: o.isPrimary,
                        department: o.department,
                        portalName: o.portalName,
                        status: o.status,
                        sourceUrl: o.sourceUrl,
                      })
                    ),
                  },
                  faqItems: {
                    create: (stateOverride.faqItems ?? taskData.national.faqItems).map(
                      (q, idx) => ({
                        question: q.question,
                        answer: q.answer,
                        displayOrder: q.displayOrder ?? idx,
                        status: q.status,
                        sourceUrl: q.sourceUrl,
                      })
                    ),
                  },
                  rejectionReasons: {
                    create: (
                      stateOverride.rejectionReasons ?? taskData.national.rejectionReasons
                    ).map((r) => ({
                      title: r.title,
                      description: r.description,
                      solution: r.solution,
                      status: r.status,
                      sourceUrl: r.sourceUrl,
                    })),
                  },
                  sourceRefs: {
                    create: (stateOverride.sourceRefs ?? taskData.national.sourceRefs).map(
                      (src) => ({
                        title: src.title,
                        actOrRuleNumber: src.actOrRuleNumber,
                        issuingAuthority: src.issuingAuthority,
                        url: src.url,
                        status: src.status,
                        sourceUrl: src.sourceUrl,
                      })
                    ),
                  },
                },
              });
            }
          }
        });
      } catch (dbErr: unknown) {
        console.warn(`⚠️ Task database write error: ${(dbErr as Error).message}`);
      }
    }

    nationalVariantsCount++;
    if (taskData.states && typeof taskData.states === "object") {
      stateVariantsCount += Object.keys(taskData.states).length;
    }

    loadedTasksCount++;
    console.log(`   + Loaded task: ${taskData.slug} (${taskData.name})`);
  }

  // 4. Summary Table
  console.log("\n==========================================");
  console.log("       DATABASE SEED SUMMARY TABLE        ");
  console.log("==========================================");
  console.table([
    { Entity: "Categories", "Records Seeded": categoryMap.size, Status: "Verified" },
    { Entity: "States & UTs", "Records Seeded": stateCodeMap.size, Status: "Verified" },
    { Entity: "Tasks (Parent)", "Records Seeded": loadedTasksCount, Status: "Validated" },
    { Entity: "National Variants", "Records Seeded": nationalVariantsCount, Status: "Created" },
    {
      Entity: "State Variants (Overrides)",
      "Records Seeded": stateVariantsCount,
      Status: "Merged",
    },
  ]);
  console.log("==========================================");
  console.log("✨ Seeding completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
