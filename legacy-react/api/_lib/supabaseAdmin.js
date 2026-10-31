// Server-side only. Uses the Supabase SERVICE ROLE key, which bypasses RLS —
// never expose this key or this file's logic to the browser.

const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";

async function sb(path, { method = "GET", body, prefer, headers } = {}) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_KEY is not set in Vercel environment variables.");
  }
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: prefer || "return=representation",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && (data.message || data.error)) || `Supabase error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

module.exports = { sb };
