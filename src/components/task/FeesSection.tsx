import React from "react";
import type { Fee, FeeCalculatorConfig } from "@/types/content";
import { Callout } from "@/components/ui/Callout";
import { IndianRupee, ExternalLink, ShieldCheck } from "lucide-react";
import { FeeCalculator } from "./FeeCalculator";

export interface FeesSectionProps {
  fees: Fee[];
  feeCalculator?: FeeCalculatorConfig;
}

export function FeesSection({ fees, feeCalculator }: FeesSectionProps) {
  const mandatoryFees = fees.filter((f) => !f.isOptional);
  const totalMandatory = mandatoryFees.reduce((acc, f) => acc + f.amount, 0);

  return (
    <section id="fees" aria-labelledby="fees-heading" className="my-12 scroll-mt-28">
      <div className="border-border/80 mb-6 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-baseline">
        <div>
          <h2 id="fees-heading" className="text-h2 text-text font-bold tracking-tight">
            Official Statutory Fees
          </h2>
          <p className="text-small text-muted mt-1">
            Exact government gazette rates. Never pay unreceipted cash or middleman commissions.
          </p>
        </div>

        <div className="bg-success-soft text-success flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Statutory Total: ₹{totalMandatory.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Amber Callout: Beware of agents charging extra */}
      <Callout
        variant="warning"
        title="Beware of agents charging extra commissions"
        className="mb-6"
      >
        The official statutory fee mandated by the Ministry gazette is{" "}
        <strong>₹{totalMandatory.toLocaleString("en-IN")}</strong>. Private touts and cyber cafe
        agents often demand ₹1,500 – ₹3,000 for this routine service. Always demand an official
        computerized government receipt for every rupee paid.
      </Callout>

      {/* Interactive Fee Calculator (if task has variable options) */}
      {feeCalculator && <FeeCalculator config={feeCalculator} className="mb-6" />}

      {/* 1. Mobile Stacked Cards (Visible under 640px) */}
      <div className="space-y-3 sm:hidden" role="region" aria-label="Fees list for mobile">
        {fees.map((fee, idx) => (
          <div
            key={`mobile-fee-${fee.label}-${idx}`}
            className="rounded-card border-border bg-background shadow-soft-xs border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-body text-text font-bold">{fee.label}</h3>
                <span className="text-muted text-xs font-medium">
                  {fee.isOptional ? "Optional / Tatkaal service" : "All standard applicants"}
                </span>
              </div>
              <span className="text-text inline-flex items-center text-base font-bold">
                <IndianRupee className="text-success h-4 w-4" aria-hidden="true" />
                <span>{fee.amount.toLocaleString("en-IN")}</span>
              </span>
            </div>

            <div className="border-border/60 mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
              <span className="text-muted">
                {fee.paymentMode === "online"
                  ? "Online portal payment"
                  : fee.paymentMode === "counter"
                    ? "Cash / POS at counter"
                    : "Online UPI / NetBanking / Debit Card"}
              </span>

              {fee.sourceUrl && (
                <a
                  href={fee.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-semibold"
                >
                  <span>Gazette Rule</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Mobile Total Row */}
        <div className="rounded-card border-success/30 bg-success-soft/30 flex items-center justify-between border p-4">
          <span className="text-text text-sm font-bold">Total Statutory Fee</span>
          <span className="text-text inline-flex items-center text-lg font-black">
            <IndianRupee className="text-success h-5 w-5" aria-hidden="true" />
            <span>{totalMandatory.toLocaleString("en-IN")}</span>
          </span>
        </div>
      </div>

      {/* 2. Desktop & Tablet Structured Table (Visible 640px and above) */}
      <div className="rounded-card border-border bg-background shadow-soft-xs hidden overflow-hidden border sm:block">
        <table className="w-full text-left text-sm" role="table">
          <thead className="border-border bg-surface-alt/70 text-muted border-b text-xs uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Fee Component
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Who Pays
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                How to Pay
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Official Gazette
              </th>
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {fees.map((fee, idx) => (
              <tr
                key={`desktop-fee-${fee.label}-${idx}`}
                className="hover:bg-surface-alt/30 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="text-text font-semibold">{fee.label}</div>
                  {fee.rulesReference && (
                    <span className="text-muted block text-xs">{fee.rulesReference}</span>
                  )}
                </td>
                <td className="text-muted px-4 py-3.5 text-xs">
                  {fee.isOptional ? (
                    <span className="bg-accent-soft text-warning rounded-full px-2 py-0.5 text-[10px] font-bold">
                      Optional / Tatkaal
                    </span>
                  ) : (
                    <span>All applicants</span>
                  )}
                </td>
                <td className="text-text px-4 py-3.5 font-bold whitespace-nowrap">
                  <span className="inline-flex items-center">
                    <IndianRupee className="text-success inline h-3.5 w-3.5" aria-hidden="true" />
                    <span>{fee.amount.toLocaleString("en-IN")}</span>
                  </span>
                </td>
                <td className="text-muted px-4 py-3.5 text-xs">
                  {fee.paymentMode === "online"
                    ? "Online portal payment"
                    : fee.paymentMode === "counter"
                      ? "Cash / Card at counter"
                      : "Online (UPI / NetBanking / Debit Card)"}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  {fee.sourceUrl ? (
                    <a
                      href={fee.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-xs font-medium"
                    >
                      <span>Gazette Citation</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-muted text-xs">Government Gazette</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Bold Total Row at Bottom */}
          <tfoot className="border-border bg-surface-alt/80 border-t">
            <tr>
              <th scope="row" colSpan={2} className="text-text px-4 py-3.5 text-sm font-bold">
                Total Statutory Fee (Standard Application)
              </th>
              <td colSpan={3} className="text-text px-4 py-3.5 text-base font-black">
                <span className="inline-flex items-center">
                  <IndianRupee className="text-success inline h-4 w-4" aria-hidden="true" />
                  <span>{totalMandatory.toLocaleString("en-IN")}</span>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
