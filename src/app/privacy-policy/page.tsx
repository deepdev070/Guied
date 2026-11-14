import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description:
    "Plain-language Privacy Policy for India Paperwork Guide, drafted in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Privacy Policy", href: "/privacy-policy" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">Privacy Policy</h1>
          <p className="text-muted mt-2 text-sm sm:text-base">
            Effective Date: January 2026 • Compliant with DPDP Act, 2023 principles.
          </p>
        </div>

        {/* Prominent Legal Review Notice Box */}
        <div className="mb-8">
          <Callout variant="warning" title="Notice for Site Operator / Legal Review">
            <p className="text-sm leading-relaxed">
              <strong>Mandatory Legal Review Notice:</strong> This document is a draft privacy
              policy aligned with the Digital Personal Data Protection Act, 2023 (DPDP Act 2023).
              You must have this document reviewed by an Indian data protection attorney before
              commercial operation.
            </p>
          </Callout>
        </div>

        {/* Policy Content */}
        <div className="rounded-card border-border shadow-soft-sm text-muted space-y-6 border bg-white p-6 text-sm leading-relaxed sm:p-8 sm:text-base">
          <section>
            <h2 className="text-h3 text-text font-bold">
              1. Introduction &amp; Commitment to Privacy
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                <strong>{siteConfig.name}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) is dedicated to protecting the privacy and personal data of
                Indian citizens visiting our website. We operate strictly as an informational civic
                portal and do not demand mandatory account registrations, Aadhaar numbers, PAN
                numbers, or identity documents.
              </p>
              <p>
                This policy explains how we handle minimal technical data, cookies, local device
                storage, and third-party advertising in accordance with the principles of
                India&apos;s{" "}
                <strong className="text-text">
                  Digital Personal Data Protection Act, 2023 (DPDP Act)
                </strong>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              2. Core Principles of the DPDP Act, 2023
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                Our data handling follows the foundational tenets of India&apos;s data protection
                framework:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-text">Purpose Limitation:</strong> We only process data
                  for the explicit, lawful purpose of delivering accurate paperwork guidance.
                </li>
                <li>
                  <strong className="text-text">Data Minimisation:</strong> We collect only the
                  minimum data strictly necessary. We never ask for sensitive government IDs.
                </li>
                <li>
                  <strong className="text-text">Storage Limitation:</strong> Personal feedback is
                  retained only as long as required to resolve reported mistakes.
                </li>
                <li>
                  <strong className="text-text">Accountability:</strong> Regular security hygiene
                  and privacy-respecting infrastructure.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">3. Information We Collect &amp; Store</h2>
            <div className="mt-3 space-y-3">
              <div>
                <h3 className="text-text font-semibold">
                  A. Local Device Storage (No Server Tracking)
                </h3>
                <p className="mt-1">
                  To improve your browsing experience without tracking your identity across the web,
                  we store certain non-personal preferences locally on your browser:
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs sm:text-sm">
                  <li>
                    <code>user_state</code>: Remembers your selected Indian state (defaulting to
                    Gujarat) so relevant RTO and civic portals are shown.
                  </li>
                  <li>
                    <code>recent_paperwork_searches</code>: Stores your recent queries locally on
                    your device so autocomplete is instant. This never leaves your device.
                  </li>
                  <li>
                    <code>checklist_progress</code>: Saves your ticked checklist items on your own
                    browser.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text font-semibold">
                  B. Voluntary Feedback (Report a Mistake)
                </h3>
                <p className="mt-1">
                  When you voluntarily submit a correction via our &ldquo;Report a Mistake&rdquo;
                  form, we collect your issue description, proposed correction, and optional contact
                  email (if you choose to provide one). This data is used solely to verify gazette
                  rules and update the guide.
                </p>
              </div>

              <div>
                <h3 className="text-text font-semibold">C. Technical Logs (404 Error Telemetry)</h3>
                <p className="mt-1">
                  When a page is not found (404 error), we log the requested URL to discover broken
                  links or newly searched government services. We do not link these URLs to personal
                  identities.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">4. Cookies &amp; Advertising Partners</h2>
            <div className="mt-3 space-y-2">
              <p>
                To maintain free access for all citizens without paywalls, {siteConfig.name} may
                display advertisements through verified advertising partners (such as Google
                AdSense).
              </p>
              <p>
                These partners may use standard web cookies to serve contextual advertisements based
                on your visit. You can control or block cookies at any time through your browser
                settings or via Google&apos;s Ad Settings page.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              5. Your Rights as a Data Principal (DPDP Act)
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                Under the DPDP Act, 2023, you have clear legal rights regarding your personal data:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Right to access summaries of personal data processed by us.</li>
                <li>Right to correction and erasure of feedback or reports submitted by you.</li>
                <li>Right to grievance redressal with our designated Data Protection Officer.</li>
                <li>
                  Right to nominate an individual to exercise rights on your behalf in case of death
                  or incapacity.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-h3 text-text font-bold">
              6. Grievance Redressal &amp; Contact Officer
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                If you have questions, concerns, or grievances regarding this Privacy Policy or data
                handling on {siteConfig.name}, please contact our Grievance Officer:
              </p>
              <div className="bg-surface border-border rounded-lg border p-4">
                <p className="text-text font-semibold">Grievance Redressal Desk</p>
                <p className="mt-1 text-xs sm:text-sm">
                  Email:{" "}
                  <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary underline">
                    {siteConfig.contactEmail}
                  </a>
                </p>
                <p className="text-muted mt-1 text-xs">Response Time: Within 7 business days</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
