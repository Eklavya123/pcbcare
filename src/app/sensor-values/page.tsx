import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getSensors, modelSlugs } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = meta({ title: "AC Sensor Values – Room, Coil & Discharge Sensor Resistance", path: "/sensor-values", description: "Sensor resistance values (room, coil, discharge, ambient) for AC models by brand. Reference for technicians from PCB Care, Jabalpur." });

export default async function Sensors() {
  const map = modelSlugs(await getSensors());
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Sensor Values", path: "/sensor-values" }]} />
      <div className="pad">
        <h1 className="t">📡 Sensor Values</h1>
        <p className="lead">Component test values by brand and model.</p>
        <ul className="list">{[...map.entries()].map(([slug, s]) => <li key={slug}><Link href={`/sensor-values/${slug}`}>{s.brand ? `${s.brand} ` : ""}{s.model_number}<small>{s.title}</small></Link></li>)}</ul>
      </div>
    </>
  );
}
