import { BUSINESS, MAIN_SITE, POLICY, SITE_URL } from "./site";
import type { Product, Review } from "./types";
import { skuOf } from "./data";

type Json = Record<string, unknown>;
export const abs = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);
const ORG_ID = `${SITE_URL}/#business`;

const seller = { "@type": "Organization", "@id": ORG_ID, name: BUSINESS.name };

export const returnPolicy = (): Json => ({
  "@type": "MerchantReturnPolicy",
  applicableCountry: "IN",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  merchantReturnLink: POLICY.returnUrl,
});

export const shippingDetails = (): Json => ({
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: POLICY.shippingCost, currency: POLICY.currency },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: POLICY.handlingMinDays, maxValue: POLICY.handlingMaxDays, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: POLICY.transitMinDays, maxValue: POLICY.transitMaxDays, unitCode: "DAY" },
  },
});

export function organizationLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": ORG_ID,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: `${BUSINESS.tagline}. AC, washing machine, refrigerator and microwave PCBs, sensors and remotes, with in-house board repair in Jabalpur.`,
    url: SITE_URL,
    logo: abs("/logo192.png"),
    image: abs("/logo192.png"),
    telephone: BUSINESS.phoneE164,
    address: { "@type": "PostalAddress", streetAddress: BUSINESS.streetAddress, addressLocality: BUSINESS.locality, addressRegion: BUSINESS.region, postalCode: BUSINESS.postalCode, addressCountry: BUSINESS.country },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: BUSINESS.days, opens: BUSINESS.opens, closes: BUSINESS.closes }],
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [BUSINESS.facebook, BUSINESS.instagram, MAIN_SITE],
    hasMerchantReturnPolicy: returnPolicy(),
    contactPoint: { "@type": "ContactPoint", telephone: BUSINESS.phoneE164, contactType: "customer service", availableLanguage: ["English", "Hindi"], areaServed: "IN" },
  };
}

export const websiteLd = (): Json => ({
  "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: BUSINESS.name,
  publisher: { "@id": ORG_ID }, inLanguage: "en-IN",
});

export const breadcrumbLd = (items: { name: string; path: string }[]): Json => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});

export const itemListLd = (name: string, path: string, items: { name: string; path: string; image?: string }[]): Json => ({
  "@context": "https://schema.org", "@type": "CollectionPage", name, url: abs(path), isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: abs(it.path), name: it.name, ...(it.image ? { image: it.image } : {}) })) },
});

export const faqLd = (qas: { q: string; a: string }[]): Json => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: qas.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
});

export function productLd(p: Product, o: { brand: string | null; category: string; price: number | null; description: string; reviews: Review[] }): Json {
  const url = abs(`/shop/product/${p.slug}`);
  const base: Json = {
    "@context": "https://schema.org", "@type": o.price ? "Product" : "ItemPage",
  };
  if (!o.price) {
    // No public price = not a valid Product rich result and not eligible for Shopping. Say what the page is instead.
    return { ...base, "@id": `${url}#page`, url, name: p.name, description: o.description, ...(p.images[0] ? { primaryImageOfPage: { "@type": "ImageObject", url: p.images[0] } } : {}), isPartOf: { "@id": `${SITE_URL}/#website` } };
  }
  const out: Json = {
    ...base, "@id": `${url}#product`, url, name: p.name, description: o.description, sku: skuOf(p), category: o.category,
    ...(p.images.length ? { image: p.images } : {}),
    brand: { "@type": "Brand", name: o.brand || BUSINESS.name },
    itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
    ...(p.motor_type ? { additionalProperty: [{ "@type": "PropertyValue", name: "Motor type", value: p.motor_type }] } : {}),
    offers: {
      "@type": "Offer", url, priceCurrency: POLICY.currency, price: o.price,
      priceValidUntil: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
      itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
      seller, shippingDetails: shippingDetails(), hasMerchantReturnPolicy: returnPolicy(),
    },
  };
  // Ratings ONLY from approved reviews written about THIS product. Never a sitewide average.
  if (o.reviews.length) {
    const avg = o.reviews.reduce((s, r) => s + r.rating, 0) / o.reviews.length;
    out.aggregateRating = { "@type": "AggregateRating", ratingValue: Number(avg.toFixed(1)), reviewCount: o.reviews.length, bestRating: 5, worstRating: 1 };
    out.review = o.reviews.slice(0, 10).map((r) => ({
      "@type": "Review", author: { "@type": "Person", name: r.user_name }, datePublished: r.created_at.slice(0, 10),
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      ...(r.comment ? { reviewBody: r.comment } : {}),
    }));
  }
  return out;
}
