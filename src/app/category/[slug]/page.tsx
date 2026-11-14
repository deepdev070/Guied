import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES_SEED_DATA } from "../../../../prisma/data/categories";
import { getTasksByCategory } from "@/lib/queries";
import { CategoryPageView } from "@/components/category/CategoryPageView";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORIES_SEED_DATA.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES_SEED_DATA.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const currentYear = 2026;

  return {
    title: `${category.name} Paperwork Guides: Documents, Fees & Steps (${currentYear})`,
    description: category.description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} Paperwork Guides (${currentYear})`,
      description: category.description,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES_SEED_DATA.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const tasks = await getTasksByCategory(slug);

  return <CategoryPageView category={category} tasks={tasks} />;
}
