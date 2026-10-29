import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().toString().replace(/\/$/, "");
  return [
    { url: base + "/", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...["/demos", "/demos/detailing", "/demos/booking"].map(path => ({ url: base + path, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: base + "/privacy", changeFrequency: "monthly", priority: 0.3 },
    { url: base + "/portfolio", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
