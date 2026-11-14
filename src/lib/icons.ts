import type { LucideIcon } from "lucide-react";
import {
  IdCard,
  Car,
  Coins,
  Home,
  Users,
  Briefcase,
  GraduationCap,
  HeartPulse,
  FileText,
  Zap,
  Folder,
} from "lucide-react";

export interface CategoryTheme {
  name: string;
  slug: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  identity: {
    name: "Identity",
    slug: "identity",
    icon: IdCard,
    bgColor: "bg-primary-soft",
    textColor: "text-primary",
    borderColor: "border-primary/20",
  },
  vehicles: {
    name: "Vehicles",
    slug: "vehicles",
    icon: Car,
    bgColor: "bg-accent-soft",
    textColor: "text-accent",
    borderColor: "border-accent/30",
  },
  "money-and-tax": {
    name: "Money and Tax",
    slug: "money-and-tax",
    icon: Coins,
    bgColor: "bg-success-soft",
    textColor: "text-success",
    borderColor: "border-success/30",
  },
  property: {
    name: "Property",
    slug: "property",
    icon: Home,
    bgColor: "bg-[#E0F2FE]", // Sky soft
    textColor: "text-[#0284C7]",
    borderColor: "border-[#BAE6FD]",
  },
  family: {
    name: "Family",
    slug: "family",
    icon: Users,
    bgColor: "bg-[#FCE7F3]", // Rose soft
    textColor: "text-[#BE185D]",
    borderColor: "border-[#FBCFE8]",
  },
  business: {
    name: "Business",
    slug: "business",
    icon: Briefcase,
    bgColor: "bg-[#F3E8FF]", // Purple soft
    textColor: "text-[#7E22CE]",
    borderColor: "border-[#E9D5FF]",
  },
  education: {
    name: "Education",
    slug: "education",
    icon: GraduationCap,
    bgColor: "bg-[#FEF3C7]", // Amber soft
    textColor: "text-[#D97706]",
    borderColor: "border-[#FDE68A]",
  },
  health: {
    name: "Health",
    slug: "health",
    icon: HeartPulse,
    bgColor: "bg-[#DCFCE7]", // Emerald soft
    textColor: "text-[#15803D]",
    borderColor: "border-[#BBF7D0]",
  },
  jobs: {
    name: "Jobs",
    slug: "jobs",
    icon: FileText,
    bgColor: "bg-[#E0E7FF]", // Indigo soft
    textColor: "text-[#4338CA]",
    borderColor: "border-[#C7D2FE]",
  },
  utilities: {
    name: "Utilities",
    slug: "utilities",
    icon: Zap,
    bgColor: "bg-[#CFFAFE]", // Cyan soft
    textColor: "text-[#0E7490]",
    borderColor: "border-[#A5F3FC]",
  },
};

const DEFAULT_CATEGORY_THEME: CategoryTheme = {
  name: "General Services",
  slug: "general",
  icon: Folder,
  bgColor: "bg-surface-alt",
  textColor: "text-muted",
  borderColor: "border-border",
};

/**
 * Returns the corresponding category theme and icon by slug or name (case-insensitive).
 */
export function getCategoryTheme(slugOrName: string): CategoryTheme {
  if (!slugOrName) return DEFAULT_CATEGORY_THEME;

  const normalized = slugOrName.toLowerCase().trim().replace(/\s+/g, "-").replace(/&/g, "and");

  if (CATEGORY_THEMES[normalized]) {
    return CATEGORY_THEMES[normalized] as CategoryTheme;
  }

  // Fallback search through keys
  for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
    if (key === normalized || theme.name.toLowerCase() === slugOrName.toLowerCase()) {
      return theme;
    }
  }

  return DEFAULT_CATEGORY_THEME;
}
