import type { NextConfig } from "next";

// Where the previous React app (login, orders, invoices, admin, games + its /api functions) is deployed.
// Set APP_ORIGIN in Vercel to override. Default = the original Vercel project once its Root Directory is `legacy-react`.
const APP_ORIGIN = (process.env.APP_ORIGIN || "https://pcbcare.vercel.app").replace(/\/$/, "");

// Paths that stay in the existing React app (auth, orders, invoices, games, ...).
// Explicit allow-list on purpose: unknown URLs must return a real 404, not the SPA shell.
const SPA_PATHS = ["/my-order", "/invoices", "/requests", "/part-finder", "/g/:code", "/l/:code", "/t/:code", "/static/:path*", "/api/:path*", "/manifest.json"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
      // Old SPA tab URLs that now have proper pages
      { source: "/shop/category", destination: "/shop", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/app", destination: `${APP_ORIGIN}/` }, // Login / technician app entry
      ...SPA_PATHS.map((p) => ({ source: p, destination: `${APP_ORIGIN}${p}` })),
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ] },
    ];
  },
};

export default nextConfig;
