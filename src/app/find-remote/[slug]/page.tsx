import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProducts, getRemotes, modelSlugs } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { meta } from "@/lib/seo";

export const revalidate = 3600;
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => safeParams(async () => [...modelSlugs(await getRemotes()).keys()].map((slug) => ({ slug })));
const load = async (slug: string) => modelSlugs(await getRemotes()).get(slug) ?? null;
const https = (u?: string | null) => (u && /^https:\/\//.test(u) ? u : null);

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const slug = (await params).slug; const r = await load(slug);
  if (!r) return { title: "Not found", robots: { index: false } };
  const name = `${r.brand ? r.brand + " " : ""}${r.model_number}`;
  return meta({ title: `${name} Remote – Compatible Board & Details`, path: `/find-remote/${slug}`, image: https(r.remote_image) ?? undefined, description: `${name}${r.appliance ? ` ${r.appliance}` : ""} remote and matching board details from PCB Care, Jabalpur.` });
}

export default async function Remote({ params }: P) {
  const slug = (await params).slug; const r = await load(slug);
  if (!r) notFound();
  const name = `${r.brand ? r.brand + " " : ""}${r.model_number}`;
  const img = https(r.remote_image);
  const ids = Array.isArray(r.linked_product_ids) ? r.linked_product_ids : [];
  const linked = ids.length ? (await getProducts()).filter((p) => ids.includes(p.id)) : [];
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Find Remote", path: "/find-remote" }, { name, path: `/find-remote/${slug}` }]} />
      <div className="pad">
        <h1 className="t">{name} Remote</h1>
        {r.title && <p className="lead">{r.title}</p>}
        {img && <div className="gal"><div className="im"><Image src={img} alt={`${name} remote`} fill sizes="220px" style={{ objectFit: "cover" }} /></div></div>}
        <table className="spec"><tbody>
          <tr><th>Model</th><td>{r.model_number}</td></tr>
          {r.brand && <tr><th>Brand</th><td>{r.brand}</td></tr>}
          {r.appliance && <tr><th>Appliance</th><td>{r.appliance}</td></tr>}
        </tbody></table>
        {linked.length > 0 && (<><h2 className="h">Matching products</h2><ul className="list">{linked.map((p) => <li key={p.id}><Link href={`/shop/product/${p.slug}`}>{p.name}</Link></li>)}</ul></>)}
        <div className="lnk"><Link href="/find-remote">All remotes</Link><Link href="/shop">Shop</Link></div>
      </div>
    </>
  );
}
