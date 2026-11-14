import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STATES_SEED_DATA } from "../../../../prisma/data/states";
import { getStateBySlugOrCode } from "@/lib/state-preference";
import { loadAllTaskFiles, type TaskSummary } from "@/lib/queries";
import { CATEGORIES_SEED_DATA } from "../../../../prisma/data/categories";
import { StatePageView } from "@/components/state/StatePageView";
import { getActiveSponsoredProviders } from "@/lib/sponsored-providers";

interface StatePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return STATES_SEED_DATA.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlugOrCode(slug);

  if (!state) {
    return {
      title: "State Not Found",
    };
  }

  const currentYear = 2026;

  return {
    title: `${state.name} Government Paperwork Guides (${currentYear})`,
    description: `Verified citizen document checklists, statutory fees, and official portal links for ${state.name}.`,
    alternates: {
      canonical: `/state/${state.slug}`,
    },
    openGraph: {
      title: `${state.name} Paperwork Guides (${currentYear})`,
      description: `Verified citizen checklists and official portal links for ${state.name}.`,
      type: "website",
    },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { slug } = await params;
  const state = getStateBySlugOrCode(slug);

  if (!state) {
    notFound();
  }

  const allTasks = loadAllTaskFiles();

  const specificTasks: TaskSummary[] = [];
  const generalTasks: TaskSummary[] = [];

  for (const t of allTasks) {
    const cat = CATEGORIES_SEED_DATA.find((c) => c.slug === t.categorySlug);
    const hasOverride = Boolean(t.states && t.states[state.code]);

    const targetVariant =
      hasOverride && t.states?.[state.code]
        ? { ...t.national, ...t.states[state.code] }
        : t.national;

    const fees = targetVariant.fees || t.national.fees;
    const mandatory = fees.filter((f) => !f.isOptional);
    const totalCost =
      mandatory.length > 0
        ? `₹${mandatory.reduce((acc, f) => acc + f.amount, 0).toLocaleString("en-IN")}`
        : "Free (₹0)";

    const summaryItem: TaskSummary = {
      slug: t.slug,
      name: t.name,
      description: targetVariant.summary || t.national.summary,
      categorySlug: t.categorySlug,
      categoryName: cat?.name || "General",
      difficulty: targetVariant.difficulty || t.national.difficulty,
      estimatedTime: targetVariant.estimatedTime || t.national.estimatedTime,
      cost: totalCost,
      availableStates: Object.keys(t.states || {}),
    };

    if (hasOverride) {
      specificTasks.push(summaryItem);
    } else {
      generalTasks.push(summaryItem);
    }
  }

  const sponsoredProviders = await getActiveSponsoredProviders(state.slug, 3);

  return (
    <StatePageView
      state={state}
      specificTasks={specificTasks}
      generalTasks={generalTasks}
      sponsoredProviders={sponsoredProviders}
    />
  );
}
