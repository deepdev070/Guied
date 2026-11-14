import { NextResponse, type NextRequest } from "next/server";
import { logMissingPage } from "@/lib/missing-pages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;
    const referrer = body.referrer || req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const result = await logMissingPage({
      url,
      referrer,
      userAgent,
    });

    return NextResponse.json({ success: result.success });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process request", details: String(err) },
      { status: 500 }
    );
  }
}
