export const SUPPORTED_LOCALES = ["en", "hi", "gu"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const CIVIC_LOCALE_COOKIE = "civic_locale";
export const CIVIC_LOCALE_STORAGE_KEY = "civic_locale";

export interface LocaleMeta {
  code: Locale;
  name: string;
  nativeName: string;
  dir: "ltr";
  dateFormat: string;
}

export const LOCALES_META: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    dateFormat: "DD MMM YYYY",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    dir: "ltr",
    dateFormat: "DD MMM YYYY",
  },
  gu: {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    dir: "ltr",
    dateFormat: "DD MMM YYYY",
  },
};

export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Extracts locale and canonical pathname from a request path.
 * e.g. "/hi/driving-licence-learner" -> { locale: "hi", pathWithoutLocale: "/driving-licence-learner" }
 * e.g. "/driving-licence-learner" -> { locale: "en", pathWithoutLocale: "/driving-licence-learner" }
 */
export function parseLocaleFromPath(pathname: string): {
  locale: Locale;
  pathWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && isSupportedLocale(firstSegment)) {
    const locale = firstSegment;
    const rest = segments.slice(1).join("/");
    return {
      locale,
      pathWithoutLocale: rest ? `/${rest}` : "/",
    };
  }
  return {
    locale: DEFAULT_LOCALE,
    pathWithoutLocale: pathname.startsWith("/") ? pathname : `/${pathname}`,
  };
}

/**
 * Formats a localized URL path for a target locale.
 * Default locale "en" has no prefix (/task-name).
 * Non-default locales prepend "/hi" or "/gu" (/hi/task-name, /gu/task-name).
 */
export function getLocalizedPath(currentPath: string, targetLocale: Locale): string {
  const { pathWithoutLocale } = parseLocaleFromPath(currentPath);

  if (targetLocale === DEFAULT_LOCALE) {
    return pathWithoutLocale;
  }

  if (pathWithoutLocale === "/") {
    return `/${targetLocale}`;
  }

  return `/${targetLocale}${pathWithoutLocale}`;
}
