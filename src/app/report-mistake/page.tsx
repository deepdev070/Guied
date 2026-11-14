import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ReportMistakeStandaloneForm } from "@/components/layout/ReportMistakeStandaloneForm";

export const metadata: Metadata = {
  title: `Report an Outdated Fee, Document or Mistake | ${siteConfig.name}`,
  description:
    "Notice an outdated fee, wrong document, or broken link? Report a mistake without an account and help improve Indian paperwork guides.",
};

export default function ReportMistakePage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Report Mistake", href: "/report-mistake" },
            ]}
          />
        </div>

        <div className="rounded-card border-border shadow-soft-sm border bg-white p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-primary text-xs font-bold tracking-wider uppercase">
              Civic Feedback & Correction
            </span>
            <h1 className="text-h2 text-text sm:text-h1 mt-1 font-extrabold">Report a Mistake</h1>
            <p className="text-muted mt-2 text-sm">
              Help us maintain 100% verified accuracy for Indian citizens. No login required.
            </p>
          </div>

          <ReportMistakeStandaloneForm />
        </div>
      </div>
    </div>
  );
}
