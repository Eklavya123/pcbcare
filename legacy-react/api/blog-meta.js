// /api/blog-meta.js
// ─────────────────────────────────────────────────────────────────────────
// Same idea as /api/product-meta.js, but for /blog/:slug — server-renders
// the real post title/meta/OG/JSON-LD (including FAQ schema, matching what
// the SPA already builds client-side in openPost) for crawlers only. Real
// visitors are untouched; see vercel.json for the bot-only routing.

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
      `${SB_URL}/rest/v1/blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const rows = await r.json();
    const post = Array.isArray(rows) ? rows[0] : null;

    if (!post) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    const title = post.meta_title || `${post.title} — PCB Care Blog`;
    const description = (post.meta_description || post.excerpt || "").slice(0, 160);
    // Same base64-guard as product-meta.js — og:image needs a real URL.
    const isRealUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
    const image = isRealUrl(post.featured_image) ? post.featured_image : DEFAULT_IMAGE;
    const url = `${SITE_URL}/blog/${post.slug}`;

    const reviewsRes = await fetch(
      `${SB_URL}/rest/v1/reviews?select=rating,comment,user_name,created_at&target_type=eq.blog&target_id=eq.${encodeURIComponent(slug)}&order=created_at.desc&limit=20`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const postReviews = await reviewsRes.json().catch(() => []);
    const reviewList = Array.isArray(postReviews) ? postReviews : [];
    const reviewCount = reviewList.length;
    const avgRating = reviewCount
      ? reviewList.reduce((s, rv) => s + rv.rating, 0) / reviewCount
      : 0;

    const jsonLdGraph = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: [image],
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        author: { "@type": "Organization", name: "PCB Care" },
        publisher: {
          "@type": "Organization",
          name: "PCB Care",
          logo: { "@type": "ImageObject", url: DEFAULT_IMAGE },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        ...(reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Math.round(avgRating * 10) / 10,
                reviewCount,
              },
            }
          : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ];
    if (Array.isArray(post.faqs) && post.faqs.length > 0) {
      jsonLdGraph.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }

    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${esc(description)}" />`
      );

    const extraTags = `
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${esc(url)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdGraph)}</script>
  </head>`;
    html = html.replace("</head>", extraTags);

    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader(
      "cache-control",
      "public, max-age=0, s-maxage=600, stale-while-revalidate=86400"
    );
    res.status(200).send(html);
  } catch (e) {
    res.status(500).send("Error rendering blog meta: " + e.message);
  }
};