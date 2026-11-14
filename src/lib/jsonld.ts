/**
 * Schema.org JSON-LD Structured Data Builder
 * Strictly adheres to Google Search Central and Schema.org guidelines.
 * Rule: Only emits markup for content that is actually rendered on the page.
 */

import type { Step, FaqItem } from "../types/content.ts";

const SITE_URL = "https://indiapaperworkguide.in";
const SITE_NAME = "India Paperwork Guide";

/**
 * 1. Organization Schema
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      "Independent civic guide for Indian citizens providing verified paperwork checklists, statutory fees, and official government portal links.",
    sameAs: ["https://twitter.com/indiapaperwork", "https://github.com/indiapaperworkguide"],
  };
}

/**
 * 2. WebSite Schema with Sitelinks Searchbox (SearchAction)
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 3. BreadcrumbList Schema
 */
export function buildBreadcrumbListSchema(items: Array<{ name: string; href?: string }>) {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const element: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };
      if (item.href) {
        element.item = item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`;
      }
      return element;
    }),
  };
}

export interface HowToStepSchema {
  "@type": "HowToStep";
  position: number;
  name: string;
  text: string;
  url?: string;
}

export interface HowToSchema {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  step: HowToStepSchema[];
  estimatedCost?: {
    "@type": "MonetaryAmount";
    currency: "INR";
    value: number;
  };
  totalTime?: string;
}

/**
 * 4. HowTo Schema (ONLY when steps are visible on the page)
 */
export function buildHowToSchema({
  name,
  description,
  steps,
  totalCost,
  estimatedTime,
  url,
}: {
  name: string;
  description: string;
  steps: Step[];
  totalCost?: number;
  estimatedTime?: string;
  url?: string;
}): HowToSchema | null {
  if (!steps || steps.length === 0) return null;

  const howTo: HowToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.title,
      text: s.description,
      url: s.officialLinkUrl || url || undefined,
    })),
  };

  if (totalCost !== undefined && totalCost >= 0) {
    howTo.estimatedCost = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: totalCost,
    };
  }

  if (estimatedTime) {
    howTo.totalTime = estimatedTime;
  }

  return howTo;
}

/**
 * 5. FAQPage Schema (ONLY when FAQs are visible on the page)
 */
export function buildFaqPageSchema(faqs: FaqItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
