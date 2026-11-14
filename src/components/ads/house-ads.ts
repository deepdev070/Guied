/**
 * Config file for in-house fallback cards and affiliate partner promos (Prompt 91).
 */

import type { AdFormat } from "./formats";

export type { AdFormat };

export interface HouseAdCard {
  id: string;
  type: "house" | "partner";
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  badgeText?: string;
  iconName: "notary" | "app" | "verify" | "share";
  targetFormats?: AdFormat[];
}

export const HOUSE_ADS_CONFIG: HouseAdCard[] = [
  {
    id: "notary-ca-help",
    type: "house",
    title: "Need help with paperwork & affidavits?",
    description:
      "Connect with verified local notaries, legal document writers, and CAs across Gujarat and India.",
    ctaText: "Find Verified Providers",
    ctaHref: "/state/gujarat",
    badgeText: "Civic Resource",
    iconName: "notary",
    targetFormats: ["rectangle", "large-rectangle", "in-article", "leaderboard"],
  },
  {
    id: "offline-checklist-app",
    type: "house",
    title: "Save Checklists On Your Phone",
    description:
      "Install our free, offline-ready web app to tick off papers at the RTO or Passport Kendra without internet.",
    ctaText: "Install Free Checklist",
    ctaHref: "/my-checklists",
    badgeText: "Free Offline App",
    iconName: "app",
    targetFormats: ["leaderboard", "rectangle", "large-rectangle", "in-article", "mobile-banner"],
  },
  {
    id: "share-with-family",
    type: "house",
    title: "Know someone applying for documents?",
    description:
      "Send them this verified step-by-step checklist on WhatsApp to help them avoid office rejections.",
    ctaText: "Share Paperwork Guide",
    ctaHref: "#",
    badgeText: "Share Guide",
    iconName: "share",
    targetFormats: ["anchor", "mobile-banner", "rectangle"],
  },
  {
    id: "partner-digilocker-ready",
    type: "partner",
    title: "DigiLocker Verified Copies Accepted",
    description:
      "Motor Vehicle Act now legally mandates RTOs accept digital driving licences and RC via DigiLocker.",
    ctaText: "Official Notification",
    ctaHref: "https://parivahan.gov.in",
    badgeText: "Sponsored Partner",
    iconName: "verify",
    targetFormats: ["rectangle", "large-rectangle", "leaderboard", "in-article"],
  },
];

/**
 * Returns an appropriate house ad or partner card for a given format or slotId.
 */
export function getHouseAdForFormat(format: AdFormat, _slotId?: string): HouseAdCard {
  // Try matching format
  const match = HOUSE_ADS_CONFIG.find(
    (ad) => !ad.targetFormats || ad.targetFormats.includes(format)
  );
  return match || HOUSE_ADS_CONFIG[0]!;
}
