import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBrandIndex } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 600;
export const metadata = meta({ title: "Brands – PCBs, Sensors & Remotes by Brand", path: "/brands", description: "Shop AC, washing machine and refrigerator boards, sensors and remotes by brand: Daikin, LG, Samsung, Voltas, Blue Star, Carrier and more. PCB Care, Jabalpur." });

export default async function Brands() {
  const brands = await getBrandIndex();
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }]} />
      <div className="pad">
        <h1 className="t">Brands</h1>
        <p className="s">Choose your appliance brand to see matching boards, sensors and remotes.</p>
        <ul className="list" style={{ marginTop: 12 }}>{brands.map((b) => <li key={b.slug}><Link href={`/brands/${b.slug}`}>{b.name}<small>{b.products.length} products</small></Link></li>)}</ul>
      </div>
    </>
  );
}
