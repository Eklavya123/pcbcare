// Server-only Supabase REST helper (anon key, read-only tables). Uses Next's fetch cache (ISR).
// The anon key is public by design (it is already shipped to every browser by the React app); env vars override.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdyyaiapyhwqnxzeujim.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";

export async function rest<T>(path: string, revalidate = 600): Promise<T[]> {
  if (!URL_ || !KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  // Throwing (not returning []) is deliberate: with ISR, a failed regeneration keeps the last good
  // page instead of caching an empty page or a false 404 that Google could act on.
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    next: { revalidate },
  });
  if (!r.ok) throw new Error(`Supabase ${r.status} for ${path.split("?")[0]}`);
  return (await r.json()) as T[];
}

/** For generateStaticParams: never fail the build because params could not be listed. */
export async function safeParams<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try { return await fn(); } catch (e) { console.warn("generateStaticParams skipped:", (e as Error).message); return []; }
}
