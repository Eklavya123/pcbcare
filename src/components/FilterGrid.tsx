"use client";
import { useState } from "react";
import type { ReactNode } from "react";

/** Server renders every product (fully crawlable); this only hides non-matching ones in the browser. */
export function FilterGrid({ placeholder, items }: { placeholder: string; items: { key: string; name: string; node: ReactNode }[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  return (
    <>
      <div className="stk"><input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></div>
      <div className="pad" style={{ paddingTop: 0 }}>
        {needle && !items.some((i) => i.name.toLowerCase().includes(needle)) && <div className="s" style={{ textAlign: "center", padding: 30, fontSize: 13 }}>No products match “{q}”.</div>}
        <div className="g2">
          {items.map((i) => <div key={i.key} hidden={!!needle && !i.name.toLowerCase().includes(needle)} style={{ display: needle && !i.name.toLowerCase().includes(needle) ? "none" : "block" }}>{i.node}</div>)}
        </div>
      </div>
    </>
  );
}
