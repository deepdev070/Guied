/**
 * Lightweight in-memory sliding window rate limiter
 * Used for public civic feedback forms, error reports, and contact requests.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 60,000ms / 1 minute)
  maxRequests?: number; // Maximum allowed requests within window (default: 5)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 5;
  const now = Date.now();

  const record = rateLimitStore.get(identifier) ?? { timestamps: [] };

  // Filter out timestamps outside the active sliding window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0] ?? now;
    const resetTime = oldest + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Record this request
  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  // Periodically cleanup stale identifiers to prevent memory leaks
  if (rateLimitStore.size > 5000) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (val.timestamps.every((ts) => now - ts >= windowMs)) {
        rateLimitStore.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
    resetTime: now + windowMs,
  };
}
