"use client";
import { useRef, useState } from "react";

/**
 * Guest-friendly review form. Posts to the same database proxy the old app used (/api/orders, action "db").
 * The server forces status "pending", clamps lengths and validates the rating, so nothing becomes public
 * until the owner approves it in the admin Reviews tab.
 */
export function ReviewForm({ productSlug, productName }: { productSlug: string; productName: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [agree, setAgree] = useState(false);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const opened = useRef(Date.now());
  const shown = hover || rating;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const n = name.trim(), c = comment.trim();
    if (!rating) return setMsg({ ok: false, text: "Please choose a star rating." });
    if (!n) return setMsg({ ok: false, text: "Please enter your name." });
    if (/https?:\/\/|www\./i.test(c) || /https?:\/\/|www\./i.test(n)) return setMsg({ ok: false, text: "Please remove links from your review." });
    if (!agree) return setMsg({ ok: false, text: "Please tick the box to agree before submitting." });
    // Bots: filled honeypot or instant submit. Pretend success so they learn nothing.
    if (trap || Date.now() - opened.current < 4000) { setMsg({ ok: true, text: "Thanks! Your review will appear after our team approves it." }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "db", table: "reviews", method: "POST", query: "", prefer: "return=minimal",
          body: { target_type: "product", target_id: productSlug, user_name: n, rating, comment: c || null } }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setRating(0); setName(""); setComment(""); setAgree(false);
      setMsg({ ok: true, text: "Thanks! Your review will appear after our team approves it." });
    } catch {
      setMsg({ ok: false, text: "Could not send your review. Please try again in a moment." });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="rf" id="write-review" noValidate aria-label={`Write a review for ${productName}`}>
      <h3 className="rf-t">Write a review</h3>
      <p className="s" style={{ margin: "0 0 10px" }}>No account needed. Share your honest experience with this product.</p>
      <div role="radiogroup" aria-label="Star rating" className="rf-stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={n <= shown ? "on" : ""} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => setRating(n)}>★</button>
        ))}
        <span className="s" style={{ marginLeft: 8 }}>{rating ? `${rating} out of 5` : "Tap a star"}</span>
      </div>
      <label className="rf-l" htmlFor="rf-name">Your name</label>
      <input id="rf-name" className="search" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Name shown with your review" />
      <label className="rf-l" htmlFor="rf-comment">Your review (optional)</label>
      <textarea id="rf-comment" className="search" rows={4} value={comment} maxLength={2000} onChange={(e) => setComment(e.target.value)} placeholder="Was the board the right match? How was delivery and support?" style={{ resize: "vertical" }} />
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
        <label>Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
      </div>
      <label className="rf-c"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree that my name and review may be shown publicly on this website.</label>
      <button className="wa" type="submit" disabled={busy} style={{ marginTop: 12, marginBottom: 6, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Sending…" : "Submit review"}</button>
      <div role="status" aria-live="polite" style={{ fontSize: 13, color: msg?.ok ? "var(--pc)" : "#ff6b6b", minHeight: 18 }}>{msg?.text}</div>
      <p className="s" style={{ margin: "6px 0 0" }}>Reviews are checked before they are published.</p>
    </form>
  );
}
