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

      // Banking to the leaderboard happens exactly once, right here — this
      // is the only code path that can ever set status to "finished"
      // (game_move already refuses to run at all once status isn't
      // "active"), so there's no risk of double-counting a game's points
      // on a retry or a later poll.
      if (finished) {
        if (score1 > 0 && game.player1_name) await sb("rpc/leaderboard_add_points", { method: "POST", body: { p_game_type: "dots_boxes", p_name: game.player1_name, p_points: score1 } });
        if (score2 > 0 && game.player2_name) await sb("rpc/leaderboard_add_points", { method: "POST", body: { p_game_type: "dots_boxes", p_name: game.player2_name, p_points: score2 } });
      }

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

    // ── Letter Duel — hidden two-player word game, /l/<code> ──
    // Also folded in here for the Vercel function-count reason explained
    // above word_duel_games' table comment.
    //
    // Reveal timing is deliberate: both players' letters stay hidden from
    // each other until choose_deadline actually passes, even if both
    // already chose earlier — checked on every word_get poll, not on a
    // server-side timer, since this whole app has no background job
    // runner. A player who never chooses in time gets a random letter
    // assigned automatically at that same check, so the game can't get
    // stuck waiting on someone who closed their tab.
    const randomLetter = () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];

    // Structural check only — does this word actually start with one of
    // the two chosen letters and end with the other? Whether it's a
    // genuine, real word is deliberately NOT checked here; that judgment
    // belongs entirely to the opponent via word_approve/word_disapprove,
    // by explicit design.
    const wordMatchesLetters = (word, l1, l2) => {
      const w = word.toLowerCase();
      const a = (l1 || "").toLowerCase(), b = (l2 || "").toLowerCase();
      return (w[0] === a && w[w.length - 1] === b) || (w[0] === b && w[w.length - 1] === a);
    };

    if (action === "word_create") {
      const { sessionId, playerName } = req.body;
      if (!sessionId) throw new Error("sessionId is required");
      const code = randomCode();
      const [created] = await sb("word_duel_games", {
        method: "POST",
        body: { code, player1_session: sessionId, player1_name: playerName?.trim()?.slice(0, 24) || null, phase: "waiting" },
        prefer: "return=representation",
      });
      return res.status(200).json({ code: created.code });
    }

    if (action === "word_get") {
      const { code, sessionId } = req.body;
      if (!code) throw new Error("code is required");
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      let game = rows[0];
      if (!game) return res.status(404).json({ error: "No game found with that code." });

      let role = "spectator";
      if (game.player1_session === sessionId) role = "player1";
      else if (game.player2_session === sessionId) role = "player2";
      else if (!game.player1_session) {
        await sb("word_duel_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player1_session: sessionId } });
        role = "player1"; game.player1_session = sessionId;
      } else if (!game.player2_session) {
        await sb("word_duel_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player2_session: sessionId, phase: "ready" } });
        role = "player2"; game.player2_session = sessionId; game.phase = "ready";
      }

      // Auto-resolve an expired choosing window — see comment above.
      if (game.phase === "choosing" && game.choose_deadline && new Date(game.choose_deadline) <= new Date()) {
        const fill = {};
        if (!game.letter1) fill.letter1 = randomLetter();
        if (!game.letter2) fill.letter2 = randomLetter();
        fill.phase = "revealed";
        const [updated] = await sb("word_duel_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: fill, prefer: "return=representation" });
        game = updated;
      }

      // Redact letters from the response while still in the choosing
      // phase — they exist in the row (so a straggler's timeout-fill has
      // something to compare against) but must never reach the client
      // before reveal.
      const payload = { ...game };
      let myLetterChosen = false;
      if (game.phase === "choosing") {
        myLetterChosen = role === "player1" ? !!game.letter1 : role === "player2" ? !!game.letter2 : false;
        payload.letter1 = null;
        payload.letter2 = null;
      }

      const messages = await sb("word_duel_messages", { filter: `?game_id=eq.${game.id}&select=*&order=created_at.asc&limit=200` });

      return res.status(200).json({ game: payload, role, myLetterChosen, messages });
    }

    // Chat for Letter Duel — mirrors game_send_message (Dots and Boxes)
    // exactly, against the separate word_duel_messages table.
    if (action === "word_send_message") {
      const { code, sessionId, message } = req.body;
      if (!message?.trim()) throw new Error("Message can't be empty");
      if (message.length > 500) throw new Error("Message too long");
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,player1_session,player2_session,player1_name,player2_name` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const sender = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!sender) throw new Error("Only players in this game can chat");
      const senderName = sender === 1 ? game.player1_name : game.player2_name;
      await sb("word_duel_messages", {
        method: "POST",
        body: { game_id: game.id, sender, sender_name: senderName || `Player ${sender}`, message: message.trim().slice(0, 500) },
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "word_set_name") {
      const { code, sessionId, name } = req.body;
      if (!name?.trim()) throw new Error("Name is required");
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,player1_session,player2_session` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const field = game.player1_session === sessionId ? "player1_name" : game.player2_session === sessionId ? "player2_name" : null;
      if (!field) throw new Error("You're not a player in this game");
      const [updated] = await sb("word_duel_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { [field]: name.trim().slice(0, 24) }, prefer: "return=representation" });
      return res.status(200).json({ game: updated });
    }

    if (action === "word_ready") {
      const { code, sessionId } = req.body;
      // Calls word_duel_set_ready (a Postgres function using SELECT ... FOR
      // UPDATE) instead of doing read-then-write here in JS. The previous
      // version read the game, decided whether to transition based on
      // that snapshot, then wrote — two players pressing Ready within the
      // same instant could each read the other's PRE-update flag, so both
      // got marked ready but neither write ever saw both flags true at
      // once, and the phase transition to "choosing" silently never fired.
      // This only reproduced under a specific timing coincidence, which is
      // exactly what made it show up as "usually works, sometimes doesn't."
      // The fix has to live in the database as a single atomic operation;
      // no amount of care in this file's read-then-write ordering can
      // close that race from the application side.
      let updated;
      try {
        updated = await sb("rpc/word_duel_set_ready", { method: "POST", body: { p_code: code, p_session_id: sessionId } });
      } catch (e) {
        if (/game_not_found/.test(e.message)) return res.status(404).json({ error: "Game not found" });
        if (/not_a_player/.test(e.message)) throw new Error("You're not a player in this game");
        throw e;
      }
      return res.status(200).json({ game: updated });
    }

    if (action === "word_choose_letter") {
      const { code, sessionId, letter } = req.body;
      if (!/^[a-zA-Z]$/.test(letter || "")) throw new Error("Pick a single letter");
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,phase,player1_session,player2_session` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.phase !== "choosing") throw new Error("It's not time to choose a letter right now");
      const field = game.player1_session === sessionId ? "letter1" : game.player2_session === sessionId ? "letter2" : null;
      if (!field) throw new Error("You're not a player in this game");
      // Conditioned on phase still being 'choosing' at the DB level —
      // guards against a choice landing right as the deadline flips over
      // to revealed on another request.
      await sb("word_duel_games", { method: "PATCH", filter: `?id=eq.${game.id}&phase=eq.choosing`, body: { [field]: letter.toLowerCase() } });
      return res.status(200).json({ ok: true });
    }

    if (action === "word_submit") {
      const { code, sessionId, word } = req.body;
      if (!/^[a-zA-Z]{2,30}$/.test(word || "")) throw new Error("Enter a valid word (letters only)");
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.phase !== "revealed") throw new Error("Not time to submit a word right now");
      const myPlayer = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!myPlayer) throw new Error("You're not a player in this game");
      if (!wordMatchesLetters(word, game.letter1, game.letter2)) {
        throw new Error(`Your word has to start with one of "${game.letter1?.toUpperCase()}"/"${game.letter2?.toUpperCase()}" and end with the other.`);
      }
      // Conditioned on phase still being 'revealed' — this is the actual
      // race resolution for "whoever submits first." If another request
      // already moved phase to pending_approval, this matches zero rows
      // and updated is undefined, meaning the opponent beat this player
      // to it.
      const result = await sb("word_duel_games", {
        method: "PATCH", filter: `?id=eq.${game.id}&phase=eq.revealed`,
        body: { phase: "pending_approval", pending_word: word, pending_by: myPlayer, updated_at: new Date().toISOString() },
        prefer: "return=representation",
      });
      const updated = result[0];
      if (!updated) throw new Error("Your opponent already submitted a word first.");
      return res.status(200).json({ game: updated });
    }

    if (action === "word_approve") {
      const { code, sessionId } = req.body;
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.phase !== "pending_approval") throw new Error("Nothing waiting for approval");
      const myPlayer = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!myPlayer || myPlayer === game.pending_by) throw new Error("Only the other player can approve this word");
      const scoreField = game.pending_by === 1 ? "score1" : "score2";
      const [updated] = await sb("word_duel_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: {
          [scoreField]: (game[scoreField] || 0) + 1,
          phase: "ready", ready1: false, ready2: false,
          letter1: null, letter2: null, choose_deadline: null,
          pending_word: null, pending_by: null,
        },
        prefer: "return=representation",
      });

      // Letter Duel has no natural "game end" the way Dots and Boxes
      // does — rounds continue indefinitely until someone leaves or a
      // word gets disapproved. Each approved word is the natural unit of
      // "a point genuinely earned," so it's banked to the leaderboard
      // immediately here, not deferred to some end-of-game moment that
      // may never come.
      const approvedName = game.pending_by === 1 ? game.player1_name : game.player2_name;
      if (approvedName) await sb("rpc/leaderboard_add_points", { method: "POST", body: { p_game_type: "letter_duel", p_name: approvedName, p_points: 1 } });

      return res.status(200).json({ game: updated });
    }

    if (action === "word_disapprove") {
      const { code, sessionId } = req.body;
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.phase !== "pending_approval") throw new Error("Nothing waiting for approval");
      const myPlayer = game.player1_session === sessionId ? 1 : game.player2_session === sessionId ? 2 : null;
      if (!myPlayer || myPlayer === game.pending_by) throw new Error("Only the other player can disapprove this word");
      const byName = game.pending_by === 1 ? (game.player1_name || "Player 1") : (game.player2_name || "Player 2");
      const [updated] = await sb("word_duel_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: { phase: "cancelled", cancelled_reason: `${byName}'s word "${game.pending_word}" was rejected.` },
        prefer: "return=representation",
      });
      return res.status(200).json({ game: updated });
    }

    // Rematch after a cancellation — fresh board, same two seats.
    if (action === "word_reset") {
      const { code, sessionId } = req.body;
      const rows = await sb("word_duel_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (sessionId !== game.player1_session && sessionId !== game.player2_session) throw new Error("Only the two players can start a rematch");
      const [updated] = await sb("word_duel_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: {
          phase: "ready", ready1: false, ready2: false,
          letter1: null, letter2: null, choose_deadline: null,
          pending_word: null, pending_by: null, cancelled_reason: null,
          score1: 0, score2: 0,
        },
        prefer: "return=representation",
      });
      return res.status(200).json({ game: updated });
    }

    // ── Keep-alive ──
    // Triggered by Vercel Cron (see vercel.json's "crons" entry) once a
    // day, nothing else calls this. Supabase's free tier pauses a project
    // after a stretch of no traffic, and the pause itself is what causes
    // the intermittent "Failed to get project config" error users saw —
    // not a bug in any query, the project was asleep. A daily touch is
    // comfortably more frequent than the pause threshold, so this should
    // prevent it from ever pausing again. Deliberately public — Vercel
    // Cron requests aren't carrying an admin session, and there's nothing
    // sensitive being returned here anyway, just a trivial read to prove
    // the database responded.
    if (action === "keepalive") {
      await sb("orders", { filter: "?select=id&limit=1" });
      return res.status(200).json({ ok: true, ts: new Date().toISOString() });
    }

    // Public — leaderboards are meant to be shown right inside each game's
    // own screen, not gated behind anything. game_type is required so a
    // caller always gets one specific leaderboard, not a mixed list.
    if (action === "leaderboard_get") {
      const { gameType } = req.body;
      if (gameType !== "dots_boxes" && gameType !== "letter_duel" && gameType !== "tambola") throw new Error("Invalid game type");
      const entries = await sb("leaderboard_scores", {
        filter: `?game_type=eq.${gameType}&select=display_name,total_points&order=total_points.desc&limit=50`,
      });
      return res.status(200).json({ entries });
    }

    // ── Tambola — hidden two-player game, /t/<code> ──
    // Folded in here for the same Vercel function-count reason as the
    // other two games. See tambola_games' table comment for the ticket
    // layout (1-99, 9 columns of 11 each — not the traditional 1-90).
    //
    // The ticket-generation algorithm (rejection sampling for a valid
    // row/column activation pattern) and every one of the 8 claim checks
    // below were tested standalone against thousands of generated tickets
    // and hand-built cases with known expected outcomes before being
    // wired in here — not just read through. That mattered: the low50/
    // high50 boundary at exactly 50 is easy to get subtly wrong (it's
    // deliberately in BOTH ranges, matching how the ranges were
    // specified), and a naive claim check can accidentally give partial
    // credit across claim types if it isn't scoped to exactly the right
    // set of numbers each time.
    const TAMBOLA_COL_RANGES = [[1,11],[12,22],[23,33],[34,44],[45,55],[56,66],[67,77],[78,88],[89,99]];
    const tShuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

    const generateTambolaActivation = () => {
      for(let attempt=0; attempt<2000; attempt++){
        const rows = [[],[],[]];
        for(let r=0;r<3;r++) rows[r] = tShuffle([0,1,2,3,4,5,6,7,8]).slice(0,5).sort((a,b)=>a-b);
        const colCount = Array(9).fill(0);
        rows.forEach(r=>r.forEach(c=>colCount[c]++));
        if(colCount.every(c=>c>=1 && c<=3)) return {rows, colCount};
      }
      return null; // astronomically unlikely given ~2.7 average attempts in testing
    };

    const generateTambolaTicket = () => {
      const act = generateTambolaActivation();
      if(!act) throw new Error("Could not generate a valid ticket layout — please try again");
      const {rows, colCount} = act;
      const grid = [Array(9).fill(null),Array(9).fill(null),Array(9).fill(null)];
      for(let c=0;c<9;c++){
        const [lo,hi] = TAMBOLA_COL_RANGES[c];
        const pool = []; for(let n=lo;n<=hi;n++) pool.push(n);
        const chosen = tShuffle(pool).slice(0,colCount[c]).sort((a,b)=>a-b);
        const activeRows = [0,1,2].filter(r=>rows[r].includes(c));
        activeRows.forEach((r,i)=>{ grid[r][c] = chosen[i]; });
      }
      return grid;
    };

    const tambolaTicketNumbers = (grid) => grid.flat().filter(x=>x!==null);
    const tambolaCorners = (grid) => {
      const top = grid[0].map((v,i)=>({v,i})).filter(x=>x.v!==null);
      const bot = grid[2].map((v,i)=>({v,i})).filter(x=>x.v!==null);
      return [top[0].v, top[top.length-1].v, bot[0].v, bot[bot.length-1].v];
    };
    const TAMBOLA_CLAIM_LABELS = {
      line1:"First Line", line2:"Middle Line", line3:"Third Line",
      low50:"1 to 50", high50:"50 to 99", corners:"Corners", odd:"Odd Numbers", even:"Even Numbers",
    };
    const checkTambolaClaim = (type, grid, crossedArr) => {
      const crossed = new Set(crossedArr);
      const isCrossed = (n) => crossed.has(n);
      if(type==="line1") return grid[0].filter(x=>x!==null).every(isCrossed);
      if(type==="line2") return grid[1].filter(x=>x!==null).every(isCrossed);
      if(type==="line3") return grid[2].filter(x=>x!==null).every(isCrossed);
      if(type==="low50"){ const nums=tambolaTicketNumbers(grid).filter(n=>n<=50); return nums.length>0 && nums.every(isCrossed); }
      if(type==="high50"){ const nums=tambolaTicketNumbers(grid).filter(n=>n>=50); return nums.length>0 && nums.every(isCrossed); }
      if(type==="corners") return tambolaCorners(grid).every(isCrossed);
      if(type==="odd"){ const nums=tambolaTicketNumbers(grid).filter(n=>n%2===1); return nums.length>0 && nums.every(isCrossed); }
      if(type==="even"){ const nums=tambolaTicketNumbers(grid).filter(n=>n%2===0); return nums.length>0 && nums.every(isCrossed); }
      return false;
    };
    const TAMBOLA_CLAIM_POINTS = { line1:10, line2:10, line3:10, low50:15, high50:15, corners:10, odd:10, even:10 };

    if (action === "tambola_create") {
      const { sessionId, playerName } = req.body;
      if (!sessionId) throw new Error("sessionId is required");
      const code = randomCode();
      const [created] = await sb("tambola_games", {
        method: "POST",
        body: {
          code, player1_session: sessionId, player1_name: playerName?.trim()?.slice(0,24) || null,
          player1_ticket: generateTambolaTicket(), status: "waiting",
        },
        prefer: "return=representation",
      });
      return res.status(200).json({ code: created.code });
    }

    if (action === "tambola_set_name") {
      const { code, sessionId, name } = req.body;
      if (!name?.trim()) throw new Error("Name is required");
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=id,player1_session,player2_session` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const field = game.player1_session === sessionId ? "player1_name" : game.player2_session === sessionId ? "player2_name" : null;
      if (!field) throw new Error("You're not a player in this game");
      const [updated] = await sb("tambola_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { [field]: name.trim().slice(0,24) }, prefer: "return=representation" });
      return res.status(200).json({ game: updated });
    }

    // Regenerating is only allowed before that player has pressed ready —
    // enforced here, not just hidden in the UI, since letting someone
    // reroll a bad ticket mid-game would be a real fairness bug, not a
    // cosmetic one.
    if (action === "tambola_regenerate_ticket") {
      const { code, sessionId } = req.body;
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      const isP1 = game.player1_session === sessionId, isP2 = game.player2_session === sessionId;
      if (!isP1 && !isP2) throw new Error("You're not a player in this game");
      if ((isP1 && game.player1_ready) || (isP2 && game.player2_ready)) throw new Error("You've already marked ready — can't reroll now");
      const field = isP1 ? "player1_ticket" : "player2_ticket";
      const [updated] = await sb("tambola_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { [field]: generateTambolaTicket() }, prefer: "return=representation" });
      return res.status(200).json({ ticket: updated[field] });
    }

    if (action === "tambola_ready") {
      const { code, sessionId } = req.body;
      let updated;
      try {
        updated = await sb("rpc/tambola_set_ready", { method: "POST", body: { p_code: code, p_session_id: sessionId } });
      } catch (e) {
        if (/game_not_found/.test(e.message)) return res.status(404).json({ error: "Game not found" });
        if (/not_a_player/.test(e.message)) throw new Error("You're not a player in this game");
        throw e;
      }
      return res.status(200).json({ game: updated });
    }

    if (action === "tambola_get") {
      const { code, sessionId } = req.body;
      if (!code) throw new Error("code is required");
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      let game = rows[0];
      if (!game) return res.status(404).json({ error: "No game found with that code." });

      let role = "spectator";
      if (game.player1_session === sessionId) role = "player1";
      else if (game.player2_session === sessionId) role = "player2";
      else if (!game.player1_session) {
        await sb("tambola_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player1_session: sessionId } });
        role = "player1"; game.player1_session = sessionId;
      } else if (!game.player2_session) {
        const ticket = generateTambolaTicket();
        await sb("tambola_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { player2_session: sessionId, player2_ticket: ticket, status: "setup" } });
        role = "player2"; game.player2_session = sessionId; game.player2_ticket = ticket; game.status = "setup";
      }

      // Announcer — draws the next number once its scheduled time has
      // passed, checked on every poll rather than a background job.
      // Compare-and-swap on next_draw_at's exact previous value, so if
      // both players' polls land at the same moment, only one of them
      // actually advances the draw — the other's conditional PATCH
      // matches zero rows and is silently skipped, not a double-draw.
      if (game.status === "playing" && game.next_draw_at && new Date(game.next_draw_at) <= new Date()) {
        const deck = game.deck || [];
        if (deck.length > 0) {
          const [num, ...rest] = deck;
          const drawn = [...(game.drawn_numbers||[]), num];
          const finished = rest.length === 0;
          const result = await sb("tambola_games", {
            method: "PATCH",
            filter: `?id=eq.${game.id}&next_draw_at=eq.${encodeURIComponent(game.next_draw_at)}`,
            body: {
              deck: rest, drawn_numbers: drawn,
              next_draw_at: finished ? null : new Date(Date.now()+6000).toISOString(),
              status: finished ? "finished" : "playing",
            },
            prefer: "return=representation",
          });
          if (result[0]) game = result[0];
        }
      }

      // Never send the opponent's ticket contents to the client — a
      // player only ever needs their own ticket to play.
      const payload = { ...game };
      delete payload.player1_ticket; delete payload.player2_ticket;
      const myTicket = role==="player1" ? game.player1_ticket : role==="player2" ? game.player2_ticket : null;
      const myCrossed = role==="player1" ? game.player1_crossed : role==="player2" ? game.player2_crossed : [];

      return res.status(200).json({ game: payload, role, myTicket, myCrossed });
    }

    // "Number Mismatch" is returned (not thrown as a hard error) whenever
    // the clicked number hasn't actually been drawn yet — this is
    // expected, routine user input, not a server fault. A number is
    // accepted if it's ANY already-drawn number the player hasn't crossed
    // yet, not only the single most-recently-announced one — deliberate,
    // to tolerate real polling/network lag between the announcer drawing
    // a number and a player's screen reflecting it.
    if (action === "tambola_click_number") {
      const { code, sessionId, number } = req.body;
      const num = Number(number);
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.status !== "playing") throw new Error("Game isn't in play right now");
      const isP1 = game.player1_session === sessionId, isP2 = game.player2_session === sessionId;
      if (!isP1 && !isP2) throw new Error("You're not a player in this game");
      const ticket = isP1 ? game.player1_ticket : game.player2_ticket;
      const crossedField = isP1 ? "player1_crossed" : "player2_crossed";
      const crossed = game[crossedField] || [];
      if (!tambolaTicketNumbers(ticket).includes(num)) throw new Error("That number isn't on your ticket");
      if (crossed.includes(num)) return res.status(200).json({ ok: true, alreadyCrossed: true, crossed });
      if (!(game.drawn_numbers||[]).includes(num)) {
        return res.status(200).json({ ok: false, mismatch: true, error: "Number Mismatch" });
      }
      const newCrossed = [...crossed, num];
      await sb("tambola_games", { method: "PATCH", filter: `?id=eq.${game.id}`, body: { [crossedField]: newCrossed } });
      return res.status(200).json({ ok: true, crossed: newCrossed });
    }

    if (action === "tambola_claim") {
      const { code, sessionId, claimType } = req.body;
      if (!TAMBOLA_CLAIM_LABELS[claimType]) throw new Error("Unknown claim type");
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (game.status !== "playing" && game.status !== "finished") throw new Error("Game isn't in play right now");
      const isP1 = game.player1_session === sessionId, isP2 = game.player2_session === sessionId;
      if (!isP1 && !isP2) throw new Error("You're not a player in this game");
      const claims = game.claims || {};
      if (claims[claimType]) throw new Error(`${TAMBOLA_CLAIM_LABELS[claimType]} was already claimed by ${claims[claimType].name}`);
      const ticket = isP1 ? game.player1_ticket : game.player2_ticket;
      const crossed = (isP1 ? game.player1_crossed : game.player2_crossed) || [];
      if (!checkTambolaClaim(claimType, ticket, crossed)) throw new Error(`You haven't actually completed ${TAMBOLA_CLAIM_LABELS[claimType]} yet`);
      const myNum = isP1 ? 1 : 2;
      const myName = isP1 ? game.player1_name : game.player2_name;
      const scoreField = isP1 ? "score1" : "score2";
      const newClaims = { ...claims, [claimType]: { by: myNum, name: myName } };
      const allClaimed = Object.keys(TAMBOLA_CLAIM_LABELS).every(k => newClaims[k]);
      const [updated] = await sb("tambola_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: { claims: newClaims, [scoreField]: (game[scoreField]||0) + TAMBOLA_CLAIM_POINTS[claimType], status: allClaimed ? "finished" : game.status },
        prefer: "return=representation",
      });
      if (myName) await sb("rpc/leaderboard_add_points", { method: "POST", body: { p_game_type: "tambola", p_name: myName, p_points: TAMBOLA_CLAIM_POINTS[claimType] } });
      return res.status(200).json({ game: updated });
    }

    if (action === "tambola_reset") {
      const { code, sessionId } = req.body;
      const rows = await sb("tambola_games", { filter: `?code=eq.${encodeURIComponent(code)}&select=*` });
      const game = rows[0];
      if (!game) return res.status(404).json({ error: "Game not found" });
      if (sessionId !== game.player1_session && sessionId !== game.player2_session) throw new Error("Only the two players can start a rematch");
      const [updated] = await sb("tambola_games", {
        method: "PATCH", filter: `?id=eq.${game.id}`,
        body: {
          player1_ticket: generateTambolaTicket(), player2_ticket: game.player2_session ? generateTambolaTicket() : null,
          player1_crossed: [], player2_crossed: [], player1_ready: false, player2_ready: false,
          deck: null, drawn_numbers: [], next_draw_at: null, claims: {}, score1: 0, score2: 0,
          status: game.player2_session ? "setup" : "waiting",
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
