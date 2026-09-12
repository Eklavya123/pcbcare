// api/analytics.js
// ═══════════════════════════════════════════════════════════════════════
// Read side only. Pings themselves are written directly from the browser
// to Supabase's REST API using the anon key (same pattern as the existing
// technician presence heartbeat in App.js) — anon can INSERT into
// site_pings and nothing else (see the table's RLS policy). This file is
// purely for the admin-only aggregate reads: raw traffic patterns and
// real-time-ish visitor counts shouldn't be queryable by anyone who opens
// devtools, only by admin, which is why this exists as a separate
// service-role-key-backed endpoint rather than an RLS SELECT policy.
//
// One action:
//   admin_get_insights — admin-only. Returns activeLastHour, activeToday,
//     activeYesterday (each: distinct non-bot session_id counts), and a
//     daily bar-chart series for the last `days` (default 14, max 90).
//     All day boundaries are computed in Asia/Kolkata, not UTC, so "today"
//     and "yesterday" match what the admin actually means by those words.
//
// Required env vars: SUPABASE_SERVICE_ROLE_KEY, ADMIN_SESSION_SECRET,
// ADMIN_EMAIL/ADMIN_PASSWORD (all already set from prior work).
//
// Not yet run against the live project — same caveat as every other API
// file here. Test admin_get_insights once real pings exist before trusting
// the numbers it returns.
// ═══════════════════════════════════════════════════════════════════════

const crypto = require("crypto");

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let initError = null;
if (!SERVICE_KEY) {
  initError = "SUPABASE_SERVICE_ROLE_KEY is not set in Vercel's environment variables.";
}

// Runs a raw SQL query via Supabase's PostgREST RPC-free path isn't
// available for arbitrary SQL, so aggregation happens by fetching rows
// through the REST API with query-string filters and reducing them here
// in JS instead of writing Postgres functions for every shape of report.
// Traffic at this project's scale makes that entirely fine; if this ever
// needs to scale to millions of pings, this is the first place to revisit.
const sbGet = async (filter) => {
  const res = await fetch(`${SB_URL}/rest/v1/site_pings${filter}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase query failed: ${res.status} ${await res.text().catch(()=>"")}`);
  return res.json();
};

const authenticateAdmin = (req) => {
  const token = req.headers["x-admin-session"];
  const expiresAt = Number(req.headers["x-admin-session-expires"]);
  const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
  if (!token || !expiresAt || !SESSION_SECRET) throw new Error("Not authorized as admin");
  if (Date.now() > expiresAt) throw new Error("Admin session expired");
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(`admin:${expiresAt}`).digest("hex");
  const a = Buffer.from(token, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error("Not authorized as admin");
};

// India-local day boundaries. Postgres/Supabase store timestamptz in UTC;
// "today" for an admin in Jabalpur should mean the Asia/Kolkata calendar
// day, not the UTC one — those disagree for part of every single day
// (UTC+5:30 offset), so using UTC boundaries here would make "today" and
// "yesterday" silently wrong for roughly 5.5 hours out of every 24.
const kolkataDateString = (d) => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};
// Returns the UTC instant corresponding to 00:00:00 Asia/Kolkata on the
// given "YYYY-MM-DD" (Kolkata) calendar date.
const kolkataMidnightUTC = (dateStr) => {
  return new Date(`${dateStr}T00:00:00+05:30`);
};

module.exports = async (req, res) => {
  if (initError) return res.status(500).json({ error: initError });
  try {
    const { action, days } = req.body || req.query || {};

    if (action === "admin_get_insights") {
      authenticateAdmin(req);

      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const todayStr = kolkataDateString(now);
      const todayStart = kolkataMidnightUTC(todayStr);
      const yesterdayStart = new Date(todayStart.getTime() - 24*60*60*1000);

      const numDays = Math.min(Math.max(Number(days) || 14, 1), 90);
      const chartStart = new Date(todayStart.getTime() - (numDays-1) * 24*60*60*1000);

      // One fetch covering the whole window needed (chart start → now),
      // then every bucket (last hour / today / yesterday / each chart day)
      // is derived from this single row set — avoids N separate round
      // trips to Supabase for what's fundamentally one query's worth of
      // data.
      const rows = await sbGet(
        `?is_bot=eq.false&pinged_at=gte.${chartStart.toISOString()}&select=session_id,pinged_at`
      );

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

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    const status = /Not authorized as admin|Admin session expired/i.test(err.message) ? 403 : 500;
    return res.status(status).json({ error: err.message });
  }
};
