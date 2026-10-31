import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DeliveryNotice } from "@/components/DeliveryNotice";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { productFaqs, productMetaDescription, productSummary, productWa } from "@/lib/content";
import { brandOf, getBrandNames, getCategories, getErrorCodes, getProduct, getProductReviews, getProducts, groupErrorCodes, price } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { faqLd, productLd } from "@/lib/schema";
import { meta } from "@/lib/seo";
import { slugify } from "@/lib/slug";
import { MAIN_SITE } from "@/lib/site";

export const revalidate = 600;
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => safeParams(async () => (await getProducts()).map((p) => ({ slug: p.slug })));

async function load(slug: string) {
  const p = await getProduct(slug);
  if (!p) return null;
  const [cats, known, reviews] = await Promise.all([getCategories(), getBrandNames(), getProductReviews(slug)]);
  const cat = cats.find((c) => c.id === p.category_id) ?? null;
  return { p, cat, brand: brandOf(p, known), reviews };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await load((await params).slug);
  if (!d) return { title: "Product not found", robots: { index: false } };
  const { p, cat } = d;
  return meta({ title: `${p.name} – Buy Online | PCB Care Jabalpur`, absoluteTitle: true, path: `/shop/product/${p.slug}`, image: p.images[0], description: productMetaDescription(p, cat?.name ?? "PCB", price(p)) });
}

export default async function Product({ params }: P) {
  const d = await load((await params).slug);
  if (!d) notFound();
  const { p, cat, brand, reviews } = d;
  const pr = price(p);
  const catName = cat?.name ?? "PCB";
  const summary = productSummary(p, catName, brand, pr);
  const faqs = productFaqs(p, pr);
  const related = cat ? (await getProducts()).filter((x) => x.category_id === cat.id && x.id !== p.id).slice(0, 8) : [];
  const brandSlug = brand ? slugify(brand) : null;
  const hasCodes = brandSlug ? groupErrorCodes(await getErrorCodes()).has(brandSlug) : false;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, ...(cat ? [{ name: cat.name, path: `/shop/category/${cat.slug}` }] : []), { name: p.name, path: `/shop/product/${p.slug}` }];

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <JsonLd data={[productLd(p, { brand, category: catName, price: pr, description: p.description?.trim() || summary, reviews }), faqLd(faqs)]} />
      <div className="pad pdp">
        <div>
          {p.images.length ? (
            <div className="gal">{p.images.map((src, i) => <div className="im" key={src}><Image src={src} alt={`${p.name}${p.images.length > 1 ? ` – photo ${i + 1}` : ""}`} fill sizes="220px" priority={i === 0} style={{ objectFit: "cover" }} /></div>)}</div>
          ) : <div className="ph" style={{ height: 200, borderRadius: 14, fontSize: 36 }} aria-hidden>🧩</div>}
        </div>
        <div>
          <h1 className="t">{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0", flexWrap: "wrap" }}>
            {cat && <Link href={`/shop/category/${cat.slug}`} style={{ fontSize: 12, color: "var(--ac)", fontWeight: 600 }}>{cat.name}</Link>}
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: p.condition === "new" ? "#4caf5022" : "#ffd70022", color: p.condition === "new" ? "var(--pc)" : "var(--ac)" }}>{p.condition === "new" ? "🆕 New" : "♻️ Refurbished"}</span>
            {reviews.length > 0 && <span style={{ fontSize: 12 }}><span className="stars" aria-hidden>★</span> {avg.toFixed(1)} ({reviews.length})</span>}
          </div>
          {(brand || p.motor_type) && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {brand && <Link className="chip" href={`/brands/${brandSlug}`}>{brand}</Link>}
            {p.motor_type && <span className="chip g">⚙️ {p.motor_type}</span>}
          </div>}
          <p className="lead">{summary}</p>
          {p.description?.trim() && <div className="desc">{p.description}</div>}
          {pr && <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pc)", marginBottom: 10 }}>Starting from ₹{pr.toLocaleString("en-IN")}</div>}
          <DeliveryNotice condition={p.condition} />
          <a className="wa" href={productWa(p, catName)} target="_blank" rel="noopener nofollow">💬 GET PRICE on WhatsApp</a>
        </div>
      </div>

      <div className="pad" style={{ paddingTop: 0 }}>
        <TrustBadges />
        <h2 className="h">Product details</h2>
        <table className="spec"><tbody>
          <tr><th>Product</th><td>{p.name}</td></tr>
          {brand && <tr><th>Brand</th><td>{brand}</td></tr>}
          <tr><th>Category</th><td>{catName}</td></tr>
          <tr><th>Condition</th><td>{p.condition === "new" ? "New" : "Refurbished, tested before dispatch"}</td></tr>
          {p.motor_type && <tr><th>Motor type</th><td>{p.motor_type}</td></tr>}
          {pr && <tr><th>Starting price</th><td>₹{pr.toLocaleString("en-IN")} (final price confirmed on WhatsApp)</td></tr>}
        </tbody></table>

        <h2 className="h">Customer reviews</h2>
        {reviews.length === 0 ? <p className="s">No reviews for this product yet.</p> : reviews.map((r) => (
          <div className="rev" key={r.id}><span className="stars" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span> <b>{r.user_name}</b>{r.comment && <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>{r.comment}</p>}</div>
        ))}

        <h2 className="h">Questions about this board</h2>
        {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}

        {related.length > 0 && (<>
          <h2 className="h">More from {catName}</h2>
          <div className="strip">{related.map((r) => (
            <Link key={r.id} href={`/shop/product/${r.slug}`} prefetch={false}>
              <div className="ph">{r.images[0] ? <Image src={r.images[0]} alt={r.name} fill sizes="130px" style={{ objectFit: "cover" }} /> : <span aria-hidden>🧩</span>}</div>
              <b>{r.name}</b>
            </Link>))}</div>
        </>)}

        {p.keywords.length > 0 && <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid var(--border)" }}><div className="s" style={{ fontWeight: 700, marginBottom: 8 }}>Keywords</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{p.keywords.map((k) => <span key={k} className="chip k">{k}</span>)}</div></div>}

        <div className="lnk">
          {cat && <Link href={`/shop/category/${cat.slug}`}>More {cat.name}</Link>}
          {brand && <Link href={`/brands/${brandSlug}`}>All {brand} products</Link>}
          {hasCodes && <Link href={`/error-codes/${brandSlug}`}>{brand} error codes</Link>}
          <Link href="/pcb-parts-directory">All PCBs &amp; Parts</Link>
          <a href={`${MAIN_SITE}/wiring`}>Wiring diagrams</a>
          <Link href="/error-codes">Error codes</Link>
        </div>
      </div>
    </>
  );
}
