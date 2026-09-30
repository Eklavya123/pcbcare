// /api/product-meta.js
// ─────────────────────────────────────────────────────────────────────────
// Server-rendered <title>/meta/OG/JSON-LD for a single product page.
// ONLY hit by crawlers/link-preview bots — see vercel.json's "has" User-Agent
// match, which routes just those requests here for /shop/product/:slug.
// Everyone else (real visitors) still gets the normal SPA via index.html,
// completely unaffected by this file.
//
// Why this exists: the app is a client-rendered React SPA, so document.title
// only becomes the product name AFTER React mounts and fetches the product.
// Google (and especially WhatsApp/Facebook/Twitter preview bots) often index
// or preview using the raw, un-rendered HTML — which just has the generic
// "PCB Care" title — so products were showing up in search/shares under the
// site name instead of their own name. This function fixes that by fetching
// the product straight from Supabase and injecting the real title/description/
// image/JSON-LD into a copy of the live index.html before responding.
//
// It intentionally reuses your live index.html as the base (fetched fresh on
// every request) rather than duplicating its content here, so any changes you
// make to index.html (GTM, manifest, PWA tags, etc.) are automatically
// reflected — nothing to keep in sync by hand.

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";
const SITE_URL = "https://shop.pcbcare.in";
const DEFAULT_IMAGE = "https://shop.pcbcare.in/logo512.png";

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

module.exports = async (req, res) => {
  try {
    const slug = (req.query.slug || "").toString().trim();
    const shellRes = await fetch(`https://${req.headers.host}/index.html`);
    let html = await shellRes.text();

    if (!slug) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    const r = await fetch(
      `${SB_URL}/rest/v1/shop_products?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const rows = await r.json();
    const prod = Array.isArray(rows) ? rows[0] : null;

    // Product not found (bad/old slug) — just serve the normal shell as-is;
    // the SPA will show its own "not found" state for real visitors.
    if (!prod) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    // Pull real reviews too — Google's Product rich result requires at least
    // one of offers/review/aggregateRating, and we'd rather show genuine
    // customer ratings than fake/omit them.
    const reviewsRes = await fetch(
      `${SB_URL}/rest/v1/reviews?select=rating,comment,user_name,created_at&target_type=eq.product&target_id=eq.${encodeURIComponent(slug)}&order=created_at.desc&limit=20`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const productReviews = await reviewsRes.json().catch(() => []);
    const reviewList = Array.isArray(productReviews) ? productReviews : [];
    const reviewCount = reviewList.length;
    const avgRating = reviewCount
      ? reviewList.reduce((s, rv) => s + rv.rating, 0) / reviewCount
      : 0;

    const title = `${prod.name} — PCB Care Shop`;
    const description = (
      (prod.description && prod.description.trim()) ||
      `${prod.name} available at PCB Care, Jabalpur. Contact us on WhatsApp for price and availability.`
    ).slice(0, 160);
    // og:image / JSON-LD image must be a real, fetchable http(s) URL — a
    // base64 data: URI (how product photos are stored today) is useless to
    // WhatsApp/Facebook/Google, which fetch the image server-side. Fall back
    // to the site logo whenever the stored image isn't an actual URL.
    const isRealUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
    const realImages = Array.isArray(prod.images) ? prod.images.filter(isRealUrl) : [];
    const image = realImages[0] || DEFAULT_IMAGE;
    const url = `${SITE_URL}/shop/product/${prod.slug}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: prod.name,
      description,
      image: realImages.length ? realImages : [DEFAULT_IMAGE],
      url,
      brand: { "@type": "Organization", name: "PCB Care" },
      ...(prod.starting_price
        ? {
            offers: {
              "@type": "Offer",
              price: prod.starting_price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url,
            },
          }
        : {}),
      ...(reviewCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Math.round(avgRating * 10) / 10,
              reviewCount,
            },
            review: reviewList.slice(0, 5).map((rv) => ({
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: rv.rating },
              author: { "@type": "Person", name: rv.user_name || "Customer" },
              ...(rv.comment ? { reviewBody: rv.comment } : {}),
            })),
          }
        : {}),
    };

    // Swap the shell's generic <title>/description/OG tags/canonical for the
    // product's own — REPLACE in place, not append. The shell already ships
    // an og:title/og:description/og:image/og:url and a canonical link (site
    // defaults). Appending a second set alongside them instead of replacing
    // was the actual bug here: most OG/link-preview parsers use the FIRST
    // tag of a given property they find, so the product-specific ones added
    // near the end of <head> could silently lose to the generic ones still
    // sitting near the top — which looked exactly like "sometimes it works,
    // sometimes it doesn't" depending on which parser/crawl pass looked.
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${esc(description)}" />`
      )
      .replace(
        /<meta property="og:title" content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${esc(title)}" />`
      )
      .replace(
        /<meta property="og:description" content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${esc(description)}" />`
      )
      .replace(
        /<meta property="og:image" content="[^"]*"\s*\/?>/,
        `<meta property="og:image" content="${esc(image)}" />`
      )
      .replace(
        /<meta property="og:url" content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${esc(url)}" />`
      )
      .replace(
        /<link rel="canonical" href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${esc(url)}" />`
      );

    // These genuinely don't exist in the shell yet, so appending is correct
    // for them: og:type (shell has none), twitter:card, and this product's
    // own JSON-LD (kept as a second script block alongside the shell's
    // sitewide ElectronicsStore schema — a store page legitimately carrying
    // both an Organization-level schema and an item-level Product schema is
    // normal and not conflicting, unlike the canonical/OG tags above).
    const extraTags = `
    <meta property="og:type" content="product" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>`;
    html = html.replace("</head>", extraTags);

    res.setHeader("content-type", "text/html; charset=utf-8");
    // Cached at the edge for 10 min, served stale for up to a day while
    // revalidating — keeps this fast without hammering Supabase per crawl.
    res.setHeader(
      "cache-control",
      "public, max-age=0, s-maxage=600, stale-while-revalidate=86400"
    );
    res.status(200).send(html);
  } catch (e) {
    res.status(500).send("Error rendering product meta: " + e.message);
  }
};