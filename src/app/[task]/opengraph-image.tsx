import { ImageResponse } from "next/og";
import { createOgCardElement, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og-image";
import { getTaskBySlug } from "@/lib/queries";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

interface Props {
  params: Promise<{
    task: string;
  }>;
}

export default async function Image({ params }: Props) {
  const { task: taskSlug } = await params;
  const task = await getTaskBySlug(taskSlug);

  if (!task) {
    return new ImageResponse(
      createOgCardElement({
        taskName: "Civic Paperwork Guide",
        estimatedTime: "Fast & Verified",
        cost: "Official Fees",
        documentCount: 0,
      }),
      { ...size }
    );
  }

  const national = task.national;
  const mandatoryTotal = national.fees
    .filter((f) => !f.isOptional)
    .reduce((acc, f) => acc + f.amount, 0);

  const costString =
    mandatoryTotal > 0 ? `₹${mandatoryTotal.toLocaleString("en-IN")}` : "Free / No Fee";

  return new ImageResponse(
    createOgCardElement({
      taskName: task.name,
      estimatedTime: national.estimatedTime || "15-30 days",
      cost: costString,
      documentCount: national.documentRequirements.length,
      year: 2026,
    }),
    { ...size }
  );
}
