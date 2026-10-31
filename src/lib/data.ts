import { rest } from "./db";
import { slugify } from "./slug";
import type { Category, ErrorCode, Product, Remote, Review, SensorValue } from "./types";

const imgs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^https:\/\//.test(x)) : []);
const norm = (p: Product): Product => ({ ...p, images: imgs(p.images), brands: Array.isArray(p.brands) ? p.brands : [], keywords: Array.isArray(p.keywords) ? p.keywords : [] });

export const getCategories = () => rest<Category>("shop_categories?select=*&order=sort_order,created_at");
export const getProducts = async () => (await rest<Product>("shop_products?select=*&order=sort_order,created_at")).map(norm);
export async function getProduct(slug: string) {
  const r = await rest<Product>(`shop_products?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return r[0] ? norm(r[0]) : null;
}
export async function getBrandNames() {
  const r = await rest<{ name: string }>("brands?select=name&order=name", 3600);
  return r.map((b) => b.name);
}
export const getProductReviews = (slug: string) =>
  rest<Review>(`reviews?select=id,target_type,target_id,user_name,rating,comment,created_at&status=eq.approved&target_type=eq.product&target_id=eq.${encodeURIComponent(slug)}&order=created_at.desc`, 300);

/** Stable id for Merchant Center + schema. Merchant Center rejects ids over 50 chars; slugs reach 80. */
export const skuOf = (p: Product) => `PCB-${p.id.replace(/-/g, "").slice(0, 10)}`;

export const price = (p: Product): number | null => {
  const n = Number(p.starting_price);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** brand for a product: explicit field, else a known brand found at the start of the name. */
export function brandOf(p: Product, known: string[]): string | null {
  if (p.brands[0]) return p.brands[0];
  const n = p.name.toLowerCase();
  return known.find((b) => n.startsWith(b.toLowerCase())) ?? null;
}

export async function getBrandIndex() {
  const [products, known] = await Promise.all([getProducts(), getBrandNames()]);
  const map = new Map<string, { name: string; slug: string; products: Product[] }>();
  for (const p of products) {
    const names = p.brands.length ? p.brands : [brandOf(p, known)].filter(Boolean) as string[];
    for (const name of names) {
      const slug = slugify(name);
      if (!slug) continue;
      const e = map.get(slug) ?? { name, slug, products: [] };
      e.products.push(p);
      map.set(slug, e);
    }
  }
  return [...map.values()].sort((a, b) => b.products.length - a.products.length);
}

// ── reference data ────────────────────────────────────────────────────────────
export const getErrorCodes = () => rest<ErrorCode>("error_codes?select=*&order=brand,error_code", 3600);
export const getSensors = () => rest<SensorValue>("sensor_values?select=*&order=brand,model_number", 3600);
export const getRemotes = () => rest<Remote>("remotes?select=*&order=brand,model_number", 3600);

export function groupErrorCodes(rows: ErrorCode[]) {
  const brands = new Map<string, { name: string; slug: string; codes: Map<string, { code: string; slug: string; rows: ErrorCode[] }> }>();
  for (const r of rows) {
    const bs = slugify(r.brand); const cs = slugify(r.error_code);
    if (!bs || !cs) continue;
    const b = brands.get(bs) ?? { name: r.brand, slug: bs, codes: new Map() };
    const c = b.codes.get(cs) ?? { code: r.error_code, slug: cs, rows: [] };
    c.rows.push(r); b.codes.set(cs, c); brands.set(bs, b);
  }
  return brands;
}

/** Stable unique slugs for model-keyed tables (sensor values, remotes). */
export function modelSlugs<T extends { id: string; brand: string | null; model_number: string }>(rows: T[]) {
  const seen = new Map<string, number>(); const out = new Map<string, T>();
  for (const r of rows) {
    const base = slugify(`${r.brand ?? ""} ${r.model_number}`) || r.id.slice(0, 8);
    const n = (seen.get(base) ?? 0) + 1; seen.set(base, n);
    out.set(n === 1 ? base : `${base}-${n}`, r);
  }
  return out;
}
