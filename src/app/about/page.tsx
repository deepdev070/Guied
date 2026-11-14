import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `About Us & Mission | ${siteConfig.name}`,
  description:
    "Learn about India Paperwork Guide, our independent civic mission to make government procedures, statutory fees, and document checklists clear and accessible to every citizen.",
};

export default function AboutPage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "About", href: "/about" },
            ]}
          />
        </div>

        {/* Hero Heading */}
        <div className="mb-8">
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">About {siteConfig.name}</h1>
          <p className="text-muted mt-2 text-base sm:text-lg">
            An independent, open-access public resource simplifying Indian government paperwork,
            statutory fees, and official procedures for everyday citizens.
          </p>
        </div>

        {/* Mandatory Government Disclaimer Callout */}
        <div className="mb-10">
          <Callout variant="warning" title="Important: Independent Information Website">
            <p className="text-sm leading-relaxed">
              <strong>{siteConfig.disclaimer.full}</strong>
            </p>
            <p className="text-muted mt-2 text-xs">
              We never charge citizens for access, we do not ask for login credentials or payment
              details, and we do not act as agents or touts. Official applications must always be
              submitted directly on official portals ending in{" "}
              <code className="bg-surface-alt rounded px-1 py-0.5 font-mono font-semibold">
                .gov.in
              </code>{" "}
              or{" "}
              <code className="bg-surface-alt rounded px-1 py-0.5 font-mono font-semibold">
                .nic.in
              </code>
              .
            </p>
          </Callout>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-10">
          {/* Mission Section */}
          <section className="rounded-card border-border shadow-soft-sm border bg-white p-6 sm:p-8">
            <h2 className="text-h3 text-text font-bold">Our Civic Mission</h2>
            <div className="text-muted mt-4 space-y-4 text-sm leading-relaxed sm:text-base">
              <p>
                Every year, hundreds of millions of Indian citizens visit government
                offices—Regional Transport Offices (RTO), Passport Seva Kendras (PSK), Tehsildar
                offices, and municipal corporations—only to be turned away because they were missing
                a single photocopy, brought the wrong address proof, or were unaware of the official
                statutory fee.
              </p>
              <p>
                This information vacuum allows touts and unlicensed middlemen to overcharge citizens
                by 5x to 10x the statutory government fees.
              </p>
              <p>
                <strong>{siteConfig.name}</strong> was created to solve this problem. Our goal is
                simple:{" "}
                <em className="text-text font-medium">
                  Know exactly what documents, photos, forms, and fees you need before you step foot
                  in any government office or apply online.
                </em>
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <div className="bg-primary-soft text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                ✓
              </div>
              <h3 className="text-text text-base font-bold">100% Verified Sources</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                Every fee amount, rule reference, and document requirement is cited directly from
                official Gazette notifications, the Motor Vehicles Act, Passport Rules, or official{" "}
                <code>.gov.in</code> circulars.
              </p>
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <div className="bg-success-soft text-success mb-3 flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                ₹
              </div>
              <h3 className="text-text text-base font-bold">Statutory Fee Transparency</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                We clearly separate statutory government fees from optional courier or SMS charges,
                warning citizens against paying commission or bribes to unauthorized intermediaries.
              </p>
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <div className="bg-accent-soft text-accent mb-3 flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                📖
              </div>
              <h3 className="text-text text-base font-bold">Class 8 Reading Level</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                Complex legal regulations are translated into plain, actionable language that any
                first-time applicant can easily follow without confusion.
              </p>
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <div className="bg-surface-alt text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                ★
              </div>
              <h3 className="text-text text-base font-bold">State Specific Personalization</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                Indian public services differ across states. We personalize procedures, portal
                links, and regional requirements per state, with Gujarat as our launch focus.
              </p>
            </div>
          </section>

          {/* Verification Protocol Link */}
          <section className="rounded-card border-primary/20 bg-primary-soft/40 border p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-h3 text-text font-bold">How We Verify Information</h2>
                <p className="text-muted mt-1 text-xs sm:text-sm">
                  Read our strict 4-step verification protocol, 90-day review cycles, and how we
                  audit every single government link and fee.
                </p>
              </div>
              <Button href="/how-we-verify" variant="primary" size="md" className="shrink-0">
                Read Verification Process
              </Button>
            </div>
          </section>

          {/* Editorial Independence & Advertising Ethics */}
          <section className="rounded-card border-border shadow-soft-sm border bg-white p-6 sm:p-8">
            <h2 className="text-h3 text-text font-bold">Editorial Independence & Funding</h2>
            <div className="text-muted mt-4 space-y-3 text-sm leading-relaxed">
              <p>
                To keep this service 100% free for all Indian citizens without paywalls or mandatory
                sign-ins, {siteConfig.name} is supported by privacy-respecting online advertising.
              </p>
              <p>
                <strong>Our Editorial Promise:</strong> Advertisers and sponsors have zero influence
                over our checklists, requirements, fees, or procedural guidance. We do not accept
                paid placements from visa agents, driving schools, or legal brokers. Every official
                link points strictly to authenticated government portals.
              </p>
            </div>
          </section>

          {/* Team Placeholder */}
          <section className="rounded-card border-border shadow-soft-sm border bg-white p-6 sm:p-8">
            <h2 className="text-h3 text-text font-bold">Our Team & Contributors</h2>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              We are an independent group of civic technologists, public policy researchers, and
              open data enthusiasts based across India. We believe that public paperwork should be
              accessible, transparent, and dignity-affirming for every citizen.
            </p>
            <div className="text-text mt-6 flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="bg-surface-alt border-border rounded-full border px-3 py-1.5">
                Civic Research Team
              </span>
              <span className="bg-surface-alt border-border rounded-full border px-3 py-1.5">
                Legal & Gazette Analysts
              </span>
              <span className="bg-surface-alt border-border rounded-full border px-3 py-1.5">
                Open Source Engineers
              </span>
            </div>
          </section>

          {/* Contact & Feedback */}
          <section className="rounded-card border-border shadow-soft-sm border bg-white p-6 text-center sm:p-8">
            <h2 className="text-h3 text-text font-bold">Found an Outdated Fee or Step?</h2>
            <p className="text-muted mx-auto mt-2 max-w-lg text-sm">
              Government rules update frequently. If you notice a fee change, modified requirement,
              or broken portal link, please let us know so we can update it immediately.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button href={`mailto:${siteConfig.contactEmail}`} variant="primary" size="md">
                Contact Editorial Team
              </Button>
              <Button href="/how-we-verify" variant="secondary" size="md">
                Verification Protocol
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
