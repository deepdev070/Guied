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
import { getTaskTranslation } from "@/lib/i18n/content-translations";
import { siteConfig } from "@/lib/site";

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
      title: "માર્ગદર્શિકા મળી નથી",
    };
  }

  const translation = await getTaskTranslation(taskSlug, "gu");
  const isReviewed = translation?.isReviewed ?? false;

  return {
    title: translation?.title || `${task.name}: જરૂરી દસ્તાવેજો, ફી અને પ્રક્રિયા (2026)`,
    description: translation?.summary || task.national.summary,
    alternates: {
      canonical: `${siteConfig.baseUrl}/gu/${task.slug}`,
      languages: {
        en: `${siteConfig.baseUrl}/${task.slug}`,
        hi: `${siteConfig.baseUrl}/hi/${task.slug}`,
        gu: `${siteConfig.baseUrl}/gu/${task.slug}`,
      },
    },
    // Prompt 96: Unreviewed machine-translated content must stay noindex until human review
    robots: {
      index: isReviewed,
      follow: true,
    },
  };
}

export default async function GujaratiTaskNationalPage({ params }: TaskPageProps) {
  const { task: taskSlug } = await params;
  const task = await getTaskBySlug(taskSlug);

  if (!task) {
    notFound();
  }

  const [variant, relatedTasks, popularTasks, translation] = await Promise.all([
    getTaskVariant(taskSlug, null),
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
      locale="gu"
      translation={translation}
    />
  );
}
