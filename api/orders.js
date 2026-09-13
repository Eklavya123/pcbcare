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

    // ── Dots and Boxes — hidden two-player game, /g/<code> ──
    // Also unrelated to orders, also folded in here for the same
    // function-count reason as admin_get_insights above. See
    // dots_boxes_games's table comment for the full picture.
    //
    // Board coordinate convention (standard, easy to get backwards, so
    // written out explicitly): for an R×C grid of BOXES there are R+1
    // rows of dots and C+1 columns of dots.
    //   h_edges[r][c] (r: 0..R, c: 0..C-1) — the horizontal edge between
    //     dot (r,c) and dot (r,c+1). It's the BOTTOM of box (r-1,c) and
    //     the TOP of box (r,c).
    //   v_edges[r][c] (r: 0..R-1, c: 0..C) — the vertical edge between
    //     dot (r,c) and dot (r+1,c). It's the RIGHT of box (r,c-1) and
    //     the LEFT of box (r,c).
    // A box is complete when its top, bottom, left and right edges are
    // all drawn (non-zero). Completing a box grants the same player
    // another turn — that's the one rule that makes this game more than
    // tic-tac-toe, and it's the part most likely to get silently wrong if
    // this is ever rewritten, so test any change against a case where one
    // move completes two boxes at once (an edge shared by two boxes that
    // were both already three-sided).

    const randomCode = () => {
      const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i — avoids ambiguous codes read aloud or hand-copied
      let s = "";
      for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };

    const emptyMatrix = (rows, cols, fill) => Array.from({ length: rows }, () => Array(cols).fill(fill));

    // Returns [isComplete, ...] check for a single box, given the current
    // edge matrices (post-move).
    const boxComplete = (h, v, r, c) => {
      return h[r][c] !== 0 && h[r + 1][c] !== 0 && v[r][c] !== 0 && v[r][c + 1] !== 0;
    };

    if (action === "game_create") {
      const { sessionId, boxRows: reqRows, boxCols: reqCols, playerName } = req.body;
      if (!sessionId) throw new Error("sessionId is required");
      // Bounded 2..12 per side — below 2 isn't a real game, above 12 makes
      // the board unreasonably large on a phone screen and turns a single
      // move into a lot of tapping-and-scrolling for not much reason.
      const boxRows = Math.min(12, Math.max(2, Number(reqRows) || 4));
      const boxCols = Math.min(12, Math.max(2, Number(reqCols) || 4));
      const code = randomCode();
      const [created] = await sb("dots_boxes_games", {
        method: "POST",
        body: {
          code,
          box_rows: boxRows,
          box_cols: boxCols,
          h_edges: emptyMatrix(boxRows + 1, boxCols, 0),
          v_edges: emptyMatrix(boxRows, boxCols + 1, 0),
          boxes: emptyMatrix(boxRows, boxCols, 0),
          player1_session: sessionId,
          player1_name: playerName?.trim()?.slice(0, 24) || null,
          status: "waiting",
        },
        prefer: "return=representation",
      });
      return res.status(200).json({ code: created.code });
    }

    // Sets the caller's display name — separate from seating (game_get)
    // because a player can be seated before they've chosen a name (the
    // frontend gates the board behind a name prompt), and a player should
    // be able to change their name later without re-seating.
    if (action === "game_set_name") {
      const { code, sessionId, name } = req.body;
      if (!name?.trim()) throw new Error("Name is required");
      const rows = await sb("dots_boxes_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,player1_session,player2_session` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const field = game.player1_session === sessionId ? "player1_name" : game.player2_session === sessionId ? "player2_name" : null;
      if (!field) throw new Error("You're not a player in this game");
      const [updated] = await sb("dots_boxes_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: { [field]: name.trim().slice(0, 24) },
        prefer: "return=representation",
      });
      return res.status(200).json({ game: updated });
    }

    // Chat — scoped to the game_id, sender identity taken from which seat
    // the session actually occupies (not trusted from a "sender" field the
    // client could lie about).
    if (action === "game_send_message") {
      const { code, sessionId, message } = req.body;
      if (!message?.trim()) throw new Error("Message can't be empty");
      if (message.length > 500) throw new Error("Message too long");
      const rows = await sb("dots_boxes_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,player1_session,player2_session,player1_name,player2_name` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const sender = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!sender) throw new Error("Only players in this game can chat");
      const senderName = sender === 1 ? game.player1_name : game.player2_name;
      await sb("game_messages", {
        method: "POST",
        body: { game_id: game.id, sender, sender_name: senderName || `Player ${sender}`, message: message.trim().slice(0, 500) },
      });
      return res.status(200).json({ ok: true });
    }

    // Fetches the game and, as a side effect, seats the caller into the
    // first open seat if they aren't already seated — this is what makes
    // "share the URL, second person just opens it" work with no separate
    // join step. Returns the caller's role so the frontend knows whether
    // to show them a board they can move on or a spectator view. Also
    // returns recent chat messages in the same call, so the existing
    // 1.5s poll drives both game state and chat without a second poll
    // loop — this is a 2-player low-traffic feature, not worth the extra
    // complexity of separating them.
    if (action === "game_get") {
      const { code, sessionId } = req.body;
      if (!code) throw new Error("code is required");
      const rows = await sb("dots_boxes_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "No game found with that code." });

      let role = "spectator";
      if (game.player1_session === sessionId) role = "player1";
      else if (game.player2_session === sessionId) role = "player2";
      else if (!game.player1_session) {
        await sb("dots_boxes_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player1_session: sessionId } });
        role = "player1";
      } else if (!game.player2_session) {
        await sb("dots_boxes_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player2_session: sessionId, status: "active" } });
        role = "player2";
        game.status = "active";
      }

      const messages = await sb("game_messages", { filter: `?game_id=eq.${game.id}&select=*&order=created_at.asc&limit=200` });

      return res.status(200).json({ game, role, messages });
    }

    if (action === "game_move") {
      const { code, sessionId, r, c, orientation } = req.body;
      if (!code || !sessionId || orientation !== "h" && orientation !== "v" || typeof r !== "number" || typeof c !== "number") {
        throw new Error("Invalid move payload");
      }
      const rows = await sb("dots_boxes_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.status !== "active") throw new Error("Game isn't active — both players need to have joined, or it's already finished");

      const myPlayer = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!myPlayer) throw new Error("You're not a player in this game");
      if (myPlayer !== game.turn) throw new Error("It's not your turn");

      const h = game.h_edges, v = game.v_edges, boxes = game.boxes;
      const R = game.box_rows, C = game.box_cols;

      if (orientation === "h") {
        if (r < 0 || r > R || c < 0 || c >= C) throw new Error("Move out of bounds");
        if (h[r][c] !== 0) throw new Error("That edge is already drawn");
        h[r][c] = myPlayer;
      } else {
        if (r < 0 || r >= R || c < 0 || c > C) throw new Error("Move out of bounds");
        if (v[r][c] !== 0) throw new Error("That edge is already drawn");
        v[r][c] = myPlayer;
      }

      // Check the one or two boxes this edge could have just completed.
      let completedAny = false;
      const candidates = orientation === "h"
        ? [[r - 1, c], [r, c]]
        : [[r, c - 1], [r, c]];
      for (const [br, bc] of candidates) {
        if (br < 0 || br >= R || bc < 0 || bc >= C) continue;
        if (boxes[br][bc] === 0 && boxComplete(h, v, br, bc)) {
          boxes[br][bc] = myPlayer;
          completedAny = true;
        }
      }

      const score1 = boxes.flat().filter(x => x === 1).length;
      const score2 = boxes.flat().filter(x => x === 2).length;
      const totalBoxes = R * C;
      const finished = score1 + score2 === totalBoxes;

      const updateBody = {
        h_edges: h, v_edges: v, boxes,
        score1, score2,
        turn: completedAny ? myPlayer : (myPlayer === 1 ? 2 : 1), // completing a box grants another turn
        status: finished ? "finished" : "active",
        winner: finished ? (score1 === score2 ? 0 : (score1 > score2 ? 1 : 2)) : null,
        updated_at: new Date().toISOString(),
      };
      const [updated] = await sb("dots_boxes_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: updateBody, prefer: "return=representation" });
      return res.status(200).json({ game: updated });
    }

    // Rematch — same code, same two seated players, fresh empty board.
    // Either player can trigger it; there's no reason to require both to
    // agree for something this low-stakes.
    if (action === "game_reset") {
      const { code, sessionId } = req.body;
      const rows = await sb("dots_boxes_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (sessionId !== game.player1_session && sessionId !== game.player2_session) throw new Error("Only the two players can start a rematch");
      const R = game.box_rows, C = game.box_cols;
      const [updated] = await sb("dots_boxes_games", {
        method: "PATCH",
        filter: `?id=eq.${game.id}`,
        body: {
          h_edges: emptyMatrix(R + 1, C, 0),
          v_edges: emptyMatrix(R, C + 1, 0),
          boxes: emptyMatrix(R, C, 0),
          turn: 1, score1: 0, score2: 0,
          status: game.player1_session && game.player2_session ? "active" : "waiting",
          winner: null,
          updated_at: new Date().toISOString(),
        },
        prefer: "return=representation",
      });
      return res.status(200).json({ game: updated });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    const status = /required|valid URL|valid amount/i.test(err.message) ? 400
      : /Not authorized as admin|Admin session expired/i.test(err.message) ? 403
      : 500;
    return res.status(status).json({ error: err.message });
  }
};
