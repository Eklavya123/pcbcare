const { verifyAuthenticationResponse } = require("@simplewebauthn/server");
const { getFirebaseAdmin } = require("../_lib/firebaseAdmin");
const { sb } = require("../_lib/supabaseAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const admin = getFirebaseAdmin();
    const { email, response: authResp } = req.body || {};
    if (!email || !authResp) return res.status(400).json({ error: "Missing fields" });
    const cleanEmail = email.trim().toLowerCase();

    const users = await sb(`users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`);
    const user = users && users[0];
    if (!user) return res.status(404).json({ error: "No account found for that email." });

    const challenges = await sb(
      `passkey_challenges?identifier=eq.${cleanEmail}&purpose=eq.login&order=created_at.desc&limit=1`
    );
    const record = challenges && challenges[0];
    if (!record) return res.status(400).json({ error: "No pending sign-in attempt. Please try again." });

    const credRows = await sb(
      `passkey_credentials?user_id=eq.${user.id}&credential_id=eq.${authResp.id}&select=*`
    );
    const credRow = credRows && credRows[0];
    if (!credRow) return res.status(400).json({ error: "Passkey not recognized." });

    const verification = await verifyAuthenticationResponse({
      response: authResp,
      expectedChallenge: record.challenge,
      expectedOrigin: process.env.ORIGIN,
      expectedRPID: process.env.RP_ID,
      authenticator: {
        credentialID: Buffer.from(credRow.credential_id, "base64url"),
        credentialPublicKey: Buffer.from(credRow.public_key, "base64url"),
        counter: Number(credRow.counter),
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Passkey verification failed." });
    }

    await sb(`passkey_credentials?id=eq.${credRow.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { counter: verification.authenticationInfo.newCounter, last_used_at: new Date().toISOString() },
    });
    await sb(`passkey_challenges?id=eq.${record.id}`, { method: "DELETE", prefer: "return=minimal" });

    if (user.status === "pending") return res.status(403).json({ error: "Account pending admin approval." });
    if (user.status === "rejected") return res.status(403).json({ error: "Account rejected. Contact admin." });

    const token = await admin.auth().createCustomToken(user.firebase_uid);
    res.status(200).json({ token, user });
  } catch (e) {
    console.error("login-verify error:", e);
    res.status(500).json({ error: e.message });
  }
};
