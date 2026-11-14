/**
 * Freshness Logic & Verification Audit for Civic Paperwork Content.
 * - "fresh": Verified within 90 days (Green Verified Badge)
 * - "aging": Verified between 91 and 180 days (Amber Advisory Badge)
 * - "stale": Verified > 180 days ago or unverified (Red Needs-Update Badge)
 */

export type FreshnessStatus = "fresh" | "aging" | "stale";

export interface FreshnessInfo {
  status: FreshnessStatus;
  badgeVariant: "verified" | "needs-update";
  label: string;
  daysSince: number;
  formattedDate: string;
  isStale: boolean;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const ONE_EIGHTY_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

export function getFreshnessInfo(
  lastVerifiedAt: string | Date | null | undefined,
  referenceDate: Date = new Date()
): FreshnessInfo {
  if (!lastVerifiedAt) {
    return {
      status: "stale",
      badgeVariant: "needs-update",
      label: "Verification Needed",
      daysSince: 999,
      formattedDate: "Not verified",
      isStale: true,
    };
  }

  const verifiedDate =
    typeof lastVerifiedAt === "string" ? new Date(lastVerifiedAt) : lastVerifiedAt;

  if (isNaN(verifiedDate.getTime())) {
    return {
      status: "stale",
      badgeVariant: "needs-update",
      label: "Invalid Verification Date",
      daysSince: 999,
      formattedDate: "Unknown",
      isStale: true,
    };
  }

  const diffMs = referenceDate.getTime() - verifiedDate.getTime();
  const daysSince = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  const formattedDate = verifiedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (diffMs <= NINETY_DAYS_MS) {
    return {
      status: "fresh",
      badgeVariant: "verified",
      label: `Verified (${formattedDate})`,
      daysSince,
      formattedDate,
      isStale: false,
    };
  }

  if (diffMs <= ONE_EIGHTY_DAYS_MS) {
    return {
      status: "aging",
      badgeVariant: "needs-update",
      label: `Verified ${daysSince} days ago`,
      daysSince,
      formattedDate,
      isStale: false,
    };
  }

  return {
    status: "stale",
    badgeVariant: "needs-update",
    label: `Awaiting 2026 Revision (${formattedDate})`,
    daysSince,
    formattedDate,
    isStale: true,
  };
}
