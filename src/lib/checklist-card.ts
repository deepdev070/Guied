/**
 * Social Checklist Card Generator (PROMPT 142)
 *
 * Generates an Open Graph style, light-coloured 1080x1350 checklist card for each guide.
 * Tailored for WhatsApp Status (4:5 / 9:16), Instagram portrait posts (4:5), and Pinterest pins.
 *
 * Key components:
 * - 1080 x 1350 dimensions
 * - Indian Civic Tricolor top accent
 * - Official citizen branding & state badge
 * - Large guide title (Class 8 accessible)
 * - Top 6 required documents checklist with green checkmarks
 * - Statutory fee & estimated timeline badges
 * - Official .gov.in verification stamp
 * - Prominent site URL branding (indiapaperworkguide.in)
 */

import type { TaskContent } from "@/types/content";
import { siteConfig } from "./site.ts";

export const CARD_DIMENSIONS = {
  width: 1080,
  height: 1350,
} as const;

export interface ChecklistCardDocument {
  name: string;
  hint?: string;
  required?: boolean;
}

export interface ChecklistCardData {
  title: string;
  subtitle?: string;
  stateName?: string;
  categoryName?: string;
  documents: ChecklistCardDocument[];
  statutoryFee?: string;
  estimatedTime?: string;
  siteUrl?: string;
  verifiedDate?: string;
  sourcePortal?: string;
}

/**
 * Escapes characters that are special in XML/SVG.
 */
export function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wraps text into lines with a maximum character width, limiting to maxLines.
 */
export function wrapSvgText(text: string, maxCharsPerLine = 34, maxLines = 3): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + " " + word).length <= maxCharsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * State code to friendly English name mapping
 */
const STATE_NAMES: Record<string, string> = {
  GJ: "Gujarat",
  MH: "Maharashtra",
  DL: "Delhi",
  KA: "Karnataka",
  TN: "Tamil Nadu",
  UP: "Uttar Pradesh",
  RJ: "Rajasthan",
  WB: "West Bengal",
  PB: "Punjab",
  HR: "Haryana",
  AP: "Andhra Pradesh",
  TG: "Telangana",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  BR: "Bihar",
  OR: "Odisha",
};

/**
 * Extracts checklist card data from a TaskContent object, optionally resolving a state variation.
 */
export function getChecklistCardDataFromTask(
  task: TaskContent,
  stateCode?: string
): ChecklistCardData {
  let stateVariation: any = undefined;
  let stateName = "All India";

  if (stateCode) {
    const codeUpper = stateCode.toUpperCase();
    const taskAny = task as any;
    if (taskAny.states && (taskAny.states[codeUpper] || taskAny.states[stateCode.toLowerCase()])) {
      stateVariation = taskAny.states[codeUpper] || taskAny.states[stateCode.toLowerCase()];
    } else if (taskAny.regionalVariations) {
      stateVariation = taskAny.regionalVariations.find(
        (v: any) => v.stateCode?.toLowerCase() === stateCode.toLowerCase()
      );
    }
    stateName =
      stateVariation?.stateName ||
      STATE_NAMES[codeUpper] ||
      (codeUpper === "ALL" ? "All India" : codeUpper);
  }

  const target = stateVariation ? { ...task.national, ...stateVariation } : task.national;

  // Documents: pick up to 6 documents (prefer required ones, ordered by displayOrder)
  const rawDocs = target?.documentRequirements || task.national?.documentRequirements || [];
  const sortedDocs = [...rawDocs].sort((a: any, b: any) => {
    if (a.requirementType === "required" && b.requirementType !== "required") return -1;
    if (a.requirementType !== "required" && b.requirementType === "required") return 1;
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });

  const top6Docs: ChecklistCardDocument[] = sortedDocs.slice(0, 6).map((doc: any) => ({
    name: doc.name,
    hint: doc.copiesHint || doc.description?.slice(0, 50) || "Original + photocopies",
    required: doc.requirementType === "required",
  }));

  // Fee calculation / summary
  let statutoryFee = "₹0 - Free";
  const fees = (target?.fees || task.national?.fees || []) as any[];
  if (fees.length > 0) {
    const totalAmount = fees.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
    statutoryFee = `₹${totalAmount.toLocaleString("en-IN")} Govt Fee`;
  } else if (target?.feeCalculator || task.national?.feeCalculator) {
    const calc = target?.feeCalculator || task.national?.feeCalculator;
    statutoryFee = `From ₹${calc?.baseFee || 0} Govt Fee`;
  }

  // Estimated time
  const estimatedTime = target?.estimatedTime || task.national?.estimatedTime || "15-30 days";

  // Verified date
  let verifiedDate = "Recently Verified";
  const rawDate = target?.lastVerifiedAt || task.national?.lastVerifiedAt;
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      verifiedDate = `Verified ${d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
    } catch {
      // Fallback
    }
  }

  // Source portal hostname
  let sourcePortal = "Official .gov.in Portal";
  const sourceUrl = target?.sourceUrl || task.national?.sourceUrl;
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      sourcePortal = url.hostname.replace(/^www\./, "");
    } catch {
      // Fallback
    }
  }

  return {
    title: target?.title || task.name,
    subtitle: target?.summary || task.description,
    stateName,
    categoryName: task.categorySlug ? task.categorySlug.toUpperCase() : "CIVIC GUIDE",
    documents: top6Docs,
    statutoryFee,
    estimatedTime,
    siteUrl: "indiapaperworkguide.in",
    verifiedDate,
    sourcePortal,
  };
}

/**
 * Generates an SVG string representation of the 1080x1350 checklist card.
 * Strict light theme: white, slate-50, navy (#003366), and green (#15803D).
 */
export function renderChecklistCardSvg(data: ChecklistCardData): string {
  const {
    title,
    stateName = "All India",
    categoryName = "DOCUMENT CHECKLIST",
    documents = [],
    statutoryFee = "Statutory Fee Only",
    estimatedTime = "7-15 days",
    siteUrl = "indiapaperworkguide.in",
    verifiedDate = "Verified 2026",
    sourcePortal = "Official .gov.in Portal",
  } = data;

  const width = CARD_DIMENSIONS.width; // 1080
  const height = CARD_DIMENSIONS.height; // 1350

  // Wrap title into up to 2 lines
  const titleLines = wrapSvgText(title, 26, 2);

  // Document list formatting (up to 6)
  const docsToShow = documents.slice(0, 6);
  const docItemHeight = 90;
  const docStartY = 480;

  const documentBoxesSvg = docsToShow
    .map((doc, idx) => {
      const y = docStartY + idx * (docItemHeight + 14);
      const isReq = doc.required !== false;
      const docName = escapeXml(doc.name);
      const docHint = escapeXml(doc.hint || "Original + photocopies");

      return `
    <!-- Doc Item ${idx + 1} -->
    <g transform="translate(64, ${y})">
      <!-- Card background -->
      <rect width="952" height="${docItemHeight}" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
      
      <!-- Number / Checkmark Badge -->
      <circle cx="48" cy="${docItemHeight / 2}" r="22" fill="#E8F7EE" stroke="#86EFAC" stroke-width="1.5" />
      <path d="M40 ${docItemHeight / 2} L46 ${docItemHeight / 2 + 6} L58 ${docItemHeight / 2 - 6}" fill="none" stroke="#15803D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Document Title & Subtitle -->
      <text x="88" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#0F172A">
        ${docName.length > 55 ? docName.slice(0, 52) + "..." : docName}
      </text>
      <text x="88" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="500" fill="#64748B">
        ${docHint.length > 68 ? docHint.slice(0, 65) + "..." : docHint}
      </text>

      <!-- Badge on right -->
      <g transform="translate(820, ${docItemHeight / 2 - 16})">
        <rect width="108" height="32" rx="16" fill="${isReq ? "#ECFDF5" : "#F1F5F9"}" stroke="${isReq ? "#A7F3D0" : "#CBD5E1"}" stroke-width="1" />
        <text x="54" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${isReq ? "#065F46" : "#475569"}">
          ${isReq ? "REQUIRED" : "OPTIONAL"}
        </text>
      </g>
    </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #F8FAFC;">
  <defs>
    <!-- Card Drop Shadow -->
    <filter id="cardShadow" x="-5%" y="-2%" width="110%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.05" />
    </filter>
  </defs>

  <!-- Canvas Background (Light slate) -->
  <rect width="${width}" height="${height}" fill="#F8FAFC" />

  <!-- Main Container Card (White) -->
  <g filter="url(#cardShadow)">
    <rect x="36" y="36" width="1008" height="1278" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
  </g>

  <!-- Tricolor Accent Top Bar (Saffron, White, Green) -->
  <g transform="translate(36, 36)">
    <clipPath id="topRoundClip">
      <rect width="1008" height="12" rx="28" />
    </clipPath>
    <g clip-path="url(#topRoundClip)">
      <rect x="0" y="0" width="336" height="12" fill="#FF9933" />
      <rect x="336" y="0" width="336" height="12" fill="#E2E8F0" />
      <rect x="672" y="0" width="336" height="12" fill="#138808" />
    </g>
  </g>

  <!-- Header Section -->
  <g transform="translate(64, 76)">
    <!-- Brand Icon -->
    <rect x="0" y="0" width="56" height="56" rx="14" fill="#003366" />
    <text x="28" y="38" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">IP</text>

    <!-- Brand Text -->
    <text x="72" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#003366">India Paperwork Guide</text>
    <text x="72" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B">Verified Citizen Portals • Zero Tout Fees</text>

    <!-- State & Category Pill Right -->
    <g transform="translate(712, 6)">
      <rect width="240" height="44" rx="22" fill="#EAF1FF" stroke="#BFDBFE" stroke-width="1.5" />
      <text x="120" y="28" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#1D4ED8" letter-spacing="0.5">
        ${escapeXml(stateName.toUpperCase())} • GUIDE
      </text>
    </g>
  </g>

  <!-- Horizontal Divider -->
  <line x1="64" y1="156" x2="1016" y2="156" stroke="#F1F5F9" stroke-width="2" />

  <!-- Category Pill -->
  <g transform="translate(64, 180)">
    <rect width="200" height="30" rx="6" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1" />
    <text x="100" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#B45309" letter-spacing="1">
      ${escapeXml(categoryName)}
    </text>
  </g>

  <!-- Guide Title (Big, bold, Class 8 clear) -->
  <g transform="translate(64, 255)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 52}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="800" fill="#0F172A" letter-spacing="-0.5">${escapeXml(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Fact Badges: Fee & Timeline -->
  <g transform="translate(64, 360)">
    <!-- Fee Badge -->
    <rect x="0" y="0" width="310" height="52" rx="14" fill="#E8F7EE" stroke="#86EFAC" stroke-width="1.5" />
    <circle cx="28" cy="26" r="14" fill="#15803D" />
    <text x="28" y="32" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">₹</text>
    <text x="54" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#15803D">
      ${escapeXml(statutoryFee)}
    </text>

    <!-- Timeline Badge -->
    <g transform="translate(326, 0)">
      <rect x="0" y="0" width="280" height="52" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5" />
      <circle cx="28" cy="26" r="14" fill="#475569" />
      <text x="28" y="32" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">⏱</text>
      <text x="54" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="700" fill="#334155">
        ${escapeXml(estimatedTime)}
      </text>
    </g>

    <!-- Verification Pill -->
    <g transform="translate(622, 0)">
      <rect x="0" y="0" width="330" height="52" rx="14" fill="#FEFCE8" stroke="#FEF08A" stroke-width="1.5" />
      <text x="165" y="32" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#854D0E">
        🛡️ ${escapeXml(verifiedDate)}
      </text>
    </g>
  </g>

  <!-- Document Checklist Header -->
  <g transform="translate(64, 452)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#003366" letter-spacing="1">
      TOP 6 REQUIRED DOCUMENTS CHECKLIST
    </text>
    <text x="952" y="0" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B">
      Carry original + 2 photocopies
    </text>
  </g>

  <!-- Document Boxes (Top 6) -->
  ${documentBoxesSvg}

  <!-- Security / Anti-Tout Callout Strip -->
  <g transform="translate(64, 1128)">
    <rect width="952" height="54" rx="12" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
    <text x="476" y="33" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#166534">
      ✓ Verified against official ${escapeXml(sourcePortal)} • Do not pay unauthorized middlemen
    </text>
  </g>

  <!-- Footer Banner with Site URL Branding -->
  <g transform="translate(64, 1202)">
    <rect width="952" height="88" rx="20" fill="#003366" />
    
    <!-- Left instructions -->
    <text x="32" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#93C5FD">
      GET COMPLETE CHECKLIST, DIRECT PORTAL LINKS &amp; STEPS:
    </text>
    
    <!-- Primary Site URL -->
    <text x="32" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">
      ${escapeXml(siteUrl)}
    </text>

    <!-- Right Button/Pill -->
    <g transform="translate(720, 24)">
      <rect width="200" height="40" rx="20" fill="#138808" />
      <text x="100" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">
        100% FREE GUIDE ↗
      </text>
    </g>
  </g>
</svg>`;
}

/**
 * Client-side helper to download the checklist card as an image.
 * Uses an offscreen HTML Canvas to export PNG, or triggers direct SVG download.
 */
export async function downloadChecklistCardImage(
  data: ChecklistCardData,
  slug = "guide"
): Promise<void> {
  if (typeof window === "undefined") return;

  const svgString = renderChecklistCardSvg(data);
  const fileName = `${slug}-checklist-card.png`;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_DIMENSIONS.width;
    canvas.height = CARD_DIMENSIONS.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context not available");
    }

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(blobUrl);

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              reject(new Error("Failed to produce PNG blob from canvas"));
              return;
            }
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            resolve();
          }, "image/png");
        } catch (drawErr) {
          reject(drawErr);
        }
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      };

      img.src = blobUrl;
    });
  } catch (canvasError) {
    console.warn("Canvas PNG conversion fallback to SVG download:", canvasError);
    // Fallback: download as SVG
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = `${slug}-checklist-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(svgUrl);
  }
}
