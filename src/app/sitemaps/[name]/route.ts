import { sitemapGroups, urlsetXml, XML_HEADERS } from "@/lib/sitemap-data";

export const revalidate = 3600;
export const generateStaticParams = () => ["core", "products", "error-codes", "reference"].map((name) => ({ name }));

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const name = (await params).name.replace(/\.xml$/, "");
  const group = (await sitemapGroups())[name];
  if (!group) return new Response("Not found", { status: 404 });
  return new Response(urlsetXml(group), { headers: XML_HEADERS });
}
