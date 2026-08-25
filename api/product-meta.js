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
const SITE_URL = "https://pcbcare.in";
const DEFAULT_IMAGE = "https://pcbcare.in/logo.png";

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
      ...(prod.price
        ? {
            offers: {
              "@type": "Offer",
              price: prod.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url,
            },
          }
        : {}),
    };

    // Swap the shell's generic <title> and description for the product's.
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${esc(description)}" />`
      );

    // Add OG/canonical/JSON-LD right before </head>, on top of whatever's
    // already there — doesn't remove the site-wide ElectronicsStore schema.
    const extraTags = `
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="product" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${esc(url)}" />
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
