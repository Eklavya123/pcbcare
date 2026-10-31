import type { NextConfig } from "next";

// Screens that still run in the previous React app. It is compiled by scripts/build-legacy.mjs into
// public/spa.html and served for these URLs, with its /api/* handlers in src/pages/api/[...legacy].js.
const SPA_PATHS = ["/app", "/my-order", "/invoices", "/requests", "/part-finder", "/g/:code", "/l/:code", "/t/:code"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["firebase-admin", "@simplewebauthn/server"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Blog, wiring diagrams and service pages are owned by pcbcare.in.
      { source: "/blog", destination: "https://pcbcare.in/blog", permanent: true },
      { source: "/blog/:slug", destination: "https://pcbcare.in/blog/:slug", permanent: true },
      { source: "/wiring", destination: "https://pcbcare.in/wiring", permanent: true },
      { source: "/wiring/:slug", destination: "https://pcbcare.in/wiring/:slug", permanent: true },
      ...["ac-pcb-repair", "washing-machine-pcb-repair", "refrigerator-pcb-repair", "microwave-pcb-repair"].map((s) => ({
        source: `/${s}`, destination: `https://pcbcare.in/${s}`, permanent: true,
      })),
      { source: "/shop/category", destination: "/shop", permanent: true },
    ];
  },
  async rewrites() {
    return SPA_PATHS.map((source) => ({ source, destination: "/spa.html" }));
  },
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ] },
      // Private app screens and the raw SPA shell must never be indexed.
      { source: "/spa.html", headers: noindex },
      ...SPA_PATHS.map((source) => ({ source, headers: noindex })),
      { source: "/api/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
