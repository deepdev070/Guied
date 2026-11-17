import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles, getArticleStaticSlugs } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Info,
} from "lucide-react";

export async function generateStaticParams() {
  return getArticleStaticSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: `Article Not Found | ${siteConfig.name}`,
    };
  }

  const pageUrl = `${siteConfig.baseUrl}/guides/articles/${article.slug}`;

  return {
    title: `${article.title} | ${siteConfig.name}`,
    description: article.summary,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: pageUrl,
      type: "article",
      publishedTime: article.lastVerifiedAt,
      modifiedTime: article.lastVerifiedAt,
      authors: [article.verifiedBy],
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const verifiedDateFormatted = new Date(article.lastVerifiedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // JSON-LD structured data for article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    author: {
      "@type": "Organization",
      name: article.verifiedBy,
      url: siteConfig.baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    datePublished: article.lastVerifiedAt,
    dateModified: article.lastVerifiedAt,
    mainEntityOfPage: `${siteConfig.baseUrl}/guides/articles/${article.slug}`,
  };

  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Guides", href: "/guides" },
            { name: "Articles", href: "/guides/articles" },
            { name: article.title },
          ]}
          className="mb-6"
        />

        {/* Article Header Card */}
        <header className="shadow-soft-sm rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="official">{article.categoryName}</Badge>

            <div className="flex items-center gap-4 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#003366]" />
                <span>{article.readTimeMinutes} min read</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#15803D]">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" />
                <span>Verified: {verifiedDateFormatted}</span>
              </span>
            </div>
          </div>

          <h1 className="mt-4 text-2xl leading-tight font-black text-[#0F172A] sm:text-3xl md:text-4xl">
            {article.title}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-[#475569] sm:text-lg">
            {article.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
            <span>
              Researched &amp; Verified by:{" "}
              <strong className="text-[#0F172A]">{article.verifiedBy}</strong>
            </span>
            <Link
              href={`/${article.relatedTaskSlug}`}
              className="inline-flex items-center gap-1.5 font-bold text-[#003366] hover:underline"
            >
              <span>View Main Checklist Guide</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Article Outline / In This Guide Box */}
        <section
          aria-label="Article outline"
          className="mt-8 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-5"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
            <BookOpen className="h-4 w-4" />
            <span>In This Article (Common Mistakes Breakdown)</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#334155] sm:text-sm">
            {article.outline.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-[#003366]">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Primary Callout linking to the Guide */}
        <aside className="mt-8 rounded-xl border border-[#86EFAC] bg-[#E8F7EE] p-4 text-xs sm:flex sm:items-center sm:justify-between sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Info className="h-5 w-5 shrink-0 text-[#15803D]" />
            <div>
              <span className="font-bold text-[#15803D]">
                Applying right now? Don&apos;t rely on memory.
              </span>
              <p className="text-[#166534]">
                Download the official statutory checklist for {article.relatedTaskTitle}.
              </p>
            </div>
          </div>
          <Link
            href={`/${article.relatedTaskSlug}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#15803D] px-3.5 py-2 font-bold text-white transition-colors hover:bg-[#166534] sm:mt-0"
          >
            <span>Open Guide</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </aside>

        {/* Core Mistakes Breakdown List */}
        <section aria-label="Mistakes and solutions" className="mt-10 space-y-8">
          {article.mistakes.map((mistake) => (
            <article
              key={mistake.number}
              className="shadow-soft-xs rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-sm font-black text-[#B91C1C]">
                    #{mistake.number}
                  </span>
                  <h2 className="text-lg font-bold text-[#0F172A] sm:text-xl">{mistake.title}</h2>
                </div>
              </div>

              {/* What people do wrong */}
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>WHAT PEOPLE DO WRONG</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#334155] sm:text-sm">
                  {mistake.whatPeopleDoWrong}
                </p>
              </div>

              {/* Consequence */}
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>THE PAINFUL CONSEQUENCE</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#334155] sm:text-sm">
                  {mistake.consequence}
                </p>
              </div>

              {/* The Correct Official Way */}
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>THE CORRECT OFFICIAL WAY</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#0F172A] sm:text-sm">
                  {mistake.correctWay}
                </p>
              </div>

              {/* Official rule citation if present */}
              {mistake.officialRuleRef && (
                <div className="mt-3 flex items-center justify-end text-xs text-[#64748B]">
                  <span>Statutory Reference: </span>
                  <span className="ml-1 font-mono font-semibold text-[#003366]">
                    {mistake.officialRuleRef}
                  </span>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Prompt 144: "Mark facts to verify" Table & Verification Notes */}
        <section
          aria-label="Facts to verify"
          className="shadow-soft-xs mt-12 rounded-2xl border border-[#FDE68A] bg-[#FEFCE8] p-6 sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h2 className="text-base font-bold text-amber-950 sm:text-lg">
              Facts to Verify &amp; State-Level Nuances
            </h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#78350F] sm:text-sm">
            In compliance with our Class 8 verification policy, every statutory rule must cite an
            official gazette or portal. Below are the key factual claims and those marked for
            state-level verification.
          </p>

          <div className="mt-4 space-y-3">
            {article.factsToVerify.map((fact, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-amber-200 bg-white p-4 text-xs sm:text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[#0F172A]">{fact.claim}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase ${
                      fact.status === "VERIFIED"
                        ? "border border-green-200 bg-green-50 text-green-800"
                        : "border border-amber-300 bg-amber-100 text-amber-950"
                    }`}
                  >
                    {fact.status === "VERIFIED" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-700" />
                        <span>VERIFIED OFFICIAL RULE</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 text-amber-800" />
                        <span>NEEDS VERIFICATION</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                  <span>
                    Official Authority:{" "}
                    <strong className="text-[#334155]">{fact.officialSource}</strong>
                  </span>
                  {fact.notes && <span className="text-[#92400E] italic">Note: {fact.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 Key Takeaways Checklist */}
        <section
          aria-label="Key takeaways"
          className="shadow-soft-xs mt-10 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7"
        >
          <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
            5 Key Takeaways Before You Head Out
          </h2>
          <ul className="mt-4 space-y-2.5 text-xs text-[#334155] sm:text-sm">
            {article.takeawayChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Official Sources Table */}
        <section
          aria-label="Official sources"
          className="shadow-soft-xs mt-10 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7"
        >
          <h2 className="text-base font-bold text-[#0F172A]">
            Official Government Sources &amp; Citations
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            All rules cited in this article are checked against official .gov.in and .nic.in
            portals.
          </p>

          <div className="mt-4 space-y-2">
            {article.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#F1F5F9]"
              >
                <span>{src.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
              </a>
            ))}
          </div>
        </section>

        {/* Related Main Paperwork Guide Footer Banner */}
        <div className="mt-10 rounded-2xl border border-[#003366] bg-[#003366] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#93C5FD] uppercase">
                Complete Step-By-Step Procedure
              </span>
              <h3 className="mt-1 text-lg font-bold sm:text-xl">
                Ready to apply for {article.relatedTaskTitle}?
              </h3>
              <p className="mt-1 text-xs text-[#BFDBFE] sm:text-sm">
                Check the full document requirements, statutory fees, and verified state portals.
              </p>
            </div>
            <Link
              href={`/${article.relatedTaskSlug}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#138808] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#138808]/90"
            >
              <span>Open Guide</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
