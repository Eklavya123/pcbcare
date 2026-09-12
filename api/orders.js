// api/orders.js
// ═══════════════════════════════════════════════════════════════════════
// Backend for the "My Order" tracking feature and the Admin → Orders
// panel. Mirrors api/invoices.js's pattern: every write goes through the
// Supabase SERVICE ROLE key server-side, never the anon key from the
// browser, because `orders` has RLS enabled with NO anon policies at all
// (see the CREATE TABLE migration — this table holds customer name,
// address and phone, so it's deliberately unreachable except through
// this file).
//
// Four actions (a fifth, admin_get_insights, is unrelated to orders but
// lives here too — see its own comment further down for why):
//   admin_create_order — admin-only. Creates an order; order_number is
//     assigned automatically by the DB (a sequence starting at 111765,
//     formatted "SN111765", "SN111766", ... — never pass order_number
//     in from the client, the DB default handles it).
//   admin_list_orders  — admin-only. Full order list for the Orders panel.
//   admin_update_order — admin-only. Edits an existing order's details.
//     order_number is never editable here — only ever set once, by the DB
//     default, at creation.
//   get_order           — PUBLIC, no auth. This is the "My Order" lookup.
//     Deliberately does NOT return customer_phone — nothing in the
//     customer-facing UI or the generated PDF needs it, so it stays
//     admin-only. See the note below on order-number enumeration before
//     treating this as done.
//
// ── SECURITY NOTE — read before relying on this in production ──
// Order numbers are sequential and public-facing by design (SN111765,
// SN111766, ...), and get_order is intentionally unauthenticated so a
// customer can look up their own order with nothing but that number.
// Those two facts together mean anyone can enumerate every order number
// in sequence and pull every customer's name, address, amount paid, and
// full item list — there's no rate limiting or second factor here. This
// wasn't an oversight; it's the direct consequence of the UX as
// specified (single field, no login). I removed phone from the public
// response as a partial mitigation, but name/address/amount are
// unavoidable — the PDF requirement means they have to be fetchable by
// order number, full stop. If that risk matters to you, the fix is a
// second required field on lookup (e.g. phone last 4 digits) or basic
// rate-limiting in front of this endpoint — neither is implemented here
// because both change the UX you specified. Decide deliberately, don't
// let this sit unconsidered.
//
// ── Required environment variables ──
//   SUPABASE_SERVICE_ROLE_KEY  — same one api/invoices.js already uses.
//   ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET — already exist.
//
// This file has NOT been run against your live Supabase project — same
// caveat as api/invoices.js when it was first written. Test all three
// actions before relying on it.
// ═══════════════════════════════════════════════════════════════════════

const crypto = require("crypto");

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let initError = null;
if (!SERVICE_KEY) {
  initError = "SUPABASE_SERVICE_ROLE_KEY is not set in Vercel's environment variables.";
}

const sb = async (table, { method = "GET", filter = "", body = null, prefer = "" } = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${method} ${table} failed: ${res.status} ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// Identical HMAC session check to api/invoices.js's authenticateAdmin —
// kept as an exact copy rather than a shared import, since these are two
// independent serverless functions with no shared module between them.
const authenticateAdmin = (req) => {
  const token = req.headers["x-admin-session"];
  const expiresAt = Number(req.headers["x-admin-session-expires"]);
  const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

  if (!token || !expiresAt || !SESSION_SECRET) throw new Error("Not authorized as admin");
  if (Date.now() > expiresAt) throw new Error("Admin session expired");

  const expected = crypto.createHmac("sha256", SESSION_SECRET)
    .update(`admin:${expiresAt}`)
    .digest("hex");

  const a = Buffer.from(token, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Not authorized as admin");
  }
};

// ── Insights helpers (formerly api/analytics.js) ──
// Merged into this file because Vercel's Hobby plan caps a deployment at
// 12 serverless functions total, and this project was sitting at exactly
// that limit before analytics.js existed as its own 13th file — adding it
// separately silently failed the deployment past the build step. Folding
// its one action in here, alongside another admin-only, order-adjacent
// endpoint, was the lowest-risk fix: no new file, no function-count cost,
// and every line of logic below is unchanged from analytics.js, not
// rewritten.
//
// India-local day boundaries. Postgres/Supabase store timestamptz in UTC;
// "today" for an admin in Jabalpur should mean the Asia/Kolkata calendar
// day, not the UTC one — those disagree for part of every single day
// (UTC+5:30 offset), so using UTC boundaries here would make "today" and
// "yesterday" silently wrong for roughly 5.5 hours out of every 24.
const kolkataDateString = (d) => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};
const kolkataMidnightUTC = (dateStr) => {
  return new Date(`${dateStr}T00:00:00+05:30`);
};

module.exports = async (req, res) => {
  if (initError) {
    return res.status(500).json({ error: initError });
  }
  try {
    const { action } = req.body || req.query || {};

    // ── Admin: site visitor insights (formerly api/analytics.js's
    // admin_get_insights) — see the merge note above. ──
    if (action === "admin_get_insights") {
      authenticateAdmin(req);

      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const todayStr = kolkataDateString(now);
      const todayStart = kolkataMidnightUTC(todayStr);
      const yesterdayStart = new Date(todayStart.getTime() - 24*60*60*1000);

      const numDays = Math.min(Math.max(Number(req.body?.days) || 14, 1), 90);
      const chartStart = new Date(todayStart.getTime() - (numDays-1) * 24*60*60*1000);

      const rows = await sb("site_pings", {
        filter: `?is_bot=eq.false&pinged_at=gte.${chartStart.toISOString()}&select=session_id,pinged_at`,
      });

      const distinctSince = (sinceISO, beforeISO) => {
        const since = new Date(sinceISO).getTime();
        const before = beforeISO ? new Date(beforeISO).getTime() : Infinity;
        const set = new Set();
        for (const r of rows) {
          const t = new Date(r.pinged_at).getTime();
          if (t >= since && t < before) set.add(r.session_id);
        }
        return set.size;
      };

      const activeLastHour = distinctSince(hourAgo.toISOString());
      const activeToday = distinctSince(todayStart.toISOString());
      const activeYesterday = distinctSince(yesterdayStart.toISOString(), todayStart.toISOString());

      const chart = [];
      for (let i = numDays - 1; i >= 0; i--) {
        const dayStart = new Date(todayStart.getTime() - i * 24*60*60*1000);
        const dayEnd = new Date(dayStart.getTime() + 24*60*60*1000);
        chart.push({
          date: kolkataDateString(dayStart),
          activeUsers: distinctSince(dayStart.toISOString(), dayEnd.toISOString()),
        });
      }

      return res.status(200).json({ activeLastHour, activeToday, activeYesterday, chart });
    }

    // ── Admin: create a new order ──
    // courierName and trackingUrl are enforced as mandatory here, not just
    // in the admin UI — a client-side-only check is trivial to bypass by
    // calling this endpoint directly, and both fields are load-bearing for
    // the customer-facing Track button, so a missing one should hard-fail
    // the write rather than silently save an untrackable order.
    if (action === "admin_create_order") {
      authenticateAdmin(req);
      const {
        customerName, customerAddress, customerPhone, purchaseDate,
        items, amount, shippingAmount, courierName, trackingUrl,
      } = req.body;

      if (!customerName?.trim()) throw new Error("Customer name is required");
      if (!customerAddress?.trim()) throw new Error("Customer address is required");
      if (!customerPhone?.trim()) throw new Error("Customer phone is required");
      if (!courierName?.trim()) throw new Error("Couriered By is required");
      // Optional now — an order can exist before a tracking link is ready.
      // If one IS provided, it still has to actually be a URL; a garbage
      // string here would silently break the frontend's Track button.
      if (trackingUrl?.trim()) {
        try { new URL(trackingUrl); } catch { throw new Error("Tracking URL must be a valid URL (include https://), or leave it blank"); }
      }
      if (!Array.isArray(items) || items.length === 0) throw new Error("At least one ordered product is required");
      if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("A valid amount is required");
      // Shipping is optional — omitted or 0 is fine, but if provided it must
      // be a real non-negative number, not silently coerced from garbage.
      const shipping = shippingAmount == null || shippingAmount === "" ? 0 : Number(shippingAmount);
      if (isNaN(shipping) || shipping < 0) throw new Error("Shipping amount must be a valid non-negative number, or left blank");

      const [created] = await sb("orders", {
        method: "POST",
        body: {
          customer_name: customerName.trim(),
          customer_address: customerAddress.trim(),
          customer_phone: customerPhone.trim(),
          purchase_date: purchaseDate || new Date().toISOString().slice(0, 10),
          items,
          amount: Number(amount),
          shipping_amount: shipping,
          courier_name: courierName.trim(),
          tracking_url: trackingUrl?.trim() || null,
        },
        prefer: "return=representation",
      });
      return res.status(200).json({ order: created });
    }

    // ── Admin: update an existing order ──
    // Deliberately cannot change order_number — it's the customer's
    // tracking key and the DB sequence that generates it is one-way by
    // design, so an edit here only ever touches the order's details, not
    // its identity. Same field validation as admin_create_order, for the
    // same reason: this has to be safe to call directly, not just safe
    // when the admin form happens to be well-behaved.
    if (action === "admin_update_order") {
      authenticateAdmin(req);
      const {
        orderId, customerName, customerAddress, customerPhone, purchaseDate,
        items, amount, shippingAmount, courierName, trackingUrl,
      } = req.body;

      if (!orderId) throw new Error("orderId is required");
      if (!customerName?.trim()) throw new Error("Customer name is required");
      if (!customerAddress?.trim()) throw new Error("Customer address is required");
      if (!customerPhone?.trim()) throw new Error("Customer phone is required");
      if (!courierName?.trim()) throw new Error("Couriered By is required");
      // Optional now — an order can exist before a tracking link is ready.
      // If one IS provided, it still has to actually be a URL; a garbage
      // string here would silently break the frontend's Track button.
      if (trackingUrl?.trim()) {
        try { new URL(trackingUrl); } catch { throw new Error("Tracking URL must be a valid URL (include https://), or leave it blank"); }
      }
      if (!Array.isArray(items) || items.length === 0) throw new Error("At least one ordered product is required");
      if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("A valid amount is required");
      const shipping = shippingAmount == null || shippingAmount === "" ? 0 : Number(shippingAmount);
      if (isNaN(shipping) || shipping < 0) throw new Error("Shipping amount must be a valid non-negative number, or left blank");

      const [updated] = await sb("orders", {
        method: "PATCH",
        filter: `?id=eq.${encodeURIComponent(orderId)}`,
        body: {
          customer_name: customerName.trim(),
          customer_address: customerAddress.trim(),
          customer_phone: customerPhone.trim(),
          purchase_date: purchaseDate || new Date().toISOString().slice(0, 10),
          items,
          amount: Number(amount),
          shipping_amount: shipping,
          courier_name: courierName.trim(),
          tracking_url: trackingUrl?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        prefer: "return=representation",
      });
      if (!updated) return res.status(404).json({ error: "Order not found" });
      return res.status(200).json({ order: updated });
    }

    // ── Admin: list all orders ──
    if (action === "admin_list_orders") {
      authenticateAdmin(req);
      const orders = await sb("orders", { filter: "?select=*&order=created_at.desc&limit=500" });
      return res.status(200).json({ orders });
    }

    // ── Public: "My Order" lookup by order number ──
    // No auth — this is the whole point, a customer with just their order
    // number can look it up. See the security note at the top of this
    // file about what that trade-off means before changing anything here.
    if (action === "get_order") {
      const { orderNumber } = req.body;
      if (!orderNumber?.trim()) throw new Error("Order number is required");
      const rows = await sb("orders", {
        filter: `?order_number=eq.${encodeURIComponent(orderNumber.trim().toUpperCase())}&select=order_number,customer_name,customer_address,purchase_date,items,amount,shipping_amount,courier_name,tracking_url`,
      });
      const order = Array.isArray(rows) ? rows[0] : null;
      if (!order) return res.status(404).json({ error: "No order found with that number. Double-check it and try again." });
      return res.status(200).json({ order });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    const status = /required|valid URL|valid amount/i.test(err.message) ? 400
      : /Not authorized as admin|Admin session expired/i.test(err.message) ? 403
      : 500;
    return res.status(status).json({ error: err.message });
  }
};
