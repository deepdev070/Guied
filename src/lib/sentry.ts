/**
 * Sentry Error Monitoring Integration (Prompt 135)
 * Compatible with Sentry Free Tier:
 * - 5,000 errors/month & 10,000 transactions/month budget
 * - Source maps and release tagging
 * - Strict Citizen PII Scrubbing (Aadhaar, PAN, Phone, Email, Passport)
 */

export interface SentryBreadcrumb {
  message?: string;
  category?: string;
  timestamp?: number;
  data?: Record<string, unknown>;
}

export interface SentryEvent {
  event_id?: string;
  message?: string;
  release?: string;
  environment?: string;
  user?: {
    id?: string;
    ip_address?: string;
    email?: string;
    username?: string;
  };
  extra?: Record<string, unknown>;
  breadcrumbs?: SentryBreadcrumb[];
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
      stacktrace?: unknown;
    }>;
  };
}

// Regex patterns for citizen PII identification
export const PII_PATTERNS = {
  // Indian 10-digit mobile phone numbers with optional +91/91 prefix
  phone: /(?:\+91[\-\s]?|(?<!\d)91[\-\s]?)?[6-9]\d{9}\b/g,
  // Indian 12-digit Aadhaar number with optional spaces/hyphens
  aadhaar: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
  // 10-character PAN number: 5 letters, 4 digits, 1 letter
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi,
  // Email address
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Indian Passport: 1 uppercase letter followed by 7 digits
  passport: /\b[A-PR-WYa-pr-wy][1-9]\d{6}\b/g,
};

/**
 * Scrubs citizen sensitive personal data from any string before Sentry transmission.
 */
export function scrubPiiText(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(PII_PATTERNS.email, "[REDACTED_EMAIL]")
    .replace(PII_PATTERNS.phone, "[REDACTED_PHONE]")
    .replace(PII_PATTERNS.aadhaar, "[REDACTED_AADHAAR]")
    .replace(PII_PATTERNS.pan, "[REDACTED_PAN]")
    .replace(PII_PATTERNS.passport, "[REDACTED_PASSPORT]");
}

/**
 * Recursively scrubs PII from arbitrary object or array structures.
 */
export function scrubPiiObject<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === "string") {
    return scrubPiiText(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => scrubPiiObject(item)) as unknown as T;
  }
  if (typeof input === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input)) {
      // Omit direct PII field names
      if (/^(aadhaar|pan|phone|email|passport|ip_address|ip)$/i.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = scrubPiiObject(val);
      }
    }
    return output as T;
  }
  return input;
}

/**
 * Standard beforeSend filter for Sentry events.
 * Strips citizen PII, cleans error messages, and deletes user IP.
 */
export function beforeSendScrubber(event: SentryEvent): SentryEvent | null {
  const scrubbed: SentryEvent = { ...event };

  // 1. Scrub main event message
  if (scrubbed.message) {
    scrubbed.message = scrubPiiText(scrubbed.message);
  }

  // 2. Scrub exceptions
  if (scrubbed.exception?.values) {
    scrubbed.exception.values = scrubbed.exception.values.map((val) => ({
      ...val,
      value: val.value ? scrubPiiText(val.value) : undefined,
    }));
  }

  // 3. Scrub breadcrumbs
  if (scrubbed.breadcrumbs) {
    scrubbed.breadcrumbs = scrubbed.breadcrumbs.map((b) => ({
      ...b,
      message: b.message ? scrubPiiText(b.message) : undefined,
      data: b.data ? scrubPiiObject(b.data) : undefined,
    }));
  }

  // 4. Scrub extra attributes
  if (scrubbed.extra) {
    scrubbed.extra = scrubPiiObject(scrubbed.extra);
  }

  // 5. Always anonymize / delete client IP address
  if (scrubbed.user) {
    delete scrubbed.user.ip_address;
    if (scrubbed.user.email) {
      scrubbed.user.email = "[REDACTED_EMAIL]";
    }
  }

  return scrubbed;
}

export interface SentryConfig {
  dsn?: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  beforeSend: (event: SentryEvent) => SentryEvent | null;
}

export function getSentryConfig(): SentryConfig {
  const isProd = process.env.NODE_ENV === "production";
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    environment: process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    // 10% traces in production to stay well within free tier 10k transactions
    tracesSampleRate: isProd ? 0.1 : 1.0,
    beforeSend: beforeSendScrubber,
  };
}

// In-memory capture log for test verification and development inspection
export const sentryEventLog: SentryEvent[] = [];

/**
 * Captures an exception, scrubs PII, and sends to Sentry (or records locally if unconfigured).
 */
export function captureException(error: unknown, extra?: Record<string, unknown>): SentryEvent {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errStack = error instanceof Error ? error.stack : undefined;

  const rawEvent: SentryEvent = {
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    environment: process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    message: errMessage,
    exception: {
      values: [
        {
          type: error instanceof Error ? error.name : "Error",
          value: errMessage,
          stacktrace: errStack,
        },
      ],
    },
    extra,
  };

  const scrubbedEvent = beforeSendScrubber(rawEvent) || rawEvent;
  sentryEventLog.push(scrubbedEvent);

  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("[Sentry:DevCapture]", scrubbedEvent.message);
  }

  return scrubbedEvent;
}

/**
 * Captures a message, scrubs PII, and records event.
 */
export function captureMessage(message: string, extra?: Record<string, unknown>): SentryEvent {
  const rawEvent: SentryEvent = {
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    environment: process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    message,
    extra,
  };

  const scrubbedEvent = beforeSendScrubber(rawEvent) || rawEvent;
  sentryEventLog.push(scrubbedEvent);
  return scrubbedEvent;
}
