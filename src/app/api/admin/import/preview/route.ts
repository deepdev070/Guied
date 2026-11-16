import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/admin/server-auth.ts";
import {
  parseGuidesFromJson,
  parseGuidesFromCsv,
  dryRunImport,
} from "../../../../../lib/admin/import-export.ts";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { format = "json", content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content string is required for preview" },
        { status: 400 }
      );
    }

    let parsedGuides: unknown[];
    try {
      if (format === "csv") {
        parsedGuides = parseGuidesFromCsv(content);
      } else {
        parsedGuides = parseGuidesFromJson(content);
      }
    } catch (parseErr) {
      return NextResponse.json(
        {
          error: `Failed to parse ${format.toUpperCase()}: ${(parseErr as Error).message}`,
        },
        { status: 400 }
      );
    }

    if (!parsedGuides || parsedGuides.length === 0) {
      return NextResponse.json(
        { error: "No guides found in the uploaded content" },
        { status: 400 }
      );
    }

    const previewResult = dryRunImport(parsedGuides);

    return NextResponse.json({
      success: true,
      result: previewResult,
    });
  } catch (err) {
    console.error("Import preview error:", err);
    return NextResponse.json({ error: "Internal server error during preview" }, { status: 500 });
  }
}
