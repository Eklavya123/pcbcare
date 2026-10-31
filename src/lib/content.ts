import { BUSINESS, POLICY, waLink } from "./site";
import type { Product } from "./types";
import { clip } from "./seo";

export const conditionLabel = (c: Product["condition"]) => (c === "new" ? "new" : "refurbished (tested before dispatch)");
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function productSummary(p: Product, category: string, brand: string | null, price: number | null) {
  const cond = p.condition === "new" ? "new" : "refurbished";
  return `${p.name} is a ${cond} ${category.toLowerCase()}${brand ? ` for ${brand} appliances` : ""} sold by ${BUSINESS.name}, ${BUSINESS.locality}.${price ? ` Starting from ${inr(price)}.` : ""} Delivery across India by ${POLICY.courier} in ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days for ${inr(POLICY.shippingCost)}.`;
}

export function productMetaDescription(p: Product, category: string, price: number | null) {
  const first = (p.description || "").replace(/\s+/g, " ").trim();
  const lead = first ? `${first.slice(0, 90)}. ` : "";
  return clip(`${p.name} – ${category}. ${lead}${price ? `From ${inr(price)}. ` : ""}Refurbished and tested, ships across India. PCB Care, Jabalpur.`, 158);
}

export function productFaqs(p: Product, price: number | null) {
  const qas = [
    { q: `Is the ${p.name} new or refurbished?`, a: `It is ${conditionLabel(p.condition)}. Every board sold by ${BUSINESS.name} is checked before it is dispatched.` },
    { q: "How much does delivery cost and how long does it take?", a: `Delivery is ${inr(POLICY.shippingCost)} through ${POLICY.courier} and takes ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days across India.` },
    { q: "What is the return and replacement policy?", a: POLICY.returnsSummary },
    { q: "How do I check that this board fits my appliance?", a: "Compare the part number and connector layout printed on your old board with this listing. If you are unsure, send a clear photo of your board on WhatsApp and we will confirm the match before you pay." },
    { q: price ? `What is the price of the ${p.name}?` : `How do I get the price of the ${p.name}?`, a: price ? `The listed starting price is ${inr(price)}. The final price is confirmed on WhatsApp at ${BUSINESS.phone}.` : `Message us on WhatsApp at ${BUSINESS.phone} and we will reply with the price and availability.` },
  ];
  return qas;
}

export const productWa = (p: Product, category: string) => waLink(`Hi, I'm interested in "${p.name}" (${category}) from PCB Care. Could you please share the price?`);
