import { getBrandIndex, getCategories, getErrorCodes, getProducts, getRemotes, getSensors, groupErrorCodes, modelSlugs } from "./data";
import { SITE_URL } from "./site";

export type Entry = { url: string; lastModified: Date; changeFrequency: "daily" | "weekly" | "monthly"; priority: number; images?: string[] };
const u = (p: string) => `${SITE_URL}${p}`;

/** Small, purpose-built sitemaps. Each stays well under Google's limits and is fast to build. */
export async function sitemapGroups(): Promise<Record<string, Entry[]>> {
  const [cats, products, brands, codes, sensors, remotes] = await Promise.all([getCategories(), getProducts(), getBrandIndex(), getErrorCodes(), getSensors(), getRemotes()]);
  const now = new Date();
  const core: Entry[] = [
    { url: u("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: u("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: u("/brands"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: u("/pcb-parts-directory"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: u("/error-codes"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: u("/sensor-values"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: u("/find-remote"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...cats.map((c): Entry => ({ url: u(`/shop/category/${c.slug}`), lastModified: now, changeFrequency: "daily", priority: 0.8, ...(c.image ? { images: [c.image] } : {}) })),
    ...brands.map((b): Entry => ({ url: u(`/brands/${b.slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.6 })),
  ];
  const prods: Entry[] = products.map((p): Entry => ({ url: u(`/shop/product/${p.slug}`), lastModified: new Date(p.created_at), changeFrequency: "weekly", priority: 0.8, ...(p.images.length ? { images: p.images } : {}) }));
  const errors: Entry[] = [];
  for (const b of groupErrorCodes(codes).values()) {
    errors.push({ url: u(`/error-codes/${b.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    for (const c of b.codes.values()) errors.push({ url: u(`/error-codes/${b.slug}/${c.slug}`), lastModified: new Date(c.rows[0].created_at), changeFrequency: "monthly", priority: 0.4 });
  }
  const reference: Entry[] = [
    ...[...modelSlugs(sensors).keys()].map((s): Entry => ({ url: u(`/sensor-values/${s}`), lastModified: now, changeFrequency: "monthly", priority: 0.4 })),
    ...[...modelSlugs(remotes).keys()].map((s): Entry => ({ url: u(`/find-remote/${s}`), lastModified: now, changeFrequency: "monthly", priority: 0.4 })),
  ];
  return { core, products: prods, "error-codes": errors, reference };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const day = (d: Date) => (Number.isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10);

export const urlsetXml = (entries: Entry[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  entries.map((e) => `<url><loc>${esc(e.url)}</loc><lastmod>${day(e.lastModified)}</lastmod><changefreq>${e.changeFrequency}</changefreq><priority>${e.priority}</priority>${(e.images ?? []).slice(0, 20).map((i) => `<image:image><image:loc>${esc(i)}</image:loc></image:image>`).join("")}</url>`).join("\n") +
  `\n</urlset>\n`;

export const indexXml = (names: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  names.map((n) => `<sitemap><loc>${SITE_URL}/sitemaps/${n}.xml</loc><lastmod>${day(new Date())}</lastmod></sitemap>`).join("\n") +
  `\n</sitemapindex>\n`;

export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" };
