-- ─────────────────────────────────────────────────────────────────────────
-- PCB Care — Reviews & Ratings + Product Price setup
-- ─────────────────────────────────────────────────────────────────────────
-- Run this ONCE in your Supabase project:
--   Supabase Dashboard → SQL Editor → New query → paste all of this → Run.
--
-- It is safe to run more than once (everything uses IF NOT EXISTS / OR REPLACE).
--
-- What it does:
--   1. Makes sure shop_products has a `price` column (used for the "From ₹…"
--      display and the Google "offers" schema).
--   2. Creates a `shop_reviews` table so visitors can leave star ratings +
--      reviews on product pages, with an `approved` flag so nothing shows
--      publicly (or counts toward your Google rating) until you approve it in
--      Admin → Reviews.
--   3. Grants the app's public (anon) key access to the table, matching how
--      the rest of your tables already work.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Price column on products (no-op if it already exists) ------------------
alter table public.shop_products
  add column if not exists price numeric;

-- 2) Reviews table ----------------------------------------------------------
create table if not exists public.shop_reviews (
  id            bigint generated always as identity primary key,
  product_id    text        not null,             -- string copy of shop_products.id
  product_slug  text,                             -- for building the product link
  product_name  text,                             -- shown in Admin → Reviews
  author        text,                             -- reviewer's name (optional)
  rating        int         not null check (rating between 1 and 5),
  body          text,                             -- the written review (optional)
  approved      boolean     not null default false,-- hidden until you approve it
  created_at    timestamptz not null default now()
);

-- Fast lookups by product and by moderation status
create index if not exists shop_reviews_product_id_idx on public.shop_reviews (product_id);
create index if not exists shop_reviews_approved_idx   on public.shop_reviews (approved);

-- 3) Access for the app's public (anon) key ---------------------------------
-- Your app talks to Supabase from the browser with the public anon key (the
-- same way brands, error codes, etc. already work), so the anon role needs
-- access to this table too. Insert = visitors can submit; select = the page
-- can show approved reviews; update/delete = you can approve/remove them from
-- the Admin panel (which also uses the anon key).
grant select, insert, update, delete on public.shop_reviews to anon, authenticated;

-- If your other tables rely on Row Level Security being OFF (the app writes
-- to them directly), keep this table consistent:
alter table public.shop_reviews disable row level security;
