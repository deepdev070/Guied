"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold text-[#666666] transition-colors hover:border-[#FCE8E6] hover:bg-[#FCE8E6] hover:text-[#C5221F] focus:ring-2 focus:ring-[#003366] focus:outline-none disabled:opacity-50"
      title="Log out of admin session"
      aria-label="Log out of admin session"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C5221F]" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      <span>Log Out</span>
    </button>
  );
}
