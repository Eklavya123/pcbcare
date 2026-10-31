import { brandOf, getBrandNames, getCategories, getProducts, price, skuOf } from "@/lib/data";
import { productSummary } from "@/lib/content";
import { POLICY, SITE_URL } from "@/lib/site";

export const revalidate = 3600;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tag = (n: string, v: string | number) => `<${n}>${esc(String(v))}</${n}>`;

/**
 * Google Merchant Center product feed (RSS 2.0). Only products that Google will accept are emitted:
 * a public price AND at least one real https image. Add this URL in Merchant Center → Products → Feeds.
 */
export async function GET() {
  const [products, cats, known] = await Promise.all([getProducts(), getCategories(), getBrandNames()]);
  const items: string[] = [];
  for (const p of products) {
    const pr = price(p);
    if (!pr || !p.images.length) continue;
    const cat = cats.find((c) => c.id === p.category_id)?.name ?? "PCB";
    const brand = brandOf(p, known) ?? "PCB Care";
    const desc = (p.description?.trim() || productSummary(p, cat, brand, pr)).replace(/\s+/g, " ").slice(0, 4900);
    items.push(`<item>
${tag("g:id", skuOf(p))}
${tag("title", p.name.slice(0, 150))}
${tag("description", desc)}
${tag("link", `${SITE_URL}/shop/product/${p.slug}`)}
${tag("g:image_link", p.images[0])}
${p.images.slice(1, 10).map((i) => tag("g:additional_image_link", i)).join("\n")}
${tag("g:availability", "in_stock")}
${tag("g:price", `${pr.toFixed(2)} ${POLICY.currency}`)}
${tag("g:brand", brand)}
${tag("g:condition", p.condition === "new" ? "new" : "refurbished")}
${tag("g:identifier_exists", "no")}
${tag("g:google_product_category", "Home & Garden > Household Appliance Accessories")}
${tag("g:product_type", cat)}
${tag("g:custom_label_0", cat)}
<g:shipping>${tag("g:country", "IN")}${tag("g:price", `${POLICY.shippingCost.toFixed(2)} ${POLICY.currency}`)}${tag("g:min_handling_time", POLICY.handlingMinDays)}${tag("g:max_handling_time", POLICY.handlingMaxDays)}${tag("g:min_transit_time", POLICY.transitMinDays)}${tag("g:max_transit_time", POLICY.transitMaxDays)}</g:shipping>
</item>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
${tag("title", "PCB Care")}
${tag("link", SITE_URL)}
${tag("description", "Refurbished AC, washing machine and refrigerator PCBs, sensors and remotes")}
${items.join("\n")}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
