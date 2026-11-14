import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: `How We Verify Government Guides | ${siteConfig.name}`,
  description:
    "Our rigorous 4-step verification methodology: official government gazettes, timestamped citations, cross-referencing, and 90-day review cycles.",
};

const VERIFICATION_STEPS = [
  {
    step: "01",
    title: "Identify Primary Government Sources",
    summary:
      "We source information exclusively from verified government publications, official Gazette of India notifications, state departments, and authenticated .gov.in / .nic.in portals.",
    details: [
      "Central Ministries (MoRTH for driving licences, MEA for passports, CBDT for PAN, UIDAI for Aadhaar).",
      "Official state portals (e.g., Digital Gujarat, Sarathi Parivahan, Commissioner of Transport).",
      "Statutory Acts & Rules (Central Motor Vehicles Rules 1989, Passports Act 1967, Income Tax Act 1961).",
    ],
  },
  {
    step: "02",
    title: "Record Source URL & Verification Timestamp",
    summary:
      "Every procedural step, required document, and statutory fee is explicitly tagged with the official URL and the exact date it was verified by an editor.",
    details: [
      "Direct deep links to official citizen application portals (no affiliate links, no third-party lead generation).",
      "Exact gazette rule or sub-rule reference cited for every statutory fee amount.",
      "Clear distinction between mandatory government fees, optional courier charges, and zero-fee steps.",
    ],
  },
  {
    step: "03",
    title: "Cross-Reference with Secondary Authority",
    summary:
      "To prevent errors arising from outdated portal pages, our researchers cross-check every requirement against a second official government source.",
    details: [
      "Cross-referencing portal user manuals with published state Citizen Charters.",
      "Verifying actual ground counter requirements at pilot offices (such as Ahmedabad and Surat RTOs).",
      "Consulting official circulars published by state transport commissioners or district collectors.",
    ],
  },
  {
    step: "04",
    title: "Automated 90-Day Re-Verification Cycle",
    summary:
      "Government policies, fees, and digital forms change over time. We enforce an automated freshness review schedule for every guide in our database.",
    details: [
      "Fresh: Re-verified within the last 90 days with active source link verification.",
      "Aging: Flagged automatically by our audit system when last verified between 90 and 180 days ago.",
      "Stale: Any guide older than 180 days triggers automated alert notifications for mandatory editorial re-inspection.",
    ],
  },
];

export default function HowWeVerifyPage() {
  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "How We Verify", href: "/how-we-verify" },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-success-soft text-success border-success/20 mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <span>✓ Verified Editorial Standards</span>
          </div>
          <h1 className="text-h2 text-text sm:text-h1 font-extrabold">How We Verify Information</h1>
          <p className="text-muted mt-2 text-base sm:text-lg">
            Our strict 4-step editorial methodology guarantees that every document checklist,
            statutory fee, and portal link is 100% accurate, up-to-date, and backed by official law.
          </p>
        </div>

        {/* Independent Site Disclaimer Callout */}
        <div className="mb-10">
          <Callout variant="important" title="Independent Civic Resource Disclaimer">
            <p className="text-sm leading-relaxed">
              <strong>{siteConfig.disclaimer.full}</strong>
            </p>
            <p className="text-muted mt-2 text-xs">
              We compile and structure public information so citizens can easily navigate government
              services without hiring third-party middlemen. All actual applications and fee
              payments must be made directly on official government websites.
            </p>
          </Callout>
        </div>

        {/* 4-Step Methodology */}
        <div className="space-y-6">
          <h2 className="text-h3 text-text font-bold">The 4-Step Verification Process</h2>

          <div className="space-y-6">
            {VERIFICATION_STEPS.map((item) => (
              <article
                key={item.step}
                className="rounded-card border-border shadow-soft-sm border bg-white p-6 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="bg-primary-soft text-primary border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-black">
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-h3 text-text text-base font-bold sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-muted mt-2 text-sm leading-relaxed">{item.summary}</p>

                    <div className="bg-surface border-border/70 mt-4 rounded-lg border p-3.5">
                      <span className="text-text text-xs font-semibold tracking-wider uppercase">
                        Verification protocol:
                      </span>
                      <ul className="text-muted mt-2 space-y-1.5 text-xs">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-success font-bold">✓</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Freshness Audit Badges Explainer */}
        <section className="rounded-card border-border shadow-soft-sm mt-12 border bg-white p-6 sm:p-8">
          <h2 className="text-h3 text-text font-bold">Our Freshness Badge System</h2>
          <p className="text-muted mt-2 text-sm">
            Every paperwork guide on our website displays a verification badge showing when the
            content was last checked against the official portal:
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-success/30 bg-success-soft/50 rounded-lg border p-4 text-center">
              <span className="bg-success inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                Fresh (0–90 days)
              </span>
              <p className="text-muted mt-2 text-xs">
                Recently verified against official gazette rules and portal forms.
              </p>
            </div>

            <div className="border-warning/30 bg-warning-soft/50 rounded-lg border p-4 text-center">
              <span className="bg-warning inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                Aging (90–180 days)
              </span>
              <p className="text-muted mt-2 text-xs">
                Scheduled for routine re-inspection by our research team.
              </p>
            </div>

            <div className="border-danger/30 bg-danger-soft/50 rounded-lg border p-4 text-center">
              <span className="bg-danger inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                Needs Update (&gt;180 days)
              </span>
              <p className="text-muted mt-2 text-xs">
                Under active review to check for updated statutory fees or rules.
              </p>
            </div>
          </div>
        </section>

        {/* Community Verification & Report Mistake */}
        <section className="rounded-card border-primary/20 bg-primary-soft/40 mt-10 border p-6 text-center sm:p-8">
          <h2 className="text-h3 text-text font-bold">
            Help Us Keep India Paperwork Guide Accurate
          </h2>
          <p className="text-muted mx-auto mt-2 max-w-lg text-sm">
            Did you recently visit an RTO or apply for a passport and notice a changed requirement
            or fee? Our community of citizens helps keep our guides accurate for everyone.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={`mailto:${siteConfig.contactEmail}?subject=Correction%20Report`}
              variant="primary"
              size="md"
            >
              Submit a Correction
            </Button>
            <Button href="/about" variant="secondary" size="md">
              About Our Mission
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
