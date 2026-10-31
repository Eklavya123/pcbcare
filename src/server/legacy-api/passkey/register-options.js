const { generateRegistrationOptions } = require("@simplewebauthn/server");
const { getFirebaseAdmin } = require("../_lib/firebaseAdmin");
const { sb } = require("../_lib/supabaseAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const admin = getFirebaseAdmin();
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    // Only the currently-signed-in Firebase user can request options for themself.
    const decoded = await admin.auth().verifyIdToken(idToken);

    const users = await sb(`users?firebase_uid=eq.${decoded.uid}&select=id,email,full_name`);
    const user = users && users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingCreds = await sb(`passkey_credentials?user_id=eq.${user.id}&select=credential_id,transports`);

    const options = await generateRegistrationOptions({
      rpName: process.env.RP_NAME || "PCB Care",
      rpID: process.env.RP_ID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.full_name || user.email,
      attestationType: "none",
      excludeCredentials: (existingCreds || []).map((c) => ({
        id: Buffer.from(c.credential_id, "base64url"),
        type: "public-key",
        transports: c.transports ? c.transports.split(",") : undefined,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Stash the challenge so register-verify.js can check it in the next call.
    await sb("passkey_challenges", {
      method: "POST",
      body: { identifier: user.id, challenge: options.challenge, purpose: "register" },
    });

    res.status(200).json(options);
  } catch (e) {
    console.error("register-options error:", e);
    res.status(500).json({ error: e.message });
  }
};
