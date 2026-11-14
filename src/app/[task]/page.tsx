import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTaskBySlug,
  getTaskVariant,
  getRelatedTasks,
  getPopularTasks,
  loadAllTaskFiles,
} from "@/lib/queries";
import { TaskPageView } from "@/components/task/TaskPageView";
import { generateTaskSeoMetadata } from "@/lib/seo";

export const revalidate = 86400; // 24 hours ISR

interface TaskPageProps {
  params: Promise<{
    task: string;
  }>;
}

export async function generateStaticParams() {
  const allTasks = loadAllTaskFiles();
  return allTasks.map((t) => ({
    task: t.slug,
  }));
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { task: taskSlug } = await params;
  const task = await getTaskBySlug(taskSlug);

  if (!task) {
    return {
      title: "Guide Not Found",
    };
  }

  const mandatoryFeeTotal = task.national.fees
    .filter((f) => !f.isOptional)
    .reduce((acc, f) => acc + f.amount, 0);

  return generateTaskSeoMetadata({
    taskSlug: task.slug,
    taskName: task.name,
    documentCount: task.national.documentRequirements.length,
    mandatoryFeeTotal,
    year: 2026,
  });
}

export default async function TaskNationalPage({ params }: TaskPageProps) {
  const { task: taskSlug } = await params;
  const task = await getTaskBySlug(taskSlug);

  if (!task) {
    notFound();
  }

  const variant = await getTaskVariant(taskSlug, null);
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
    />
  );
}
