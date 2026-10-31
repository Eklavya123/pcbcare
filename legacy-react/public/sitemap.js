// /api/sitemap.js — generates sitemap.xml on every request, straight from the
// live shop_categories / shop_products tables. New products you add in Admin
// appear here automatically — nothing to regenerate or redeploy.
//
// This file must live at the REPO ROOT under /api/sitemap.js (same folder as
// your existing /api/admin-login.js and /api/admin-verify.js) so Vercel picks
// it up as a serverless function automatically.

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";
const SITE_URL = "https://pcbcare.in";

const esc = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

module.exports = async (req, res) => {
  try {
    const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${SB_URL}/rest/v1/shop_categories?select=slug,created_at&order=sort_order`, { headers }),
      fetch(`${SB_URL}/rest/v1/shop_products?select=slug,created_at&order=created_at.desc`, { headers }),
    ]);
    const categories = catsRes.ok ? await catsRes.json() : [];
    const products = prodsRes.ok ? await prodsRes.json() : [];

    const today = new Date().toISOString().slice(0, 10);

    const urls = [
      { loc: `${SITE_URL}/`, lastmod: today, priority: "1.0" },
      { loc: `${SITE_URL}/shop`, lastmod: today, priority: "0.9" },
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
