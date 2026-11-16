"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check if there is an existing waiting worker (e.g. from background update)
        if (registration.waiting) {
          window.dispatchEvent(
            new CustomEvent("sw-update-available", {
              detail: { registration },
            })
          );
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New content is available and will be used when the current tab is reloaded/closed.
              window.dispatchEvent(
                new CustomEvent("sw-update-available", {
                  detail: { registration },
                })
              );
            }
          });
        });
      } catch (error) {
        console.warn("[PWA] Service worker registration failed:", error);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }
  }, []);

  return null;
}
