// /api/mistral.js
// Server-side proxy to Mistral AI. The API key lives ONLY in the Vercel
// environment variable MISTRAL_API_KEY (Project → Settings → Environment
// Variables) — it is never sent to or visible from the browser. The React
// app calls this same-origin endpoint (/api/mistral) instead of calling
// Mistral directly, which also sidesteps any CORS restrictions a browser
// would otherwise hit calling api.mistral.ai straight from client JS.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing MISTRAL_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy." });
    return;
  }

  const { messages, max_tokens = 500, model = "mistral-small-latest", response_format } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Request body must include a non-empty 'messages' array." });
    return;
  }

  const payload = { model, messages, max_tokens };
  if (response_format) payload.response_format = response_format;

  try {
    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await mistralRes.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }

    if (!mistralRes.ok) {
      res.status(mistralRes.status).json({ error: data?.message || data?.error?.message || `Mistral API error (${mistralRes.status})` });
      return;
    }

    const text = data?.choices?.[0]?.message?.content || "";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error while calling Mistral." });
  }
}