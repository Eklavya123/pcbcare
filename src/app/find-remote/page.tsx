import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getRemotes, modelSlugs } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = meta({ title: "Find Remote – Match Your AC PCB to Its Remote", path: "/find-remote", description: "Find the right AC remote for your board by brand and model number. PCB Care, Jabalpur." });

export default async function Remotes() {
  const map = modelSlugs(await getRemotes());
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Find Remote", path: "/find-remote" }]} />
      <div className="pad">
        <h1 className="t">🎮 Find Remote</h1>
        <p className="lead">Match your PCB to its remote by brand and model number.</p>
        <ul className="list">{[...map.entries()].map(([slug, r]) => <li key={slug}><Link href={`/find-remote/${slug}`}>{r.brand ? `${r.brand} ` : ""}{r.model_number}<small>{r.title || r.appliance || ""}</small></Link></li>)}</ul>
      </div>
    </>
  );
}
