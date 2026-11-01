import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { getBrandIndex, getCategories, getErrorCodes, groupErrorCodes } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { faqLd, itemListLd } from "@/lib/schema";
import { BUSINESS, POLICY } from "@/lib/site";
import { meta } from "@/lib/seo";

export const revalidate = 600;
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => safeParams(async () => (await getBrandIndex()).map((b) => ({ slug: b.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const slug = (await params).slug;
  const b = (await getBrandIndex()).find((x) => x.slug === slug);
  if (!b) return { title: "Brand not found", robots: { index: false } };
  return meta({ title: `${b.name} PCBs, Sensors & Remotes – Buy Online`, path: `/brands/${b.slug}`, image: b.products.find((p) => p.images[0])?.images[0], description: `${b.products.length} ${b.name} boards, sensors and remotes from PCB Care, Jabalpur. Refurbished and tested, delivered across India.` });
}

export default async function Brand({ params }: P) {
  const slug = (await params).slug;
  const b = (await getBrandIndex()).find((x) => x.slug === slug);
  if (!b) notFound();
  const [codes, cats] = await Promise.all([getErrorCodes(), getCategories()]);
  const hasCodes = groupErrorCodes(codes).has(slug);
  const byCat = cats.map((c) => ({ c, n: b.products.filter((p) => p.category_id === c.id).length })).filter((x) => x.n > 0);
  const faq = [
    { q: `Do you sell ${b.name} PCBs?`, a: `Yes. PCB Care lists ${b.products.length} ${b.name} boards, sensors and remotes${byCat.length ? `, including ${byCat.slice(0, 3).map((x) => x.c.name).join(", ")}` : ""}. Every board is refurbished and tested before dispatch.` },
    { q: `How do I find the right ${b.name} board for my appliance?`, a: "Match the part number printed on your old board with the product listing. If you are unsure, send a photo of the board on WhatsApp and we will confirm the match before you pay." },
    { q: "What are the delivery charges and time?", a: `Delivery is ₹${POLICY.shippingCost} through ${POLICY.courier} and takes ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days across India.` },
    { q: `Can you repair a ${b.name} board instead of replacing it?`, a: `Yes. ${BUSINESS.name} repairs boards in its ${BUSINESS.locality} workshop. Message ${BUSINESS.phone} on WhatsApp with a photo.` },
  ];
  const path = `/brands/${b.slug}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }, { name: b.name, path }]} />
      <JsonLd data={[faqLd(faq), itemListLd(`${b.name} products`, path, b.products.map((p) => ({ name: p.name, path: `/shop/product/${p.slug}`, image: p.images[0] })))]} />
      <div className="pad">
        <h1 className="t">{b.name} PCBs, Sensors &amp; Remotes</h1>
        <p className="lead">{b.products.length} {b.name} products from PCB Care, Jabalpur. Each board is refurbished and tested before dispatch.</p>
        {byCat.length > 0 && <p className="lead">{b.name} products by category: {byCat.map((x, i) => <span key={x.c.id}>{i > 0 && ", "}<Link className="lk" href={`/shop/category/${x.c.slug}`}>{x.c.name} ({x.n})</Link></span>)}.</p>}
        <div className="g2">{b.products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 2} />)}</div>
        <h2 className="h">{b.name} questions</h2>
        {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
        <div className="lnk">
          {hasCodes && <Link href={`/error-codes/${slug}`}>{b.name} error codes</Link>}
          <Link href="/brands">All brands</Link><Link href="/shop">Shop</Link>
        </div>
      </div>
    </>
  );
}
