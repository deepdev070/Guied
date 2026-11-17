import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "../../../../lib/rate-limiter.ts";
import {
  PartnerEnquiryInputSchema,
  savePartnerEnquiry,
  PARTNER_CATEGORIES,
  RATE_CARD_TIERS,
} from "../../../../lib/partners.ts";

export async function GET() {
  return NextResponse.json({
    categories: PARTNER_CATEGORIES,
    tiers: RATE_CARD_TIERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`partners:${ip}`, { windowMs: 60_000, maxRequests: 5 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many partnership enquiries submitted from your network. Please wait a few moments before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = PartnerEnquiryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed. Please verify the provided details.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    // Honeypot anti-spam check
    if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
      return NextResponse.json({
        success: true,
        referenceId: "PARTNER-CONFIRMED",
        message: "Enquiry received.",
      });
    }

    const record = await savePartnerEnquiry(parsed.data);

    return NextResponse.json({
      success: true,
      referenceId: record.id,
      message:
        "Your partnership enquiry has been received. Our civic verification desk will review your credentials and contact you within 24–48 working hours.",
    });
  } catch (err: unknown) {
    console.error("[Partners API] Error processing enquiry:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again shortly." },
      { status: 500 }
    );
  }
}
