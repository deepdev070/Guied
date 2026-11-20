import fs from "node:fs";
import path from "node:path";
import { CATEGORIES_SEED_DATA, type CategorySeedData } from "../../prisma/data/categories.ts";
import { STATES_SEED_DATA, type StateSeedData } from "../../prisma/data/states.ts";
export type { StateSeedData };
import { TaskContentSchema, type TaskContent, type TaskVariant } from "../types/content.ts";

type AsyncFn<T> = () => Promise<T>;

function cachedQuery<T>(
  fn: AsyncFn<T>,
  keyParts?: string[],
  options?: { revalidate?: number | false; tags?: string[] }
): AsyncFn<T> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextCache = require("next/cache");
    if (typeof nextCache?.unstable_cache === "function") {
      return nextCache.unstable_cache(fn, keyParts, options);
    }
  } catch {
    // Fallback for standalone test runner
  }
  return fn;
}

export interface MergedTaskVariant extends TaskVariant {
  taskSlug: string;
  taskName: string;
  categorySlug: string;
  categoryName?: string;
  isStateOverride: boolean;
  stateCode?: string;
  stateName?: string;
  stateSlug?: string;
  launchState?: boolean;
}

export interface TaskSummary {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  cost: string;
  availableStates: string[];
}

export function formatTaskCost(fees: { amount: number; isOptional?: boolean }[]): string {
  if (!fees || fees.length === 0) return "Free (₹0)";
  const mandatory = fees.filter((f) => !f.isOptional);
  const targetFees = mandatory.length > 0 ? mandatory : fees;
  const amounts = targetFees.map((f) => f.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min === max) {
    return min === 0 ? "Free (₹0)" : `₹${min.toLocaleString("en-IN")}`;
  }
  return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
}

export const FALLBACK_POPULAR_TASKS: TaskSummary[] = [
  {
    slug: "pan-card-new",
    name: "New PAN Card (Form 49A)",
    description: "Apply for a new Permanent Account Number online or via physical application.",
    categorySlug: "money-and-tax",
    categoryName: "Money and Tax",
    difficulty: "easy",
    estimatedTime: "10–15 days",
    cost: "₹107",
    availableStates: [],
  },
  {
    slug: "aadhaar-update",
    name: "Aadhaar Card: Address & Mobile Update",
    description:
      "Update residential address, mobile phone number, or demographic details on UIDAI portal.",
    categorySlug: "identity",
    categoryName: "Identity",
    difficulty: "easy",
    estimatedTime: "7–14 days",
    cost: "₹50",
    availableStates: [],
  },
  {
    slug: "ration-card-new",
    name: "Ration Card: New or Member Addition",
    description:
      "Apply for new household ration card or add newly married spouse or child to existing card.",
    categorySlug: "family",
    categoryName: "Family",
    difficulty: "medium",
    estimatedTime: "15–30 days",
    cost: "₹20 – ₹50",
    availableStates: ["gujarat"],
  },
  {
    slug: "marriage-certificate",
    name: "Marriage Certificate Registration",
    description: "Legal registration of marriage under Hindu Marriage Act or Special Marriage Act.",
    categorySlug: "family",
    categoryName: "Family",
    difficulty: "medium",
    estimatedTime: "15–30 days",
    cost: "₹100 – ₹250",
    availableStates: [],
  },
  {
    slug: "voter-id-apply",
    name: "Voter ID: New Registration (Form 6)",
    description:
      "Online application for inclusion of name in the electoral roll via Election Commission portal.",
    categorySlug: "identity",
    categoryName: "Identity",
    difficulty: "easy",
    estimatedTime: "15–30 days",
    cost: "Free (₹0)",
    availableStates: [],
  },
];

/**
 * Loads all task JSON definitions from src/content/tasks
 */
export function loadAllTaskFiles(): TaskContent[] {
  const tasksDir = path.join(process.cwd(), "src/content/tasks");
  if (!fs.existsSync(tasksDir)) return [];

  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json"));
  const tasks: TaskContent[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(tasksDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);
      const parsed = TaskContentSchema.safeParse(json);
      if (parsed.success) {
        tasks.push(parsed.data);
      }
    } catch {
      // Continue loading valid files
    }
  }

  return tasks;
}

/**
 * 1. getCategories: Returns all categories with active task counts
 */
export async function getCategories(): Promise<(CategorySeedData & { taskCount: number })[]> {
  return cachedQuery(
    async () => {
      const allTasks = loadAllTaskFiles();
      const countMap = new Map<string, number>();

      for (const t of allTasks) {
        countMap.set(t.categorySlug, (countMap.get(t.categorySlug) || 0) + 1);
      }

      return CATEGORIES_SEED_DATA.map((cat) => ({
        ...cat,
        taskCount: countMap.get(cat.slug) || 0,
      })).sort((a, b) => a.displayOrder - b.displayOrder);
    },
    ["categories-list"],
    { revalidate: 3600, tags: ["categories"] }
  )();
}

/**
 * 2. getTaskBySlug: Returns parent task metadata
 */
export async function getTaskBySlug(taskSlug: string): Promise<TaskContent | null> {
  const allTasks = loadAllTaskFiles();
  const task = allTasks.find((t) => t.slug === taskSlug);
  return task || null;
}

/**
 * 3. getTaskVariant: Merges national baseline content with state-specific overrides
 */
export async function getTaskVariant(
  taskSlug: string,
  stateSlugOrCode?: string | null
): Promise<MergedTaskVariant | null> {
  const task = await getTaskBySlug(taskSlug);
  if (!task) return null;

  const category = CATEGORIES_SEED_DATA.find((c) => c.slug === task.categorySlug);

  // If no state provided or state is "national" / "all-india"
  if (!stateSlugOrCode || stateSlugOrCode === "national" || stateSlugOrCode === "all-india") {
    return {
      ...task.national,
      taskSlug: task.slug,
      taskName: task.name,
      categorySlug: task.categorySlug,
      categoryName: category?.name,
      isStateOverride: false,
    };
  }

  // Lookup state
  const normalized = stateSlugOrCode.toLowerCase().trim();
  const state = STATES_SEED_DATA.find(
    (s) => s.slug === normalized || s.code.toLowerCase() === normalized
  );

  if (!state) {
    // Graceful fallback to national
    return {
      ...task.national,
      taskSlug: task.slug,
      taskName: task.name,
      categorySlug: task.categorySlug,
      categoryName: category?.name,
      isStateOverride: false,
    };
  }

  const stateOverride = task.states?.[state.code] || task.states?.[state.slug];
  if (!stateOverride) {
    // No specific override for this state -> return national baseline with state context
    return {
      ...task.national,
      taskSlug: task.slug,
      taskName: task.name,
      categorySlug: task.categorySlug,
      categoryName: category?.name,
      isStateOverride: false,
      stateCode: state.code,
      stateName: state.name,
      stateSlug: state.slug,
      launchState: state.launchState,
    };
  }

  // Merge state override over national baseline
  return {
    ...task.national,
    title: stateOverride.title ?? `${task.national.title} - ${state.name}`,
    summary: stateOverride.summary ?? task.national.summary,
    estimatedTime: stateOverride.estimatedTime ?? task.national.estimatedTime,
    difficulty: stateOverride.difficulty ?? task.national.difficulty,
    status: stateOverride.status ?? task.national.status,
    steps: stateOverride.steps ?? task.national.steps,
    documentRequirements: stateOverride.documentRequirements ?? task.national.documentRequirements,
    fees: stateOverride.fees ?? task.national.fees,
    feeCalculator: stateOverride.feeCalculator ?? task.national.feeCalculator,
    beforeYouGo: stateOverride.beforeYouGo ?? task.national.beforeYouGo,
    officialLinks: stateOverride.officialLinks ?? task.national.officialLinks,
    faqItems: stateOverride.faqItems ?? task.national.faqItems,
    rejectionReasons: stateOverride.rejectionReasons ?? task.national.rejectionReasons,
    sourceRefs: stateOverride.sourceRefs ?? task.national.sourceRefs,
    taskSlug: task.slug,
    taskName: task.name,
    categorySlug: task.categorySlug,
    categoryName: category?.name,
    isStateOverride: true,
    stateCode: state.code,
    stateName: state.name,
    stateSlug: state.slug,
    launchState: state.launchState,
  };
}

/**
 * 4. getPopularTasks: High traffic popular services
 */
export async function getPopularTasks(limit = 8): Promise<TaskSummary[]> {
  const allTasks = loadAllTaskFiles();
  const diskTasks: TaskSummary[] = allTasks.map((t) => {
    const cat = CATEGORIES_SEED_DATA.find((c) => c.slug === t.categorySlug);
    return {
      slug: t.slug,
      name: t.name,
      description: t.description || t.national.summary,
      categorySlug: t.categorySlug,
      categoryName: cat?.name || "General",
      difficulty: t.national.difficulty,
      estimatedTime: t.national.estimatedTime,
      cost: formatTaskCost(t.national.fees),
      availableStates: (() => {
        const states = Object.keys(t.states || {});
        if ((states.includes("GJ") || states.includes("gujarat")) && !states.includes("gujarat")) {
          return [...states, "gujarat"];
        }
        return states;
      })(),
    };
  });

  const diskSlugs = new Set(diskTasks.map((t) => t.slug));
  const combined = [...diskTasks, ...FALLBACK_POPULAR_TASKS.filter((t) => !diskSlugs.has(t.slug))];
  return combined.slice(0, limit);
}

/**
 * 5. getRelatedTasks: Tasks in the same category or related field
 */
export async function getRelatedTasks(
  taskSlug: string,
  categorySlug: string,
  limit = 4
): Promise<TaskSummary[]> {
  const allTasks = loadAllTaskFiles();
  return allTasks
    .filter((t) => t.categorySlug === categorySlug && t.slug !== taskSlug)
    .slice(0, limit)
    .map((t) => {
      const cat = CATEGORIES_SEED_DATA.find((c) => c.slug === t.categorySlug);
      return {
        slug: t.slug,
        name: t.name,
        description: t.description || t.national.summary,
        categorySlug: t.categorySlug,
        categoryName: cat?.name || "General",
        difficulty: t.national.difficulty,
        estimatedTime: t.national.estimatedTime,
        cost: formatTaskCost(t.national.fees),
        availableStates: (() => {
          const states = Object.keys(t.states || {});
          if (
            (states.includes("GJ") || states.includes("gujarat")) &&
            !states.includes("gujarat")
          ) {
            return [...states, "gujarat"];
          }
          return states;
        })(),
      };
    });
}

/**
 * 6. getAllTaskStatePairs: For Next.js generateStaticParams across all states
 */
export async function getAllTaskStatePairs(): Promise<{ task: string; state: string }[]> {
  const allTasks = loadAllTaskFiles();
  const pairs: { task: string; state: string }[] = [];

  for (const t of allTasks) {
    for (const st of STATES_SEED_DATA) {
      pairs.push({
        task: t.slug,
        state: st.slug,
      });
    }
  }

  return pairs;
}

/**
 * 7. getTasksByCategory: Returns all tasks belonging to a civic category
 */
export async function getTasksByCategory(categorySlug: string): Promise<TaskSummary[]> {
  const allTasks = loadAllTaskFiles();
  const diskTasks: TaskSummary[] = allTasks
    .filter((t) => t.categorySlug === categorySlug)
    .map((t) => {
      const cat = CATEGORIES_SEED_DATA.find((c) => c.slug === t.categorySlug);
      return {
        slug: t.slug,
        name: t.name,
        description: t.description || t.national.summary,
        categorySlug: t.categorySlug,
        categoryName: cat?.name || "General",
        difficulty: t.national.difficulty,
        estimatedTime: t.national.estimatedTime,
        cost: formatTaskCost(t.national.fees),
        availableStates: (() => {
          const states = Object.keys(t.states || {});
          if (
            (states.includes("GJ") || states.includes("gujarat")) &&
            !states.includes("gujarat")
          ) {
            return [...states, "gujarat"];
          }
          return states;
        })(),
      };
    });

  const diskSlugs = new Set(diskTasks.map((t) => t.slug));
  const fallbackMatching = FALLBACK_POPULAR_TASKS.filter(
    (t) => t.categorySlug === categorySlug && !diskSlugs.has(t.slug)
  );

  return [...diskTasks, ...fallbackMatching];
}

/**
 * 7. searchTasks: Filter tasks by keywords, category, or document names
 */
export async function searchTasks(query: string, stateSlug?: string): Promise<MergedTaskVariant[]> {
  const allTasks = loadAllTaskFiles();
  const q = query.toLowerCase().trim();

  const results: MergedTaskVariant[] = [];

  for (const t of allTasks) {
    const variant = await getTaskVariant(t.slug, stateSlug);
    if (!variant) continue;

    const matchesName = t.name.toLowerCase().includes(q);
    const matchesTitle = variant.title.toLowerCase().includes(q);
    const matchesSummary = variant.summary.toLowerCase().includes(q);
    const matchesDoc = variant.documentRequirements.some((d) => d.name.toLowerCase().includes(q));
    const matchesFee = variant.fees.some((f) => f.label.toLowerCase().includes(q));

    if (q === "" || matchesName || matchesTitle || matchesSummary || matchesDoc || matchesFee) {
      results.push(variant);
    }
  }

  return results;
}

/**
 * Helper to get all states metadata
 */
export function getAllStates(): StateSeedData[] {
  return STATES_SEED_DATA;
}
