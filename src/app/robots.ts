import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://website.com";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/checkout"] }], sitemap: `${base}/sitemap.xml` };
}
