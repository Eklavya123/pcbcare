const { generateAuthenticationOptions } = require("@simplewebauthn/server");
const { sb } = require("../_lib/supabaseAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Enter your email first." });
    const cleanEmail = email.trim().toLowerCase();

    const users = await sb(`users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,status`);
    const user = users && users[0];
    if (!user) return res.status(404).json({ error: "No account found for that email." });

    const creds = await sb(`passkey_credentials?user_id=eq.${user.id}&select=credential_id,transports`);
    if (!creds || creds.length === 0) {
      return res.status(404).json({ error: "No passkey set up for this account yet." });
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID,
      userVerification: "preferred",
      allowCredentials: creds.map((c) => ({
        id: Buffer.from(c.credential_id, "base64url"),
        type: "public-key",
        transports: c.transports ? c.transports.split(",") : undefined,
      })),
    });

    await sb("passkey_challenges", {
      method: "POST",
      body: { identifier: cleanEmail, challenge: options.challenge, purpose: "login" },
    });

    res.status(200).json(options);
  } catch (e) {
    console.error("login-options error:", e);
    res.status(500).json({ error: e.message });
  }
};
