import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/schema";
import { getCategories } from "@/lib/data";
import { BUSINESS, SITE_URL } from "@/lib/site";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1a1f2e" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BUSINESS.name} – AC, Washing Machine & Fridge PCBs, Sensors & Remotes | Jabalpur`, template: `%s | ${BUSINESS.name}` },
  description: "Refurbished and tested AC, washing machine, refrigerator and microwave PCBs, sensors and remotes from PCB Care, Jabalpur. Delivery across India.",
  applicationName: BUSINESS.name,
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  icons: { icon: "/favicon.ico", apple: "/logo192.png" },
  manifest: undefined,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let cats: { name: string; slug: string }[] = [];
  try { cats = (await getCategories()).map((c) => ({ name: c.name, slug: c.slug })); } catch { /* footer links are optional; page content is not */ }
  return (
    <html lang="en-IN">
      <body>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Header />
        <main>{children}</main>
        <Footer categories={cats} />
        <BottomNav />
      </body>
    </html>
  );
}
