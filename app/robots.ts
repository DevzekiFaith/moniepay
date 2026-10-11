import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/accounts/"],
      },
    ],
    sitemap: "https://moniepay.app/sitemap.xml",
    host: "https://moniepay.app",
  };
}
