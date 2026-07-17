const { verifyRegistrationResponse } = require("@simplewebauthn/server");
const { getFirebaseAdmin } = require("../_lib/firebaseAdmin");
const { sb } = require("../_lib/supabaseAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const admin = getFirebaseAdmin();
    const { idToken, response: attResp } = req.body || {};
    if (!idToken || !attResp) return res.status(400).json({ error: "Missing fields" });

    const decoded = await admin.auth().verifyIdToken(idToken);

    const users = await sb(`users?firebase_uid=eq.${decoded.uid}&select=id`);
    const user = users && users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const challenges = await sb(
      `passkey_challenges?identifier=eq.${user.id}&purpose=eq.register&order=created_at.desc&limit=1`
    );
    const record = challenges && challenges[0];
    if (!record) return res.status(400).json({ error: "No pending passkey setup. Please try again." });

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge: record.challenge,
      expectedOrigin: process.env.ORIGIN,
      expectedRPID: process.env.RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Passkey verification failed." });
    }

    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    await sb("passkey_credentials", {
      method: "POST",
      body: {
        user_id: user.id,
        credential_id: Buffer.from(credentialID).toString("base64url"),
        public_key: Buffer.from(credentialPublicKey).toString("base64url"),
        counter,
        device_type: credentialDeviceType,
        backed_up: credentialBackedUp,
        transports: (attResp.response?.transports || []).join(","),
      },
    });

    // Clean up — this challenge has now been used.
    await sb(`passkey_challenges?id=eq.${record.id}`, { method: "DELETE", prefer: "return=minimal" });

    res.status(200).json({ verified: true });
  } catch (e) {
    console.error("register-verify error:", e);
    res.status(500).json({ error: e.message });
  }
};
