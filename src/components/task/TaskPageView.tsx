"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { AtAGlance } from "./AtAGlance";
import { StatePromptBanner } from "./StatePromptBanner";
import { StatePortalHeader } from "./StatePortalHeader";
import { TaskNavTabs } from "./TaskNavTabs";
import { DocumentSection } from "./DocumentSection";
import { StepsSection } from "./StepsSection";
import { FeesSection } from "./FeesSection";
import { MistakesSection } from "./MistakesSection";
import { FaqSection } from "./FaqSection";
import { OfficialLinksSection } from "./OfficialLinksSection";
import { TaskJourney } from "./TaskJourney";
import { RelatedTasks } from "./RelatedTasks";
import { TaskSidebar } from "./TaskSidebar";
import { ShareButtonGroup } from "./ShareButtonGroup";
import { WhatChangedSection } from "./WhatChangedSection";
import { ListenButton } from "./ListenButton";
import { AdSlot } from "@/components/ads/AdSlot";
import { MobileAnchorAd } from "@/components/ads/MobileAnchorAd";
import { AD_PLACEMENTS } from "@/components/ads/placements";
import { analytics } from "@/lib/analytics";

// Lazy-loaded below-the-fold & print components for minimal initial hydration JS (CWV INP < 200ms)
const PrintTaskView = dynamic(() => import("./PrintTaskView").then((mod) => mod.PrintTaskView), {
  ssr: true,
});
const HelpfulFeedbackWidget = dynamic(
  () => import("./HelpfulFeedbackWidget").then((mod) => mod.HelpfulFeedbackWidget),
  { ssr: true }
);
const BeforeYouGoCard = dynamic(
  () => import("./BeforeYouGoCard").then((mod) => mod.BeforeYouGoCard),
  { ssr: true }
);
const NearbyStatesSection = dynamic(
  () => import("./NearbyStatesSection").then((mod) => mod.NearbyStatesSection),
  { ssr: true }
);
const PopularInStateBlock = dynamic(
  () => import("./PopularInStateBlock").then((mod) => mod.PopularInStateBlock),
  { ssr: true }
);
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbListSchema, buildHowToSchema, buildFaqPageSchema } from "@/lib/jsonld";
import {
  getStoredCompletedDocs,
  saveStoredCompletedDocs,
  clearStoredCompletedDocs,
  checkRulesChanged,
  markRulesAcknowledged,
} from "@/lib/checklist-storage";
import type { MergedTaskVariant, TaskSummary } from "@/lib/queries";
import type { TaskContent } from "@/types/content";
import type { StateSeedData } from "../../../prisma/data/states";
import type { Locale } from "@/i18n";
import type { TaskTranslationData } from "@/lib/i18n/content-translations";
import { TranslationNotice } from "@/components/i18n/TranslationNotice";

export interface TaskPageViewProps {
  task: TaskContent;
  variant: MergedTaskVariant;
  relatedTasks: TaskSummary[];
  popularTasks?: TaskSummary[];
  state?: StateSeedData;
  isStatePage?: boolean;
  locale?: Locale;
  translation?: TaskTranslationData | null;
}

export function TaskPageView({
  task,
  variant,
  relatedTasks,
  popularTasks,
  state,
  isStatePage = false,
  locale = "en",
  translation,
}: TaskPageViewProps) {
  const currentYear = 2026;

  // Interactive completed documents state stored in localStorage per task+state
  const [completedDocIds, setCompletedDocIds] = useState<string[]>(() =>
    getStoredCompletedDocs(task.slug, state?.slug)
  );

  const [hasRulesChanged, setHasRulesChanged] = useState(false);

  useEffect(() => {
    const changed = checkRulesChanged(task.slug, String(variant.lastVerifiedAt || ""), state?.slug);
    if (changed) {
      setHasRulesChanged(true);
    }
  }, [task.slug, variant.lastVerifiedAt, state?.slug]);

  const handleAcknowledgeRules = () => {
    markRulesAcknowledged(task.slug, String(variant.lastVerifiedAt || ""), state?.slug);
    setHasRulesChanged(false);
  };

  const handleToggleDoc = (docId: string) => {
    setCompletedDocIds((prev) => {
      const exists = prev.includes(docId);
      const next = exists ? prev.filter((id) => id !== docId) : [...prev, docId];
      saveStoredCompletedDocs(task.slug, state?.slug, next, {
        taskTitle: task.name,
        totalCount: variant.documentRequirements.length,
        currentVersion: String(variant.lastVerifiedAt || ""),
      });

      // Track checklist start and completion (Prompt 82)
      if (!exists && prev.length === 0) {
        analytics.checklistStart(task.slug, state?.slug);
      }
      if (!exists && next.length === variant.documentRequirements.length) {
        analytics.checklistComplete(task.slug, state?.slug, variant.documentRequirements.length);
      }

      return next;
    });
  };

  const handleResetDocs = () => {
    clearStoredCompletedDocs(task.slug, state?.slug);
    setCompletedDocIds([]);
  };

  // Compute fee summary string
  const mandatoryFees = variant.fees.filter((f) => !f.isOptional);
  const totalMandatory = mandatoryFees.reduce((acc, f) => acc + f.amount, 0);
  const costLabel =
    totalMandatory > 0
      ? `₹${totalMandatory.toLocaleString("en-IN")}`
      : variant.fees.length > 0
        ? `₹${variant.fees[0]?.amount.toLocaleString("en-IN")}`
        : "Free (₹0)";

  const categoryName = variant.categoryName || "General Services";
  const categorySlug = variant.categorySlug || "general";

  // Breadcrumbs: if state page, include task link and current state
  const breadcrumbItems =
    isStatePage && state
      ? [
          { name: "Home", href: "/" },
          { name: categoryName, href: `/category/${categorySlug}` },
          { name: task.name, href: `/${task.slug}` },
          { name: state.name },
        ]
      : [
          { name: "Home", href: "/" },
          { name: categoryName, href: `/category/${categorySlug}` },
          { name: task.name },
        ];

  const totalDocs = variant.documentRequirements.length;
  const readyDocs = completedDocIds.filter((id) =>
    variant.documentRequirements.some((d) => (d.id || d.name) === id)
  ).length;

  const whereToApply =
    variant.steps.some((s) => s.where?.toLowerCase().includes("online")) &&
    variant.steps.some(
      (s) =>
        s.where?.toLowerCase().includes("rto") ||
        s.where?.toLowerCase().includes("counter") ||
        s.where?.toLowerCase().includes("physical")
    )
      ? "both"
      : variant.steps.every((s) => s.where?.toLowerCase().includes("online"))
        ? "online"
        : "both";

  const pageTitle =
    translation?.title ||
    (isStatePage && state
      ? `${task.name} in ${state.name}: documents, fees and steps (${currentYear})`
      : `${task.name}: documents, fees and steps (${currentYear})`);

  const pageSummary = translation?.summary || variant.summary;

  // Build structured data schemas (only for visible content)
  const canonicalUrl = `https://indiapaperworkguide.in/${task.slug}${isStatePage && state ? `/${state.slug}` : ""}`;
  const breadcrumbSchema = buildBreadcrumbListSchema(breadcrumbItems);
  const howToSchema = buildHowToSchema({
    name: task.name,
    description: variant.summary,
    steps: variant.steps,
    totalCost: totalMandatory,
    estimatedTime: variant.estimatedTime,
    url: canonicalUrl,
  });
  const faqSchema = buildFaqPageSchema(variant.faqItems);

  return (
    <>
      {/* Schema.org Structured Data (JSON-LD) */}
      <JsonLd schema={[breadcrumbSchema, howToSchema, faqSchema]} />

      {/* 0. Dedicated Print View (visible strictly on media print) */}
      <PrintTaskView task={task} variant={variant} state={state} isStatePage={isStatePage} />

      {/* Screen Interactive Layout (hidden on print) */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 print:hidden">
        {/* 1. Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />

        {/* State Official Portal & Office Header if on a state page */}
        {isStatePage && state && (
          <StatePortalHeader
            state={state}
            isStateOverride={variant.isStateOverride}
            taskName={task.name}
          />
        )}

        {/* State-specific details coming soon Callout when falling back to national */}
        {isStatePage && !variant.isStateOverride && state && (
          <Callout
            variant="important"
            title={`State-specific details for ${state.name} coming soon`}
            className="mb-6"
          >
            We are currently verifying localized counter circulars, forms, and fees for{" "}
            <strong>{state.name}</strong>. In the meantime, the verified national baseline procedure
            and statutory requirements are shown below.
          </Callout>
        )}

        {/* Main Content Layout with Sticky Right Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Column */}
          <div className="lg:col-span-8">
            {/* Rules Changed Retention Banner (Prompt 145) */}
            {hasRulesChanged && (
              <div
                role="status"
                aria-live="polite"
                className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-900">
                      ⚠️
                    </span>
                    <div>
                      <strong className="font-bold text-amber-950">
                        Official Rules Changed Since Your Last Save
                      </strong>
                      <p className="mt-0.5 text-xs text-amber-900">
                        Statutory fees or portal procedures were updated since you last saved this
                        guide.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <a
                      href="#what-changed"
                      className="rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-950"
                    >
                      What Changed ↓
                    </a>
                    <button
                      type="button"
                      onClick={handleAcknowledgeRules}
                      className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col gap-3">
              {/* Verified Badge and Category Link */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/category/${categorySlug}`}
                  className="bg-surface-alt hover:bg-surface border-border text-muted hover:text-primary rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
                >
                  {categoryName}
                </Link>
                <Badge
                  variant="verified"
                  date={variant.lastVerifiedAt ? String(variant.lastVerifiedAt) : undefined}
                >
                  Verified Official Procedure
                </Badge>
                {variant.isStateOverride && (
                  <span className="bg-accent-soft text-warning border-accent/30 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                    {variant.stateName} Specific Rules
                  </span>
                )}
              </div>

              {/* 2. H1 */}
              <h1 className="text-h1 text-text font-bold tracking-tight">{pageTitle}</h1>

              {/* Machine Translation Notice (Prompt 96) */}
              {locale !== "en" && (
                <TranslationNotice locale={locale} isReviewed={translation?.isReviewed} />
              )}

              {/* Summary description */}
              <p className="text-body text-muted leading-relaxed">{pageSummary}</p>

              {/* Voice-friendly Audio Reader (Prompt 102) */}
              <div className="pt-1">
                <ListenButton
                  title={pageTitle}
                  summary={pageSummary}
                  documents={variant.documentRequirements}
                  locale={locale}
                />
              </div>
            </div>

            {/* 4. At a glance summary box */}
            <AtAGlance
              estimatedTime={variant.estimatedTime}
              cost={costLabel}
              whereToApply={whereToApply}
              difficulty={variant.difficulty}
              bestFor={task.description || variant.summary}
              totalDocuments={totalDocs}
            />

            {/* Prompt 86: TASK_TOP Ad Slot (Strictly Below H1 & At A Glance) */}
            <AdSlot
              name={AD_PLACEMENTS.TASK_TOP.name}
              format={AD_PLACEMENTS.TASK_TOP.format}
              placementId={AD_PLACEMENTS.TASK_TOP.slotId}
              className="my-6"
            />

            {/* 5. State Selector Prompt (only on national page) */}
            {!isStatePage && (
              <StatePromptBanner
                taskSlug={task.slug}
                hasStateOverride={Boolean(task.states && Object.keys(task.states).length > 0)}
              />
            )}

            {/* 6. Tabs / Anchors Navigation */}
            <TaskNavTabs
              hasMistakes={variant.rejectionReasons.length > 0}
              hasFaqs={variant.faqItems.length > 0}
            />

            {/* 7. Content Sections */}
            {/* Documents Section */}
            <DocumentSection
              documents={variant.documentRequirements}
              completedIds={completedDocIds}
              onToggleDoc={handleToggleDoc}
              onResetDocs={handleResetDocs}
              taskTitle={task.name}
              taskSlug={task.slug}
              stateName={isStatePage && state ? state.name : variant.stateName}
            />

            {/* Prompt 86: TASK_INLINE_1 (After Documents) */}
            <AdSlot
              name={AD_PLACEMENTS.TASK_INLINE_1.name}
              format={AD_PLACEMENTS.TASK_INLINE_1.format}
              placementId={AD_PLACEMENTS.TASK_INLINE_1.slotId}
              className="my-6"
            />

            {/* Steps Section */}
            <StepsSection steps={variant.steps} />

            {/* Prompt 86: TASK_INLINE_2 (After Steps) */}
            <AdSlot
              name={AD_PLACEMENTS.TASK_INLINE_2.name}
              format={AD_PLACEMENTS.TASK_INLINE_2.format}
              placementId={AD_PLACEMENTS.TASK_INLINE_2.slotId}
              className="my-6"
            />

            {/* Fees Section */}
            <FeesSection fees={variant.fees} feeCalculator={variant.feeCalculator} />

            {/* Mistakes Section */}
            <MistakesSection reasons={variant.rejectionReasons} />

            {/* Prompt 86: TASK_BOTTOM (Before FAQs) */}
            <AdSlot
              name={AD_PLACEMENTS.TASK_BOTTOM.name}
              format={AD_PLACEMENTS.TASK_BOTTOM.format}
              placementId={AD_PLACEMENTS.TASK_BOTTOM.slotId}
              className="my-6"
            />

            {/* FAQs Section */}
            <FaqSection faqs={variant.faqItems} taskSlug={task.slug} />

            {/* Official Links Section */}
            <OfficialLinksSection links={variant.officialLinks} />

            {/* Prompt 145: What Changed Log (Email-Free Retention) */}
            <WhatChangedSection taskSlug={task.slug} stateCode={state?.code} className="my-8" />

            {/* Share with Family & Friends */}
            <ShareButtonGroup
              taskTitle={task.name}
              stateName={isStatePage && state ? state.name : variant.stateName}
              categorySlug={task.categorySlug}
              canonicalPath={isStatePage && state ? `/${task.slug}/${state.slug}` : `/${task.slug}`}
              className="my-8"
            />

            {/* Task Journeys: What people usually do next */}
            <TaskJourney currentTaskSlug={task.slug} />

            {/* Prompt 72: Before you leave home mini card (5 final checks) */}
            <BeforeYouGoCard
              taskTitle={task.name}
              stateName={isStatePage && state ? state.name : variant.stateName}
              beforeYouGo={variant.beforeYouGo}
              documents={variant.documentRequirements}
              fees={variant.fees}
              className="my-8"
            />

            {/* Was this page helpful? feedback widget */}
            <HelpfulFeedbackWidget taskSlug={task.slug} stateSlug={state?.slug} className="my-8" />

            {/* 8. Related Tasks */}
            <RelatedTasks tasks={relatedTasks} />

            {/* Prompt 79: Cross-state internal linking to neighboring states */}
            <NearbyStatesSection
              taskSlug={task.slug}
              taskName={task.name}
              currentStateSlug={state?.slug}
              currentStateName={state?.name}
            />

            {/* Prompt 79: Popular in <State> internal linking block */}
            <PopularInStateBlock
              stateSlug={state?.slug || "gujarat"}
              stateName={state?.name || "Gujarat"}
              tasks={popularTasks && popularTasks.length > 0 ? popularTasks : relatedTasks}
            />
          </div>

          {/* 9. Right Sidebar on Desktop (Sticky) / Mobile Bottom Bar */}
          <div className="lg:col-span-4">
            <TaskSidebar
              totalItems={totalDocs}
              completedCount={readyDocs}
              taskTitle={task.name}
              taskSlug={task.slug}
              stateSlug={state?.slug}
              stateName={isStatePage && state ? state.name : variant.stateName}
              categorySlug={task.categorySlug}
              documents={variant.documentRequirements}
              onResetDocs={handleResetDocs}
            />
          </div>
        </div>
      </div>

      {/* Prompt 90: Optional dismissible mobile bottom anchor placeholder */}
      <MobileAnchorAd />
    </>
  );
}
