import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import { getAdminSession } from "@/lib/admin/server-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In | India Paperwork Guide",
  description: "Secure administrator sign-in.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
      <AdminLoginForm />
    </div>
  );
}
