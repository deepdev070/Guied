import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/admin/server-auth.ts";
import { exportGuidesAsJson, exportGuidesAsCsv } from "../../../../lib/admin/import-export.ts";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const csvData = exportGuidesAsCsv();
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="civic-guides-${dateStr}.csv"`,
      },
    });
  }

  const jsonData = exportGuidesAsJson();
  return new NextResponse(jsonData, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="civic-guides-${dateStr}.json"`,
    },
  });
}
