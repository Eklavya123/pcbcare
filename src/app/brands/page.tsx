import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getBrandIndex } from "@/lib/data";
import { faqLd } from "@/lib/schema";
import { BUSINESS, POLICY } from "@/lib/site";
import { meta } from "@/lib/seo";

export const revalidate = 600;
export const metadata = meta({ title: "Brands – PCBs, Sensors & Remotes by Brand", path: "/brands", description: "Shop AC, washing machine and refrigerator boards, sensors and remotes by brand: Daikin, LG, Samsung, Voltas, Blue Star, Carrier and more. PCB Care, Jabalpur." });

export default async function Brands() {
  const brands = await getBrandIndex();
  const faq = [
    { q: "Which appliance brands do you stock boards for?", a: `PCB Care lists boards, sensors and remotes for ${brands.length} brands, including ${brands.slice(0, 6).map((b) => b.name).join(", ")}.` },
    { q: "Can I get a board for a brand that is not listed?", a: `Message ${BUSINESS.phone} on WhatsApp with a photo of your board. We often source or repair boards for brands that are not yet listed.` },
    { q: "How are boards matched to my appliance?", a: "Match the part number and connector layout printed on your old board with the product listing. We confirm the match on WhatsApp before you pay." },
    { q: "What are the delivery charges?", a: `Delivery is ₹${POLICY.shippingCost} through ${POLICY.courier}, taking ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days across India.` },
  ];
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }]} />
      <div className="pad">
        <h1 className="t">Brands</h1>
        <p className="lead">Choose your appliance brand to see matching boards, sensors and remotes. Every board is refurbished and tested before dispatch, and each listing shows the part number so you can match it to your old board.</p>
        <JsonLd data={faqLd(faq)} />
        <ul className="list" style={{ marginTop: 12 }}>{brands.map((b) => <li key={b.slug}><Link href={`/brands/${b.slug}`}>{b.name}<small>{b.products.length} products</small></Link></li>)}</ul>
        <h2 className="h">Frequently asked questions</h2>
        {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
    </>
  );
}
