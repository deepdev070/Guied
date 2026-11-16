import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { requireAdminSession } from "@/lib/admin/server-auth";
import { getTaskContent } from "@/lib/admin/task-storage";
import { GuideEditorForm } from "@/components/admin/editor/GuideEditorForm";

export const metadata: Metadata = {
  title: "Edit Civic Guide | Admin | India Paperwork Guide",
  robots: { index: false, follow: false },
};

export default async function AdminEditGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminSession();
  const { slug } = await params;

  const task = getTaskContent(slug);
  if (!task) {
    notFound();
  }

  return (
    <div className="py-2">
      <GuideEditorForm initialTask={task} />
    </div>
  );
}
