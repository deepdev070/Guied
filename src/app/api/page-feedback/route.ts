import { NextResponse, type NextRequest } from "next/server";
import { recordPageFeedback, getPageFeedbackStats } from "@/lib/page-feedback";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const result = await recordPageFeedback(body, ip);

    if (result.rateLimited) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskSlug = searchParams.get("taskSlug");
    const stats = await getPageFeedbackStats(taskSlug);
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
