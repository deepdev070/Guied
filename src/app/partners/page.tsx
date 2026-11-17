import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  PARTNER_CATEGORIES,
  RATE_CARD_TIERS,
  EDITORIAL_SEPARATION_PRINCIPLES,
} from "@/lib/partners";
import { PartnerEnquiryForm } from "@/components/partners/PartnerEnquiryForm";

export const metadata: Metadata = {
  title: `Local Partners & Center Directory Listings | ${siteConfig.name}`,
  description:
    "How CA offices, notaries, CSC/Jan Seva Kendras, and typing centres can list their services for citizens needing paperwork help. Clear separation between editorial guides and partner listings.",
  openGraph: {
    title: `Partner with India Paperwork Guide — Local Center Listings`,
    description:
      "Connect with citizens in Gujarat and across India who need assistance with document drafting, attestation, CSC services, and portal filing.",
    url: `${siteConfig.baseUrl}/partners`,
  },
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Local Partners", href: "/partners" },
            ]}
          />
        </div>

        {/* Hero Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-[#003366] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#003366]" />
            Local Civic Partner Directory
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Help Citizens In Your District Complete Their Paperwork
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Every day, thousands of Indian citizens read our step-by-step guides for driving
            licences, passports, property registration, and government certificates. Many need
            in-person support from Chartered Accountants, Notaries, CSC, Jan Seva Kendras, and
            Typing centres: legal stamp paper, notary attestation, document scanning, or assisted
            online form entry. List your verified center to connect with local citizens who need
            your skills.
          </p>
        </div>

        {/* MANDATORY EDITORIAL SEPARATION NOTICE (Prompt 146 Invariant) */}
        <section
          aria-labelledby="editorial-separation-heading"
          className="mb-12 rounded-2xl border-2 border-[#003366]/20 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003366]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2
                  id="editorial-separation-heading"
                  className="text-lg font-bold text-slate-900 sm:text-xl"
                >
                  Strict Editorial Separation: Public Truth First
                </h2>
                <p className="text-xs text-slate-500">
                  Our civic covenant between editorial independence and local business listings.
                </p>
              </div>
            </div>
            <span className="self-start rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-semibold text-slate-700 sm:self-center">
              ISO / Editorial Integrity Policy
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {EDITORIAL_SEPARATION_PRINCIPLES.map((principle, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-xs font-bold text-[#003366]">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{principle.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <strong>Citizen Protection Notice:</strong> Sponsored partners do not have
            administrative access to edit guides, adjust statutory fees, or alter document
            checklists. If you encounter any listed partner misrepresenting statutory government
            fees, please report them immediately via our{" "}
            <Link href="/report-mistake" className="font-semibold text-[#003366] underline">
              Mistake & Grievance Desk
            </Link>
            .
          </div>
        </section>

        {/* Four Partner Categories */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Who Can List In The Local Center Directory?
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              We welcome verified civic practitioners and service desks serving Indian citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PARTNER_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors hover:border-[#003366]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#003366]">
                    {category.badge}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Category: {category.id}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">{category.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {category.description}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
                  <div className="font-semibold text-slate-800">Common Civic Services:</div>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {category.commonServices.map((srv, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">✓</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Verification Required: </span>
                  {category.credentialRequired}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rate Card Placeholders Section (Prompt 146 requirement) */}
        <section className="mb-12">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-bold tracking-wider text-slate-800 uppercase">
              Transparent Pricing
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Rate Card & Listing Tiers
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Clear, transparent monthly rates. No hidden commissions, no lead fees, and zero
              lock-in contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {RATE_CARD_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  tier.isPopular
                    ? "border-[#003366] bg-white shadow-md ring-2 ring-[#003366]/20"
                    : "border-slate-200 bg-white shadow-xs"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-6 rounded-full bg-[#003366] px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{tier.tagline}</p>

                  <div className="mt-4 flex items-baseline gap-1.5 border-b border-slate-100 pb-4">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {tier.priceFormatted}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/ {tier.period}</span>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <a
                    href="#enquiry-form"
                    className={`block w-full rounded-lg px-4 py-2.5 text-center text-xs font-bold transition-colors ${
                      tier.isPopular
                        ? "bg-[#003366] text-white hover:bg-[#002244]"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    Select {tier.name}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            * Introductory launch rates for Gujarat state pilot. Listing does not imply government
            endorsement or affiliation.
          </p>
        </section>

        {/* Enquiry Form Section */}
        <section id="enquiry-form" className="mb-12">
          <PartnerEnquiryForm />
        </section>

        {/* Frequently Asked Questions */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
            Frequently Asked Questions for Local Partners
          </h2>
          <div className="space-y-4 divide-y divide-slate-100 text-xs text-slate-700 sm:text-sm">
            <div className="pt-3 first:pt-0">
              <h3 className="font-bold text-slate-900">
                Can paying for a partner listing modify the documents or fees listed on a guide?
              </h3>
              <p className="mt-1 text-slate-600">
                Never. Our editorial team maintains an absolute wall between guide contents and
                partner listings. Statutory government fees, required official forms, and
                eligibility rules come directly from official gazettes and can never be altered by
                sponsors.
              </p>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-slate-900">
                How do you verify my center before listing?
              </h3>
              <p className="mt-1 text-slate-600">
                Our team checks your registration number (ICAI membership for CAs, Notary serial
                number for advocates, CSC ID / VLE number for CSC centers, or Shop Act licence for
                cyber cafes) against official registries. We also verify your physical address and
                business phone number via WhatsApp.
              </p>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-slate-900">
                How quickly does my listing appear after enquiry submission?
              </h3>
              <p className="mt-1 text-slate-600">
                Typically within 24 to 48 working hours. Once our verification desk approves your
                credentials, we send you a preview link and activate your directory placement.
              </p>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-slate-900">
                Can citizens review or complain about a partner center?
              </h3>
              <p className="mt-1 text-slate-600">
                Yes. Citizens can report any discrepancy through our feedback portal. If any partner
                is found overcharging beyond their disclosed rates or misrepresenting government
                rules, their listing is removed immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
