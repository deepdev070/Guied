/**
 * Mobile Error Monitoring Integration (Prompt 135)
 * Sentry mobile client wrapper with PII scrubbing and release tagging.
 */

import {
  beforeSendScrubber,
  captureException as baseCaptureException,
  captureMessage as baseCaptureMessage,
  scrubPiiText,
  type SentryEvent,
} from "../../../src/lib/sentry.ts";

export function getMobileSentryConfig() {
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production";
  return {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
    environment: isDev ? "development" : "production",
    release: "v0.1.0-mobile",
    beforeSend: beforeSendScrubber,
  };
}

export function captureMobileException(
  error: unknown,
  context?: Record<string, unknown>
): SentryEvent {
  return baseCaptureException(error, {
    platform: "mobile",
    ...context,
  });
}

export function captureMobileMessage(
  message: string,
  context?: Record<string, unknown>
): SentryEvent {
  return baseCaptureMessage(message, {
    platform: "mobile",
    ...context,
  });
}

export { scrubPiiText };
