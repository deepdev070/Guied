/**
 * Core Revalidation Logic and Auth Validator (Prompt 76)
 * Supports on-demand ISR revalidation for pages (/passport-renewal, etc.) and tags.
 */

export interface RevalidateRequestInput {
  path?: string | null;
  tag?: string | null;
}

export interface RevalidateResult {
  valid: boolean;
  error?: string;
  path?: string;
  tag?: string;
}

/**
 * Validates bearer token or secret string against server configured secret.
 */
export function validateRevalidateToken(
  providedToken: string | null | undefined,
  expectedSecret: string
): boolean {
  if (!providedToken || !expectedSecret) {
    return false;
  }

  // Remove "Bearer " prefix if present
  const cleanProvided = providedToken.replace(/^Bearer\s+/i, "").trim();
  const cleanExpected = expectedSecret.trim();

  if (cleanProvided.length === 0 || cleanExpected.length === 0) {
    return false;
  }

  return cleanProvided === cleanExpected;
}

/**
 * Validates and normalizes the target path or tag for revalidation.
 */
export function parseRevalidatePayload(input: RevalidateRequestInput): RevalidateResult {
  const path = typeof input.path === "string" ? input.path.trim() : undefined;
  const tag = typeof input.tag === "string" ? input.tag.trim() : undefined;

  if (!path && !tag) {
    return {
      valid: false,
      error: "At least one of 'path' or 'tag' must be specified for on-demand revalidation.",
    };
  }

  if (path && !path.startsWith("/")) {
    return {
      valid: false,
      error:
        "Revalidation 'path' must begin with a leading forward slash (e.g. '/passport-renewal').",
    };
  }

  return {
    valid: true,
    path: path || undefined,
    tag: tag || undefined,
  };
}
