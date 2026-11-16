import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatePreferenceProvider } from "@/context/StatePreferenceContext";
import { ReportMistakeProvider } from "@/context/ReportMistakeContext";
import { ConsentProvider } from "@/context/ConsentContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { siteConfig } from "@/lib/site";
import { fontVariables } from "@/lib/fonts";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsScript } from "@/components/analytics/AnalyticsScript";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "India Paperwork",
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.defaultLocale} className={`${fontVariables} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="India Paperwork" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("civic_text_scale");if(s&&["100","115","130"].indexOf(s)!==-1){document.documentElement.setAttribute("data-text-scale",s);}var l=localStorage.getItem("civic_lite_mode");if(l==="true"){document.documentElement.setAttribute("data-lite-mode","true");}}catch(e){}})();`,
          }}
        />
        <JsonLd schema={[buildOrganizationSchema(), buildWebSiteSchema()]} />
      </head>
      <body className="bg-surface text-text flex min-h-full flex-col font-sans">
        <ConsentProvider>
          <AnalyticsScript />
          <ServiceWorkerRegister />
          {/* WCAG AA Skip-to-content Link */}
          <a
            href="#main-content"
            className="focus:rounded-input focus:bg-primary text-small focus:shadow-soft-lg focus:ring-primary sr-only font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Skip to main content
          </a>

          <LanguageProvider>
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
          </LanguageProvider>

          {/* Privacy & Cookie Consent Banner (Prompt 88) */}
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
