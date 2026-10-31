import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProducts, getSensors, modelSlugs } from "@/lib/data";
import { safeParams } from "@/lib/db";
import { clip, meta } from "@/lib/seo";

export const revalidate = 3600;
type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => safeParams(async () => [...modelSlugs(await getSensors()).keys()].map((slug) => ({ slug })));
const load = async (slug: string) => modelSlugs(await getSensors()).get(slug) ?? null;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const slug = (await params).slug; const s = await load(slug);
  if (!s) return { title: "Not found", robots: { index: false } };
  return meta({ title: `${s.brand ? s.brand + " " : ""}${s.model_number} Sensor Values`, path: `/sensor-values/${slug}`, description: clip(`${s.title}. ${s.description}`, 158) });
}

export default async function Sensor({ params }: P) {
  const slug = (await params).slug; const s = await load(slug);
  if (!s) notFound();
  const rows: [string, string | null][] = [["PCB type", s.pcb_type], ["Room sensor", s.room_sensor_value], ["Coil sensor", s.coil_sensor_value], ["Discharge sensor", s.discharge_sensor_value], ["Ambient sensor", s.ambient_sensor_value], ["Condenser coil sensor", s.condenser_coil_sensor_value]];
  const ids = Array.isArray(s.linked_product_ids) ? s.linked_product_ids : [];
  const linked = ids.length ? (await getProducts()).filter((p) => ids.includes(p.id)) : [];
  const name = `${s.brand ? s.brand + " " : ""}${s.model_number}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Sensor Values", path: "/sensor-values" }, { name, path: `/sensor-values/${slug}` }]} />
      <div className="pad">
        <h1 className="t">{name} Sensor Values</h1>
        <p className="lead">{s.title}</p>
        <div className="desc">{s.description}</div>
        <table className="spec"><tbody>{rows.filter(([, v]) => v).map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
        {linked.length > 0 && (<><h2 className="h">Matching products</h2><ul className="list">{linked.map((p) => <li key={p.id}><Link href={`/shop/product/${p.slug}`}>{p.name}</Link></li>)}</ul></>)}
        <div className="lnk"><Link href="/sensor-values">All sensor values</Link><Link href="/shop">Shop</Link></div>
      </div>
    </>
  );
}
