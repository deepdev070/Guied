"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PARTNER_CATEGORIES,
  RATE_CARD_TIERS,
  GUJARAT_DISTRICTS,
  type PartnerEnquiryInput,
} from "@/lib/partners";
import { Button } from "@/components/ui/Button";

export function PartnerEnquiryForm() {
  const [formData, setFormData] = useState<PartnerEnquiryInput>({
    businessName: "",
    category: "csc_eseva",
    contactPerson: "",
    phone: "",
    email: "",
    state: "Gujarat",
    district: "Ahmedabad",
    address: "",
    registrationNumber: "",
    plan: "verified_partner",
    notes: "",
    honeypot: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successResult, setSuccessResult] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/partners/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues && Array.isArray(data.issues)) {
          const errorsMap: Record<string, string> = {};
          data.issues.forEach((issue: { path: string[]; message: string }) => {
            const field = issue.path[0];
            if (field) errorsMap[field] = issue.message;
          });
          setFieldErrors(errorsMap);
          setErrorMessage(data.error || "Please review the highlighted fields below.");
        } else {
          setErrorMessage(data.error || "Failed to submit enquiry. Please try again.");
        }
        return;
      }

      setSuccessResult({
        referenceId: data.referenceId || "PARTNER-CONFIRMED",
        message: data.message || "Enquiry submitted successfully.",
      });
    } catch {
      setErrorMessage("Network error. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
          Enquiry ID: {successResult.referenceId}
        </span>

        <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
          Listing Application Received!
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-700">
          {successResult.message}
        </p>

        {/* Onboarding Timeline */}
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-emerald-200 bg-white p-4 text-left shadow-xs">
          <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
            What Happens Next:
          </h4>
          <ol className="mt-2.5 space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                1
              </span>
              <span>
                <strong>Credential Verification:</strong> Desk checks your professional ID / CSC
                license against state registry.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                2
              </span>
              <span>
                <strong>WhatsApp Confirmation:</strong> We send you a preview link of your center
                card on WhatsApp.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                3
              </span>
              <span>
                <strong>Listing Activation:</strong> Your center goes live on the district directory
                and guide sidebars.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => {
              setSuccessResult(null);
              setFormData({
                businessName: "",
                category: "csc_eseva",
                contactPerson: "",
                phone: "",
                email: "",
                state: "Gujarat",
                district: "Ahmedabad",
                address: "",
                registrationNumber: "",
                plan: "verified_partner",
                notes: "",
                honeypot: "",
              });
            }}
          >
            Submit Another Center
          </Button>
          <Button href="/" variant="primary" size="md">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">List Your Local Service Center</h3>
        <p className="mt-1 text-sm text-slate-600">
          Reach citizens in your district who need physical paperwork, attestation, or online filing
          support.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {/* Row 1: Business Name & Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="partner-businessName"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Center / Business Name <span className="text-red-600">*</span>
          </label>
          <input
            id="partner-businessName"
            name="businessName"
            type="text"
            required
            value={formData.businessName}
            onChange={handleChange}
            placeholder="E.g., Shubh Jan Seva Kendra / Patel & Associates CA"
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          />
          {fieldErrors.businessName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.businessName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="partner-category"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Service Category <span className="text-red-600">*</span>
          </label>
          <select
            id="partner-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          >
            {PARTNER_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.shortTitle})
              </option>
            ))}
            <option value="other">Other Civic / Documentation Service</option>
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
          )}
        </div>
      </div>

      {/* Row 2: Contact Person, Phone, Email */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="partner-contactPerson"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Contact Person Name <span className="text-red-600">*</span>
          </label>
          <input
            id="partner-contactPerson"
            name="contactPerson"
            type="text"
            required
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="E.g., Ramesh Patel"
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          />
          {fieldErrors.contactPerson && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.contactPerson}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="partner-phone"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            10-Digit Mobile / WhatsApp <span className="text-red-600">*</span>
          </label>
          <input
            id="partner-phone"
            name="phone"
            type="tel"
            maxLength={10}
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 font-mono text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          />
          {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label
            htmlFor="partner-email"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            id="partner-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="office@example.com"
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>
      </div>

      {/* Row 3: State & District */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="partner-state"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            State <span className="text-red-600">*</span>
          </label>
          <select
            id="partner-state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          >
            <option value="Gujarat">Gujarat (ગુજરાત) — Launch State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Other">Other State / All India</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="partner-district"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            District / City <span className="text-red-600">*</span>
          </label>
          {formData.state === "Gujarat" ? (
            <select
              id="partner-district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
            >
              {GUJARAT_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="partner-district"
              name="district"
              type="text"
              required
              value={formData.district}
              onChange={handleChange}
              placeholder="E.g., Mumbai Suburban / Jaipur"
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
            />
          )}
          {fieldErrors.district && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>
          )}
        </div>
      </div>

      {/* Row 4: Professional ID / Registration Number & Plan Interest */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="partner-registrationNumber"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Government / Professional Registration No. <span className="text-red-600">*</span>
          </label>
          <input
            id="partner-registrationNumber"
            name="registrationNumber"
            type="text"
            required
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="E.g. CSC ID: 123456789012, ICAI M.No: 123456, or Notary Reg No"
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Used exclusively by our civic desk to verify authenticity against government
            directories.
          </p>
          {fieldErrors.registrationNumber && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.registrationNumber}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="partner-plan"
            className="mb-1.5 block text-xs font-semibold text-slate-900"
          >
            Listing Tier Interest <span className="text-red-600">*</span>
          </label>
          <select
            id="partner-plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
          >
            {RATE_CARD_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} — {tier.priceFormatted} ({tier.period})
              </option>
            ))}
            <option value="undecided">Undecided / Discuss with Civic Team</option>
          </select>
          {fieldErrors.plan && <p className="mt-1 text-xs text-red-600">{fieldErrors.plan}</p>}
        </div>
      </div>

      {/* Row 5: Physical Address */}
      <div>
        <label
          htmlFor="partner-address"
          className="mb-1.5 block text-xs font-semibold text-slate-900"
        >
          Center Physical Address <span className="font-normal text-slate-400">(Optional)</span>
        </label>
        <input
          id="partner-address"
          name="address"
          type="text"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="Shop / Office No, Building Name, Near Landmark, Taluka"
          className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
        />
      </div>

      {/* Row 6: Additional Message */}
      <div>
        <label
          htmlFor="partner-notes"
          className="mb-1.5 block text-xs font-semibold text-slate-900"
        >
          Services Offered or Special Notes{" "}
          <span className="font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          id="partner-notes"
          name="notes"
          rows={3}
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="E.g., We have biometric iris scanner for Aadhaar updates and offer Gujarati typing service..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:outline-none"
        />
      </div>

      {/* Honeypot Spam Prevention */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="partner-honeypot">Leave empty</label>
        <input
          id="partner-honeypot"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.honeypot || ""}
          onChange={handleChange}
        />
      </div>

      {/* Editorial Declaration Checkbox Note */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>
            <strong>Editorial Standard:</strong> Submitting this listing confirms that your center
            agrees to maintain clear, published rates for physical assistance and never charges
            illegal surcharges over government statutory fees. Editorial guide content remains 100%
            independent.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <Link href="/about" className="text-xs text-slate-500 hover:text-slate-800">
          Learn how we verify
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[180px]"
        >
          {isSubmitting ? "Submitting Enquiry..." : "Submit Listing Enquiry"}
        </Button>
      </div>
    </form>
  );
}
