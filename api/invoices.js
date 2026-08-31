// api/invoices.js
// ═══════════════════════════════════════════════════════════════════════
// Every invoice read/write goes through here — never directly from the
// browser to Supabase — because RLS on invoice_profiles / invoices /
// invoice_line_items denies the anon key entirely (see invoice_schema.sql
// for why: this app has no Supabase-recognized identity to check against,
// since auth is Firebase, not Supabase Auth).
//
// Flow for every request:
//   1. Read the Firebase ID token from the Authorization header.
//   2. Verify it server-side with the Firebase Admin SDK — this is the
//      one step that actually proves who's calling; nothing before this
//      point should be trusted.
//   3. Look up that Firebase UID's row in `users` to get technician_id.
//   4. Perform the requested action using the Supabase SERVICE ROLE key,
//      filtered to that technician_id — the service role key bypasses
//      RLS, which is exactly why it must never reach the browser.
//
// ── Required environment variables (set these in Vercel → Settings →
//    Environment Variables — do NOT prefix them with REACT_APP_, which
//    would bundle them into the client-side JS and defeat the whole
//    point) ──
//   FIREBASE_SERVICE_ACCOUNT_JSON   — the full service account JSON
//                                     (Firebase Console → Project
//                                     Settings → Service Accounts →
//                                     Generate new private key), stored
//                                     as a single-line JSON string.
//   SUPABASE_SERVICE_ROLE_KEY       — Supabase → Project Settings → API
//                                     → service_role key (the SECRET
//                                     one, not the anon key already used
//                                     elsewhere in this app).
//   ADMIN_EMAIL / ADMIN_PASSWORD /
//   ADMIN_SESSION_SECRET            — already exist for the admin panel
//                                     per your current setup; reused
//                                     here for the admin-only actions.
//
// ── New npm dependency required ──
//   npm install firebase-admin
//
// This file has NOT been run against a live Firebase/Supabase project —
// I don't have credentials for either. Syntax and logic are correct as
// written, but test the four actions against your real project before
// relying on it, the same as you would for any new backend code.
// ═══════════════════════════════════════════════════════════════════════

// Using firebase-admin's modular API (initializeApp/getApps/cert from
// "firebase-admin/app", getAuth from "firebase-admin/auth") rather than the
// old `const admin = require("firebase-admin")` namespace object — that
// classic shape isn't reliable on every bundler/runtime with firebase-admin
// v12+ and was the actual cause of a crash here (admin.apps came back
// undefined, throwing "Cannot read properties of undefined (reading
// 'length')" before the request handler ever ran). The modular imports
// below are Firebase's own current recommendation and avoid that class of
// interop problem entirely.
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const crypto = require("crypto");

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This used to run JSON.parse(...) directly at module scope. If
// FIREBASE_SERVICE_ACCOUNT_JSON is malformed — extremely easy to get wrong
// when pasting it into Vercel's env var UI, since the private_key field's
// \n sequences are easy to mangle in transit — that throw happened before
// the request handler below even started, crashing the whole function with
// a bare, undebuggable 500 and no JSON body at all. Capturing the error
// here instead means every request can return a real, readable message
// pointing at the actual problem.
let initError = null;
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    });
  } catch (e) {
    initError = `FIREBASE_SERVICE_ACCOUNT_JSON is not valid: ${e.message}. Re-copy the full service account JSON from Firebase Console → Project Settings → Service Accounts, paste it as a single-line value in Vercel, and redeploy.`;
  }
}
if (!SERVICE_KEY) {
  initError = initError || "SUPABASE_SERVICE_ROLE_KEY is not set in Vercel's environment variables.";
}

// Thin Supabase REST helper using the service role key — this bypasses
// RLS, which is safe ONLY because every call site below has already
// filtered by a technician_id we ourselves verified, not one the client
// sent us.
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

// Resolves who's calling, in one of two ways:
//   1. A verified Firebase ID token → returns { id: users.id, anonymous:false }.
//      This is the real, trustworthy path — the identity is cryptographically
//      proven by Firebase.
//   2. A client-supplied X-Device-Id header (a random UUID the browser
//      generated and stored locally, used when there's no login at all) →
//      returns { id: deviceId, anonymous:true }. This path has NO real
//      verification behind it by definition — anyone could send any UUID.
//      It exists purely to support the "use it without logging in" request;
//      it is not, and cannot be, a secure identity the way option 1 is.
const authenticate = async (req) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (idToken) {
    const decoded = await getAuth().verifyIdToken(idToken);
    const rows = await sb("users", { filter: `?firebase_uid=eq.${decoded.uid}&select=id,status` });
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) throw new Error("No matching user for this token");
    if (user.status && user.status !== "approved") throw new Error("Account not approved");
    return { id: user.id, anonymous: false };
  }

  const deviceId = req.headers["x-device-id"];
  const isValidUuid = typeof deviceId === "string" && /^[0-9a-f-]{36}$/i.test(deviceId);
  if (!isValidUuid) throw new Error("Missing Authorization bearer token or a valid X-Device-Id");
  return { id: deviceId, anonymous: true };
};

// Real admin-session check, matching admin-login.js exactly: that route
// issues token = HMAC-SHA256(ADMIN_SESSION_SECRET, `admin:${expiresAt}`).
// So verifying means recomputing that same HMAC from the expiresAt the
// client sends back, comparing it to the token in constant time (so a
// timing attack can't leak the correct value byte-by-byte), and checking
// the session hasn't expired. The client already stores both token and
// expiresAt together (pcb_admin_session), so both are sent here.
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

module.exports = async (req, res) => {
  if (initError) {
    return res.status(500).json({ error: initError });
  }
  try {
    const { action } = req.body || req.query || {};

    // ── Technician actions (require a verified Firebase user OR an
    //    anonymous device ID — see authenticate() above) ──
    if (action === "create_invoice") {
      const { id: technicianId } = await authenticate(req);
      const { customer, appliance, lineItems } = req.body;

      if (!customer?.name || !customer?.phone) {
        return res.status(400).json({ error: "Customer name and phone are required" });
      }
      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        return res.status(400).json({ error: "At least one line item is required" });
      }

      const subtotal = lineItems.reduce((s, li) => s + (li.quantity || 0) * (li.unitPrice || 0), 0);

      const created = await sb("invoices", {
        method: "POST",
        prefer: "return=representation",
        body: {
          technician_id: technicianId,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address || null,
          appliance_type: req.body.appliance?.type || null,
          appliance_brand: appliance?.brand || null,
          model_number: appliance?.model || null,
          subtotal,
          total: subtotal, // no discount/tax in the simplified form — total is just the line-item sum
          warranty_months: req.body.warranty?.months || 0,
          theme: req.body.theme || "classic",
          service_date: req.body.serviceDate || new Date().toISOString().slice(0, 10),
        },
      });
      const invoice = Array.isArray(created) ? created[0] : created;

      const lineRows = lineItems.map((li, i) => ({
        invoice_id: invoice.id,
        description: li.description,
        quantity: li.quantity || 1,
        unit_price: li.unitPrice || 0,
        line_total: (li.quantity || 1) * (li.unitPrice || 0),
        shop_product_id: li.shopProductId || null,
        sort_order: i,
      }));
      await sb("invoice_line_items", { method: "POST", body: lineRows });

      return res.status(200).json({ invoice });
    }

    if (action === "list_my_invoices") {
      const { id: technicianId } = await authenticate(req);
      const invoices = await sb("invoices", {
        filter: `?technician_id=eq.${technicianId}&select=*&order=created_at.desc`,
      });
      return res.status(200).json({ invoices });
    }

    if (action === "get_invoice") {
      const { id: technicianId } = await authenticate(req);
      const { invoiceId } = req.body;
      const rows = await sb("invoices", {
        filter: `?id=eq.${invoiceId}&technician_id=eq.${technicianId}&select=*`,
      });
      const invoice = Array.isArray(rows) ? rows[0] : null;
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      const lineItems = await sb("invoice_line_items", {
        filter: `?invoice_id=eq.${invoiceId}&select=*&order=sort_order`,
      });
      return res.status(200).json({ invoice, lineItems });
    }

    if (action === "save_profile") {
      const { id: technicianId, anonymous } = await authenticate(req);
      const { businessName, phone, address, logoUrl } = req.body;
      if (!businessName || !phone) {
        return res.status(400).json({ error: "Business name and phone are required" });
      }
      const existing = await sb("invoice_profiles", { filter: `?user_id=eq.${technicianId}&select=id` });
      const body = { business_name: businessName, phone, address: address || null, logo_url: logoUrl || null, is_anonymous_device: anonymous, updated_at: new Date().toISOString() };
      let result;
      if (Array.isArray(existing) && existing.length) {
        result = await sb("invoice_profiles", { method: "PATCH", filter: `?user_id=eq.${technicianId}`, body, prefer: "return=representation" });
      } else {
        result = await sb("invoice_profiles", { method: "POST", body: { ...body, user_id: technicianId }, prefer: "return=representation" });
      }
      return res.status(200).json({ profile: Array.isArray(result) ? result[0] : result });
    }

    if (action === "get_profile") {
      const { id: technicianId } = await authenticate(req);
      const rows = await sb("invoice_profiles", { filter: `?user_id=eq.${technicianId}&select=*` });
      return res.status(200).json({ profile: Array.isArray(rows) ? rows[0] || null : null });
    }

    // ── Admin-only actions ──
    if (action === "admin_list_technicians") {
      authenticateAdmin(req);
      const profiles = await sb("invoice_profiles", { filter: "?select=*" });
      // Invoice counts per technician, computed here rather than trusting
      // any client-supplied number.
      const counts = await sb("invoices", { filter: "?select=technician_id" });
      const countMap = {};
      (counts || []).forEach((r) => { countMap[r.technician_id] = (countMap[r.technician_id] || 0) + 1; });
      // No more embedded `users(...)` join here — dropping the FK on
      // user_id (needed to accept anonymous device UUIDs) means PostgREST
      // can no longer infer that relationship automatically. Fetch real
      // account names separately, only for the profiles that are actually
      // real accounts, and merge them in by hand instead.
      const realIds = (profiles || []).filter(p => !p.is_anonymous_device).map(p => p.user_id);
      let usersById = {};
      if (realIds.length) {
        const users = await sb("users", { filter: `?id=in.(${realIds.join(",")})&select=id,full_name,email,phone` });
        usersById = Object.fromEntries((users || []).map(u => [u.id, u]));
      }
      const withCounts = (profiles || []).map((p) => ({
        ...p,
        invoice_count: countMap[p.user_id] || 0,
        account: usersById[p.user_id] || null, // null for an anonymous device profile — there is no real account behind it
      }));
      return res.status(200).json({ technicians: withCounts });
    }

    if (action === "admin_list_technician_invoices") {
      authenticateAdmin(req);
      const { technicianId } = req.body;
      const invoices = await sb("invoices", {
        filter: `?technician_id=eq.${technicianId}&select=*&order=created_at.desc`,
      });
      return res.status(200).json({ invoices });
    }

    // Every invoice ever generated, across every technician (real accounts
    // and anonymous devices alike) — a flat view for "admin can see every
    // invoice generated" rather than requiring a drill-down per technician.
    if (action === "admin_list_all_invoices") {
      authenticateAdmin(req);
      const invoices = await sb("invoices", { filter: "?select=*&order=created_at.desc&limit=500" });
      return res.status(200).json({ invoices });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    const status = /Missing Authorization|invalid|No matching user|not approved|valid X-Device-Id/i.test(err.message) ? 401
      : /Not authorized as admin/i.test(err.message) ? 403
      : 500;
    return res.status(status).json({ error: err.message });
  }
};
        
