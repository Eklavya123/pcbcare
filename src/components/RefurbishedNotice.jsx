// For shop.pcbcare.in (React). Save as src/components/RefurbishedNotice.jsx
// and place it on every PRODUCT page, right under the price:
//   import RefurbishedNotice from "../components/RefurbishedNotice";
//   <RefurbishedNotice />

const linkStyle = { color: "#9db4ff" };

export default function RefurbishedNotice() {
  return (
    <div
      style={{
        border: "1px solid #2a3350",
        borderRadius: 10,
        padding: "12px 14px",
        margin: "14px 0",
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <div>
        <strong>Condition:</strong> Refurbished (tested before dispatch)
      </div>
      <div>
        <strong>Delivery:</strong> ₹150 via Delhivery courier, 7 to 10 days
      </div>
      <div>
        <strong>Returns:</strong> No refunds. Replacement for a faulty board only if it
        is not broken, water damaged, short circuited or damaged by wrong installation.{" "}
        <a href="https://pcbcare.in/return-refund-policy" style={linkStyle}>
          Read the full policy
        </a>
        .
      </div>
      <div>
        <a href="https://pcbcare.in/delivery-policy" style={linkStyle}>Shipping Policy</a>
        {" · "}
        <a href="https://pcbcare.in/contact" style={linkStyle}>Contact Us</a>
      </div>
    </div>
  );
}
