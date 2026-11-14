import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  IndianRupee,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getGlossaryTermBySlug, getAllGlossaryTerms } from "@/data/glossary";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface GlossaryTermPageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  const terms = getAllGlossaryTerms();
  return terms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: GlossaryTermPageProps): Promise<Metadata> {
  const { term: termSlug } = await params;
  const term = getGlossaryTermBySlug(termSlug);

  if (!term) {
    return {
      title: "Term Not Found | Civic Glossary",
    };
  }

  return {
    title: `${term.termEn} Definition: Meaning in Hindi & Gujarati (2026)`,
    description: `What is ${term.termEn}? Simple Class-8 explanation in English, Hindi (${term.termHi}), and Gujarati (${term.termGu}) with official costs and who issues it.`,
  };
}

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { term: termSlug } = await params;
  const term = getGlossaryTermBySlug(termSlug);

  if (!term) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Glossary", href: "/glossary" },
            { name: term.termEn },
          ]}
        />

        {/* Back link */}
        <div className="my-6">
          <Link
            href="/glossary"
            className="text-muted hover:text-text inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to All Terms</span>
          </Link>
        </div>

        {/* Term Title & Badges */}
        <div className="rounded-card border-border bg-surface-alt/40 border p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="bg-primary-soft text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Civic Term</span>
            </span>
            <span className="bg-success-soft text-success rounded-full px-3 py-1 text-xs font-bold">
              Class 8 Verified
            </span>
          </div>

          <h1 className="text-h1 text-text font-black tracking-tight">{term.termEn}</h1>

          {/* Hindi and Gujarati Subheadings */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="rounded-input bg-background border-border border px-3 py-1.5">
              <span className="text-muted block text-xs font-medium">हिंदी (Hindi)</span>
              <span className="text-text font-bold">{term.termHi}</span>
            </div>
            <div className="rounded-input bg-background border-border border px-3 py-1.5">
              <span className="text-muted block text-xs font-medium">ગુજરાતી (Gujarati)</span>
              <span className="text-text font-bold">{term.termGu}</span>
            </div>
          </div>
        </div>

        {/* Trilingual Definitions Section */}
        <div className="mt-8 space-y-6">
          <section className="rounded-card border-border bg-background shadow-soft-xs border p-6">
            <h2 className="text-h3 text-text mb-4 font-bold">1. Simple Definition (English)</h2>
            <p className="text-text text-body leading-relaxed">{term.defEn}</p>
          </section>

          <section className="rounded-card border-border bg-background shadow-soft-xs border p-6">
            <h2 className="text-h3 text-text mb-4 font-bold">2. हिंदी में अर्थ (Hindi Explanation)</h2>
            <p className="text-text text-body leading-relaxed">{term.defHi}</p>
          </section>

          <section className="rounded-card border-border bg-background shadow-soft-xs border p-6">
            <h2 className="text-h3 text-text mb-4 font-bold">
              3. ગુજરાતીમાં અર્થ (Gujarati Explanation)
            </h2>
            <p className="text-text text-body leading-relaxed">{term.defGu}</p>
          </section>

          {/* Practical Details: Who issues & Typical Cost */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-card border-border bg-background shadow-soft-xs border p-6">
              <div className="text-text mb-2 flex items-center gap-2 font-bold">
                <ShieldCheck className="text-success h-5 w-5" aria-hidden="true" />
                <span>Who Issues It?</span>
              </div>
              <p className="text-muted text-xs leading-relaxed">{term.whoIssues}</p>
            </div>

            <div className="rounded-card border-border bg-background shadow-soft-xs border p-6">
              <div className="text-text mb-2 flex items-center gap-2 font-bold">
                <IndianRupee className="text-accent h-5 w-5" aria-hidden="true" />
                <span>Typical Statutory Cost</span>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                {term.commonCost || "Free of cost (₹0). Do not pay touts or cyber cafes."}
              </p>
            </div>
          </div>

          {/* Where is this used in paperwork? */}
          {term.whereUsed.length > 0 && (
            <section className="rounded-card border-border bg-background shadow-soft-xs border p-6">
              <h2 className="text-body text-text mb-3 font-bold">
                Where is {term.termEn} used in Indian paperwork?
              </h2>
              <ul className="space-y-2 text-xs">
                {term.whereUsed.map((use, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Citizen Tip Callout */}
          {term.tips && (
            <div className="rounded-card border-accent/40 bg-accent-soft/40 border p-5 text-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-accent mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-text font-bold">Important Citizen Tip</h3>
                  <p className="mt-1 leading-relaxed text-slate-700">{term.tips}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
