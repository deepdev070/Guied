import type { Metadata } from "next";
import React from "react";
import { getAdminSession } from "@/lib/admin/server-auth";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Civic Portal Admin | India Paperwork Guide",
  description: "Internal civic editorial and paperwork guide verification management portal.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] font-sans text-[#111827] antialiased selection:bg-[#EBF3FB] selection:text-[#003366]">
      {session && <AdminHeader username={session.username} />}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-[#E5E7EB] bg-white py-4 text-center text-xs text-[#6B7280]">
        <p>
          India Paperwork Guide Civic Administration &bull; Confidential Internal Tool &bull;
          Automatic 8h Session Expiration
        </p>
      </footer>
    </div>
  );
}
