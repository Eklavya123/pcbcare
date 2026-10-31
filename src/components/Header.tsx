import Image from "next/image";
import Link from "next/link";
import { APP_URL } from "@/lib/site";

export const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/error-codes", label: "Error Codes" },
  { href: "/sensor-values", label: "Sensor Values" },
  { href: "/find-remote", label: "Find Remote" },
  { href: "https://pcbcare.in/wiring", label: "Wiring Diagrams" },
  { href: "https://pcbcare.in/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Link href="/" aria-label="PCB Care home"><Image src="/logo.webp" alt="PCB Care" width={110} height={30} priority style={{ height: 30, width: "auto" }} /></Link>
        <nav className="dnav" aria-label="Main">
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        </nav>
        <a className="login" href={APP_URL || "/my-order"} rel="nofollow">Login</a>
      </div>
    </header>
  );
}
