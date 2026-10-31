// /middleware.js  (must sit at the repo ROOT — same level as package.json,
// vercel.json — NOT inside /src)
// ─────────────────────────────────────────────────────────────────────────
// Runs on Vercel's Edge Network before any other routing happens. Replaces
// vercel.json's "has" User-Agent matching, which turned out not to fire
// reliably. This does the same job with explicit, testable code instead of
// a regex buried in JSON config: if the request's User-Agent looks like a
// crawler/link-preview bot AND the URL is a product or blog post page,
// rewrite it (same visible URL, different response) to the matching
// server-rendered meta function. Every other request — i.e. every real
// visitor — falls through completely untouched to the normal SPA.

import { rewrite } from "@vercel/edge";

const BOT_RE =
  /Google|bingbot|Yandex|Baiduspider|DuckDuckBot|Applebot|facebookexternalhit|Facebot|WhatsApp|Slackbot|TelegramBot|LinkedInBot|Twitterbot|Discordbot|Pinterest|redditbot|SkypeUriPreview|W3C_Validator|AhrefsBot|SemrushBot|MJ12bot|GPTBot|ClaudeBot|PerplexityBot|Bytespider/i;

// Only run this middleware at all for product/blog paths — everything else
// (home, admin, shop listing, etc.) skips it entirely, no perf cost.
export const config = {
  matcher: [
    "/shop/product/:path*",
    "/blog/:path*",
    "/",
    "/shop",
    "/shop/category/:path*",
    "/pcb-parts-directory",
    "/error-codes",
    "/find-remote",
    "/sensor-values",
    "/part-finder",
  ],
};

const SITE = "https://shop.pcbcare.in";
const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SB_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";
const SB_HEADERS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

// Crawler-facing copy for the top-level pages. Without this every one of these
// URLs served the generic index.html shell to bots (title "PCB Care", no H1,
// canonical pointing at the home page), so Google saw them as duplicates of "/".
const STATIC_PAGES = {
  "/": {
    title: "PCB Care – AC, Washing Machine & Fridge PCBs, Sensors & Remotes | Jabalpur",
    desc: "Appliance PCBs, sensors and remotes for AC, washing machine, refrigerator and microwave from PCB Care, Jabalpur. Find your model and get the price on WhatsApp.",
    h1: "Appliance PCBs, Sensors & Remotes – PCB Care, Jabalpur",
    intro: "Shop AC indoor and outdoor PCBs, washing machine and refrigerator control boards, temperature sensors and original remotes. Browse by category or search by model number.",
    list: "both",
  },
  "/shop": {
    title: "Shop AC, Washing Machine & Fridge PCBs, Sensors, Remotes | PCB Care",
    desc: "Browse AC inverter and non-inverter PCBs, washing machine and fridge boards, sensors and remotes. Part numbers listed, price on WhatsApp. PCB Care, Jabalpur.",
    h1: "Shop Appliance PCBs, Sensors & Remotes",
    intro: "Every product lists its brand, model and part number so you can match the board before you order.",
    list: "both",
  },
  "/pcb-parts-directory": {
    title: "PCB Parts Directory – AC, Washing Machine & Fridge Boards by Brand | PCB Care",
    desc: "Directory of AC, washing machine and refrigerator PCBs, sensors and remotes by brand and model, updated automatically. PCB Care, Jabalpur.",
    h1: "PCB Parts Directory",
    intro: "All PCBs, sensors and remotes we list, grouped by category.",
    list: "both",
  },
  "/error-codes": {
    title: "AC & Washing Machine Error Codes – Meaning, Cause & Fix | PCB Care",
    desc: "Look up AC and washing machine error codes by brand and model: Voltas, Daikin, Samsung, LG, Blue Star, Carrier and more, with likely PCB causes.",
    h1: "AC & Washing Machine Error Code Lookup",
    intro: "Pick the brand and model, enter the code shown on the display, and see what it means and what usually fails.",
  },
  "/find-remote": {
    title: "Find Your AC Remote by Model – Original & Compatible | PCB Care",
    desc: "Identify your AC remote by brand and model and see the matching original remote. PCB Care, Jabalpur.",
    h1: "Find Your AC Remote",
    intro: "Choose your AC brand and model to find the matching remote.",
  },
  "/sensor-values": {
    title: "AC Sensor Resistance Values (10K, 15K, 20K, 50K) by Brand | PCB Care",
    desc: "Check AC thermistor sensor resistance values and types by brand and model: Daikin, LG, Voltas, Blue Star, Panasonic, Haier and more.",
    h1: "AC Sensor Resistance Values",
    intro: "Look up the sensor type and resistance for your AC model before replacing a coil, room or discharge sensor.",
  },
  "/part-finder": {
    title: "Appliance PCB Part Finder – Match by Brand & Model | PCB Care",
    desc: "Find the right PCB or part for your AC, washing machine or refrigerator by brand and model number. PCB Care, Jabalpur.",
    h1: "Appliance PCB Part Finder",
    intro: "Select brand and model to find the matching board or part.",
  },
};

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sb(path) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: SB_HEADERS });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

const links = (items, hrefOf) =>
  `<ul>${items.map((i) => `<li><a href="${esc(hrefOf(i))}">${esc(i.name)}</a></li>`).join("")}</ul>`;

function applyMeta(html, { title, desc, canonical, body }) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(canonical)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(canonical)}" />`)
    // React's createRoot replaces this placeholder content on mount, so real
    // visitors never see it; crawlers that don't run JS get real text + links.
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

async function renderPage(request, meta, body, canonical) {
  const shellRes = await fetch(new URL("/index.html", request.url));
  const html = applyMeta(await shellRes.text(), { ...meta, canonical, body });
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_RE.test(ua)) return; // real visitor — do nothing, normal SPA loads

  const url = new URL(request.url);
  const productPrefix = "/shop/product/";
  const blogPrefix = "/blog/";

  if (url.pathname.startsWith(productPrefix)) {
    const slug = url.pathname.slice(productPrefix.length);
    const target = new URL("/api/product-meta", url);
    target.searchParams.set("slug", slug);
    return rewrite(target);
  }

  if (url.pathname.startsWith(blogPrefix)) {
    const slug = url.pathname.slice(blogPrefix.length);
    const target = new URL("/api/blog-meta", url);
    target.searchParams.set("slug", slug);
    return rewrite(target);
  }

  const path = url.pathname.replace(/\/+$/, "") || "/";

  // /shop/category/:slug — real category name, product count and links to every
  // product in it (so Google can discover product URLs from the category page).
  if (path.startsWith("/shop/category/")) {
    const slug = decodeURIComponent(path.slice("/shop/category/".length));
    const cats = await sb(`shop_categories?select=id,name,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    const cat = cats[0];
    if (!cat) return;
    const prods = await sb(`shop_products?select=name,slug&category_id=eq.${encodeURIComponent(cat.id)}&order=created_at.desc&limit=100`);
    const n = prods.length;
    const meta = {
      title: `${cat.name} – Price & Buy Online | PCB Care Jabalpur`,
      desc: `Buy ${cat.name} from PCB Care, Jabalpur${n ? ` – ${n} models listed` : ""}. Check the part number against your board and get the price on WhatsApp.`,
    };
    const body = `<main><h1>${esc(cat.name)}</h1><p>${esc(meta.desc)}</p>${n ? links(prods, (p) => `/shop/product/${p.slug}`) : ""}<p><a href="/shop">All categories</a></p></main>`;
    return renderPage(request, meta, body, `${SITE}/shop/category/${cat.slug}`);
  }

  const page = STATIC_PAGES[path];
  if (!page) return;

  let extra = "";
  if (page.list) {
    const [cats, prods] = await Promise.all([
      sb("shop_categories?select=name,slug&order=sort_order"),
      sb("shop_products?select=name,slug&order=created_at.desc&limit=60"),
    ]);
    if (cats.length) extra += `<h2>Categories</h2>${links(cats, (c) => `/shop/category/${c.slug}`)}`;
    if (prods.length) extra += `<h2>Latest products</h2>${links(prods, (p) => `/shop/product/${p.slug}`)}`;
  }
  const body = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p>${extra}</main>`;
  return renderPage(request, page, body, path === "/" ? `${SITE}/` : `${SITE}${path}`);
}
