import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://website.com";
  return ["", "/how-it-works", "/leads", "/pricing", "/faq", "/about", "/terms", "/privacy"].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly", priority: path === "" ? 1 : 0.7 }));
}
