const B = [
  { e: "✅", t: "OK Tested", d: "Refurbished PCB tested properly" },
  { e: "🔩", t: "Original PCB", d: "Every PCB is original — no compatibility issues" },
  { e: "⭐", t: "Trusted Brand", d: "At PCB Care our customers feel maximum satisfaction" },
  { e: "🛡️", t: "Warranty", d: "Every PCB comes with a warranty period" },
];
export function TrustBadges() {
  return <div className="g2" style={{ gap: 10, marginBottom: 26 }}>{B.map((b) => <div className="tb" key={b.t}><div className="e" aria-hidden>{b.e}</div><b>{b.t}</b><span>{b.d}</span></div>)}</div>;
}
