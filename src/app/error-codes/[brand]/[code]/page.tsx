import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getBrandIndex, getErrorCodes, groupErrorCodes } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { faqLd } from "@/lib/schema";
import { clip, meta } from "@/lib/seo";

export const revalidate = 3600;
type P = { params: Promise<{ brand: string; code: string }> };
export const generateStaticParams = () => safeParams(async () => [...groupErrorCodes(await getErrorCodes()).values()].flatMap((b) => [...b.codes.keys()].map((code) => ({ brand: b.slug, code }))));

async function load(p: P["params"]) {
  const { brand, code } = await p;
  const b = groupErrorCodes(await getErrorCodes()).get(brand);
  const c = b?.codes.get(code);
  return b && c ? { b, c } : null;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await load(params);
  if (!d) return { title: "Error code not found", robots: { index: false } };
  const { b, c } = d;
  return meta({ title: `${b.name} ${c.code} Error Code – Meaning & How to Fix`, path: `/error-codes/${b.slug}/${c.slug}`, description: clip(`${b.name} error ${c.code}: ${c.rows[0].meaning}. ${c.rows[0].cause ? `Cause: ${c.rows[0].cause}. ` : ""}Step-by-step fix from PCB Care.`, 158) });
}

export default async function Code({ params }: P) {
  const d = await load(params);
  if (!d) notFound();
  const { b, c } = d;
  const hasProducts = (await getBrandIndex()).some((x) => x.slug === b.slug);
  const path = `/error-codes/${b.slug}/${c.slug}`;
  const others = [...b.codes.values()].filter((x) => x.slug !== c.slug).slice(0, 12);
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Error Codes", path: "/error-codes" }, { name: b.name, path: `/error-codes/${b.slug}` }, { name: c.code, path }]} />
      <JsonLd data={faqLd(c.rows.map((r) => ({ q: `What does error code ${c.code} mean on a ${b.name} ${r.appliance}${r.model_number ? ` (${r.model_number})` : ""}?`, a: `${r.meaning}.${r.cause ? ` Cause: ${r.cause}.` : ""} Fix: ${r.how_to_fix}` })))} />
      <div className="pad">
        <h1 className="t">{b.name} {c.code} Error Code</h1>
        <p className="lead">{c.rows[0].meaning}.</p>
        {c.rows.map((r) => (
          <section key={r.id} className="box" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--ac)", fontWeight: 600, marginBottom: 6 }}>{r.appliance}{r.model_number ? ` · ${r.model_number}` : ""}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.meaning}</div>
            {r.cause && <p className="desc" style={{ marginBottom: 8 }}><b>Cause:</b> {r.cause}</p>}
            <p className="desc" style={{ marginBottom: 0 }}><b>How to fix:</b> {r.how_to_fix}</p>
          </section>
        ))}
        <div className="lnk">
          <Link href={`/error-codes/${b.slug}`}>All {b.name} codes</Link>
          {hasProducts && <Link href={`/brands/${b.slug}`}>{b.name} boards &amp; parts</Link>}
          <Link href="/shop">Shop</Link>
        </div>
        {others.length > 0 && (<><h2 className="h">Other {b.name} codes</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{others.map((o) => <Link key={o.slug} className="chip k" href={`/error-codes/${b.slug}/${o.slug}`}>{o.code}</Link>)}</div></>)}
      </div>
    </>
  );
}
