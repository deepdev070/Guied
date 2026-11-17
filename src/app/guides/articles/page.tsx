import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Clock, ShieldCheck, AlertTriangle, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: `Common Civic Paperwork Mistakes & Practical Advice | ${siteConfig.name}`,
  description:
    "Plain-language guides on common mistakes that cause government paperwork delays, RTO test failures, passport rejections, and vehicle transfer traps across India.",
};

export default function ArticlesIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Guides", href: "/guides" },
            { name: "Common Mistakes Articles" },
          ]}
          className="mb-6"
        />

        {/* Header Banner */}
        <div className="shadow-soft-sm mb-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
            <span>Civic Mistake Prevention &amp; Expert Advice</span>
          </div>

          <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl md:text-4xl">
            Avoid Costly Paperwork Mistakes
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#475569] sm:text-base">
            Most government applications in India don&apos;t get rejected because of complex laws —
            they get stalled by simple preventable errors like wrong photo specs, unrecorded address
            changes, or missed e-KYC options. Read these verified breakdowns before you apply.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#15803D]">
              <ShieldCheck className="h-4 w-4 text-[#15803D]" />
              Verified against official .gov.in portals
            </span>
            <span>•</span>
            <span>Class 8 plain language</span>
            <span>•</span>
            <span>Zero agent sponsored content</span>
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="shadow-soft-xs hover:shadow-soft-sm flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:border-[#003366]/40"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Badge variant="official">{article.categoryName}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{article.readTimeMinutes} min read</span>
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#0F172A] hover:text-[#003366]">
                  <Link href={`/guides/articles/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="mt-2.5 text-xs leading-relaxed text-[#475569] sm:text-sm">
                  {article.summary}
                </p>

                {/* Outline Teaser */}
                <div className="mt-4 border-t border-[#F1F5F9] pt-3">
                  <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase">
                    What you will learn:
                  </span>
                  <ul className="mt-1.5 space-y-1 text-xs text-[#334155]">
                    {article.outline.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="line-clamp-1 flex items-start gap-1.5">
                        <span className="font-bold text-[#003366]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                <span className="text-xs font-medium text-[#15803D]">
                  🛡️ Verified{" "}
                  {new Date(article.lastVerifiedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <Link
                  href={`/guides/articles/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Navigation Back to Guides */}
        <div className="mt-10 rounded-xl border border-[#BFDBFE] bg-[#EAF1FF] p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-[#1E40AF]">
              Looking for step-by-step document checklists?
            </h3>
            <p className="mt-1 text-xs text-[#3B82F6]">
              Browse our complete A–Z directory of verified paperwork procedures and statutory fees.
            </p>
          </div>
          <Link
            href="/guides"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#002244] sm:mt-0"
          >
            <span>All Guides Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
