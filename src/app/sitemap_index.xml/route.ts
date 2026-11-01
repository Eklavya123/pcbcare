import { indexXml, sitemapGroups, XML_HEADERS } from "@/lib/sitemap-data";

export const revalidate = 3600;

export async function GET() {
  return new Response(indexXml(Object.keys(await sitemapGroups())), { headers: XML_HEADERS });
}
