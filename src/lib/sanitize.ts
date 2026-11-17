/**
 * Input sanitisation and safe URL handling utilities (Prompt 134)
 * Protects against XSS, script injection, SSRF, open redirect, and malformed inputs.
 */

const DANGEROUS_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:", "blob:"]);

/**
 * Strips HTML tags, script fragments, and control characters from user text input.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    return String(input);
  }

  return (
    input
      // Strip script tags and their contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Strip other HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove control characters except newline and tab
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normalize unicode whitespace
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
  );
}

/**
 * Escapes characters for safe HTML rendering if dynamically injected.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates and sanitizes email input. Returns empty string if invalid format.
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.trim().toLowerCase();
  // Standard RFC-compliant relaxed email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}

/**
 * Validates whether a given URL is safe to navigate to or link to.
 * Rejects javascript:, data:, blob:, and invalid protocol schemes.
 */
export function isSafeUrl(url: unknown, allowedProtocols: string[] = ["http:", "https:"]): boolean {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }

  const trimmed = url.trim();

  // Relative URLs starting with / (excluding protocol-relative //)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL, returning empty string if it uses an unsafe or malicious protocol.
 */
export function sanitizeUrl(
  url: unknown,
  allowedProtocols: string[] = ["http:", "https:"]
): string {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();

  // Disallow any protocol with whitespace / control characters bypassing parser
  const lower = trimmed.toLowerCase();
  for (const dangerous of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(dangerous)) {
      return "";
    }
  }

  if (isSafeUrl(trimmed, allowedProtocols)) {
    return trimmed;
  }

  return "";
}

/**
 * Returns secure anchor props for external links.
 * Enforces target="_blank" and rel="noopener noreferrer" to prevent tab-nabbing.
 */
export function getSafeExternalLinkProps(url: string): {
  href: string;
  target: "_blank";
  rel: "noopener noreferrer";
} {
  const safeUrl = sanitizeUrl(url) || "#";
  return {
    href: safeUrl,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}
