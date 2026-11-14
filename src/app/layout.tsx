import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatePreferenceProvider } from "@/context/StatePreferenceContext";
import { ReportMistakeProvider } from "@/context/ReportMistakeContext";
import { ConsentProvider } from "@/context/ConsentContext";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { siteConfig } from "@/lib/site";
import { fontVariables } from "@/lib/fonts";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsScript } from "@/components/analytics/AnalyticsScript";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/jsonld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${siteConfig.name} | Verified Citizen Paperwork Guides`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "./",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.defaultLocale} className={`${fontVariables} h-full antialiased`}>
      <head>
        <JsonLd schema={[buildOrganizationSchema(), buildWebSiteSchema()]} />
      </head>
      <body className="bg-surface text-text flex min-h-full flex-col font-sans">
        <ConsentProvider>
          <AnalyticsScript />
          {/* WCAG AA Skip-to-content Link */}
          <a
            href="#main-content"
            className="focus:rounded-input focus:bg-primary text-small focus:shadow-soft-lg focus:ring-primary sr-only font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Skip to main content
          </a>

          <StatePreferenceProvider>
            <ReportMistakeProvider>
              {/* Global Header */}
              <Header />

              {/* Main Content Area */}
              <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                {children}
              </main>

              {/* Global Footer */}
              <Footer />
            </ReportMistakeProvider>
          </StatePreferenceProvider>

          {/* Privacy & Cookie Consent Banner (Prompt 88) */}
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
