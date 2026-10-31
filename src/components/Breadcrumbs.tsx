import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbLd } from "@/lib/schema";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <nav className="crumbs" aria-label="Breadcrumb">
        {items.map((it, i) => (
          <span key={it.path} style={{ margin: 0 }}>
            {i > 0 && <span aria-hidden>›</span>}
            {i < items.length - 1 ? <Link href={it.path}>{it.name}</Link> : <span aria-current="page" style={{ margin: 0 }}>{it.name}</span>}
          </span>
        ))}
      </nav>
    </>
  );
}
