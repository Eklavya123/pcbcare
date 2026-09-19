// /api/sitemap.js — generates sitemap.xml on every request, straight from
// the live database tables. New products, blog posts, wiring diagrams, or
// pages you add in Admin appear here automatically — nothing to regenerate
// or redeploy.
//
// This file must live at the REPO ROOT under /api/sitemap.js (same folder
// as your other /api files) so Vercel picks it up as a serverless function
// automatically. vercel.json already rewrites /sitemap.xml to this route.
//
// FIX: SITE_URL was hardcoded to https://pcbcare.in — the ROOT domain,
// a completely separate Next.js site this repo has nothing to do with.
// This repo and every URL it actually serves lives at shop.pcbcare.in, so
// every single URL this file ever generated was wrong: real, crawlable
// shop/blog/wiring pages were submitted to Google under a domain that
// doesn't serve them. That's the single root cause of the sitemap issue —
// everything else in this file was already working correctly against the
// live tables, it was just labeling its own output with the wrong domain.

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";
const SITE_URL = "https://shop.pcbcare.in";

// Never list these as their own sitemap entries — they're logged-in,
// personal, or utility flows with no independent search value (nobody
// searches for "my order" or "invoices"), and duplicate/thin utility
// pages in a sitemap waste crawl budget rather than helping it.
const EXCLUDED_STATIC_SLUGS = new Set(["my-order","invoices","requests"]);

const esc = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

module.exports = async (req, res) => {
  try {
    const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

    const [catsRes, prodsRes, blogRes, wiringRes, pagesRes] = await Promise.all([
      fetch(`${SB_URL}/rest/v1/shop_categories?select=slug,created_at&order=sort_order`, { headers }),
      fetch(`${SB_URL}/rest/v1/shop_products?select=slug,created_at&order=created_at.desc`, { headers }),
      fetch(`${SB_URL}/rest/v1/blog_posts?status=eq.published&select=slug,published_at,updated_at,created_at&order=published_at.desc`, { headers }),
      fetch(`${SB_URL}/rest/v1/wiring_diagrams?select=slug,created_at&order=created_at.desc`, { headers }),
      fetch(`${SB_URL}/rest/v1/pages?status=eq.published&select=slug,published_at,updated_at,created_at&order=created_at.desc`, { headers }),
    ]);
    const categories = catsRes.ok ? await catsRes.json() : [];
    const products = prodsRes.ok ? await prodsRes.json() : [];
    const blogPosts = blogRes.ok ? await blogRes.json() : [];
    const wiringDiagrams = wiringRes.ok ? await wiringRes.json() : [];
    const pages = pagesRes.ok ? await pagesRes.json() : [];

    const today = new Date().toISOString().slice(0, 10);
    const dateOf = (row) => (row.updated_at || row.published_at || row.created_at || today).slice(0, 10);

    const urls = [
      // ── Top-level content hubs — worth indexing on their own, unlike
      // pure self-service tools (my order, invoices, requests). ──
      { loc: `${SITE_URL}/`, lastmod: today, priority: "1.0" },
      { loc: `${SITE_URL}/shop`, lastmod: today, priority: "0.9" },
      { loc: `${SITE_URL}/blog`, lastmod: today, priority: "0.7" },
      { loc: `${SITE_URL}/wiring`, lastmod: today, priority: "0.7" },
      { loc: `${SITE_URL}/error-codes`, lastmod: today, priority: "0.6" },
      { loc: `${SITE_URL}/find-remote`, lastmod: today, priority: "0.6" },
      { loc: `${SITE_URL}/sensor-values`, lastmod: today, priority: "0.6" },
      { loc: `${SITE_URL}/part-finder`, lastmod: today, priority: "0.6" },

      ...categories.map(c => ({
        loc: `${SITE_URL}/shop/category/${c.slug}`,
        lastmod: (c.created_at || today).slice(0, 10),
        priority: "0.8",
      })),
      ...products.map(p => ({
        loc: `${SITE_URL}/shop/product/${p.slug}`,
        lastmod: (p.created_at || today).slice(0, 10),
        priority: "0.7",
      })),
      ...blogPosts.map(p => ({
        loc: `${SITE_URL}/blog/${p.slug}`,
        lastmod: dateOf(p),
        priority: "0.6",
      })),
      ...wiringDiagrams.map(w => ({
        loc: `${SITE_URL}/wiring/${w.slug}`,
        lastmod: (w.created_at || today).slice(0, 10),
        priority: "0.6",
      })),
      ...pages
        .filter(pg => pg.slug && !EXCLUDED_STATIC_SLUGS.has(pg.slug))
        .map(pg => ({
          loc: `${SITE_URL}/${pg.slug}`,
          lastmod: dateOf(pg),
          priority: "0.5",
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"); // re-generate at most hourly
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><error>${esc(e.message)}</error>`);
  }
};
