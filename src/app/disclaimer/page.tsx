import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";

export const metadata: Metadata = {
  title: `Disclaimer & Non-Government Notice | ${siteConfig.name}`,
  description:
    "Official non-affiliation disclaimer and legal terms for India Paperwork Guide. We are an independent civic information resource, not a government portal.",
};

export default function DisclaimerPage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Disclaimer", href: "/disclaimer" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">
            Disclaimer &amp; Non-Affiliation Notice
          </h1>
          <p className="text-muted mt-2 text-sm sm:text-base">
            Last Updated: January 2026 • Please read this notice carefully before using our guides.
          </p>
        </div>

        {/* Prominent Legal Review Notice Box */}
        <div className="mb-8">
          <Callout variant="warning" title="Notice for Site Operator / Legal Review">
            <p className="text-sm leading-relaxed">
              <strong>Mandatory Legal Review Notice:</strong> This document is a plain-language
              draft prepared for an informational civic website in India. You should have this
              document reviewed and adapted by a qualified advocate or legal professional licensed
              in India before official commercial launch.
            </p>
          </Callout>
        </div>

        {/* Disclaimer Text Content */}
        <div className="rounded-card border-border shadow-soft-sm text-muted space-y-6 border bg-white p-6 text-sm leading-relaxed sm:p-8 sm:text-base">
          <section>
            <h2 className="text-h3 text-text font-bold">1. Independent Non-Government Resource</h2>
            <div className="mt-3 space-y-2">
              <p>
                <strong>{siteConfig.name}</strong> ({siteConfig.baseUrl}) is an independent civic
                information guide.{" "}
                <strong className="text-danger">
                  This website is NOT an official government website and is NOT affiliated with,
                  associated with, authorized by, endorsed by, or in any way connected to the
                  Government of India, any State Government, Union Territory administration, or any
                  of their ministries, departments, directorates, or public sector undertakings.
                </strong>
              </p>
              <p>
                All official government application forms, statutory fee payments, biometrics, and
                document verifications must be submitted directly through official portals hosted on{" "}
                <code className="bg-surface-alt text-text rounded px-1 py-0.5 font-mono font-semibold">
                  .gov.in
                </code>{" "}
                or{" "}
                <code className="bg-surface-alt text-text rounded px-1 py-0.5 font-mono font-semibold">
                  .nic.in
                </code>{" "}
                domains, or in person at designated government facilitation counters.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              2. Informational Purpose Only — No Legal Advice
            </h2>
            <p className="mt-3">
              The content provided on this website—including document checklists, procedure steps,
              estimated timelines, and statutory fee calculations—is published purely for general
              educational and informational purposes. None of the content on this platform
              constitutes legal, financial, tax, or administrative advice. No citizen-advisor or
              fiduciary relationship is formed through your use of this site.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              3. Verification &amp; Statutory Accuracy
            </h2>
            <p className="mt-3">
              While our editorial research team makes every effort to verify information against
              official Gazette of India notifications, state Citizen Charters, and current portal
              rules, administrative procedures and statutory fees can change without prior notice.
              We do not make any express or implied warranties or representations regarding the
              completeness, timeliness, or absolute infallibility of any checklist or instruction.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              4. External Government Links &amp; Third Parties
            </h2>
            <p className="mt-3">
              Our guides contain direct hyperlinks to third-party government websites (such as
              Parivahan Sewa, Passport Seva, Income Tax e-filing, and Digital Gujarat). These
              external websites are operated independently by respective government authorities.{" "}
              {siteConfig.name} exercises no control over the availability, server uptime, security,
              or privacy practices of these third-party platforms.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              5. No Intermediary, Agent, or Fee Collection
            </h2>
            <p className="mt-3">
              {siteConfig.name} does not act as an agent, broker, or intermediary. We will never
              request cash payments, bank transfers, credit card numbers, OTPs, or passwords for
              government services. If anyone claiming to represent {siteConfig.name} requests money
              or personal documents from you, please report them immediately.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">6. Limitation of Liability</h2>
            <p className="mt-3">
              To the fullest extent permitted under applicable Indian law, {siteConfig.name}, its
              founders, contributors, and research team shall not be held liable for any direct,
              indirect, consequential, or incidental loss or damage arising from reliance on the
              information presented on this website, or from application rejections, administrative
              delays, or changes in government fees.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">7. Questions &amp; Contact</h2>
            <p className="mt-3">
              For editorial corrections, notices, or inquiries regarding this disclaimer, please
              contact us at:{" "}
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
