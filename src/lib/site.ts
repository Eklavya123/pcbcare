export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://shop.pcbcare.in").replace(/\/$/, "");
export const MAIN_SITE = "https://pcbcare.in";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export const BUSINESS = {
  name: "PCB Care",
  legalName: "PCBcare",
  tagline: "Professional PCB Sales and Service",
  phone: "+91 91118 39918",
  phoneE164: "+919111839918",
  whatsapp: "919111839918",
  streetAddress: "Mani Plaza Market, Badi Omti",
  locality: "Jabalpur",
  region: "Madhya Pradesh",
  postalCode: "482002",
  country: "IN",
  opens: "11:00",
  closes: "21:00",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  facebook: "https://www.facebook.com/Pcbcare1/",
  instagram: "https://www.instagram.com/pcb_care/",
};

// Facts taken from the live shop's Refurbished/Delivery notice. Keep in ONE place so
// the page copy, JSON-LD and the Merchant Center feed can never disagree.
export const POLICY = {
  currency: "INR",
  shippingCost: 150,
  courier: "Delhivery",
  transitMinDays: 7,
  transitMaxDays: 10,
  // TODO(owner): confirm real dispatch time. Used in schema + feed (handling time).
  handlingMinDays: 0,
  handlingMaxDays: 2,
  returnsSummary:
    "No refunds. A replacement is given for a faulty board only if it is not broken, water damaged, short circuited or damaged by wrong installation.",
  returnUrl: `${MAIN_SITE}/return-refund-policy`,
  shippingUrl: `${MAIN_SITE}/delivery-policy`,
  contactUrl: `${MAIN_SITE}/contact`,
};

export const waLink = (text: string) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
