import type { Metadata } from "next";
import React from "react";
import { requireAdminSession } from "@/lib/admin/server-auth";
import type { TaskContent } from "@/types/content";
import { GuideEditorForm } from "@/components/admin/editor/GuideEditorForm";

export const metadata: Metadata = {
  title: "Create New Civic Guide | Admin | India Paperwork Guide",
  robots: { index: false, follow: false },
};

const DEFAULT_NEW_GUIDE: TaskContent = {
  slug: "new-civic-guide",
  name: "New Civic Service",
  categorySlug: "identity",
  description: "Official statutory paperwork procedure guide for Indian citizens.",
  national: {
    title: "New Civic Service Application Guide",
    summary:
      "Step-by-step verified instructions for Indian citizens applying for this civic document.",
    estimatedTime: "15–30 days",
    difficulty: "medium",
    status: "DRAFT",
    lastVerifiedAt: new Date().toISOString(),
    verifiedBy: "Civic Editorial Team",
    sourceUrl: "https://india.gov.in",
    steps: [
      {
        stepNumber: 1,
        title: "Submit Online Application on Official Government Portal",
        description:
          "Visit the designated official government portal and complete the prescribed application form.",
        where: "Online Portal",
        estimatedTime: "15 minutes",
        status: "PUBLISHED",
      },
    ],
    documentRequirements: [
      {
        name: "Proof of Identity (Aadhaar / Voter ID / Passport)",
        description: "Official photo identity card issued by the Government of India.",
        requirementType: "required",
        copiesHint: "Original + 1 self-attested photocopy",
        displayOrder: 0,
        status: "PUBLISHED",
      },
    ],
    fees: [
      {
        label: "Statutory Application Fee",
        amount: 100,
        currency: "INR",
        paymentMode: "both",
        isOptional: false,
        rulesReference: "Official Statutory Rules Schedule",
        status: "PUBLISHED",
      },
    ],
    officialLinks: [
      {
        label: "Official National Portal",
        url: "https://india.gov.in",
        isPrimary: true,
        department: "Government of India",
        portalName: "National Portal of India",
        status: "PUBLISHED",
      },
    ],
    faqItems: [
      {
        question: "Who is eligible to apply for this document?",
        answer: "Any resident citizen of India meeting statutory age and residency criteria.",
        displayOrder: 0,
        status: "PUBLISHED",
      },
    ],
    rejectionReasons: [
      {
        title: "Name Mismatch Across Submitted Documents",
        description:
          "Discrepancies in spelling between applicant name on identity and address proofs.",
        solution: "Ensure name spelling matches official government gazette or Aadhaar exactly.",
        status: "PUBLISHED",
      },
    ],
    sourceRefs: [],
  },
  states: {},
};

export default async function AdminNewGuidePage() {
  await requireAdminSession();

  return (
    <div className="py-2">
      <GuideEditorForm initialTask={DEFAULT_NEW_GUIDE} isNew={true} />
    </div>
  );
}
