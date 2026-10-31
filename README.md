# PCB Care shop – Next.js (TypeScript)

Phase 1 of the React → Next.js migration: every **public, indexable** page of shop.pcbcare.in.
Login, orders, invoices, requests and the games stay in the existing React app (see PLAN.md).

## Run
```bash
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_ANON_KEY (same anon key the React app uses)
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production check
```

## Where things are
| Need | File |
|---|---|
| Business facts, delivery + return policy (single source of truth) | `src/lib/site.ts` |
| All database access (read-only, ISR cached) | `src/lib/data.ts`, `src/lib/db.ts` |
| All structured data (Product, Organization, FAQ, Breadcrumb, ItemList) | `src/lib/schema.ts` |
| Titles / descriptions / canonicals | `src/lib/seo.ts` |
| Product copy + FAQs | `src/lib/content.ts` |
| Google Merchant Center feed | `src/app/feeds/google-merchant.xml/route.ts` |
| Sitemap / robots / llms.txt | `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts` |
| Theme (same colours as the React app) | `src/app/globals.css` |
