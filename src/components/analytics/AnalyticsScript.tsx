"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { useConsent } from "@/context/ConsentContext";

export interface AnalyticsScriptProps {
  plausibleDomain?: string;
  gaMeasurementId?: string;
}

/**
 * Loads privacy-friendly analytics scripts only when user consent is granted (Prompt 88).
 * Complies with DPDP Act 2023 and Google Consent Mode v2.
 */
export function AnalyticsScript({
  plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  gaMeasurementId = process.env.NEXT_PUBLIC_ANALYTICS_ID,
}: AnalyticsScriptProps) {
  const { consent } = useConsent();
  const isAnalyticsAllowed = consent ? consent.analytics : false;

  // Update Google Consent Mode v2 when user updates consent preferences
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
      gtag("consent", "update", {
        analytics_storage: isAnalyticsAllowed ? "granted" : "denied",
        ad_storage: consent?.advertising ? "granted" : "denied",
        ad_user_data: consent?.advertising ? "granted" : "denied",
        ad_personalization: consent?.advertising ? "granted" : "denied",
      });
    }
  }, [consent, isAnalyticsAllowed]);

  return (
    <>
      {/* 1. Privacy-First Plausible Analytics (<1KB, Cookieless, DPDP Act 2023 compliant) */}
      {plausibleDomain && isAnalyticsAllowed && (
        <Script
          strategy="afterInteractive"
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.tagged-events.js"
        />
      )}

      {/* 2. Google Analytics 4 (GA4) with privacy consent mode */}
      {gaMeasurementId && isAnalyticsAllowed && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('consent', 'default', {
                  'analytics_storage': 'granted',
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied'
                });
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
