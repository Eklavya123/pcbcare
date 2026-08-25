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
  matcher: ["/shop/product/:path*", "/blog/:path*"],
};

export default function middleware(request) {
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
}
