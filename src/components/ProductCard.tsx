import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { price } from "@/lib/data";

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const pr = price(p);
  return (
    <Link href={`/shop/product/${p.slug}`} className="cc" prefetch={false}>
      <div className="ph">
        {p.images[0] ? <Image src={p.images[0]} alt={p.name} fill sizes="(max-width:768px) 45vw, 240px" priority={priority} style={{ objectFit: "cover" }} /> : <span aria-hidden>🧩</span>}
      </div>
      <div className="pn">{p.name}</div>
      {pr && <div className="pr">From ₹{pr.toLocaleString("en-IN")}</div>}
      <div className="gp">GET PRICE →</div>
    </Link>
  );
}
