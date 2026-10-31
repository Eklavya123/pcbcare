import { POLICY } from "@/lib/site";
export function DeliveryNotice({ condition }: { condition: string }) {
  return (
    <div className="note">
      <div><strong>Condition:</strong> {condition === "new" ? "New" : "Refurbished (tested before dispatch)"}</div>
      <div><strong>Delivery:</strong> ₹{POLICY.shippingCost} via {POLICY.courier} courier, {POLICY.transitMinDays} to {POLICY.transitMaxDays} days</div>
      <div><strong>Returns:</strong> {POLICY.returnsSummary} <a href={POLICY.returnUrl}>Read the full policy</a>.</div>
      <div><a href={POLICY.shippingUrl}>Shipping Policy</a> · <a href={POLICY.contactUrl}>Contact Us</a></div>
    </div>
  );
}
