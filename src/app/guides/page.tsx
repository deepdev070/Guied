import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { buildSearchIndex, type SearchableItem } from "@/lib/search";
import { STATES_SEED_DATA } from "../../../prisma/data/states";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { LeaderboardAd } from "@/components/ads/LeaderboardAd";
import { AD_PLACEMENTS } from "@/components/ads/placements";

export const metadata: Metadata = {
  title: `All Guides (A–Z Directory) | ${siteConfig.name}`,
  description:
    "Complete A-Z directory of all verified Indian citizen paperwork guides, document checklists, statutory fees, and state-specific portals across India and Gujarat.",
};

export default function GuidesDirectoryPage() {
  const allTasks = buildSearchIndex();

  // Sort tasks alphabetically by name
  const sortedTasks = [...allTasks].sort((a, b) => a.name.localeCompare(b.name));

  // Group tasks by first letter
  const groupedTasks: Record<string, SearchableItem[]> = {};
  for (const task of sortedTasks) {
    const firstLetter = task.name.charAt(0).toUpperCase();
    if (!groupedTasks[firstLetter]) {
      groupedTasks[firstLetter] = [];
    }
    groupedTasks[firstLetter].push(task);
  }

  const letters = Object.keys(groupedTasks).sort();

  // Priority states for quick pill links
  const featuredStates = [
    { slug: "gujarat", name: "Gujarat", isLaunch: true },
    { slug: "maharashtra", name: "Maharashtra" },
    { slug: "delhi", name: "Delhi" },
    { slug: "karnataka", name: "Karnataka" },
    { slug: "uttar-pradesh", name: "Uttar Pradesh" },
    { slug: "rajasthan", name: "Rajasthan" },
  ];

  let taskCounter = 0;

  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "All Guides (A–Z)", href: "/guides" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">
            All Paperwork Guides (A–Z)
          </h1>
          <p className="text-muted mt-2 text-sm sm:text-base">
            Complete alphabetical directory of every verified government procedure, document
            checklist, statutory fee, and state-specific portal links.
          </p>
        </div>

        {/* Alphabet Quick Jump Bar */}
        <nav
          aria-label="Alphabetical quick jump"
          className="rounded-card border-border shadow-soft-sm mb-10 border bg-white p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-muted mr-1 text-xs font-semibold tracking-wider uppercase">
              Jump to:
            </span>
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="border-border bg-surface-alt/60 text-text hover:border-primary hover:bg-primary-soft hover:text-primary focus-visible:ring-primary flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Grouped Guides List */}
        <div className="space-y-12">
          {letters.map((letter) => {
            const tasksInLetter = groupedTasks[letter] || [];

            return (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                {/* Letter Header */}
                <div className="border-border mb-4 flex items-center gap-3 border-b pb-2">
                  <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-base font-black text-white shadow-xs">
                    {letter}
                  </span>
                  <h2 className="text-h3 text-text font-bold">
                    Guides starting with &ldquo;{letter}&rdquo;
                  </h2>
                  <span className="text-muted text-xs">({tasksInLetter.length})</span>
                </div>

                {/* Tasks in Letter */}
                <div className="space-y-4">
                  {tasksInLetter.map((task) => {
                    taskCounter++;
                    const shouldRenderAd = taskCounter % 20 === 0;

                    return (
                      <React.Fragment key={task.slug}>
                        <article className="rounded-card border-border shadow-soft-sm hover:border-primary/40 hover:shadow-soft-md border bg-white p-5 transition-all duration-200">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral">{task.categoryName}</Badge>
                              {task.launchState && <Badge variant="new">★ Gujarat verified</Badge>}
                            </div>
                            <span className="text-text text-xs font-semibold">
                              Govt fee: {task.cost}
                            </span>
                          </div>

                          <h3 className="text-h3 text-text hover:text-primary font-bold transition-colors">
                            <Link href={`/${task.slug}`}>{task.name}</Link>
                          </h3>

                          <p className="text-muted mt-1.5 text-sm leading-relaxed">
                            {task.summary}
                          </p>

                          {/* Quick State Links */}
                          <div className="border-border/60 mt-4 border-t pt-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-text font-semibold">Select State:</span>
                              <Link
                                href={`/${task.slug}`}
                                className="bg-surface-alt hover:bg-primary-soft hover:text-primary rounded px-2 py-0.5 font-medium transition-colors"
                              >
                                All-India National
                              </Link>
                              {featuredStates.map((st) => (
                                <Link
                                  key={st.slug}
                                  href={`/${task.slug}/${st.slug}`}
                                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                                    st.isLaunch
                                      ? "bg-accent-soft text-text hover:bg-accent font-semibold hover:text-white"
                                      : "bg-surface-alt hover:bg-primary-soft hover:text-primary"
                                  }`}
                                >
                                  {st.name} {st.isLaunch ? "★" : ""}
                                </Link>
                              ))}
                            </div>

                            {/* Collapsible Full 36 State HTML Links for SEO crawlers */}
                            <details className="text-muted mt-2.5 text-xs">
                              <summary className="text-primary cursor-pointer font-medium hover:underline">
                                View all 36 state &amp; UT portals for this guide
                              </summary>
                              <div className="bg-surface border-border mt-2.5 grid grid-cols-2 gap-1.5 rounded-lg border p-3 sm:grid-cols-3 md:grid-cols-4">
                                {STATES_SEED_DATA.map((st) => (
                                  <Link
                                    key={st.slug}
                                    href={`/${task.slug}/${st.slug}`}
                                    className="text-muted hover:text-primary truncate hover:underline"
                                  >
                                    {st.name}
                                  </Link>
                                ))}
                              </div>
                            </details>
                          </div>
                        </article>

                        {/* Ad slot after every 20 items */}
                        {shouldRenderAd && (
                          <div className="my-8 flex justify-center">
                            <LeaderboardAd slotId={`guides-mid-${taskCounter}`} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Leaderboard Ad Slot (Prompt 86: GUIDES_LIST) */}
        <div className="mt-12 flex justify-center">
          <LeaderboardAd slotId={AD_PLACEMENTS.GUIDES_LIST.slotId} />
        </div>
      </div>
    </div>
  );
}
