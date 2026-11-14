import React from "react";
import Link from "next/link";
import { FaqList } from "@/components/ui/Accordion";
import type { FaqItem } from "@/types/content";
import { HelpCircle, MessageSquarePlus } from "lucide-react";

export interface FaqSectionProps {
  faqs: FaqItem[];
  taskSlug?: string;
}

/**
 * FAQ section using FaqList and outputting FAQPage JSON-LD
 * strictly for questions visible on the page.
 */
export function FaqSection({ faqs, taskSlug }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  const items = faqs.map((f, idx) => ({
    id: `faq-${idx}`,
    question: f.question,
    answer: f.answer,
  }));

  // JSON-LD structured data strictly for questions visible on this page
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const reportUrl = taskSlug
    ? `/report-mistake?task=${encodeURIComponent(taskSlug)}&type=missing-faq`
    : "/report-mistake?type=missing-faq";

  return (
    <section id="faqs" aria-labelledby="faqs-heading" className="my-12 scroll-mt-28">
      {/* FAQPage JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="border-border/80 mb-6 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-baseline">
        <div>
          <h2 id="faqs-heading" className="text-h2 text-text font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-small text-muted mt-1">
            Common citizen doubts answered according to official Ministry circulars.
          </p>
        </div>

        <span className="bg-primary-soft text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span>{faqs.length} Answers</span>
        </span>
      </div>

      {/* Accordion FAQ List */}
      <FaqList items={items} />

      {/* "Still confused? Report a missing question" Link */}
      <div className="rounded-card border-border bg-surface-alt/50 mt-6 flex flex-col items-center justify-between gap-3 border p-4 sm:flex-row sm:px-6">
        <div className="text-muted flex items-center gap-2.5 text-xs">
          <MessageSquarePlus className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Didn&rsquo;t find an answer to your specific situation or query?</span>
        </div>

        <Link
          href={reportUrl}
          className="text-primary hover:text-primary-hover text-xs font-semibold transition-colors"
        >
          Still confused? Report a missing question &rarr;
        </Link>
      </div>
    </section>
  );
}
