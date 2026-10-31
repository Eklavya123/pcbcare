import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCategories, getProducts, price } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 600;
export const metadata = meta({ title: "All PCBs & Parts – Complete Product Directory", path: "/pcb-parts-directory", description: "Every PCB, sensor and remote sold by PCB Care in one list, grouped by category. Jabalpur, India." });

export default async function Directory() {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "All PCBs & Parts", path: "/pcb-parts-directory" }]} />
      <div className="pad">
        <h1 className="t">All PCBs &amp; Parts</h1>
        <p className="s">{products.length} products in {cats.length} categories.</p>
        {cats.map((c) => {
          const list = products.filter((p) => p.category_id === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id}>
              <h2 className="h"><Link href={`/shop/category/${c.slug}`}>{c.name}</Link> <span className="s">({list.length})</span></h2>
              <ul className="list">{list.map((p) => <li key={p.id}><Link href={`/shop/product/${p.slug}`}>{p.name}<small>{price(p) ? `From ₹${price(p)!.toLocaleString("en-IN")}` : "Price on WhatsApp"}</small></Link></li>)}</ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
