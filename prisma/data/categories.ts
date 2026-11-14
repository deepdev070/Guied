export interface CategorySeedData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
  displayOrder: number;
}

export const CATEGORIES_SEED_DATA: CategorySeedData[] = [
  {
    slug: "identity",
    name: "Identity Documents",
    description:
      "Aadhaar card updates, Voter ID (EPIC), PAN cards, and Indian passport procedures.",
    icon: "IdCard",
    bgColor: "bg-primary-soft",
    textColor: "text-primary",
    displayOrder: 1,
  },
  {
    slug: "vehicles",
    name: "Vehicles and Driving",
    description:
      "Learner permits, permanent driving licences, renewal, and vehicle RC ownership transfer.",
    icon: "Car",
    bgColor: "bg-accent-soft",
    textColor: "text-accent",
    displayOrder: 2,
  },
  {
    slug: "money-and-tax",
    name: "Money and Tax",
    description:
      "PAN-Aadhaar linking, income tax e-filing guidance, income certificates, and bank affidavits.",
    icon: "Coins",
    bgColor: "bg-success-soft",
    textColor: "text-success",
    displayOrder: 3,
  },
  {
    slug: "property-and-land",
    name: "Property and Land",
    description:
      "Sale deed registration, 7/12 land records, encumbrance certificates, and mutation.",
    icon: "Home",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0284C7]",
    displayOrder: 4,
  },
  {
    slug: "family-and-certificates",
    name: "Family and Certificates",
    description:
      "Birth, death, and marriage registration, legal name change Gazette, and caste certificates.",
    icon: "Users",
    bgColor: "bg-[#FCE7F3]",
    textColor: "text-[#BE185D]",
    displayOrder: 5,
  },
  {
    slug: "business-and-licences",
    name: "Business and Licences",
    description:
      "GST registration, Udyam MSME certificate, Gumasta Shop & Establishment, and trade licences.",
    icon: "Briefcase",
    bgColor: "bg-[#F3E8FF]",
    textColor: "text-[#7E22CE]",
    displayOrder: 6,
  },
  {
    slug: "education-and-scholarships",
    name: "Education and Scholarships",
    description:
      "Post-matric scholarships, fee reimbursement, caste validity for college, and duplicate marksheets.",
    icon: "GraduationCap",
    bgColor: "bg-[#FEF3C7]",
    textColor: "text-[#D97706]",
    displayOrder: 7,
  },
  {
    slug: "health-and-welfare",
    name: "Health and Welfare",
    description:
      "Ayushman Bharat (PM-JAY) Golden Card, disability UDID cards, and state health schemes.",
    icon: "HeartPulse",
    bgColor: "bg-[#DCFCE7]",
    textColor: "text-[#15803D]",
    displayOrder: 8,
  },
  {
    slug: "jobs-and-pension",
    name: "Jobs and Pension",
    description:
      "EPF advance withdrawal, EPS pension claims, employment exchange, and Senior Citizen Cards.",
    icon: "FileText",
    bgColor: "bg-[#E0E7FF]",
    textColor: "text-[#4338CA]",
    displayOrder: 9,
  },
  {
    slug: "utilities-and-connections",
    name: "Utilities and Connections",
    description:
      "New domestic electricity connections, meter transfer, LPG gas cylinders, and water lines.",
    icon: "Zap",
    bgColor: "bg-[#CFFAFE]",
    textColor: "text-[#0E7490]",
    displayOrder: 10,
  },
];
