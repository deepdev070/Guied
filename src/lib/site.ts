export const siteConfig = {
  name: "India Paperwork Guide",
  shortName: "Paperwork Guide",
  version: "0.1.0",
  tagline: "Clear, step-by-step paperwork help for Indian citizens",
  description:
    "Find exact document checklists, honest fee breakdowns, step-by-step instructions, and direct official portal links for everyday government services across all Indian states.",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultLocale: "en" as const,
  supportedLocales: [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
    { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  ] as const,
  contactEmail: "contact@indiapaperworkguide.in",
  socialLinks: {
    twitter: "https://x.com/indiapaperwork",
    github: "https://github.com/indiapaperworkguide",
  },
  disclaimer: {
    short:
      "Notice: This website is an independent informational guide. It is not affiliated with, endorsed by, or connected to any government department or official authority.",
    full: "This website is an independent informational resource. It is not an official government website and is not affiliated with, endorsed by, authorized by, or connected to any government agency, ministry, or department. All procedures, documents, fees, and requirements are compiled for informational purposes and verified against official government portals.",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const siteName = siteConfig.name;
export const siteTagline = siteConfig.tagline;
export const siteBaseUrl = siteConfig.baseUrl;
export const defaultLocale = siteConfig.defaultLocale;
export const supportedLocales = siteConfig.supportedLocales;
export const contactEmail = siteConfig.contactEmail;
export const socialLinks = siteConfig.socialLinks;
export const legalDisclaimer = siteConfig.disclaimer;
