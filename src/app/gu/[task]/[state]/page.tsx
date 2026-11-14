import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTaskBySlug,
  getTaskVariant,
  getRelatedTasks,
  getPopularTasks,
  loadAllTaskFiles,
} from "@/lib/queries";
import { getStateBySlugOrCode } from "@/lib/state-preference";
import { TaskPageView } from "@/components/task/TaskPageView";
import { getTaskTranslation } from "@/lib/i18n/content-translations";
import { siteConfig } from "@/lib/site";

export const revalidate = 86400; // 24 hours ISR
export const dynamicParams = true;

interface TaskStatePageProps {
  params: Promise<{
    task: string;
    state: string;
  }>;
}

export async function generateStaticParams() {
  const allTasks = loadAllTaskFiles();
  // Pre-render launch state Gujarat for each task
  return allTasks.map((t) => ({
    task: t.slug,
    state: "gujarat",
  }));
}

export async function generateMetadata({ params }: TaskStatePageProps): Promise<Metadata> {
  const { task: taskSlug, state: stateSlug } = await params;
  const task = await getTaskBySlug(taskSlug);
  const state = getStateBySlugOrCode(stateSlug);

  if (!task || !state) {
    return {
      title: "માર્ગદર્શિકા મળી નથી",
    };
  }

  const translation = await getTaskTranslation(taskSlug, "gu");
  const isReviewed = translation?.isReviewed ?? false;

  return {
    title: `${task.name} (${state.name}): જરૂરી દસ્તાવેજો, સરકારી ફી અને પ્રક્રિયા (2026)`,
    description: `${state.name} માં ${task.name} માટે જરૂરી દસ્તાવેજો, સત્તાવાર .gov.in પોર્ટલ લિંક્સ અને પ્રક્રિયા.`,
    alternates: {
      canonical: `${siteConfig.baseUrl}/gu/${task.slug}/${state.slug}`,
      languages: {
        en: `${siteConfig.baseUrl}/${task.slug}/${state.slug}`,
        hi: `${siteConfig.baseUrl}/hi/${task.slug}/${state.slug}`,
        gu: `${siteConfig.baseUrl}/gu/${task.slug}/${state.slug}`,
      },
    },
    // Prompt 96: Unreviewed pages stay noindex
    robots: {
      index: isReviewed,
      follow: true,
    },
  };
}

export default async function GujaratiTaskStatePage({ params }: TaskStatePageProps) {
  const { task: taskSlug, state: stateSlug } = await params;
  const task = await getTaskBySlug(taskSlug);
  const state = getStateBySlugOrCode(stateSlug);

  if (!task || !state) {
    notFound();
  }

  const [variant, relatedTasks, popularTasks, translation] = await Promise.all([
    getTaskVariant(taskSlug, state.slug),
    getRelatedTasks(task.slug, task.categorySlug, 4),
    getPopularTasks(4),
    getTaskTranslation(taskSlug, "gu"),
  ]);

  if (!variant) {
    notFound();
  }

  return (
    <TaskPageView
      task={task}
      variant={variant}
      relatedTasks={relatedTasks}
      popularTasks={popularTasks}
      state={state}
      isStatePage={true}
      locale="gu"
      translation={translation}
    />
  );
}
