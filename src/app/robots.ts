import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/contact",
          "/download",
          "/privacy",
          "/security",
          "/share/",
        ],
        disallow: [
          "/app",
          "/db/",
          "/page/",
          "/admin/",
          "/api/",
          "/login",
          "/client-login",
          "/tauri-app",
        ],
      },
    ],
    sitemap: "https://corpus.com/sitemap.xml",
  };
}
