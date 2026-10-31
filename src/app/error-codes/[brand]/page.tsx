import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getBrandIndex, getErrorCodes, groupErrorCodes } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { itemListLd } from "@/lib/schema";
import { clip, meta } from "@/lib/seo";

export const revalidate = 3600;
type P = { params: Promise<{ brand: string }> };
export const generateStaticParams = () => safeParams(async () => [...groupErrorCodes(await getErrorCodes()).keys()].map((brand) => ({ brand })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const b = groupErrorCodes(await getErrorCodes()).get((await params).brand);
  if (!b) return { title: "Brand not found", robots: { index: false } };
  return meta({ title: `${b.name} Error Codes – Meaning, Cause & Fix`, path: `/error-codes/${b.slug}`, description: `All ${b.codes.size} ${b.name} error codes with meaning, cause and how to fix. Reference for technicians from PCB Care, Jabalpur.` });
}

export default async function BrandCodes({ params }: P) {
  const slug = (await params).brand;
  const b = groupErrorCodes(await getErrorCodes()).get(slug);
  if (!b) notFound();
  const hasProducts = (await getBrandIndex()).some((x) => x.slug === slug);
  const codes = [...b.codes.values()].sort((x, y) => x.code.localeCompare(y.code, undefined, { numeric: true }));
  const path = `/error-codes/${b.slug}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Error Codes", path: "/error-codes" }, { name: b.name, path }]} />
      <JsonLd data={itemListLd(`${b.name} error codes`, path, codes.map((c) => ({ name: `${b.name} ${c.code}`, path: `${path}/${c.slug}` })))} />
      <div className="pad">
        <h1 className="t">{b.name} Error Codes</h1>
        <p className="lead">{codes.length} {b.name} fault codes. Select a code for the meaning, cause and fix.</p>
        <ul className="list">{codes.map((c) => <li key={c.slug}><Link href={`${path}/${c.slug}`}><span><b>{c.code}</b> <small>{clip(c.rows[0].meaning, 70)}</small></span></Link></li>)}</ul>
        <div className="lnk">{hasProducts && <Link href={`/brands/${slug}`}>{b.name} boards, sensors &amp; remotes</Link>}<Link href="/error-codes">All brands</Link></div>
      </div>
    </>
  );
}
