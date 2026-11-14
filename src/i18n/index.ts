import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALES_META,
  CIVIC_LOCALE_COOKIE,
  CIVIC_LOCALE_STORAGE_KEY,
  isSupportedLocale,
  parseLocaleFromPath,
  getLocalizedPath,
  type Locale,
  type LocaleMeta,
} from "./config.ts";

import enMessages from "./messages/en.json" with { type: "json" };
import hiMessages from "./messages/hi.json" with { type: "json" };
import guMessages from "./messages/gu.json" with { type: "json" };

export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALES_META,
  CIVIC_LOCALE_COOKIE,
  CIVIC_LOCALE_STORAGE_KEY,
  isSupportedLocale,
  parseLocaleFromPath,
  getLocalizedPath,
  type Locale,
  type LocaleMeta,
};

type MessagesTree = Record<string, Record<string, string>>;

const MESSAGES_CATALOG: Record<Locale, MessagesTree> = {
  en: enMessages,
  hi: hiMessages,
  gu: guMessages,
};

/**
 * Loads the full dictionary of messages for a given locale.
 * Falls back to default locale (en) if missing.
 */
export function getMessages(locale: Locale = DEFAULT_LOCALE): MessagesTree {
  return MESSAGES_CATALOG[locale] || MESSAGES_CATALOG[DEFAULT_LOCALE];
}

/**
 * Universal translation function.
 * Supports dot notation: t(locale, "nav.home")
 * Supports parameter interpolation: t(locale, "task.documentsCount", { count: 5 })
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const parts = key.split(".");
  const messages = getMessages(locale);
  const fallback = getMessages(DEFAULT_LOCALE);

  let val: unknown = messages;
  for (const part of parts) {
    if (val && typeof val === "object" && part in val) {
      val = (val as Record<string, unknown>)[part];
    } else {
      val = undefined;
      break;
    }
  }

  // Fallback to English if translation is missing for the key
  if (val === undefined) {
    let fbVal: unknown = fallback;
    for (const part of parts) {
      if (fbVal && typeof fbVal === "object" && part in fbVal) {
        fbVal = (fbVal as Record<string, unknown>)[part];
      } else {
        fbVal = undefined;
        break;
      }
    }
    val = fbVal;
  }

  if (typeof val !== "string") {
    return key;
  }

  if (!params) {
    return val;
  }

  let result = val;
  for (const [pKey, pVal] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
  }
  return result;
}

/**
 * Formats a currency amount into the target locale.
 * Uses Indian number grouping (1,00,000) and ₹ symbol.
 */
export function formatCurrency(amount: number, locale: Locale = DEFAULT_LOCALE): string {
  if (amount === 0) {
    return t(locale, "common.free");
  }
  const localeTag = locale === "hi" ? "hi-IN" : locale === "gu" ? "gu-IN" : "en-IN";
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}
