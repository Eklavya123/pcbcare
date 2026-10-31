import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Page not found", robots: { index: false } };
export default function NotFound() {
  return (
    <div className="pad">
      <h1 className="t">Page not found</h1>
      <p className="lead">This page does not exist or has moved. Try the <Link className="lk" href="/shop">shop</Link>, <Link className="lk" href="/brands">brands</Link> or <Link className="lk" href="/error-codes">error codes</Link>.</p>
    </div>
  );
}
