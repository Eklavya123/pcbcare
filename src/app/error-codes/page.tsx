import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { faqLd } from "@/lib/schema";
import { getErrorCodes, groupErrorCodes } from "@/lib/data";
import { meta } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = meta({ title: "AC & Washing Machine Error Codes – Meaning & Fix", path: "/error-codes", description: "Error code lookup for AC, washing machine and refrigerator brands: Voltas, Daikin, LG, Samsung, Blue Star, Carrier and more. Meaning, cause and how to fix." });

const FAQ = [
  { q: "What is an error code on an AC or washing machine?", a: "It is a fault code shown by the appliance when its control board detects a problem, for example a sensor reading out of range, a communication failure between the indoor and outdoor unit, or a motor that does not start." },
  { q: "Does an error code always mean the PCB is faulty?", a: "No. Many codes point to a sensor, connector, wiring or a power supply problem. Check the sensor, its plug and the wiring first, and replace or repair the board only when those are good." },
  { q: "How do I use this list?", a: "Choose your brand, open the code shown on the display, and read the meaning, the likely cause and the suggested fix. If the board turns out to be the cause, you can order a matching refurbished board from the shop." },
  { q: "Can PCB Care repair my board instead of replacing it?", a: "Yes. PCB Care repairs AC, washing machine, refrigerator and microwave boards in its Jabalpur workshop. Message us on WhatsApp with a photo of the board." },
];

export default async function ErrorCodes() {
  const brands = [...groupErrorCodes(await getErrorCodes()).values()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Error Codes", path: "/error-codes" }]} />
      <div className="pad">
        <h1 className="t">🔴 Error Codes</h1>
        <p className="lead">Pick a brand to see every fault code with its meaning, likely cause and how technicians fix it.</p>
        <p className="lead">This reference covers {brands.length} brands and {brands.reduce((n, b) => n + b.codes.size, 0)} codes for air conditioners, washing machines and refrigerators. Each code page explains what the appliance is reporting, which part usually causes it, and what to check before replacing a board.</p>
        <JsonLd data={faqLd(FAQ)} />
        <ul className="list">{brands.map((b) => <li key={b.slug}><Link href={`/error-codes/${b.slug}`}>{b.name}<small>{b.codes.size} codes</small></Link></li>)}</ul>
        <h2 className="h">Frequently asked questions</h2>
        {FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
    </>
  );
}
