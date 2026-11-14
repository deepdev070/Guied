import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";

const ReportMistakeSchema = z.object({
  taskSlug: z.string().max(100).optional().nullable(),
  stateCode: z.string().max(10).optional().nullable(),
  issueType: z.enum([
    "outdated_fee",
    "wrong_document",
    "broken_link",
    "procedure_changed",
    "other",
  ]),
  description: z.string().min(5, "Please provide at least 5 characters").max(2000),
  proposedCorrection: z.string().max(2000).optional().nullable(),
  reporterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  honeypot: z.string().max(100).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, { windowMs: 60_000, maxRequests: 5 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    // 2. Validate input payload
    const body = await req.json();
    const parsed = ReportMistakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      taskSlug,
      stateCode,
      issueType,
      description,
      proposedCorrection,
      reporterEmail,
      honeypot,
    } = parsed.data;

    // 3. Honeypot check: if bot filled this hidden field, return silent success
    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    // 4. Save into database ErrorReport table
    try {
      const report = await db.errorReport.create({
        data: {
          taskSlug: taskSlug || null,
          stateCode: stateCode || null,
          issueType,
          description: description.trim(),
          proposedCorrection: proposedCorrection?.trim() || null,
          reporterEmail: reporterEmail?.trim() || null,
          status: "NEW",
        },
      });

      return NextResponse.json({ success: true, id: report.id });
    } catch (dbErr) {
      // Graceful fallback if database is offline or running in mock environment
      console.warn("[ErrorReport] Database error recording error report:", dbErr);
      return NextResponse.json({ success: true, mocked: true });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
