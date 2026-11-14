import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://indiapaperworkguide.in").replace(
    /\/$/,
    ""
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/design", "/my-checklists", "/search?*"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
