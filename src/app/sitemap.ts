import type { MetadataRoute } from "next";
import { getBrandIndex, getCategories, getErrorCodes, getProducts, getRemotes, getSensors, groupErrorCodes, modelSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
const u = (p: string) => `${SITE_URL}${p}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, products, brands, codes, sensors, remotes] = await Promise.all([getCategories(), getProducts(), getBrandIndex(), getErrorCodes(), getSensors(), getRemotes()]);
  const now = new Date();
  const out: MetadataRoute.Sitemap = [
    { url: u("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: u("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: u("/brands"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: u("/pcb-parts-directory"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: u("/error-codes"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: u("/sensor-values"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: u("/find-remote"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  for (const c of cats) out.push({ url: u(`/shop/category/${c.slug}`), lastModified: now, changeFrequency: "daily", priority: 0.8, ...(c.image ? { images: [c.image] } : {}) });
  for (const p of products) out.push({ url: u(`/shop/product/${p.slug}`), lastModified: new Date(p.created_at), changeFrequency: "weekly", priority: 0.8, ...(p.images.length ? { images: p.images } : {}) });
  for (const b of brands) out.push({ url: u(`/brands/${b.slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  for (const b of groupErrorCodes(codes).values()) {
    out.push({ url: u(`/error-codes/${b.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    for (const c of b.codes.values()) out.push({ url: u(`/error-codes/${b.slug}/${c.slug}`), lastModified: new Date(c.rows[0].created_at), changeFrequency: "monthly", priority: 0.4 });
  }
  for (const s of modelSlugs(sensors).keys()) out.push({ url: u(`/sensor-values/${s}`), lastModified: now, changeFrequency: "monthly", priority: 0.4 });
  for (const s of modelSlugs(remotes).keys()) out.push({ url: u(`/find-remote/${s}`), lastModified: now, changeFrequency: "monthly", priority: 0.4 });
  return out;
}
