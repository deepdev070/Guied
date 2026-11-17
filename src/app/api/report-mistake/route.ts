import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createErrorReport } from "@/lib/admin/reports";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

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

    // 4. Sanitize inputs against XSS and malicious characters
    const cleanDescription = sanitizeText(description);
    const cleanProposedCorrection = proposedCorrection
      ? sanitizeText(proposedCorrection)
      : undefined;
    const cleanReporterEmail = reporterEmail ? sanitizeEmail(reporterEmail) : undefined;

    // 5. Save into database & file system ErrorReport storage
    try {
      const report = await createErrorReport({
        taskSlug: taskSlug ? sanitizeText(taskSlug) : undefined,
        stateCode: stateCode ? sanitizeText(stateCode) : undefined,
        issueType,
        description: cleanDescription,
        proposedCorrection: cleanProposedCorrection,
        reporterEmail: cleanReporterEmail,
      });

      return NextResponse.json({ success: true, id: report.id });
    } catch (err) {
      console.warn("[ErrorReport] Error recording report:", err);
      return NextResponse.json({ success: true, mocked: true });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
