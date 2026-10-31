import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { getBrandIndex, getErrorCodes, groupErrorCodes } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { itemListLd } from "@/lib/schema";
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
  const hasCodes = groupErrorCodes(await getErrorCodes()).has(slug);
  const path = `/brands/${b.slug}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }, { name: b.name, path }]} />
      <JsonLd data={itemListLd(`${b.name} products`, path, b.products.map((p) => ({ name: p.name, path: `/shop/product/${p.slug}`, image: p.images[0] })))} />
      <div className="pad">
        <h1 className="t">{b.name} PCBs, Sensors &amp; Remotes</h1>
        <p className="lead">{b.products.length} {b.name} products from PCB Care, Jabalpur. Each board is refurbished and tested before dispatch.</p>
        <div className="g2">{b.products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 2} />)}</div>
        <div className="lnk">
          {hasCodes && <Link href={`/error-codes/${slug}`}>{b.name} error codes</Link>}
          <Link href="/brands">All brands</Link><Link href="/shop">Shop</Link>
        </div>
      </div>
    </>
  );
}
