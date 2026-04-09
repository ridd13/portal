import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/konto", "/auth/"],
    },
    sitemap: "https://das-portal.online/sitemap.xml",
  };
}
