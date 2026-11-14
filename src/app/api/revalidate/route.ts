import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseRevalidatePayload, validateRevalidateToken } from "@/lib/revalidate";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader;

  const customHeader = request.headers.get("x-revalidate-token");
  if (customHeader) return customHeader;

  const querySecret =
    request.nextUrl.searchParams.get("secret") || request.nextUrl.searchParams.get("token");
  if (querySecret) return querySecret;

  return null;
}

export async function POST(request: NextRequest) {
  const expectedSecret =
    process.env.REVALIDATE_SECRET_TOKEN || "paperwork-revalidate-secret-token-2026";
  const token = extractToken(request);

  if (!validateRevalidateToken(token, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  let body: { path?: string; tag?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional if params are in searchParams
  }

  const path = body.path || request.nextUrl.searchParams.get("path");
  const tag = body.tag || request.nextUrl.searchParams.get("tag");

  const parsed = parseRevalidatePayload({ path, tag });
  if (!parsed.valid) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.path) {
    revalidatePath(parsed.path);
  }

  if (parsed.tag) {
    revalidateTag(parsed.tag, "max");
  }

  return NextResponse.json(
    {
      revalidated: true,
      path: parsed.path ?? null,
      tag: parsed.tag ?? null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  const expectedSecret =
    process.env.REVALIDATE_SECRET_TOKEN || "paperwork-revalidate-secret-token-2026";
  const token = extractToken(request);

  if (!validateRevalidateToken(token, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  const path = request.nextUrl.searchParams.get("path");
  const tag = request.nextUrl.searchParams.get("tag");

  const parsed = parseRevalidatePayload({ path, tag });
  if (!parsed.valid) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.path) {
    revalidatePath(parsed.path);
  }

  if (parsed.tag) {
    revalidateTag(parsed.tag, "max");
  }

  return NextResponse.json(
    {
      revalidated: true,
      path: parsed.path ?? null,
      tag: parsed.tag ?? null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
