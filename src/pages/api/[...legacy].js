// One serverless function for ALL of the existing app's API routes (Vercel Hobby allows only 12 functions).
// Each handler is the unchanged file from the old React app, so /api/orders, /api/invoices,
// /api/admin-login, /api/passkey/... keep working exactly as before.
const pick = (m) => (m && m.default) || m;

const routes = {
  "admin-login": () => require("../../server/legacy-api/admin-login.js"),
  "admin-verify": () => require("../../server/legacy-api/admin-verify.js"),
  invoices: () => require("../../server/legacy-api/invoices.js"),
  mistral: () => require("../../server/legacy-api/mistral.js"),
  orders: () => require("../../server/legacy-api/orders.js"),
  "passkey/login-options": () => require("../../server/legacy-api/passkey/login-options.js"),
  "passkey/login-verify": () => require("../../server/legacy-api/passkey/login-verify.js"),
  "passkey/register-options": () => require("../../server/legacy-api/passkey/register-options.js"),
  "passkey/register-verify": () => require("../../server/legacy-api/passkey/register-verify.js"),
};

export const config = { api: { bodyParser: { sizeLimit: "4mb" }, responseLimit: false } };

export default async function handler(req, res) {
  const key = [].concat(req.query.legacy || []).join("/");
  const load = routes[key];
  if (!load) return res.status(404).json({ error: "Not found" });
  return pick(load())(req, res);
}
