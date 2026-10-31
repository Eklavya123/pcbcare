"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/shop", icon: "🛍️", label: "Shop" },
  { href: "/error-codes", icon: "🔴", label: "Errors" },
  { href: "https://pcbcare.in/wiring", icon: "⚡", label: "Wiring" },
];

export function BottomNav() {
  const path = usePathname() || "/";
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <nav className="bnav" aria-label="Primary">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={on(t.href) ? "on" : ""}><div className="i" aria-hidden>{t.icon}</div><div className="l">{t.label}</div></Link>
      ))}
    </nav>
  );
}
