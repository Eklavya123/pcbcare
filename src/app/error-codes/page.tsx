import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getErrorCodes, groupErrorCodes } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = meta({ title: "AC & Washing Machine Error Codes – Meaning, Cause & Fix", path: "/error-codes", description: "Error code lookup for AC, washing machine and refrigerator brands: Voltas, Daikin, LG, Samsung, Blue Star, Carrier and more. Meaning, cause and how to fix." });

export default async function ErrorCodes() {
  const brands = [...groupErrorCodes(await getErrorCodes()).values()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Error Codes", path: "/error-codes" }]} />
      <div className="pad">
        <h1 className="t">🔴 Error Codes</h1>
        <p className="lead">Pick a brand to see every fault code with its meaning, likely cause and how technicians fix it.</p>
        <ul className="list">{brands.map((b) => <li key={b.slug}><Link href={`/error-codes/${b.slug}`}>{b.name}<small>{b.codes.size} codes</small></Link></li>)}</ul>
      </div>
    </>
  );
}
