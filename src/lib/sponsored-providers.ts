import { prisma } from "./db.ts";
import {
  SPONSORED_PROVIDERS_SEED,
  type SponsoredProviderData,
} from "../data/sponsored-providers.ts";

/**
 * Retrieves active sponsored service providers for a given state (Prompt 92).
 * Shows up to 3 providers whose contract dates are currently active.
 */
export async function getActiveSponsoredProviders(
  stateSlug: string,
  limit = 3
): Promise<SponsoredProviderData[]> {
  const now = new Date();

  try {
    if (prisma && prisma.sponsoredProvider) {
      const providers = await prisma.sponsoredProvider.findMany({
        where: {
          stateSlug: stateSlug.toLowerCase(),
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (providers && providers.length > 0) {
        return providers.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category as SponsoredProviderData["category"],
          city: p.city,
          stateSlug: p.stateSlug,
          phone: p.phone,
          address: p.address || undefined,
          services: p.services,
          startDate: p.startDate.toISOString(),
          endDate: p.endDate.toISOString(),
          isActive: p.isActive,
        }));
      }
    }
  } catch {
    // Database fallback
  }

  // Fallback to static seed data (filtered by state and active date window)
  return SPONSORED_PROVIDERS_SEED.filter((p) => {
    if (p.stateSlug.toLowerCase() !== stateSlug.toLowerCase() || !p.isActive) {
      return false;
    }
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  }).slice(0, limit);
}
