import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterGrid } from "@/components/FilterGrid";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { itemListLd } from "@/lib/schema";
import { brandOf, getBrandNames, getCategories, getProducts } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { meta } from "@/lib/seo";

export const revalidate = 600;
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => safeParams(async () => (await getCategories()).map((c) => ({ slug: c.slug })));

async function load(slug: string) {
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return null;
  const [all, known] = await Promise.all([getProducts(), getBrandNames()]);
  const products = all.filter((p) => p.category_id === cat.id);
  return { cat, cats, products, known };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await load((await params).slug);
  if (!d) return { title: "Category not found", robots: { index: false } };
  const n = d.products.length;
  return meta({ title: `${d.cat.name} – Buy Online in India`, path: `/shop/category/${d.cat.slug}`, image: d.cat.image || d.products[0]?.images[0],
    description: `Buy ${d.cat.name} from PCB Care, Jabalpur. ${n} models listed with part details. Refurbished and tested, delivered across India. Get the price on WhatsApp.` });
}

export default async function Category({ params }: P) {
  const d = await load((await params).slug);
  if (!d) notFound();
  const { cat, cats, products, known } = d;
  const brands = [...new Set(products.map((p) => brandOf(p, known)).filter(Boolean) as string[])];
  const path = `/shop/category/${cat.slug}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: cat.name, path }]} />
      <JsonLd data={itemListLd(cat.name, path, products.map((p) => ({ name: p.name, path: `/shop/product/${p.slug}`, image: p.images[0] })))} />
      <div className="pad" style={{ paddingBottom: 0 }}>
        <h1 className="t">{cat.name}</h1>
        <p className="lead">{products.length ? `${products.length} ${cat.name} models from PCB Care, Jabalpur${brands.length ? `, including ${brands.slice(0, 5).join(", ")}` : ""}. Every board is refurbished and tested before dispatch, with delivery across India.` : "No products in this category yet."}</p>
      </div>
      <FilterGrid placeholder={`Search in ${cat.name}…`} items={products.map((p, i) => ({ key: p.id, name: p.name, node: <ProductCard p={p} priority={i < 2} /> }))} />
      <div className="pad">
        {brands.length > 0 && (<><h2 className="h">Brands in this category</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{brands.map((b) => <Link key={b} href={`/brands/${slugify(b)}`} className="chip k">{b}</Link>)}</div></>)}
        <h2 className="h">More categories</h2>
        <div className="lnk" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>{cats.filter((c) => c.id !== cat.id).map((c) => <Link key={c.id} href={`/shop/category/${c.slug}`}>{c.name}</Link>)}</div>
      </div>
    </>
  );
}
