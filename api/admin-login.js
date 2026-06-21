// /api/admin-login.js
// Server-side admin credential check. ADMIN_EMAIL, ADMIN_PASSWORD, and
// ADMIN_SESSION_SECRET live only in Vercel's environment variables — never in
// the client JS bundle or the git repo.
//
// On success, this also issues a signed session token (HMAC-SHA256) with an
// expiry, so the browser can safely stay logged in across a page refresh.
// The token itself proves nothing on its own to the client — only this
// server (which holds ADMIN_SESSION_SECRET) can verify it's genuine, via
// /api/admin-verify. Just storing "isAdmin: true" in localStorage directly
// (without this) would let anyone grant themselves admin access by typing
// one line into the browser console — this avoids that.
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !SESSION_SECRET) {
    res.status(500).json({ error: "Server is missing ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET. Add them in Vercel -> Settings -> Environment Variables, then redeploy." });
    return;
  }

  const { email, password } = req.body || {};
  const isAdmin = typeof email === "string" && typeof password === "string"
    && email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (!isAdmin) {
    res.status(200).json({ isAdmin: false });
    return;
  }

  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day session
  const token = crypto.createHmac("sha256", SESSION_SECRET)
    .update(`admin:${expiresAt}`)
    .digest("hex");

  res.status(200).json({ isAdmin: true, token, expiresAt });
}
