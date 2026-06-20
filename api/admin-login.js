// /api/admin-login.js
// Server-side admin credential check. ADMIN_EMAIL and ADMIN_PASSWORD live only
// in Vercel's environment variables (Project → Settings → Environment
// Variables) — they are never present in the client JS bundle or the git
// repo, so nobody can find them by viewing page source or inspecting code.
// The browser sends the email+password the person typed; this function
// returns only a boolean — the real values never travel back to the client.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    res.status(500).json({ error: "Server is missing ADMIN_EMAIL / ADMIN_PASSWORD. Add them in Vercel → Settings → Environment Variables, then redeploy." });
    return;
  }

  const { email, password } = req.body || {};
  const isAdmin = typeof email === "string" && typeof password === "string"
    && email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  res.status(200).json({ isAdmin });
}
