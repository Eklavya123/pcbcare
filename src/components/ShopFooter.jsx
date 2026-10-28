// For shop.pcbcare.in (React). Save as src/components/ShopFooter.jsx and render
// it at the bottom of EVERY page, e.g. inside App.js after your routes:
//   import ShopFooter from "./components/ShopFooter";
//   ...
//   <ShopFooter />
//
// Everything below is plain visible text and normal links, so Google can read
// your business details and policies on the shop itself.

const linkStyle = { color: "#9db4ff", textDecoration: "none" };

export default function ShopFooter() {
  return (
    <footer
      style={{
        background: "#0a0d14",
        color: "#c9d1e6",
        padding: "28px 20px",
        fontSize: 14,
        lineHeight: 1.7,
        marginTop: 40,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <strong style={{ color: "#fff", fontSize: 16 }}>PCBcare</strong>
        <div>Professional PCB Sales and Service</div>
        <div>Mani Plaza Market, Badi Omti, Jabalpur, Madhya Pradesh 482002, India</div>
        <div>
          Phone / WhatsApp:{" "}
          <a href="tel:+919111839918" style={linkStyle}>
            +91 91118 39918
          </a>
        </div>
        <div>Open Monday to Saturday, 11:00 am to 9:00 pm</div>

        <nav
          aria-label="Policies"
          style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}
        >
          <a href="https://pcbcare.in/contact" style={linkStyle}>Contact Us</a>
          <a href="https://pcbcare.in/delivery-policy" style={linkStyle}>Shipping Policy</a>
          <a href="https://pcbcare.in/return-refund-policy" style={linkStyle}>Return &amp; Refund Policy</a>
          <a href="https://pcbcare.in/terms-and-conditions" style={linkStyle}>Terms &amp; Conditions</a>
          <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>
          <a href="/pcb-parts-directory" style={linkStyle}>All PCBs &amp; Parts</a>
          <a href="https://pcbcare.in" style={linkStyle}>pcbcare.in</a>
        </nav>

        <div style={{ marginTop: 14, fontSize: 12, color: "#8a93ad" }}>
          All boards sold are refurbished and tested. Delivery charge ₹150 via
          Delhivery, 7 to 10 days.
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#8a93ad" }}>
          © {new Date().getFullYear()} PCBcare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
