import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { getAllGlossaryTerms } from "@/data/glossary";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Civic Paperwork Glossary: Simple Legal & Government Terms Explained (2026)",
  description:
    "Plain-language, Class-8 reading level explanations of affidavit, notary, gazette, self-attested, and domicile in English, Hindi, and Gujarati.",
};

export default function GlossaryIndexPage() {
  const terms = getAllGlossaryTerms();

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Civic Glossary" }]} />

        {/* Hero Section */}
        <div className="my-8 text-center sm:text-left">
          <div className="bg-primary-soft text-primary mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Trilingual Civic Glossary</span>
          </div>
          <h1 className="text-h1 text-text font-black tracking-tight">
            Government & Legal Terms Explained
          </h1>
          <p className="text-muted text-body mt-2 max-w-3xl leading-relaxed">
            Confused by terms like <em>affidavit</em>, <em>notary</em>, <em>self-attested</em>, or{" "}
            <em>gazette notification</em>? Here are clear, Class-8 explanations in English, Hindi
            (हिंदी), and Gujarati (ગુજરાતી) so you never get misled by agents.
          </p>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {terms.map((term) => (
            <article
              key={term.slug}
              className="rounded-card border-border bg-background shadow-soft-xs hover:border-primary/50 hover:shadow-soft-md flex flex-col justify-between border p-6 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-h3 text-text font-bold">
                      <Link
                        href={`/glossary/${term.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {term.termEn}
                      </Link>
                    </h2>
                    <div className="text-muted mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="font-medium text-slate-700">{term.termHi}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{term.termGu}</span>
                    </div>
                  </div>
                  <span className="bg-surface-alt text-muted rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    Class 8
                  </span>
                </div>

                <p className="text-muted mt-4 text-xs leading-relaxed">{term.defEn}</p>

                <div className="bg-surface-alt/60 rounded-input border-border/60 mt-4 border p-3 text-xs">
                  <div className="text-text flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="text-success h-3.5 w-3.5" aria-hidden="true" />
                    <span>Who issues it:</span>
                  </div>
                  <p className="text-muted mt-0.5 text-[11px]">{term.whoIssues}</p>
                </div>
              </div>

              <div className="border-border/60 mt-5 flex items-center justify-between border-t pt-4">
                <span className="text-muted text-xs">
                  {term.commonCost ? `Typical cost: ${term.commonCost}` : "Free service"}
                </span>
                <Link
                  href={`/glossary/${term.slug}`}
                  className="text-primary hover:text-primary-hover inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                >
                  <span>Read details</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
