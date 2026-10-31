import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { itemListLd } from "@/lib/schema";
import { getCategories, getProducts } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 600;
export const metadata = meta({ title: "Shop AC, Washing Machine & Fridge PCBs, Sensors, Remotes", path: "/shop", description: "Browse refurbished, tested PCBs for air conditioners, washing machines, refrigerators and microwaves, plus sensors and remotes. PCB Care, Jabalpur." });

export default async function Shop() {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const count = (id: string) => products.filter((p) => p.category_id === id).length;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }]} />
      <JsonLd data={itemListLd("Shop", "/shop", cats.map((c) => ({ name: c.name, path: `/shop/category/${c.slug}`, image: c.image || undefined })))} />
      <div className="pad">
        <h1 className="t">🛍️ Shop</h1>
        <p className="s" style={{ marginBottom: 16 }}>Browse parts and PCBs by category. {products.length} products listed.</p>
        <div className="g2">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop/category/${c.slug}`} className="cc">
              <div className="ph">{c.image ? <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 45vw, 240px" style={{ objectFit: "cover" }} /> : <span aria-hidden>🧩</span>}</div>
              <b className="n">{c.name}</b><div className="s" style={{ marginTop: 4 }}>{count(c.id)} products</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
