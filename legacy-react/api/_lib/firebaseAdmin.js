const admin = require("firebase-admin");

// Reused across warm serverless invocations so we don't re-init every call.
let initialized = false;

function getFirebaseAdmin() {
  if (!initialized) {
    if (!process.env.FIREBASE_ADMIN_KEY) {
      throw new Error("FIREBASE_ADMIN_KEY is not set in Vercel environment variables.");
    }
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_KEY, "base64").toString("utf-8")
    );
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    initialized = true;
  }
  return admin;
}

module.exports = { getFirebaseAdmin, admin };
