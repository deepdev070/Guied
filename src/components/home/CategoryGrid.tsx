import React from "react";
import { IconCard } from "@/components/ui/Card";
import { getCategoryTheme } from "@/lib/icons";
import type { CategorySeedData } from "../../../prisma/data/categories";

export interface CategoryGridProps {
  categories: (CategorySeedData & { taskCount: number })[];
}

/**
 * Category grid displaying all 10 civic categories with IconCard tiles.
 * Responsive layout: 2 columns mobile, 3 columns tablet, 5 columns desktop.
 */
export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section aria-labelledby="browse-by-category-heading" className="my-10">
      <div className="mb-6 flex flex-col">
        <h2 id="browse-by-category-heading" className="text-h2 text-text font-bold tracking-tight">
          Browse by category
        </h2>
        <p className="text-small text-muted mt-1">
          Explore paperwork requirements, documents, and official fees organized by civic category.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.slug);
          const Icon = theme.icon;
          const countLabel = `${cat.taskCount} ${cat.taskCount === 1 ? "guide" : "guides"}`;

          return (
            <IconCard
              key={cat.slug}
              title={cat.name}
              description={countLabel}
              href={`/category/${cat.slug}`}
              icon={<Icon className="h-6 w-6" />}
              iconBgColor={`${theme.bgColor} ${theme.textColor}`}
              className="h-full"
            />
          );
        })}
      </div>
    </section>
  );
}
