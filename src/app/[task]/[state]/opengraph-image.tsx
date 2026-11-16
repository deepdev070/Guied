import { ImageResponse } from "next/og";
import { createOgCardElement, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og-image";
import { getTaskBySlug, getTaskVariant } from "@/lib/queries";
import { getStateBySlugOrCode } from "@/lib/state-preference";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

interface Props {
  params: Promise<{
    task: string;
    state: string;
  }>;
}

export default async function Image({ params }: Props) {
  const { task: taskSlug, state: stateSlug } = await params;
  const task = await getTaskBySlug(taskSlug);
  const state = getStateBySlugOrCode(stateSlug);

  if (!task) {
    return new ImageResponse(
      createOgCardElement({
        taskName: "Civic Paperwork Guide",
        stateName: state?.name,
        estimatedTime: "Fast & Verified",
        cost: "Official Fees",
        documentCount: 0,
      }),
      { ...size }
    );
  }

  const variant = await getTaskVariant(taskSlug, stateSlug);
  const activeVariant = variant || task.national;

  const mandatoryTotal = activeVariant.fees
    .filter((f) => !f.isOptional)
    .reduce((acc, f) => acc + f.amount, 0);

  const costString =
    mandatoryTotal > 0 ? `₹${mandatoryTotal.toLocaleString("en-IN")}` : "Free / No Fee";

  return new ImageResponse(
    createOgCardElement({
      taskName: task.name,
      stateName: state?.name,
      estimatedTime: activeVariant.estimatedTime || "15-30 days",
      cost: costString,
      documentCount: activeVariant.documentRequirements.length,
      year: 2026,
    }),
    { ...size }
  );
}
