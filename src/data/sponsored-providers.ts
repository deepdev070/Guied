export interface SponsoredProviderData {
  id: string;
  name: string;
  category: "notary" | "ca" | "typing_centre" | "legal_writer";
  city: string;
  stateSlug: string;
  phone: string;
  address?: string;
  services: string[];
  startDate: string; // ISO date
  endDate: string; // ISO date
  isActive: boolean;
}

export const SPONSORED_PROVIDERS_SEED: SponsoredProviderData[] = [
  {
    id: "guj-notary-01",
    name: "Shree Ganesh Notary & Affidavit Services",
    category: "notary",
    city: "Ahmedabad",
    stateSlug: "gujarat",
    phone: "+91 98250 12345",
    address: "Near Old City Civil Court, Bhadra, Ahmedabad, Gujarat 380001",
    services: [
      "Notary Stamp & Attestation",
      "Name Change Gazette Affidavit",
      "Lost Document Indemnity Bond",
      "Power of Attorney (POA)",
    ],
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    isActive: true,
  },
  {
    id: "guj-typing-02",
    name: "Patel E-Mitra & Online Form Typing Centre",
    category: "typing_centre",
    city: "Surat",
    stateSlug: "gujarat",
    phone: "+91 98790 54321",
    address: "Opp. Majura Gate Sub-Registrar Office, Ring Road, Surat, Gujarat 395002",
    services: [
      "Sarathi & Parivahan Online Forms",
      "Passport Seva Kendra Appointment",
      "Gujarati to English Translation",
      "Digital Signature (DSC Token)",
    ],
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    isActive: true,
  },
  {
    id: "guj-ca-03",
    name: "Kothari & Associates (Tax & Legal Documentation)",
    category: "ca",
    city: "Vadodara",
    stateSlug: "gujarat",
    phone: "+91 94260 98765",
    address: "Alkapuri Commercial Centre, R.C. Dutt Road, Vadodara, Gujarat 390007",
    services: [
      "PAN Card Rectification / Surrender",
      "Income & Net Worth Certificates",
      "Succession Certificate Advice",
      "GST Registration Assistance",
    ],
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    isActive: true,
  },
];

