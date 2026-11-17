import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { sanitizeText, sanitizeEmail } from "./sanitize.ts";

export interface PartnerCategoryInfo {
  id: "ca_tax" | "notary_legal" | "csc_eseva" | "typing_cyber" | "other";
  name: string;
  shortTitle: string;
  badge: string;
  description: string;
  whoCanApply: string;
  commonServices: string[];
  credentialRequired: string;
}

export const PARTNER_CATEGORIES: PartnerCategoryInfo[] = [
  {
    id: "ca_tax",
    name: "Chartered Accountants & Tax Consultants",
    shortTitle: "CA & Tax Offices",
    badge: "Tax & Compliance",
    description:
      "Assist citizens and micro-entrepreneurs with PAN, TAN, GST registrations, Udhyam / MSME certificates, ITR filings, and business compliances.",
    whoCanApply:
      "ICAI Members, Certified Tax Return Preparers (TRP), Advocates enrolled with Bar Council.",
    commonServices: [
      "PAN Card & TAN Registration",
      "GST New Registration & Amendments",
      "Udhyam / MSME Certificate",
      "Income Tax Return (ITR) Filing",
      "Shop & Establishment (Gumasta) License",
    ],
    credentialRequired:
      "ICAI Membership Number, TRP Registration No., or Bar Council Enrolment No.",
  },
  {
    id: "notary_legal",
    name: "Notaries & Legal Document Drafters",
    shortTitle: "Notaries & Drafters",
    badge: "Legal & Attestation",
    description:
      "Provide physical stamp paper, legal affidavits, name change declarations, deed drafting, annexures, and formal oath attestation for civic procedures.",
    whoCanApply:
      "Central or State Government appointed Notaries Public, Oath Commissioners, Licensed Deed Writers.",
    commonServices: [
      "Affidavit on Non-Judicial Stamp Paper",
      "Annexure-E / Annexure-F for Passport",
      "Gazette Name Change Declarations",
      "Rental Agreements & Proof of Address Deeds",
      "True Copy Document Notarisation",
    ],
    credentialRequired: "Government Notary Registration Number and State Gazette Notification.",
  },
  {
    id: "csc_eseva",
    name: "CSC, Jan Seva Kendra & E-Seva Centres",
    shortTitle: "CSC / E-Seva Kendras",
    badge: "Government Services",
    description:
      "Authorized grassroots village and ward-level digital kiosks helping citizens fill online forms, verify biometrics, and print civic certificates.",
    whoCanApply:
      "CSC Village Level Entrepreneurs (VLEs), Gujarat Jan Seva Kendra operators, Maha e-Seva operators.",
    commonServices: [
      "Aadhaar Demographic Address Update",
      "Ration Card KYC & Member Addition",
      "Income & Caste Certificate Applications",
      "PM-KISAN / Ayushman Card Enrollment",
      "Electricity & Water Bill Utility Payments",
    ],
    credentialRequired:
      "Valid CSC ID / VLE ID or District Collector Jan Seva Kendra Authorization.",
  },
  {
    id: "typing_cyber",
    name: "Typing Centres & Online Cyber Cafes",
    shortTitle: "Typing & Online Cafes",
    badge: "Digital Assist",
    description:
      "Physical desktop assist desks helping citizens who lack smartphones, computers, or printers to scan original documents, fill Sarathi/Parivahan forms, and book RTO slots.",
    whoCanApply:
      "Commercial typing bureaus, DTP operators, cyber cafes with valid local municipality trade licenses.",
    commonServices: [
      "Parivahan / Sarathi Driving Licence Form Entry",
      "Passport Seva Application & Slot Booking",
      "Document Scanning to PDF (< 200 KB) for Portals",
      "Regional Language Typing (Gujarati / Hindi)",
      "High-Resolution Colour Printouts & Lamination",
    ],
    credentialRequired: "Local Municipality Trade License or Shop & Establishment Registration.",
  },
];

export interface RateCardTier {
  id: "basic_directory" | "verified_partner" | "spotlight_network";
  name: string;
  priceFormatted: string;
  period: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export const RATE_CARD_TIERS: RateCardTier[] = [
  {
    id: "basic_directory",
    name: "Local Center Directory Listing",
    priceFormatted: "₹0",
    period: "Free forever",
    tagline: "Essential local discoverability for verified grassroots kiosks and typing centers.",
    features: [
      "Inclusion in District & Taluka Center Directory",
      "Physical shop address, Google Map pin, and business hours",
      "Official government VLE / Registration ID verified mark",
      "Direct phone and WhatsApp contact number displayed",
      "Standard civic service category tags",
    ],
  },
  {
    id: "verified_partner",
    name: "Verified District Partner",
    priceFormatted: "₹499",
    period: "per month",
    isPopular: true,
    badge: "Most Popular",
    tagline: "Recommended for active CA offices, notaries, and busy urban Jan Seva Kendras.",
    features: [
      "All features of Free Directory Listing",
      "Verified Partner Shield on District Guide Sidebars",
      "Direct 'Book Assistance on WhatsApp' one-tap CTA button",
      "Highlighted position above standard unverified shops",
      "Monthly performance report (citizen views and clicks)",
      "Listing up to 2 distinct physical locations in the district",
    ],
  },
  {
    id: "spotlight_network",
    name: "Tehsil Spotlight Network",
    priceFormatted: "₹1,499",
    period: "per month",
    badge: "High Visibility",
    tagline: "For established civic service firms and multi-branch documentation centers.",
    features: [
      "All features of Verified District Partner",
      "Exclusive spotlight banner on 5 relevant task guides in your district",
      "Coverage across up to 5 branch locations / talukas",
      "Priority customer inquiry routing via dedicated partner portal",
      "Featured badge: 'Top Rated Documentation Center'",
      "Dedicated account onboarding support via WhatsApp",
    ],
  },
];

export const EDITORIAL_SEPARATION_PRINCIPLES = [
  {
    title: "100% Editorial Independence",
    description:
      "Our document checklists, statutory fees, eligibility criteria, and step-by-step procedures are strictly editorial. They are verified directly from official .gov.in and .nic.in gazette notifications and can never be modified, influenced, or purchased by any partner or advertiser.",
  },
  {
    title: "Mandatory Credential Verification",
    description:
      "We do not list unverified touts, middlemen, or unofficial agents. Every listing must present a valid government VLE ID, Bar Council Notary license, ICAI membership number, or municipal trade registration before going live.",
  },
  {
    title: "Clear Sponsored Labelling",
    description:
      "Citizens will always see distinct visual labels ('Sponsored Partner' or 'Verified Local Center'). Directory listings are physically separated from government step-by-step instructions so citizens never confuse official requirements with private commercial services.",
  },
  {
    title: "Strict Citizen Grievance & Delisting Policy",
    description:
      "Partners must charge fair, transparent service fees for physical assistance and must never misrepresent official government statutory fees. Any verified complaint of misrepresentation or illegal facilitation results in immediate and permanent delisting.",
  },
];

export const GUJARAT_DISTRICTS = [
  "Ahmedabad",
  "Amreli",
  "Anand",
  "Aravalli",
  "Banaskantha",
  "Bharuch",
  "Bhavnagar",
  "Botad",
  "Chhota Udaipur",
  "Dahod",
  "Dang",
  "Devbhoomi Dwarka",
  "Gandhinagar",
  "Gir Somnath",
  "Jamnagar",
  "Junagadh",
  "Kheda",
  "Kutch",
  "Mahisagar",
  "Mehsana",
  "Morbi",
  "Narmada",
  "Navsari",
  "Panchmahal",
  "Patan",
  "Porbandar",
  "Rajkot",
  "Sabarkantha",
  "Surat",
  "Surendranagar",
  "Tapi",
  "Vadodara",
  "Valsad",
];

export const PartnerEnquiryInputSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business or Center name must be at least 2 characters")
    .max(120, "Name is too long"),
  category: z.enum(["ca_tax", "notary_legal", "csc_eseva", "typing_cyber", "other"], {
    errorMap: () => ({ message: "Please select a valid partner category" }),
  }),
  contactPerson: z
    .string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
  email: z.string().email("Please enter a valid email address"),
  state: z.string().min(2).max(50).default("Gujarat"),
  district: z.string().min(2, "Please select or specify your district").max(60),
  address: z.string().max(250).optional().nullable(),
  registrationNumber: z
    .string()
    .min(3, "Please provide your professional registration or CSC/VLE ID number")
    .max(80),
  plan: z
    .enum(["basic_directory", "verified_partner", "spotlight_network", "undecided"])
    .default("verified_partner"),
  notes: z.string().max(1000).optional().nullable(),
  honeypot: z.string().max(100).optional().nullable(),
});

export type PartnerEnquiryInput = z.infer<typeof PartnerEnquiryInputSchema>;

export interface PartnerEnquiryRecord extends PartnerEnquiryInput {
  id: string;
  createdAt: string;
  status: "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
}

const AUDIT_DIR = path.resolve(process.cwd(), ".audit");
const ENQUIRIES_FILE = path.join(AUDIT_DIR, "partner-enquiries.jsonl");

export async function savePartnerEnquiry(
  input: PartnerEnquiryInput
): Promise<PartnerEnquiryRecord> {
  const cleanInput: PartnerEnquiryInput = {
    businessName: sanitizeText(input.businessName),
    category: input.category,
    contactPerson: sanitizeText(input.contactPerson),
    phone: input.phone.trim(),
    email: sanitizeEmail(input.email) || input.email.trim().toLowerCase(),
    state: sanitizeText(input.state || "Gujarat"),
    district: sanitizeText(input.district),
    address: input.address ? sanitizeText(input.address) : null,
    registrationNumber: sanitizeText(input.registrationNumber),
    plan: input.plan,
    notes: input.notes ? sanitizeText(input.notes) : null,
    honeypot: input.honeypot || null,
  };

  const id = `PARTNER-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const record: PartnerEnquiryRecord = {
    ...cleanInput,
    id,
    createdAt: new Date().toISOString(),
    status: "PENDING_REVIEW",
  };

  try {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
    fs.appendFileSync(ENQUIRIES_FILE, JSON.stringify(record) + "\n", "utf-8");
  } catch (err) {
    console.warn("[Partners] Failed to write to .audit/partner-enquiries.jsonl:", err);
  }

  return record;
}
