"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh CSRF token on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCsrf() {
      try {
        const res = await fetch("/api/admin/csrf");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.csrfToken) {
            setCsrfToken(data.csrfToken);
          }
        }
      } catch {
        // Ignored, form submit will fallback or retry
      }
    }
    loadCsrf();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      // Attempt to ensure CSRF token exists
      let activeCsrf = csrfToken;
      if (!activeCsrf) {
        try {
          const csrfRes = await fetch("/api/admin/csrf");
          if (csrfRes.ok) {
            const csrfData = await csrfRes.json();
            activeCsrf = csrfData.csrfToken;
            setCsrfToken(activeCsrf);
          }
        } catch {
          // Continue
        }
      }

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": activeCsrf,
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          csrfToken: activeCsrf,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed. Please verify credentials.");
        return;
      }

      // Successful login -> Navigate to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error connecting to login service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBF3FB] text-[#003366]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Admin Sign In</h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          Civic portal editorial, verification, and audit management.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 flex items-start gap-3 rounded-xl border border-[#F5C2C7] bg-[#FCE8E6] p-4 text-sm text-[#C5221F]"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Username */}
        <div>
          <label
            htmlFor="admin-username"
            className="mb-2 block text-xs font-semibold tracking-wider text-[#374151] uppercase"
          >
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9CA3AF]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] py-2.5 pr-3.5 pl-10 text-sm text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
              placeholder="e.g. admin"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold tracking-wider text-[#374151] uppercase"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9CA3AF]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] py-2.5 pr-10 pl-10 text-sm text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
              placeholder="••••••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-[#F3F4F6] p-3 text-xs text-[#6B7280]">
          Sessions remain authenticated for <strong>8 hours</strong>. Rate limited to 5 failed
          attempts per 15 minutes.
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#003366] px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#002244] focus:ring-3 focus:ring-[#003366]/40 focus:outline-none active:bg-[#001830] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>Sign In to Admin Panel</span>
          )}
        </button>
      </form>
    </div>
  );
}
