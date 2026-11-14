import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { getTaskBySlug, getTaskVariant } from "@/lib/queries";
import { ChecklistPdfDocument } from "@/lib/pdf/ChecklistPdfDocument";
import { siteConfig } from "@/lib/site";

export async function GET(request: NextRequest, context: { params: Promise<{ task: string }> }) {
  try {
    const { task: taskSlug } = await context.params;
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get("state") || undefined;
    const isDownload = searchParams.get("download") !== "false";

    // 1. Fetch Task and merged State variant
    const task = await getTaskBySlug(taskSlug);
    if (!task) {
      return NextResponse.json({ error: `Task '${taskSlug}' was not found.` }, { status: 404 });
    }

    const variant = await getTaskVariant(taskSlug, stateParam);
    if (!variant) {
      return NextResponse.json(
        { error: `Variant for '${taskSlug}' was not found.` },
        { status: 404 }
      );
    }

    // 2. Compute canonical URL and generate QR code
    const stateSlug = variant.stateSlug || stateParam;
    const canonicalPath = stateSlug ? `/${taskSlug}/${stateSlug}` : `/${taskSlug}`;
    const canonicalUrl = `${siteConfig.baseUrl}${canonicalPath}`;

    const qrCodeDataUrl = await QRCode.toDataURL(canonicalUrl, {
      margin: 1,
      width: 90,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    const generatedDate = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const stateName = variant.stateName || "All India (National)";

    // 3. Render PDF document to buffer using @react-pdf/renderer
    const pdfDocument = ChecklistPdfDocument({
      task,
      variant,
      stateName,
      canonicalUrl,
      qrCodeDataUrl,
      generatedDate,
    });

    const pdfBuffer = await renderToBuffer(pdfDocument);

    const disposition = isDownload
      ? `attachment; filename="${taskSlug}-checklist.pdf"`
      : `inline; filename="${taskSlug}-checklist.pdf"`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[API/PDF] Error generating PDF checklist:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF checklist. Please try again." },
      { status: 500 }
    );
  }
}
