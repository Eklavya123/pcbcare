import { getBrandIndex, getCategories } from "@/lib/data";
import { BUSINESS, MAIN_SITE, POLICY, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

/** llms.txt: a plain, factual summary for AI assistants and answer engines. */
export async function GET() {
  const [cats, brands] = await Promise.all([getCategories(), getBrandIndex()]);
  const body = `# ${BUSINESS.name}

> ${BUSINESS.tagline}. Refurbished, tested control boards (PCBs), sensors and remotes for air conditioners, washing machines, refrigerators and microwaves, plus in-house board repair. Based in ${BUSINESS.locality}, ${BUSINESS.region}, India. Ships across India.

## Facts
- Address: ${BUSINESS.streetAddress}, ${BUSINESS.locality}, ${BUSINESS.region} ${BUSINESS.postalCode}, India
- Phone and WhatsApp: ${BUSINESS.phone}
- Hours: Monday to Saturday, 11:00 to 21:00 IST
- Delivery: INR ${POLICY.shippingCost} via ${POLICY.courier}, ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days
- Returns: ${POLICY.returnsSummary}
- Prices are starting prices; the final price is confirmed on WhatsApp.

## Shop
${cats.map((c) => `- [${c.name}](${SITE_URL}/shop/category/${c.slug})`).join("\n")}

## Brands
${brands.slice(0, 30).map((b) => `- [${b.name}](${SITE_URL}/brands/${b.slug}): ${b.products.length} products`).join("\n")}

## Reference
- [Error codes by brand](${SITE_URL}/error-codes)
- [Sensor values](${SITE_URL}/sensor-values)
- [Find a remote](${SITE_URL}/find-remote)
- [Wiring diagrams](${MAIN_SITE}/wiring)
- [Blog](${MAIN_SITE}/blog)
- [All products](${SITE_URL}/pcb-parts-directory)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
