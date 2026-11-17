/**
 * Deep Links & Universal Links Engine (Prompt 128)
 *
 * Configures and resolves:
 * - Android App Links (https://indiapaperwork.in/*)
 * - iOS Universal Links (https://indiapaperwork.in/*)
 * - Custom Schemes (civicguide://* and indiapaperwork://*)
 * - Fallbacks to website when app is uninstalled
 */

export const APP_SCHEMES = ["civicguide", "indiapaperwork"] as const;
export const PRODUCTION_DOMAIN = "indiapaperwork.in";
export const ALLOWED_HOSTS = ["indiapaperwork.in", "www.indiapaperwork.in", "localhost:3000"];

export interface ParsedDeepLink {
  screen: "home" | "task" | "category" | "search" | "saved" | "more";
  pathname: string;
  params: Record<string, string>;
  rawUrl: string;
  isUniversalLink: boolean;
}

/**
 * Normalizes URL string and strips protocol and domain prefixes
 */
export function extractPathAndParams(rawUrl: string): {
  pathname: string;
  params: Record<string, string>;
  isUniversalLink: boolean;
} {
  if (!rawUrl) {
    return { pathname: "/", params: {}, isUniversalLink: false };
  }

  let clean = rawUrl.trim();
  let isUniversalLink = false;

  // Check universal link schemes (https / http)
  for (const host of ALLOWED_HOSTS) {
    const httpsPrefix = `https://${host}`;
    const httpPrefix = `http://${host}`;
    if (clean.startsWith(httpsPrefix)) {
      clean = clean.slice(httpsPrefix.length);
      isUniversalLink = true;
      break;
    } else if (clean.startsWith(httpPrefix)) {
      clean = clean.slice(httpPrefix.length);
      isUniversalLink = true;
      break;
    }
  }

  // Check custom scheme prefixes (civicguide:// or indiapaperwork://)
  if (!isUniversalLink) {
    for (const scheme of APP_SCHEMES) {
      const prefix = `${scheme}://`;
      if (clean.startsWith(prefix)) {
        clean = "/" + clean.slice(prefix.length).replace(/^\/+/, "");
        break;
      }
    }
  }

  // Separate query params
  const [pathPart, queryPart] = clean.split("?");
  const pathname = (pathPart || "/").replace(/\/+$/, "") || "/";
  const params: Record<string, string> = {};

  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
  }

  return { pathname, params, isUniversalLink };
}

/**
 * Resolves a web URL or deep-link to the exact Expo Router screen and parameters
 */
export function resolveDeepLink(url: string): ParsedDeepLink {
  const { pathname, params, isUniversalLink } = extractPathAndParams(url);

  // 1. Root / Home
  if (pathname === "/" || pathname === "") {
    return {
      screen: "home",
      pathname: "/(tabs)",
      params,
      rawUrl: url,
      isUniversalLink,
    };
  }

  // 2. Saved Checklists
  if (pathname === "/saved" || pathname === "/my-checklists" || pathname === "/my-lists") {
    return {
      screen: "saved",
      pathname: "/(tabs)/saved",
      params,
      rawUrl: url,
      isUniversalLink,
    };
  }

  // 3. Search
  if (pathname === "/search") {
    return {
      screen: "search",
      pathname: "/(tabs)/search",
      params,
      rawUrl: url,
      isUniversalLink,
    };
  }

  // 4. More / Settings
  if (pathname === "/more" || pathname === "/settings" || pathname === "/about") {
    return {
      screen: "more",
      pathname: "/(tabs)/more",
      params,
      rawUrl: url,
      isUniversalLink,
    };
  }

  // 5. Category: /category/:slug
  const categoryMatch = pathname.match(/^\/category\/([a-zA-Z0-9_-]+)/);
  if (categoryMatch && categoryMatch[1]) {
    return {
      screen: "category",
      pathname: "/category/[slug]",
      params: { ...params, slug: categoryMatch[1] },
      rawUrl: url,
      isUniversalLink,
    };
  }

  // 6. Task guides:
  // Can be /task/:slug/:state, /task/:slug, or directly /:task/:state or /:task
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 1) {
    let taskSlug = segments[0] || "";
    let state = segments[1] || params.state;

    if (taskSlug === "task" && segments.length >= 2) {
      taskSlug = segments[1] || "";
      state = segments[2] || params.state;
    }

    const mergedParams: Record<string, string> = { ...params, slug: taskSlug };
    if (state) {
      mergedParams.state = state;
    }

    return {
      screen: "task",
      pathname: "/task/[slug]",
      params: mergedParams,
      rawUrl: url,
      isUniversalLink,
    };
  }

  // Fallback to home
  return {
    screen: "home",
    pathname: "/(tabs)",
    params,
    rawUrl: url,
    isUniversalLink,
  };
}

/**
 * Builds universal link and custom scheme link for any web path
 */
export function buildLinksForPath(webPath: string): {
  universalUrl: string;
  appSchemeUrl: string;
} {
  const cleanPath = webPath.startsWith("/") ? webPath : `/${webPath}`;
  return {
    universalUrl: `https://${PRODUCTION_DOMAIN}${cleanPath}`,
    appSchemeUrl: `civicguide://${cleanPath.replace(/^\//, "")}`,
  };
}
