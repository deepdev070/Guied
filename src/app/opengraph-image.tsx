import { ImageResponse } from "next/og";
import { createOgCardElement, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    createOgCardElement({
      taskName: "Clear, Step-by-Step Indian Civic Paperwork Guides",
      estimatedTime: "Fast & Verified",
      cost: "Zero Tout Fees",
      documentCount: 10,
      year: 2026,
    }),
    { ...size }
  );
}

