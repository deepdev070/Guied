import crypto from "node:crypto";
import { checkRateLimit } from "../rate-limiter.ts";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiV1ResponseOptions {
  status?: number;
  maxAge?: number; // Cache maxAge in seconds (default: 3600 / 1 hour)
  sMaxAge?: number; // Shared cache maxAge in seconds (default: 86400 / 24 hours)
  pagination?: PaginationMeta;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, If-None-Match",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle HTTP OPTIONS preflight for CORS
 */
export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Standardized API v1 JSON Response with:
 * - CORS enabled
 * - ETag calculation and 304 Not Modified handling
 * - Stale-while-revalidate Cache-Control headers
 * - Sliding window Rate Limiting headers
 */
export function jsonResponse<T>(
  request: Request,
  data: T,
  options: ApiV1ResponseOptions = {}
): Response {
  const status = options.status ?? 200;
  const maxAge = options.maxAge ?? 3600;
  const sMaxAge = options.sMaxAge ?? 86400;

  // 1. Rate Limiting Check (100 requests per minute per IP for v1 API)
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimit = checkRateLimit(`api_v1_${clientIp}`, {
    windowMs: 60_000,
    maxRequests: 100,
  });

  const rateLimitHeaders = {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
  };

  if (!rateLimit.allowed) {
    return Response.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again in 1 minute.",
        },
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          ...rateLimitHeaders,
          "Retry-After": "60",
        },
      }
    );
  }

  // 2. Prepare payload
  const body = {
    success: status >= 200 && status < 300,
    data,
    ...(options.pagination ? { pagination: options.pagination } : {}),
  };

  const serialized = JSON.stringify(body);

  // 3. Compute ETag Hash (MD5)
  const etag = `"${crypto.createHash("md5").update(serialized).digest("hex")}"`;

  // 4. Check If-None-Match for 304 Not Modified
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch.includes(etag))) {
    return new Response(null, {
      status: 304,
      headers: {
        ...CORS_HEADERS,
        ...rateLimitHeaders,
        ETag: etag,
        "Cache-Control": `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
      },
    });
  }

  // 5. Return full response
  return new Response(serialized, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...rateLimitHeaders,
      ETag: etag,
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
    },
  });
}

/**
 * Standardized API v1 Error Response
 */
export function errorResponse(
  request: Request,
  message: string,
  statusCode: number = 400,
  code: string = "BAD_REQUEST"
): Response {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkRateLimit(`api_v1_${clientIp}`, {
    windowMs: 60_000,
    maxRequests: 100,
  });

  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    {
      status: statusCode,
      headers: {
        ...CORS_HEADERS,
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
      },
    }
  );
}
