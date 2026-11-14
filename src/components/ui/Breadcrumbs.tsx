"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeJsonLd?: boolean;
  /**
   * Optional custom home label. Defaults to "Home".
   */
  homeLabel?: string;
  /**
   * If true, always prepends the Home item { name: "Home", href: "/" } if not already provided.
   */
  autoHome?: boolean;
}

export function Breadcrumbs({
  items: rawItems,
  className,
  includeJsonLd = true,
  homeLabel = "Home",
  autoHome = true,
}: BreadcrumbsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Normalize items to include Home if autoHome is set and first item is not home
  const items = React.useMemo(() => {
    if (
      autoHome &&
      (rawItems.length === 0 ||
        (rawItems[0]?.href !== "/" && rawItems[0]?.name.toLowerCase() !== "home"))
    ) {
      return [{ name: homeLabel, href: "/" }, ...rawItems];
    }
    return rawItems;
  }, [autoHome, homeLabel, rawItems]);

  // Construct JSON-LD BreadcrumbList
  const jsonLd = React.useMemo(() => {
    if (!includeJsonLd || items.length === 0) return null;

    const itemListElement = items.map((item, index) => {
      const position = index + 1;
      const fullUrl = item.href
        ? item.href.startsWith("http")
          ? item.href
          : `${siteConfig.baseUrl}${item.href}`
        : `${siteConfig.baseUrl}`;

      return {
        "@type": "ListItem",
        position,
        name: item.name,
        item: fullUrl,
      };
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  }, [includeJsonLd, items]);

  if (items.length === 0) return null;

  const total = items.length;
  const hasMiddleItems = total > 3;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className={cn("text-muted flex items-center text-sm", className)}
      >
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {items.map((item, index) => {
            const isLast = index === total - 1;
            const isFirst = index === 0;
            const isMiddle = !isFirst && !isLast;

            // Mobile truncation behavior:
            // When there are more than 3 items, hide middle items on mobile unless expanded
            const isHiddenOnMobile = hasMiddleItems && isMiddle && !isExpanded;

            return (
              <React.Fragment key={`${item.name}-${index}`}>
                {/* Separator icon before each item except the first */}
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className={cn(
                      "text-muted/60 select-none",
                      isHiddenOnMobile && "hidden sm:inline-flex"
                    )}
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </li>
                )}

                {/* Truncation ellipsis button on mobile if collapsed */}
                {hasMiddleItems && index === 1 && !isExpanded && (
                  <li className="inline-flex sm:hidden">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(true)}
                      aria-label="Show full breadcrumb trail"
                      className="text-muted hover:bg-surface-alt hover:text-text focus-visible:ring-primary/40 rounded px-1.5 py-0.5 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
                    >
                      …
                    </button>
                    <span aria-hidden="true" className="text-muted/60 ml-1 select-none">
                      <svg
                        className="inline h-3.5 w-3.5 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </li>
                )}

                {/* Breadcrumb Item */}
                <li
                  className={cn("flex items-center", isHiddenOnMobile && "hidden sm:inline-flex")}
                >
                  {isLast ? (
                    <span
                      aria-current="page"
                      className="text-text max-w-[200px] truncate font-medium sm:max-w-xs md:max-w-md"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className="hover:text-primary focus-visible:ring-primary/40 rounded-sm transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
