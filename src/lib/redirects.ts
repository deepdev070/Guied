export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

/**
 * Prompt 80: Next.js redirects table for legacy, mistyped, and abbreviated civic slugs.
 * Ensures all link equity is preserved and users landing on common typos get 308 redirected
 * to canonical kebab-case URLs.
 */
export const SITE_REDIRECTS: RedirectRule[] = [
  // 1. Common Task Misspellings & Legacy Slugs (US vs UK English "license" vs "licence")
  { source: "/passport", destination: "/passport-renewal", permanent: true },
  { source: "/passports", destination: "/passport-renewal", permanent: true },
  { source: "/passport-apply", destination: "/passport-renewal", permanent: true },
  { source: "/driving-licence", destination: "/driving-licence-learner", permanent: true },
  { source: "/driving-license", destination: "/driving-licence-learner", permanent: true },
  { source: "/driving-license-learner", destination: "/driving-licence-learner", permanent: true },
  { source: "/driving-license-new", destination: "/driving-licence-new", permanent: true },
  { source: "/dl-learner", destination: "/driving-licence-learner", permanent: true },
  { source: "/learner-license", destination: "/driving-licence-learner", permanent: true },
  { source: "/learner-licence", destination: "/driving-licence-learner", permanent: true },
  { source: "/new-dl", destination: "/driving-licence-new", permanent: true },
  { source: "/permanent-dl", destination: "/driving-licence-new", permanent: true },

  // 2. Category Slugs & Aliases
  { source: "/category/identity-documents", destination: "/category/identity", permanent: true },
  { source: "/category/vehicle-services", destination: "/category/vehicles", permanent: true },
  { source: "/categories", destination: "/", permanent: true },
  { source: "/states", destination: "/", permanent: true },

  // 3. 2-Letter State Code Shortcuts to Canonical State Hubs
  { source: "/state/gj", destination: "/state/gujarat", permanent: true },
  { source: "/state/mh", destination: "/state/maharashtra", permanent: true },
  { source: "/state/dl", destination: "/state/delhi", permanent: true },
  { source: "/state/ka", destination: "/state/karnataka", permanent: true },
  { source: "/state/rj", destination: "/state/rajasthan", permanent: true },
  { source: "/state/up", destination: "/state/uttar-pradesh", permanent: true },
  { source: "/state/mp", destination: "/state/madhya-pradesh", permanent: true },

  // 4. 2-Letter State Code Shortcuts for Task Pages (e.g. /passport-renewal/gj -> /passport-renewal/gujarat)
  { source: "/:task/gj", destination: "/:task/gujarat", permanent: true },
  { source: "/:task/mh", destination: "/:task/maharashtra", permanent: true },
  { source: "/:task/dl", destination: "/:task/delhi", permanent: true },
  { source: "/:task/ka", destination: "/:task/karnataka", permanent: true },
  { source: "/:task/rj", destination: "/:task/rajasthan", permanent: true },
  { source: "/:task/up", destination: "/:task/uttar-pradesh", permanent: true },
  { source: "/:task/mp", destination: "/:task/madhya-pradesh", permanent: true },
];

/**
 * Resolves destination for a given pathname against the redirects table.
 * Helpful for middleware or test simulations.
 */
export function resolveRedirect(
  pathname: string
): { destination: string; permanent: boolean } | null {
  const cleanPath = pathname.replace(/\/$/, "");

  for (const rule of SITE_REDIRECTS) {
    // Exact match
    if (rule.source === cleanPath) {
      return { destination: rule.destination, permanent: rule.permanent };
    }

    // Pattern match for :task parameter (e.g. "/:task/gj")
    if (rule.source.includes("/:task/")) {
      const suffix = rule.source.replace("/:task/", "");
      const destSuffix = rule.destination.replace("/:task/", "");
      const match = cleanPath.match(/^\/([^/]+)\/([^/]+)$/);
      if (match && match[2] === suffix) {
        const task = match[1];
        return { destination: `/${task}/${destSuffix}`, permanent: rule.permanent };
      }
    }
  }

  return null;
}
