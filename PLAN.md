# Migration plan: React (CRA) → TypeScript + Next.js

## 1. Goals
1. Every public page returns full HTML (title, H1, copy, links, JSON-LD) in the first response.
2. Every page has one canonical URL, is linked from at least two other pages, and is in the sitemap.
3. Products are eligible for Google Search product snippets and the Shopping tab (free listings).
4. Same look as today (dark theme, green/gold accents).

## 2. What moves, what stays
| Area | Where it lives after phase 1 |
|---|---|
| Home, shop, categories, products, brands, directory | **Next.js** (this project) |
| Error codes (index → brand → code), sensor values, find-remote | **Next.js** (new per-item URLs) |
| Blog, wiring diagrams, service pages, policies | pcbcare.in (already Next.js) – shop URLs 301 there |
| Login, my-order, invoices, requests, part-finder, games (/g /l /t), admin | **Existing React app**, reached through `rewrites` in `next.config.ts` (set `APP_ORIGIN`) |

## 3. URL map (all in sitemap.xml)
```
/                                  home
/shop                              category index
/shop/category/{slug}              category            (15)
/shop/product/{slug}               product             (119, same URLs as today)
/brands, /brands/{brand}           brand hubs          (new)
/pcb-parts-directory               flat list of every product (crawl hub)
/error-codes, /error-codes/{brand}, /error-codes/{brand}/{code}   (new)
/sensor-values, /sensor-values/{model}      (new)
/find-remote,  /find-remote/{model}         (new)
/feeds/google-merchant.xml  /sitemap.xml  /robots.txt  /llms.txt
```
Internal links: header + footer on every page (categories, brands, error codes, directory); product → category, brand, brand error codes; category → brands, sibling categories; brand → products, error codes; error code → brand, other codes; breadcrumbs everywhere.

## 4. Cut-over steps (do in this order)
1. Deploy this project as a **new Vercel project** on a preview URL. Set the env vars from `.env.example`.
2. Deploy the existing React app as its own project; set `APP_ORIGIN` to it. Test /my-order and /invoices through the preview URL.
3. Compare 20 URLs old vs new (title, H1, canonical, price). Fix differences.
4. Point shop.pcbcare.in at the new project. Keep the React app on its own URL.
5. Search Console: delete the `www.shop` and `www` sitemaps; submit `https://shop.pcbcare.in/sitemap.xml`; use URL Inspection → Request indexing on /, /shop and the 15 categories.
6. Watch Pages → Indexing and Enhancements → Products weekly for 6 weeks.
Rollback: re-point the domain to the old project (the old URLs are unchanged, so nothing to undo).

## 5. Google Shopping – read before relying on it
- Feed: `https://shop.pcbcare.in/feeds/google-merchant.xml`. Only products with a **public price and a real https image** are included: **82 of 119 today** (28 have no image, 9 have no price, 6 have neither).
- Prices are "starting price" values. Merchant Center disapproves when the landing-page price differs from the feed price. Either keep prices exact or add a clear "final price confirmed on WhatsApp" note (already on every page).
- **Checkout risk:** Google expects products to be buyable on the site. A WhatsApp-only flow can lead to disapproval or account suspension. Free listings can still be tried, but plan for a real cart/payment step (Razorpay, Cashfree) before spending on Shopping ads.
- Returns: schema and feed state "no returns", matching your policy. Merchant Center → Shipping & returns must say the same.
- No GTIN/MPN: feed sends `identifier_exists=no`. Add an MPN column to `shop_products` later where a manufacturer part number exists.
- Stock: every product is marked `in_stock`. Add a stock/availability column before launch so sold-out boards are not advertised.
- Handling time is a **placeholder (0–2 days)** in `src/lib/site.ts`. Confirm it.

## 6. Ratings
Stars appear only when approved reviews exist for that exact product (`reviews.target_id = product slug`). Today there is 1 review in total, so almost no product will show stars. Do not copy a sitewide rating onto products: Google treats that as misleading markup. Fastest fix is a review request on the WhatsApp order message.

## 7. Content gaps to fix in the database (not code)
- 28 products without images; 12 without descriptions; 9 without prices; keywords on only 1 product.
- Brands missing on 1 product (matched from the name when possible).
- Error-code rows have images (pcb_image, error_image, led_image) that are not shown yet.

## 8. Uploads
All product images already live in Supabase Storage (0 base64 left). Phase 2 admin should: upload with client-side resize to ~1600px, WebP, one folder per product, alt text field, and refuse saving a product without a primary image. Next.js serves them through `next/image` (AVIF/WebP, responsive sizes).

## 9. Phases
| Phase | Scope | Exit check |
|---|---|---|
| 1 (this) | Public pages, schema, feed, sitemap | Rich Results Test clean on 10 products; sitemap fully discovered |
| 2 | Admin + uploads in Next.js, review submission with moderation | Admin can add a product end to end |
| 3 | Cart + online payment, order tracking in Next.js | Merchant Center "checkout" requirement met |
| 4 | Retire the React app | No traffic to APP_ORIGIN for 30 days |

## 10. Known limits of this build
- Tested with `next build` + `next start` against a mock of your database using 8 real product rows, not the live site (my sandbox cannot reach your domain). Run it against the real database before cut-over.
- Vercel Hobby allows 12 serverless functions per deployment. This project is mostly static/ISR, but check the build summary after deploying.
