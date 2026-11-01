import type { Metadata } from "next";
import { BUSINESS, SITE_URL } from "./site";

export const clip = (s: string, n: number) => { const t = s.replace(/\s+/g, " ").trim(); return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…"; };

export function meta(o: { title: string; description: string; path: string; image?: string; absoluteTitle?: boolean; noindex?: boolean; type?: "website" | "article" }): Metadata {
  const url = `${SITE_URL}${o.path === "/" ? "" : o.path}`;
  const image = o.image || `${SITE_URL}/logo512.png`;
  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: clip(o.description, 158),
    alternates: { canonical: url },
    robots: o.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: { type: o.type ?? "website", url, title: o.title, description: clip(o.description, 200), siteName: BUSINESS.name, locale: "en_IN", images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: o.title, description: clip(o.description, 200), images: [image] },
  };
}

/** Pick the longest suffix that keeps the whole title within ~60 characters (what search results show). */
export function fitTitle(name: string, suffixes = [" – Buy Online | PCB Care Jabalpur", " – Buy Online | PCB Care", " | PCB Care"], max = 60) {
  for (const sfx of suffixes) if (name.length + sfx.length <= max) return name + sfx;
  const last = suffixes[suffixes.length - 1];
  return clip(name, max - last.length) + last;
}
