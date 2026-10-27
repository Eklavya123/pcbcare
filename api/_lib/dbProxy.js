// api/_lib/dbProxy.js
//
// Authorization rules for the "db" action in api/orders.js.
//
// WHY THIS EXISTS: the browser used to talk to Supabase directly with the
// public (anon) key, so row-level-security had to be left wide open for the
// app to work. That meant anyone holding the public key could read or change
// the users table and several others. This module is the single place that
// decides what an admin, a logged-in user, or a visitor may do instead. The
// proxy then runs the approved request with the service key on the server.
//
// Files in api/_lib are NOT serverless functions, so this costs nothing
// against Vercel's 12-function cap.
"use strict";

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const err = (status, message) => new HttpError(status, message);

// Public content: anyone may read, only the admin may write.
const PUBLIC_CONTENT = new Set([
  "blog_categories", "blog_posts", "brands", "error_codes", "pages",
  "parts_data", "remote_images", "remotes", "sensor_values",
  "shop_categories", "shop_products", "wiring_diagrams", "tips_tricks",
  "app_settings", "community_posts", "community_replies",
]);
// Everything an admin session may touch through the proxy.
const ADMIN_TABLES = new Set([...PUBLIC_CONTENT, "reviews", "users", "user_requests", "request_messages"]);

// Fields a normal user may set on their OWN profile. Deliberately excludes
// role, status, muted and verified_at, which only the server or admin sets.
const USER_CREATE_FIELDS = ["full_name", "phone", "email", "country", "state", "city", "instagram_id", "experience", "specialization", "method", "details_skipped_at"];
const USER_PATCH_FIELDS = ["full_name", "phone", "country", "state", "city", "instagram_id", "experience", "specialization", "details_skipped_at", "last_seen"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PREFER_OK = new Set(["return=minimal", "return=representation", "resolution=merge-duplicates", "resolution=ignore-duplicates"]);

const parseQuery = (q) => new URLSearchParams(String(q || "").replace(/^\?/, ""));
const qs = (p) => { const s = p.toString(); return s ? "?" + s : ""; };
const pick = (params, keys) => { const o = new URLSearchParams(); keys.forEach((k) => { if (params.has(k)) o.set(k, params.get(k)); }); return o; };
const onlyKeys = (obj, keys) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw err(400, "Invalid request body");
  const out = {};
  keys.forEach((k) => { if (obj[k] !== undefined) out[k] = obj[k]; });
  return out;
};
const sanitizePrefer = (p) => {
  if (!p) return undefined;
  const parts = String(p).split(",").map((s) => s.trim());
  return parts.every((s) => PREFER_OK.has(s)) ? parts.join(",") : undefined;
};
const text = (v, max, name) => {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") throw err(400, `${name} must be text`);
  if (v.length > max) throw err(400, `${name} is too long`);
  return v;
};
const eqUuid = (v, name) => {
  const m = /^eq\.(.+)$/.exec(v || "");
  if (!m || !UUID.test(m[1])) throw err(400, `${name} must be a valid id`);
  return m[1].toLowerCase();
};
const needLogin = (ctx) => { if (!ctx.uid) throw err(401, "Please sign in first"); };

// input: { table, method, query, body, prefer }
// ctx:   { isAdmin, uid, email, getDbUser(), getAutoApprove(), getRequestOwner(id) }
// returns { path, method, body, prefer } for the server to execute.
async function authorize(input, ctx) {
  const table = input.table;
  const method = String(input.method || "GET").toUpperCase();
  if (!/^[a-z_]+$/.test(table || "")) throw err(400, "Invalid table");
  if (!["GET", "POST", "PATCH", "DELETE"].includes(method)) throw err(405, "Method not allowed");
  const params = parseQuery(input.query);
  const prefer = sanitizePrefer(input.prefer);

  // ── Admin: pass-through, but only for tables the admin panel really uses ──
  if (ctx.isAdmin) {
    if (!ADMIN_TABLES.has(table)) throw err(403, "Table not available");
    return { path: table + qs(params), method, body: input.body ?? null, prefer };
  }

  // ── Public content: read-only for everyone else ──
  if (PUBLIC_CONTENT.has(table)) {
    if (method !== "GET") throw err(403, "Only the admin can change this");
    if (table === "pages" || table === "blog_posts") params.set("status", "eq.published");
    return { path: table + qs(params), method, body: null, prefer: undefined };
  }

  switch (table) {
    case "users": {
      needLogin(ctx);
      if (method === "GET") {
        const p = pick(params, ["select", "limit", "order"]);
        p.set("firebase_uid", "eq." + ctx.uid);
        return { path: "users" + qs(p), method, body: null, prefer: undefined };
      }
      if (method === "POST") {
        if (await ctx.getDbUser()) throw err(409, "Account already exists");
        const b = onlyKeys(input.body, USER_CREATE_FIELDS);
        b.firebase_uid = ctx.uid;                      // never trust the client for identity
        if (ctx.email) b.email = ctx.email;            // the verified email wins
        if (b.method && !["Google", "Email"].includes(b.method)) delete b.method;
        b.status = (await ctx.getAutoApprove()) ? "approved" : "pending"; // the SERVER decides approval
        b.verified_at = new Date().toISOString();
        return { path: "users", method, body: b, prefer: prefer || "return=representation" };
      }
      if (method === "PATCH") {
        const id = eqUuid(params.get("id"), "id");
        const me = await ctx.getDbUser();
        if (!me || String(me.id).toLowerCase() !== id) throw err(403, "You can only change your own profile");
        const b = onlyKeys(input.body, USER_PATCH_FIELDS);
        if (!Object.keys(b).length) throw err(400, "Nothing to update");
        const p = new URLSearchParams();
        p.set("id", "eq." + id);
        p.set("firebase_uid", "eq." + ctx.uid);
        return { path: "users" + qs(p), method, body: b, prefer };
      }
      throw err(403, "Not allowed");
    }

    case "user_requests": {
      if (method === "GET") {
        needLogin(ctx);
        const me = await ctx.getDbUser();
        if (!me) throw err(403, "No profile found");
        const p = pick(params, ["select", "order", "limit"]);
        p.set("user_id", "eq." + me.id);
        return { path: "user_requests" + qs(p), method, body: null, prefer: undefined };
      }
      if (method === "POST") {
        const me = ctx.uid ? await ctx.getDbUser() : null;
        if (ctx.uid && !me) throw err(403, "No profile found");
        const src = onlyKeys(input.body, ["request_type", "appliance", "brand", "description", "image_url", "user_name"]);
        const b = {
          request_type: text(src.request_type, 60, "type"),
          appliance: text(src.appliance, 120, "appliance"),
          brand: text(src.brand, 120, "brand"),
          description: text(src.description, 5000, "description"),
          image_url: text(src.image_url, 3000000, "image"),
          user_id: me ? me.id : null,
          user_name: me ? (me.full_name || "Anonymous") : (text(src.user_name, 80, "name") || "Anonymous"),
          status: "pending",
        };
        return { path: "user_requests", method, body: b, prefer: prefer || "return=minimal" };
      }
      throw err(403, "Not allowed");
    }

    case "request_messages": {
      needLogin(ctx);
      const me = await ctx.getDbUser();
      if (!me) throw err(403, "No profile found");
      if (method === "GET") {
        const rid = eqUuid(params.get("request_id"), "request_id");
        if (String(await ctx.getRequestOwner(rid)) !== String(me.id)) throw err(403, "Not your request");
        const p = pick(params, ["select", "order", "limit"]);
        p.set("request_id", "eq." + rid);
        return { path: "request_messages" + qs(p), method, body: null, prefer: undefined };
      }
      if (method === "POST") {
        const src = onlyKeys(input.body, ["request_id", "message", "image_url"]);
        if (!UUID.test(src.request_id || "")) throw err(400, "request_id must be a valid id");
        if (String(await ctx.getRequestOwner(src.request_id)) !== String(me.id)) throw err(403, "Not your request");
        const b = {
          request_id: src.request_id,
          sender: "user",
          message: text(src.message, 4000, "message"),
          image_url: text(src.image_url, 3000000, "image"),
        };
        if (!b.message && !b.image_url) throw err(400, "Message is empty");
        return { path: "request_messages", method, body: b, prefer: prefer || "return=minimal" };
      }
      throw err(403, "Not allowed");
    }

    case "reviews": {
      if (method === "GET") {
        const p = pick(params, ["select", "order", "limit", "target_type", "target_id"]);
        p.set("status", "eq.approved"); // only approved reviews are ever public
        return { path: "reviews" + qs(p), method, body: null, prefer: undefined };
      }
      if (method === "POST") {
        const me = ctx.uid ? await ctx.getDbUser() : null;
        const src = onlyKeys(input.body, ["target_type", "target_id", "user_name", "rating", "comment"]);
        const rating = Number(src.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw err(400, "Rating must be 1 to 5");
        const b = {
          target_type: text(src.target_type, 40, "target_type"),
          target_id: text(src.target_id, 200, "target_id"),
          user_name: text(src.user_name, 80, "name") || "Guest",
          user_id: me ? String(me.id) : null,
          rating,
          comment: text(src.comment, 2000, "comment"),
          status: "pending", // always moderated
        };
        if (!b.target_type || !b.target_id) throw err(400, "Missing review target");
        return { path: "reviews", method, body: b, prefer: prefer || "return=minimal" };
      }
      throw err(403, "Only the admin can moderate reviews");
    }

    default:
      throw err(403, "Table not available");
  }
}

module.exports = { authorize, HttpError, PUBLIC_CONTENT, ADMIN_TABLES, UUID };
