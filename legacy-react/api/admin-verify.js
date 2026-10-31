// /api/admin-verify.js
// Verifies a session token issued by /api/admin-login. The client sends back
// {token, expiresAt} on app load; this recomputes the expected HMAC using the
// server-only ADMIN_SESSION_SECRET and confirms it matches and hasn't expired.
// A forged token (e.g. someone editing localStorage by hand) will never match,
// since computing a valid one requires the secret, which never leaves the server.
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
  if (!SESSION_SECRET) {
    res.status(500).json({ valid: false, error: "Server is missing ADMIN_SESSION_SECRET." });
    return;
  }

  const { token, expiresAt } = req.body || {};
  if (!token || !expiresAt || typeof expiresAt !== "number") {
    res.status(200).json({ valid: false });
    return;
  }

  if (Date.now() > expiresAt) {
    res.status(200).json({ valid: false });
    return;
  }

  const expected = crypto.createHmac("sha256", SESSION_SECRET)
    .update(`admin:${expiresAt}`)
    .digest("hex");

  // Constant-time comparison to avoid leaking timing information about the token.
  const valid = expected.length === String(token).length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(token)));

  res.status(200).json({ valid });
}
