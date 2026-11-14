"use client";

import { useEffect, useRef } from "react";

export function NotFoundTracker() {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    if (typeof window === "undefined") return;

    loggedRef.current = true;
    const currentUrl = window.location.href;
    const referrer = document.referrer || null;

    fetch("/api/log-missing-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: currentUrl,
        referrer,
      }),
    }).catch(() => {
      // Non-blocking telemetry
    });
  }, []);

  return null;
}
