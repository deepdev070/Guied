import type { NextConfig } from "next";
import { SITE_REDIRECTS } from "./src/lib/redirects.ts";
import { SECURITY_HEADERS } from "./src/lib/security-headers.ts";

const nextConfig: NextConfig = {
  // Strict trailing slash policy: redirects /path/ -> /path with 308 permanent redirect
  trailingSlash: false,

  // Performance & Core Web Vitals optimization
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,

  // Security Headers (Prompt 134)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  // Image optimization for LCP and minimal mobile data usage
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Canonical redirects for mistyped, legacy, and abbreviated civic URLs
  async redirects() {
    return SITE_REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: r.permanent,
    }));
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
