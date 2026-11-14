import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTaskBySlug,
  getTaskVariant,
  getRelatedTasks,
  getPopularTasks,
  getAllTaskStatePairs,
} from "@/lib/queries";
import { getStateBySlugOrCode } from "@/lib/state-preference";
import { TaskPageView } from "@/components/task/TaskPageView";
import { generateTaskSeoMetadata } from "@/lib/seo";

export const revalidate = 86400; // 24 hours ISR

interface TaskStatePageProps {
  params: Promise<{
    task: string;
    state: string;
  }>;
}

export async function generateStaticParams() {
  const pairs = await getAllTaskStatePairs();
  return pairs.map((p) => ({
    task: p.task,
    state: p.state,
  }));
}

export async function generateMetadata({ params }: TaskStatePageProps): Promise<Metadata> {
  const { task: taskSlug, state: stateSlug } = await params;
  const task = await getTaskBySlug(taskSlug);
  const state = getStateBySlugOrCode(stateSlug);

  if (!task || !state) {
    return {
      title: "Guide Not Found",
    };
  }

  const variant = await getTaskVariant(taskSlug, state.slug);
  const hasUniqueContent = variant?.isStateOverride ?? false;

  const mandatoryFeeTotal = (variant?.fees || task.national.fees)
    .filter((f) => !f.isOptional)
    .reduce((acc, f) => acc + f.amount, 0);

  return generateTaskSeoMetadata({
    taskSlug: task.slug,
    taskName: task.name,
    stateSlug: state.slug,
    stateName: state.name,
    stateCode: state.code,
    documentCount:
      variant?.documentRequirements.length || task.national.documentRequirements.length,
    mandatoryFeeTotal,
    hasStateOverride: hasUniqueContent,
    year: 2026,
  });
}

export default async function TaskStatePage({ params }: TaskStatePageProps) {
  const { task: taskSlug, state: stateSlug } = await params;
  const task = await getTaskBySlug(taskSlug);
  const state = getStateBySlugOrCode(stateSlug);

  if (!task || !state) {
    notFound();
  }

  const variant = await getTaskVariant(taskSlug, state.slug);
  if (!variant) {
    notFound();
  }

  const relatedTasks = await getRelatedTasks(taskSlug, task.categorySlug, 3);
  const popularTasks = await getPopularTasks(4);

  return (
    <TaskPageView
      task={task}
      variant={variant}
      relatedTasks={relatedTasks}
      popularTasks={popularTasks}
      state={state}
      isStatePage={true}
    />
  );
}
