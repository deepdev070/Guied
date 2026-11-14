"use client";

import React, { createContext, useContext, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  type Locale,
  DEFAULT_LOCALE,
  LOCALES_META,
  CIVIC_LOCALE_COOKIE,
  CIVIC_LOCALE_STORAGE_KEY,
  isSupportedLocale,
  parseLocaleFromPath,
  getLocalizedPath,
  t as translateKey,
} from "@/i18n";

export { CIVIC_LOCALE_COOKIE, CIVIC_LOCALE_STORAGE_KEY };

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  isPending: false,
});

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. Synchronously derive locale from path or initial/default
  const { locale: pathLocale } = parseLocaleFromPath(pathname);
  const locale = pathLocale || initialLocale || DEFAULT_LOCALE;

  // 2. Sync HTML lang and dir attributes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = LOCALES_META[locale]?.dir || "ltr";
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    if (!isSupportedLocale(newLocale)) return;

    // 1. Persist choice in localStorage
    try {
      localStorage.setItem(CIVIC_LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // Storage unavailable
    }

    // 2. Persist choice in first-party 1-year cookie
    if (typeof document !== "undefined") {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `${CIVIC_LOCALE_COOKIE}=${newLocale}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    // 3. Navigate to corresponding localized path
    const targetPath = getLocalizedPath(pathname, newLocale);
    if (targetPath !== pathname) {
      startTransition(() => {
        router.push(targetPath);
      });
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translateKey(locale, key, params);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
