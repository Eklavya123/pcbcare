import type { MetadataRoute } from "next";
import { sitemapGroups } from "@/lib/sitemap-data";

export const revalidate = 3600;

// /sitemap.xml keeps working (flat list). The same URLs are also split into /sitemaps/*.xml behind /sitemap_index.xml.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return Object.values(await sitemapGroups()).flat();
}
