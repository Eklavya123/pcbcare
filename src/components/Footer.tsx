import Link from "next/link";
import { BUSINESS, MAIN_SITE, POLICY } from "@/lib/site";

export function Footer({ categories = [] as { name: string; slug: string }[] }) {
  return (
    <footer className="ft">
      <div className="ft-in">
        <strong style={{ color: "#fff", fontSize: 16 }}>{BUSINESS.legalName}</strong>
        <div>{BUSINESS.tagline}</div>
        <div>{BUSINESS.streetAddress}, {BUSINESS.locality}, {BUSINESS.region} {BUSINESS.postalCode}, India</div>
        <div>Phone / WhatsApp: <a href={`tel:${BUSINESS.phoneE164}`}>{BUSINESS.phone}</a></div>
        <div>Open Monday to Saturday, 11:00 am to 9:00 pm</div>
        {categories.length > 0 && (<>
          <h2>Shop by category</h2>
          <nav aria-label="Categories">{categories.map((c) => <Link key={c.slug} href={`/shop/category/${c.slug}`}>{c.name}</Link>)}</nav>
        </>)}
        <h2>Learn</h2>
        <nav aria-label="Resources">
          <Link href="/brands">Brands</Link><Link href="/error-codes">Error codes</Link><Link href="/sensor-values">Sensor values</Link>
          <Link href="/find-remote">Find remote</Link><Link href="/pcb-parts-directory">All PCBs &amp; parts</Link>
          <a href={`${MAIN_SITE}/wiring`}>Wiring diagrams</a><a href={`${MAIN_SITE}/blog`}>Blog</a>
        </nav>
        <h2>Policies</h2>
        <nav aria-label="Policies">
          <a href={POLICY.contactUrl}>Contact Us</a><a href={POLICY.shippingUrl}>Shipping Policy</a><a href={POLICY.returnUrl}>Return &amp; Refund Policy</a>
          <a href={`${MAIN_SITE}/terms-and-conditions`}>Terms &amp; Conditions</a><a href={`${MAIN_SITE}/privacy-policy`}>Privacy Policy</a>
          <a href={`${MAIN_SITE}/cookie-policy`}>Cookie Policy</a><a href={`${MAIN_SITE}/grievance-redressal`}>Grievance Redressal</a><a href={MAIN_SITE}>pcbcare.in</a>
        </nav>
        <div className="fine">All boards sold are refurbished and tested. Delivery charge ₹{POLICY.shippingCost} via {POLICY.courier}, {POLICY.transitMinDays} to {POLICY.transitMaxDays} days.</div>
        <div className="fine">© {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.</div>
      </div>
    </footer>
  );
}
