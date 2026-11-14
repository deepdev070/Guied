import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";

export const metadata: Metadata = {
  title: `Terms of Use | ${siteConfig.name}`,
  description:
    "Terms of Use and conditions for accessing India Paperwork Guide's civic checklists, fee breakdowns, and procedural guides.",
};

export default function TermsPage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Terms of Use", href: "/terms" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">Terms of Use</h1>
          <p className="text-muted mt-2 text-sm sm:text-base">
            Effective Date: January 2026 • Please review these terms governing website usage.
          </p>
        </div>

        {/* Prominent Legal Review Notice Box */}
        <div className="mb-8">
          <Callout variant="warning" title="Notice for Site Operator / Legal Review">
            <p className="text-sm leading-relaxed">
              <strong>Mandatory Legal Review Notice:</strong> This document is a plain-language
              draft terms of use agreement for an Indian informational platform. You must have this
              document reviewed by an advocate or legal counsel licensed in India before launch.
            </p>
          </Callout>
        </div>

        {/* Terms Content */}
        <div className="rounded-card border-border shadow-soft-sm text-muted space-y-6 border bg-white p-6 text-sm leading-relaxed sm:p-8 sm:text-base">
          <section>
            <h2 className="text-h3 text-text font-bold">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing, browsing, or using <strong>{siteConfig.name}</strong> (
              {siteConfig.baseUrl}), you acknowledge that you have read, understood, and agree to be
              bound by these Terms of Use and our Privacy Policy. If you do not agree with any part
              of these terms, please do not use this website.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              2. Nature of Service — Non-Government Civic Guide
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                {siteConfig.name} is an independent civic portal created to help Indian citizens
                understand paperwork requirements.{" "}
                <strong className="text-danger">
                  We are not an official government authority, RTO, Passport Seva Kendra, or
                  sub-registrar office. We do not issue certificates, licences, or government
                  documents.
                </strong>
              </p>
              <p>
                All official applications must be executed directly on official government websites
                (ending in .gov.in or .nic.in) or in person at designated government facilitation
                counters.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">3. Permitted &amp; Prohibited Use</h2>
            <div className="mt-3 space-y-2">
              <p>
                You may use this website for your own personal, educational, non-commercial
                purposes. You agree NOT to:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Deploy automated scrapers, bots, or data harvesting scripts against our pages
                  without written consent.
                </li>
                <li>
                  Spam feedback forms, submit false correction reports, or abuse the rate-limited
                  feedback endpoints.
                </li>
                <li>
                  Impersonate government officials or claim {siteConfig.name} is an official
                  government affiliate.
                </li>
                <li>
                  Charge third parties fees for accessing our checklists or procedural summaries.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">4. Intellectual Property</h2>
            <p className="mt-3">
              The original editorial descriptions, categorized checklists, step-by-step guides,
              software code, and visual layout on this website are protected under Indian copyright
              laws. Government forms, Gazette notifications, and statutory fee schedules remain the
              property of respective Indian government ministries and authorities.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              5. Disclaimer of Warranties &amp; No Legal Advice
            </h2>
            <p className="mt-3">
              This service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              basis. We make no representations or warranties of any kind regarding accuracy,
              completeness, or suitability for any particular civic situation. The content does not
              constitute legal or professional advice. Always verify requirements on official
              gazettes before paying fees or submitting documents.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">6. Governing Law &amp; Jurisdiction</h2>
            <p className="mt-3">
              These Terms of Use shall be governed by and construed in accordance with the laws of
              India. Any disputes arising in connection with this platform shall be subject to the
              exclusive jurisdiction of the courts located in Gujarat, India.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">7. Contact Information</h2>
            <p className="mt-3">
              For legal inquiries, copyright claims, or questions regarding these terms, please
              contact:{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="text-primary font-semibold underline"
              >
                {siteConfig.contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
