import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { faqLd, itemListLd } from "@/lib/schema";
import { getBrandIndex, getCategories, getProducts } from "@/lib/data";
import { BUSINESS, MAIN_SITE, POLICY } from "@/lib/site";
import { meta } from "@/lib/seo";

export const revalidate = 600;
export const metadata = meta({
  title: "PCB Care – AC, Washing Machine & Fridge PCBs, Sensors & Remotes | Jabalpur",
  absoluteTitle: true, path: "/",
  description: "Buy refurbished, tested AC, washing machine, refrigerator and microwave PCBs, sensors and remotes from PCB Care, Jabalpur. Prices on WhatsApp, delivery across India.",
});

const FEATURES = [
  { e: "🛍️", t: "Shop", d: "Boards, sensors and remotes", c: "#4caf50", h: "/shop" },
  { e: "🗂️", t: "All PCBs & Parts", d: "Every product in one list", c: "#4caf50", h: "/pcb-parts-directory" },
  { e: "🏷️", t: "Brands", d: "Daikin, LG, Samsung and more", c: "#ffd700", h: "/brands" },
  { e: "🔴", t: "Error Codes", d: "Fault codes by brand", c: "#ff4757", h: "/error-codes" },
  { e: "📡", t: "Sensor Values", d: "Component test values", c: "#00bcd4", h: "/sensor-values" },
  { e: "🎮", t: "Find Remote", d: "Match PCB to its remote", c: "#e91e63", h: "/find-remote" },
  { e: "⚡", t: "Wiring Diagrams", d: "Circuit diagrams & images", c: "#ffd700", h: `${MAIN_SITE}/wiring` },
  { e: "📝", t: "Blog", d: "Guides, tips & how-tos", c: "#ffd700", h: `${MAIN_SITE}/blog` },
  { e: "📦", t: "My Order", d: "Track your order status", c: "#00e5ff", h: "/my-order" },
];

const FAQ = [
  { q: "What does PCB Care sell?", a: "PCB Care sells refurbished, tested control boards (PCBs), temperature sensors and remotes for air conditioners, washing machines, refrigerators and microwaves, and repairs boards in its Jabalpur workshop." },
  { q: "Do you deliver across India?", a: `Yes. Delivery is ₹${POLICY.shippingCost} through ${POLICY.courier} and takes ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days.` },
  { q: "Are the boards new or refurbished?", a: "Almost all boards are refurbished and tested before dispatch. Each product page states its condition." },
  { q: "How do I order or get a price?", a: `Open the product and tap Get Price on WhatsApp, or message ${BUSINESS.phone}. Send the part number or a photo of your old board and we will confirm the match.` },
  { q: "Where is the store?", a: `${BUSINESS.streetAddress}, ${BUSINESS.locality}, ${BUSINESS.region} ${BUSINESS.postalCode}. Open Monday to Saturday, 11:00 am to 9:00 pm.` },
];

export default async function Home() {
  const [cats, products, brands] = await Promise.all([getCategories(), getProducts(), getBrandIndex()]);
  const latest = [...products].filter((p) => p.images.length).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8);
  return (
    <>
      <JsonLd data={[faqLd(FAQ), itemListLd("Shop categories", "/shop", cats.map((c) => ({ name: c.name, path: `/shop/category/${c.slug}`, image: c.image || undefined })))]} />
      <div className="pad">
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>AC, Washing Machine &amp; Fridge PCBs, Sensors &amp; Remotes</h1>
        <p className="s" style={{ margin: "0 0 18px", fontSize: 13 }}>Refurbished, tested boards from PCB Care, Jabalpur. Delivery across India.</p>
        <div className="g2" style={{ marginBottom: 16 }}>
          {FEATURES.map((f) => (
            <Link key={f.t} href={f.h} className="fc" style={{ border: `1px solid ${f.c}22` }}>
              <div className="e" aria-hidden>{f.e}</div><b>{f.t}</b><span>{f.d}</span>
            </Link>
          ))}
        </div>

        <h2 className="h">Shop by category</h2>
        <div className="g2">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop/category/${c.slug}`} className="cc">
              <div className="ph">{c.image ? <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 45vw, 240px" style={{ objectFit: "cover" }} /> : <span aria-hidden>🧩</span>}</div>
              <b className="n">{c.name}</b>
            </Link>
          ))}
        </div>

        {latest.length > 0 && (<>
          <h2 className="h">Latest products</h2>
          <div className="g2">{latest.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 2} />)}</div>
        </>)}

        <h2 className="h">Shop by brand</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {brands.slice(0, 20).map((b) => <Link key={b.slug} href={`/brands/${b.slug}`} className="chip k">{b.name} ({b.products.length})</Link>)}
        </div>

        <h2 className="h">About PCB Care</h2>
        <p className="lead">PCB Care is a board-level repair workshop and parts store at {BUSINESS.streetAddress}, {BUSINESS.locality}. We repair and supply control boards for air conditioners, washing machines, refrigerators and microwaves, and publish the error codes, sensor values and wiring diagrams technicians use every day.</p>

        <h2 className="h">Frequently asked questions</h2>
        {FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}

        <div className="box" style={{ marginTop: 26 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Follow PCB Care</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={BUSINESS.facebook} rel="noopener noreferrer me" target="_blank" style={{ flex: 1, textAlign: "center", padding: 10, borderRadius: 10, background: "#1877f222", color: "#1877f2", fontWeight: 600, fontSize: 12 }}>📘 Facebook</a>
            <a href={BUSINESS.instagram} rel="noopener noreferrer me" target="_blank" style={{ flex: 1, textAlign: "center", padding: 10, borderRadius: 10, background: "linear-gradient(135deg,#f0930022,#dc267722,#a41cd622)", color: "#dc2677", fontWeight: 600, fontSize: 12 }}>📷 Instagram</a>
          </div>
        </div>
      </div>
    </>
  );
}
