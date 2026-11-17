/**
 * Security headers configuration (Prompt 134)
 * Hardens civic portal against XSS, clickjacking, MIME-sniffing, and data exfiltration.
 * Compatible with Google AdSense, Google Analytics, Sentry, and official government portal frames.
 */

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.googletagmanager.com https://*.google-analytics.com https://*.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: *.gov.in *.nic.in https://pagead2.googlesyndication.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://*.sentry.io https://*.ingest.sentry.io",
  "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
];

export const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES.join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

